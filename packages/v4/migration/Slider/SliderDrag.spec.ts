import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { frames, getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Slider } from './Slider.js';
import { SliderDrag } from './SliderDrag.js';
import type { DragMode } from '../../src/index.js';

registerComponents(Slider);

const ITEM_WIDTH = 100;

afterEach(resetDom);

function render({ items = 3, options = '' } = {}): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-component', 'Slider');
  root.innerHTML = `
    <div data-component="SliderDrag" data-ref="wrapper" tabindex="0"
      style="width:${ITEM_WIDTH}px;overflow:hidden;display:flex">
      ${Array.from(
        { length: items },
        (_, index) =>
          `<div data-component="SliderItem" style="flex:0 0 ${ITEM_WIDTH}px;height:20px">${index}</div>`,
      ).join('')}
    </div>
  `;
  for (const attribute of options.split(' ').filter(Boolean)) {
    const [name, value = ''] = attribute.split('=');
    root.setAttribute(name, value);
  }
  document.body.append(root);
  return root;
}

async function ready(root: HTMLElement) {
  await settle();
  await frames(4);
  const track = root.querySelector('[data-component="SliderDrag"]') as HTMLElement;
  return {
    slider: getInstance<Slider>(root, 'Slider'),
    drag: getInstance<SliderDrag>(track, 'SliderDrag'),
    track,
  };
}

/** Real pointer events, at the element the service listens on. */
function grab(el: HTMLElement, x: number): void {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: 0,
      bubbles: true,
    }),
  );
}

function move(x: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { buttons: 1, clientX: x, clientY: 0 }));
}

function release(): void {
  window.dispatchEvent(new PointerEvent('pointerup'));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Collect the events SliderDrag re-emits, which bubble past the Slider. */
function record(): { modes: string[]; stop: () => void } {
  const modes: string[] = [];
  const names: DragMode[] = ['idle', 'start', 'drag', 'drop', 'inertia', 'stop'];
  const listeners = names.map((name) => {
    const listener = () => modes.push(name);
    document.addEventListener(name, listener);
    return () => document.removeEventListener(name, listener);
  });
  return { modes, stop: () => listeners.forEach((off) => off()) };
}

describe('SliderDrag', () => {
  it('re-emits the drag lifecycle, and never the idle mode', async () => {
    const root = render();
    const { track } = await ready(root);
    const { modes, stop } = record();

    grab(track, 50);
    expect(modes).toEqual(['start']);

    // One pixel, so the coast this releases is short enough to watch end.
    move(49);
    expect(modes.at(-1)).toBe('drag');

    release();
    expect(modes).toContain('drop');

    // The coast runs on the scheduler tick, so real frames finish it.
    await frames(40);
    stop();

    expect(modes.at(-1)).toBe('stop');
    expect(modes).toContain('inertia');
    // `idle` is what the service reports outside a gesture; announcing it
    // would be an event about nothing happening.
    expect(modes).not.toContain('idle');
  });

  it('moves every slide with the pointer', async () => {
    const root = render();
    const { slider, track } = await ready(root);

    grab(track, 50);
    move(20);

    // Set synchronously by `moveInstantly`, written on the next frame.
    for (const item of slider.items) {
      expect(item.x).toBe(-30);
    }
    await frames(2);
    expect(slider.items.items[0].$el.style.transform).toBe('translate3d(-30px, 0px, 0px)');

    release();
    await frames(20);
  });

  it('multiplies the movement by the sensitivity option', async () => {
    const root = render({ options: 'data-option-sensitivity=2' });
    const { slider, track } = await ready(root);

    grab(track, 50);
    move(20);

    for (const item of slider.items) {
      expect(item.x).toBe(-60);
    }

    release();
    await frames(20);
  });

  it('is relative to the slide the gesture started from', async () => {
    const root = render();
    const { slider, track } = await ready(root);

    slider.goTo(1);
    expect(slider.items.items[0].x).toBe(-ITEM_WIDTH);

    grab(track, 50);
    move(40);
    expect(slider.items.items[0].x).toBe(-ITEM_WIDTH - 10);

    release();
    await frames(20);
  });

  it('throws to the closest slide on a flick, with fitBounds', async () => {
    const root = render({ options: 'data-option-fit-bounds' });
    const { slider, track } = await ready(root);

    // One large, fast movement: the velocity saturates the clamp, so the
    // throw lands on the last state whatever the exact reading was.
    grab(track, 90);
    move(10);
    release();
    await frames(4);

    expect(slider.currentIndex).toBe(slider.indexMax);
    for (const item of slider.items) {
      expect(item.x).toBe(-2 * ITEM_WIDTH);
    }
  });

  it('lets a paused gesture settle where it was released', async () => {
    const root = render({ options: 'data-option-fit-bounds' });
    const { slider, track } = await ready(root);

    grab(track, 50);
    move(20);
    // Holding still costs the velocity: it is decayed by the idle time at the
    // drop, through the law the coast itself obeys. v3 kept the last move's
    // delta however long the pause was, so letting go after a pause flung the
    // slider.
    await sleep(300);
    release();
    await frames(4);

    expect(slider.currentIndex).toBe(0);
    for (const item of slider.items) {
      // `toBeCloseTo` because the first state is a measured difference, so it
      // is `-0` rather than `0`.
      expect(item.x).toBeCloseTo(0);
    }
  });

  it('rests between two slides without fitBounds', async () => {
    const root = render();
    const { slider, track } = await ready(root);

    grab(track, 50);
    move(20);
    await sleep(300);
    release();
    await frames(4);

    // The index follows the closest state, but the slides stay where the
    // gesture left them — which is the whole point of the option.
    expect(slider.currentIndex).toBe(0);
    const [first] = slider.items.items;
    expect(first.x).toBeLessThan(-25);
    expect(first.x).toBeGreaterThan(-50);
  });

  it('leaves the vertical axis to the browser', async () => {
    const root = render();
    const { track } = await ready(root);

    // v3 blocked the native gesture from an `onTouchmove` handler once a touch
    // drag looked horizontal. `pan-y` is that heuristic as a platform rule —
    // and it survives the drag service, which only writes `touch-action: none`
    // over a computed `auto`.
    expect(track.style.touchAction).toBe('pan-y');
    expect(getComputedStyle(track).touchAction).toBe('pan-y');

    track.remove();
    await settle();
    expect(track.style.touchAction).toBe('');
  });

  it('is optional: the same markup with no track still navigates', async () => {
    const root = render();
    const { slider, drag } = await ready(root);

    drag.$terminate();
    slider.goNext();

    expect(slider.currentIndex).toBe(1);
  });
});
