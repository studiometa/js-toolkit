import { afterEach, describe, expect, it } from 'vitest';
import { registerComponent } from '../../src/index.js';
import { frames, getInstance, resetDom, settle } from '../../src/test-utils.js';
import { ScrollAnimationTarget } from './ScrollAnimationTarget.js';
import { ScrollAnimationTimeline } from './ScrollAnimationTimeline.js';

registerComponent(ScrollAnimationTimeline);

const SPACER = 2000;
const HEIGHT = 200;

afterEach(async () => {
  window.scrollTo(0, 0);
  document.body.style.height = '';
  document.body.style.margin = '';
  await resetDom();
});

/**
 * A timeline 2000 px down a 6000 px page. With the default
 * `start end / end start` offset the animation runs from
 * `2000 - innerHeight` to `2200`.
 */
function render({
  mount = 'eager',
  targets = 1,
}: { mount?: string; targets?: number } = {}): HTMLElement {
  document.body.style.margin = '0';
  document.body.style.height = '6000px';

  const el = document.createElement('div');
  el.setAttribute('data-component', 'ScrollAnimationTimeline');
  el.setAttribute('data-mount', mount);
  // Undamped, so a scroll settles in one frame and the assertions are exact.
  el.setAttribute('data-option-damp-factor', '1');
  el.style.cssText = `position:absolute;top:${SPACER}px;left:0;width:100px;height:${HEIGHT}px`;
  el.innerHTML = Array.from(
    { length: targets },
    () => `
      <div
        data-component="ScrollAnimationTarget"
        data-option-damp-factor="1"
        data-option-from='{"opacity":0,"x":0}'
        data-option-to='{"opacity":1,"x":100}'
      ></div>`,
  ).join('');
  document.body.append(el);
  return el;
}

function bounds() {
  return { start: SPACER - window.innerHeight, end: SPACER + HEIGHT };
}

async function scrollTo(y: number): Promise<void> {
  window.scrollTo(0, y);
  await frames(10);
}

function targetsOf(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-component="ScrollAnimationTarget"]')];
}

describe('ScrollAnimationTimeline', () => {
  it('defaults to the reversible in-view mount strategy', () => {
    const el = document.createElement('div');
    expect(new ScrollAnimationTimeline(el).$config.mountStrategy).toBe('in-view');
  });

  it('tracks its targets as a live collection', async () => {
    const el = render({ targets: 2 });
    await settle();

    const timeline = getInstance<ScrollAnimationTimeline>(el, 'ScrollAnimationTimeline');
    expect(timeline.targets.size).toBe(2);

    const added = document.createElement('div');
    added.setAttribute('data-component', 'ScrollAnimationTarget');
    added.setAttribute('data-option-to', '{"opacity":1}');
    el.append(added);
    await settle();
    expect(timeline.targets.size).toBe(3);

    added.remove();
    await settle();
    expect(timeline.targets.size).toBe(2);
  });

  it('drives its targets from the scroll position', async () => {
    const el = render();
    await settle();
    const [target] = targetsOf(el);
    const { start, end } = bounds();

    await scrollTo(start);
    expect(Number(target.style.opacity)).toBeCloseTo(0, 2);

    await scrollTo(start + (end - start) / 2);
    expect(Number(target.style.opacity)).toBeCloseTo(0.5, 1);
    expect(target.style.transform).toContain('translate3d(5');

    await scrollTo(end);
    expect(Number(target.style.opacity)).toBeCloseTo(1, 2);
    expect(target.style.transform).toBe('translate3d(100px, 0px, 0px)');
  });

  it('renders every target of the timeline in one pass', async () => {
    const el = render({ targets: 3 });
    await settle();
    const { end } = bounds();

    await scrollTo(end);
    for (const target of targetsOf(el)) {
      expect(Number(target.style.opacity)).toBeCloseTo(1, 2);
    }
  });

  it('honours the play range of each target', async () => {
    const el = render({ targets: 2 });
    const [first, second] = targetsOf(el);
    first.setAttribute('data-option-play-range', '[0, 0.5]');
    second.setAttribute('data-option-play-range', '[0.5, 1]');
    await settle();

    const { start, end } = bounds();
    await scrollTo(start + (end - start) / 2);

    expect(Number(first.style.opacity)).toBeCloseTo(1, 1);
    expect(Number(second.style.opacity)).toBeCloseTo(0, 1);
  });

  it('picks up a target inserted after the timeline mounted', async () => {
    const el = render({ targets: 0 });
    await settle();

    const added = document.createElement('div');
    added.setAttribute('data-component', 'ScrollAnimationTarget');
    added.setAttribute('data-option-damp-factor', '1');
    added.setAttribute('data-option-from', '{"opacity":0}');
    added.setAttribute('data-option-to', '{"opacity":1}');
    el.append(added);
    await settle();

    await scrollTo(bounds().end);
    expect(Number(added.style.opacity)).toBeCloseTo(1, 2);
  });

  it('snaps a target to its nearest boundary when it is destroyed', async () => {
    const el = render();
    await settle();
    const [target] = targetsOf(el);
    const { start, end } = bounds();

    await scrollTo(start + (end - start) * 0.8);
    expect(Number(target.style.opacity)).toBeGreaterThan(0.5);

    getInstance<ScrollAnimationTarget>(target, 'ScrollAnimationTarget').$destroy();
    await frames(4);
    expect(target.style.opacity).toBe('1');
  });

  it('stops the frame subscription once the damped value settled', async () => {
    const el = render();
    await settle();
    const timeline = getInstance<ScrollAnimationTimeline>(el, 'ScrollAnimationTimeline');

    await scrollTo(bounds().end);
    expect((timeline as unknown as { __unsubscribeFrame: unknown }).__unsubscribeFrame).toBeNull();
  });
});
