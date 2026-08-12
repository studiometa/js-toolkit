import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { frames } from '../test-utils.js';
import { useDrag, type DragMode, type DragProps } from './drag.js';

function render(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', 'position:absolute;top:0;left:0;width:100px;height:100px');
  document.body.append(el);
  return el;
}

function grab(el: HTMLElement, x: number, y: number): void {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y,
      bubbles: true,
    }),
  );
}

function move(x: number, y: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { buttons: 1, clientX: x, clientY: y }));
}

function release(): void {
  window.dispatchEvent(new PointerEvent('pointerup'));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Count the frames the page requests over a real span of time. `frames()`
 * requests its own, so a test watching for a leaked loop has to wait on a
 * timer instead.
 */
async function countRequestedFrames(ms: number, run: () => void): Promise<number> {
  const original = globalThis.requestAnimationFrame;
  let calls = 0;
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    calls += 1;
    return original.call(globalThis, callback);
  }) as typeof requestAnimationFrame;
  try {
    run();
    await sleep(ms);
  } finally {
    globalThis.requestAnimationFrame = original;
  }
  return calls;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useDrag', () => {
  it('walks through the whole drag cycle', async () => {
    const el = render();
    const modes: DragMode[] = [];
    const last: DragProps[] = [];
    // A steep damping so the inertia settles in a handful of frames.
    const unsubscribe = useDrag(el, { dampFactor: 0.1 }).add((props) => {
      modes.push(props.mode);
      last.push({ ...props });
    });

    grab(el, 10, 10);
    expect(modes).toEqual(['start']);
    expect(last[0].originX).toBe(10);
    expect(last[0].originY).toBe(10);
    expect(last[0].isGrabbing).toBe(true);

    move(60, 30);
    expect(modes.at(-1)).toBe('drag');
    expect(last.at(-1)?.deltaX).toBe(50);
    expect(last.at(-1)?.deltaY).toBe(20);
    expect(last.at(-1)?.distanceX).toBe(50);
    expect(last.at(-1)?.distanceY).toBe(20);

    release();
    expect(modes.at(-1)).toBe('drop');
    expect(last.at(-1)?.isGrabbing).toBe(false);
    expect(last.at(-1)?.hasInertia).toBe(true);
    // The final position is known at drop time, before the first inertia
    // frame runs.
    expect(last.at(-1)?.finalX).toBeGreaterThan(60);

    await frames(6);
    unsubscribe();

    expect(modes).toContain('inertia');
    expect(modes.at(-1)).toBe('stop');
    expect(last.at(-1)?.hasInertia).toBe(false);
    // The coast arrives exactly where the drop said it would.
    expect(last.at(-1)?.x).toBe(last.at(-1)?.finalX);
  });

  it('computes the settle position in closed form', () => {
    const el = render();
    // Barely any decay per frame, which is what made the old term-by-term
    // walk run ~690 000 iterations — twice per drop, blocking the
    // `pointerup` for 2.3 to 4.4 ms.
    const dampFactor = 0.99999;
    const drops: DragProps[] = [];
    const unsubscribe = useDrag(el, { dampFactor }).add((props) => {
      if (props.mode === 'drop') {
        drops.push({ ...props });
      }
    });

    grab(el, 0, 0);
    move(50, 0);
    release();
    unsubscribe();

    // The exact sum, where walking it stopped 10 000 px short of it. Timing
    // is not asserted: the value is what proves the loop is gone.
    expect(drops[0].finalX).toBe(50 + 50 / (1 - dampFactor));
  });

  it('drops when the button is released outside the window', () => {
    const el = render();
    const modes: DragMode[] = [];
    const unsubscribe = useDrag(el).add((props) => modes.push(props.mode));

    grab(el, 0, 0);
    // No button pressed anymore: the pointer came back without it.
    document.dispatchEvent(
      new PointerEvent('pointermove', { buttons: 0, clientX: 40, clientY: 0 }),
    );
    unsubscribe();

    expect(modes).toEqual(['start', 'drop']);
  });

  it('blocks the click that ends a real drag, not the one that ends a tap', async () => {
    const el = render();
    el.innerHTML =
      '<span style="position:absolute;left:0;top:0;width:20px;height:20px"></span>' +
      '<span style="position:absolute;left:70px;top:0;width:20px;height:20px"></span>';
    const [from, to] = [...el.children] as HTMLElement[];
    let clicks = 0;
    document.body.addEventListener('click', () => {
      clicks += 1;
    });
    const unsubscribe = useDrag(el).add(() => {});

    // Real input, because the guard only ever suppresses a click the browser
    // synthesized itself. Pressing on one child and releasing on another
    // makes the browser fire that click on their common ancestor, which is
    // the dragged element.
    await userEvent.dragAndDrop(from, to);
    expect(clicks).toBe(0);

    // A press that never moved is a click, and stays one.
    await userEvent.click(to);
    expect(clicks).toBe(1);

    unsubscribe();
  });

  it('never blocks a click it did not synthesize itself', () => {
    const el = render();
    el.innerHTML = '<a href="#target">link</a>';
    const link = el.firstElementChild as HTMLElement;
    let clicks = 0;
    document.body.addEventListener('click', () => {
      clicks += 1;
    });
    const unsubscribe = useDrag(el).add(() => {});

    grab(el, 0, 0);
    move(100, 0);
    release();

    // Keyboard activation of a link inside a dragged card, and every other
    // programmatic click: the guard used to read the drag distance, which
    // outlives its gesture, so all of them were cancelled from the first
    // real drag onwards.
    link.click();
    expect(clicks).toBe(1);

    // And a gesture later, with nothing dragged in between.
    grab(el, 0, 0);
    release();
    link.click();
    expect(clicks).toBe(2);

    unsubscribe();
  });

  it('starts no inertia when the drop takes the last subscriber with it', async () => {
    const el = render();
    const emits: DragMode[] = [];
    // A component that unmounts on drop: the unsubscribe runs *inside* the
    // `drop` update, so the service is already torn down when `drop()`
    // resumes. Subscribing the inertia tick there left a frame loop running
    // for the life of the page, computing inertia into a dead service.
    let unsubscribe = (): void => {};
    unsubscribe = useDrag(el, { dampFactor: 0.99 }).add(({ mode }) => {
      emits.push(mode);
      if (mode === 'drop') {
        unsubscribe();
      }
    });

    grab(el, 0, 0);
    move(200, 0);

    const requested = await countRequestedFrames(150, release);

    expect(emits.at(-1)).toBe('drop');
    expect(requested).toBe(0);
  });

  it('shares one service per element and releases it with the last subscriber', () => {
    const el = render();
    expect(useDrag(el)).toBe(useDrag(el));
    expect(useDrag(el)).not.toBe(useDrag(render()));

    let calls = 0;
    const unsubscribe = useDrag(el).add(() => {
      calls += 1;
    });
    grab(el, 0, 0);
    expect(calls).toBe(1);

    unsubscribe();
    grab(el, 0, 0);
    expect(calls).toBe(1);
  });
});
