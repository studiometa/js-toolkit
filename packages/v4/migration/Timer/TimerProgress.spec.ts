import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { TimerProgress } from './TimerProgress.js';

registerComponents(TimerProgress);

afterEach(resetDom);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function render(attributes = ''): Promise<{ el: HTMLElement; instance: TimerProgress }> {
  const root = document.createElement('div');
  root.innerHTML = `<div data-component="TimerProgress" ${attributes}></div>`;
  document.body.append(root);
  await settle();
  const el = root.firstElementChild as HTMLElement;
  return { el, instance: getInstance<TimerProgress>(el, 'TimerProgress') };
}

function recordProgress(el: HTMLElement): number[] {
  const ratios: number[] = [];
  el.addEventListener('timer-progress', (event) => {
    ratios.push((event as CustomEvent<{ ratio: number }>).detail.ratio);
  });
  return ratios;
}

describe('TimerProgress', () => {
  it('does not run the frame loop before the countdown is armed', async () => {
    const { el } = await render('data-option-no-autostart');
    const ratios = recordProgress(el);

    await wait(60);

    expect(ratios).toEqual([]);
  });

  it('reports increasing progress while armed, ending at 1', async () => {
    const { el } = await render('data-option-delay="0.08"');
    const ratios = recordProgress(el);

    await wait(150);

    expect(ratios.length).toBeGreaterThan(1);
    expect(ratios.at(-1)).toBe(1);
    expect([...ratios]).toEqual([...ratios].sort((a, b) => a - b));
  });

  it('stops the frame loop once complete', async () => {
    const { el } = await render('data-option-delay="0.02"');
    const ratios = recordProgress(el);

    await wait(60);
    const countAtComplete = ratios.length;
    await wait(60);

    expect(ratios.length).toBe(countAtComplete);
  });

  it('resets progress to 0 when stopped', async () => {
    const { el, instance } = await render('data-option-delay="0.2"');
    const ratios = recordProgress(el);

    await wait(30);
    instance.stop();

    expect(ratios.at(-1)).toBe(0);
  });

  it('stops the frame loop while paused and resumes it', async () => {
    const { el, instance } = await render('data-option-delay="0.1"');
    const ratios = recordProgress(el);

    await wait(20);
    instance.pause();
    const countAtPause = ratios.length;
    await wait(40);

    expect(ratios.length).toBe(countAtPause);

    instance.resume();
    await wait(150);

    expect(ratios.at(-1)).toBe(1);
  });
});
