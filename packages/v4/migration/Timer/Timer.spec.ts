import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Timer } from './Timer.js';

registerComponents(Timer);

afterEach(resetDom);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates the element and starts recording events on it before mounting
 * settles: `mounted()`'s autostart fires `timer-start` synchronously during
 * that first cycle, which a listener attached only after `await settle()`
 * would already have missed.
 */
function renderUnmounted(attributes = ''): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `<div data-component="Timer" ${attributes}></div>`;
  document.body.append(root);
  return root.firstElementChild as HTMLElement;
}

async function render(attributes = ''): Promise<{ el: HTMLElement; instance: Timer }> {
  const el = renderUnmounted(attributes);
  await settle();
  return { el, instance: getInstance<Timer>(el, 'Timer') };
}

function record(el: HTMLElement, ...types: string[]): string[] {
  const events: string[] = [];
  for (const type of types) {
    el.addEventListener(type, () => events.push(type));
  }
  return events;
}

describe('Timer', () => {
  it('starts on mount by default, then ends after the delay', async () => {
    const el = renderUnmounted('data-option-delay="0.02"');
    const events = record(el, 'timer-start', 'timer-end');
    await settle();

    await wait(60);

    expect(events).toEqual(['timer-start', 'timer-end']);
  });

  it('does not start on mount when autostart is disabled', async () => {
    const { el, instance } = await render('data-option-delay="0.02" data-option-autostart="false"');
    const events = record(el, 'timer-start', 'timer-end');

    await wait(60);
    expect(events).toEqual([]);

    instance.start();
    await wait(60);
    expect(events).toEqual(['timer-start', 'timer-end']);
  });

  it('pauses and resumes, preserving the remaining time', async () => {
    const { el, instance } = await render('data-option-delay="0.1" data-option-autostart="false"');
    const events = record(el, 'timer-pause', 'timer-resume', 'timer-end');

    instance.start();
    await wait(30);
    instance.pause();
    const remainingAtPause = instance.remaining;

    await wait(50);
    expect(events).toEqual(['timer-pause']);
    expect(instance.timerId).toBeNull();

    instance.resume();
    expect(events).toEqual(['timer-pause', 'timer-resume']);
    expect(instance.remaining).toBeCloseTo(remainingAtPause, 0);

    await wait(120);
    expect(events).toEqual(['timer-pause', 'timer-resume', 'timer-end']);
  });

  it('is a no-op to pause an idle timer or resume a running one', async () => {
    const { el, instance } = await render('data-option-delay="0.1"');
    const events = record(el, 'timer-pause', 'timer-resume');

    instance.resume();
    expect(events).toEqual([]);

    instance.stop();
    instance.pause();
    expect(events).toEqual([]);
  });

  it('stops without completing', async () => {
    const { el, instance } = await render('data-option-delay="0.02"');
    const events = record(el, 'timer-stop', 'timer-end');

    instance.stop();
    await wait(60);

    expect(events).toEqual(['timer-stop']);
    expect(instance.remaining).toBe(0);
  });

  it('restarts from the beginning', async () => {
    const { el, instance } = await render('data-option-delay="0.1" data-option-autostart="false"');
    const events = record(el, 'timer-start');

    instance.start();
    await wait(30);
    instance.restart();

    expect(events).toEqual(['timer-start', 'timer-start']);
    expect(instance.remaining).toBeCloseTo(100, 0);
  });

  it('re-arms itself and emits timer-tick when repeat is set', async () => {
    // `settle()` itself takes real time (its own polling waits), so the delay
    // must be comfortably longer than that to observe exactly one full cycle
    // rather than however many `settle()`'s own wait already consumed.
    const el = renderUnmounted('data-option-delay="0.15" data-option-repeat="true"');
    const events = record(el, 'timer-start', 'timer-end', 'timer-tick');
    await settle();

    await wait(150);

    expect(events).toEqual(['timer-start', 'timer-end', 'timer-tick', 'timer-start']);
  });

  it('cancels the pending countdown when destroyed', async () => {
    const { el, instance } = await render('data-option-delay="0.02"');
    const events = record(el, 'timer-end');

    instance.$destroy();
    await wait(60);

    expect(events).toEqual([]);
  });
});
