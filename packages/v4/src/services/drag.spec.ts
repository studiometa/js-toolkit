import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import { countRequestedFrames, frames } from '../test-utils.js';
import { DRAG_MODES, useDrag, type DragMode, type DragProps } from './drag.js';

function render(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', 'position:absolute;top:0;left:0;width:100px;height:100px');
  document.body.append(el);
  return el;
}

function grab(el: HTMLElement, x: number, y: number, pointerType = 'mouse'): void {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y,
      pointerType,
      bubbles: true,
    }),
  );
}

function move(x: number, y: number, pointerType = 'mouse'): void {
  document.dispatchEvent(
    new PointerEvent('pointermove', { buttons: 1, clientX: x, clientY: y, pointerType }),
  );
}

function release(): void {
  window.dispatchEvent(new PointerEvent('pointerup'));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DRAG_MODES', () => {
  it('names every mode the service can report', () => {
    // The constants are the discoverable surface for a component written in
    // plain JavaScript, where the union type is invisible. If the service ever
    // reports a mode the object does not name, that audience cannot spell it.
    expect(Object.values(DRAG_MODES)).toEqual(['idle', 'start', 'drag', 'drop', 'inertia', 'stop']);
  });

  it('types the mode from the object, so the two cannot drift', () => {
    // Assignable both ways: the type is derived from the constants, and a bare
    // literal still satisfies it.
    const fromConstant: DragMode = DRAG_MODES.INERTIA;
    const fromLiteral: DragMode = 'inertia';
    expect(fromConstant).toBe(fromLiteral);
  });
});

describe('useDrag', () => {
  it('walks through the whole drag cycle', async () => {
    const el = render();
    const modes: DragMode[] = [];
    const last: DragProps[] = [];
    // A steep damping so the inertia settles in a handful of frames.
    const unsubscribe = useDrag(el, { dampFactor: 0.1 }).subscribe((props) => {
      modes.push(props.mode);
      last.push({ ...props });
    });

    grab(el, 10, 10);
    expect(modes).toEqual(['start']);
    expect(last[0].originX).toBe(10);
    expect(last[0].originY).toBe(10);

    move(60, 30);
    expect(modes.at(-1)).toBe('drag');
    expect(last.at(-1)?.deltaX).toBe(50);
    expect(last.at(-1)?.deltaY).toBe(20);
    expect(last.at(-1)?.distanceX).toBe(50);
    expect(last.at(-1)?.distanceY).toBe(20);

    release();
    expect(modes.at(-1)).toBe('drop');
    // The final position is known at drop time, before the first inertia
    // frame runs.
    expect(last.at(-1)?.finalX).toBeGreaterThan(60);

    await frames(6);
    unsubscribe();

    expect(modes).toContain('inertia');
    expect(modes.at(-1)).toBe('stop');
    // `stop` is announced once; the props rest on `idle`, which is also what
    // they report before the first gesture. Held and coasting are readings of
    // `mode`, not flags beside it.
    expect(useDrag(el, { dampFactor: 0.1 }).props().mode).toBe('idle');
    // The coast arrives exactly where the drop said it would.
    expect(last.at(-1)?.x).toBe(last.at(-1)?.finalX);
  });

  it.each(['mouse', 'touch'])('filters %s pointer movement to the owned axis', (pointerType) => {
    for (const axis of ['x', 'y'] as const) {
      const el = render();
      const seen: DragProps[] = [];
      const unsubscribe = useDrag(el, { axis, inertia: false }).subscribe((props) => {
        seen.push({ ...props });
      });

      grab(el, 10, 20, pointerType);
      move(70, 90, pointerType);

      const dragged = seen.find(({ mode }) => mode === DRAG_MODES.DRAG) as DragProps;
      if (axis === 'x') {
        expect(dragged.x).toBe(70);
        expect(dragged.deltaX).toBe(60);
        expect(dragged.distanceX).toBe(60);
        expect(dragged.y).toBe(20);
        expect(dragged.deltaY).toBe(0);
        expect(dragged.distanceY).toBe(0);
      } else {
        expect(dragged.x).toBe(10);
        expect(dragged.deltaX).toBe(0);
        expect(dragged.distanceX).toBe(0);
        expect(dragged.y).toBe(90);
        expect(dragged.deltaY).toBe(70);
        expect(dragged.distanceY).toBe(70);
      }

      release();
      const dropped = seen.find(({ mode }) => mode === DRAG_MODES.DROP) as DragProps;
      if (axis === 'x') {
        expect(dropped.finalX).toBeGreaterThan(dropped.x);
        expect(dropped.finalY).toBe(20);
        expect(dropped.distanceX).toBe(60);
        expect(dropped.distanceY).toBe(0);
      } else {
        expect(dropped.finalX).toBe(10);
        expect(dropped.finalY).toBeGreaterThan(dropped.y);
        expect(dropped.distanceX).toBe(0);
        expect(dropped.distanceY).toBe(70);
      }

      unsubscribe();
      el.remove();
    }
  });

  it('computes the settle position in closed form, and does not revise it', async () => {
    const el = render();
    // Barely any decay per frame, which is what made the old term-by-term
    // walk run ~690 000 iterations — twice per drop, blocking the
    // `pointerup` for 2.3 to 4.4 ms. A coast this slow never finishes, which
    // is the point: the destination is known without travelling to it.
    const dampFactor = 0.99999;
    const seen: DragProps[] = [];
    const unsubscribe = useDrag(el, { dampFactor }).subscribe((props) => {
      seen.push({ ...props });
    });

    grab(el, 0, 0);
    move(50, 0);
    release();
    const drop = seen.at(-1) as DragProps;

    // Finite and far away, where the walk would have blocked to reach it.
    expect(Number.isFinite(drop.finalX)).toBe(true);
    expect(drop.finalX).toBeGreaterThan(50);

    await frames(5);
    const coasting = seen.filter((props) => props.mode === DRAG_MODES.INERTIA);

    // The invariant, asserted without assuming how the velocity was measured:
    // every frame moves and none of them moves the destination. A walk that
    // recomputed the sum as the delta shrank would drift instead.
    expect(coasting.length).toBeGreaterThan(1);
    for (const props of coasting) {
      expect(props.finalX).toBe(drop.finalX);
      expect(props.finalY).toBe(drop.finalY);
    }
    expect(coasting.at(-1)?.x).toBeGreaterThan(coasting[0].x);

    unsubscribe();
  });

  it('coasts to the position announced at the drop, whatever the frames cost', async () => {
    const el = render();
    const seen: DragProps[] = [];
    const unsubscribe = useDrag(el, { dampFactor: 0.5 }).subscribe((props) => {
      seen.push({ ...props });
    });

    grab(el, 0, 0);
    move(40, 20);
    release();
    const drop = seen.at(-1) as DragProps;

    await frames(40);
    const stopped = seen.at(-1) as DragProps;

    // The drop's promise, kept to the pixel. Real frames here are whatever
    // this machine delivered — the assertion holds because each step
    // integrates the decay across its own elapsed time rather than counting
    // frames, so a stutter cannot shorten the coast.
    expect(stopped.mode).toBe(DRAG_MODES.STOP);
    expect(stopped.x).toBe(drop.finalX);
    expect(stopped.y).toBe(drop.finalY);
    expect(drop.finalX).toBeGreaterThan(40);

    unsubscribe();
  });

  it('does not fling when the pointer held still before letting go', async () => {
    const el = render();
    const seen: DragProps[] = [];
    const unsubscribe = useDrag(el).subscribe((props) => {
      seen.push({ ...props });
    });

    grab(el, 0, 0);
    move(120, 0);
    // Held still. The last move's delta used to survive the pause intact, so
    // letting go after thinking about it threw as hard as letting go mid-swipe.
    await frames(25);
    release();
    const drop = seen.at(-1) as DragProps;

    expect(drop.mode).toBe(DRAG_MODES.DROP);
    // A couple of pixels of drift is fine; a fling is tens or hundreds.
    expect(Math.abs(drop.finalX - drop.x)).toBeLessThan(5);

    unsubscribe();
  });

  it('does not amplify the throw when the release looks older than the move', async () => {
    const el = render();
    const seen: DragProps[] = [];
    const unsubscribe = useDrag(el).subscribe((props) => {
      seen.push({ ...props });
    });

    grab(el, 0, 0);
    // Built now, dispatched after the move, so its `timeStamp` is *earlier*
    // than the sample it will be compared against — which is what a mismatched
    // clock looks like from inside the service. Unguarded, the negative idle
    // ran the decay backwards and multiplied the velocity.
    const staleRelease = new PointerEvent('pointerup');
    move(120, 0);
    window.dispatchEvent(staleRelease);
    const drop = seen.at(-1) as DragProps;

    expect(drop.mode).toBe(DRAG_MODES.DROP);
    expect(Number.isFinite(drop.finalX)).toBe(true);
    // A plausible throw for a 120 px move, not a launch.
    expect(drop.finalX).toBeLessThan(drop.x + 2000);

    unsubscribe();
  });

  it('still flings when the pointer was moving as it let go', async () => {
    const el = render();
    const seen: DragProps[] = [];
    const unsubscribe = useDrag(el).subscribe((props) => {
      seen.push({ ...props });
    });

    grab(el, 0, 0);
    move(60, 0);
    move(120, 0);
    release();
    const drop = seen.at(-1) as DragProps;

    // The other side of the same guard: a live gesture must still throw.
    expect(drop.finalX).toBeGreaterThan(drop.x + 20);

    unsubscribe();
  });

  it('keeps the projected drop but skips the scheduler coast when inertia is disabled', async () => {
    const el = render();
    const seen: DragProps[] = [];
    const unsubscribe = useDrag(el, { inertia: false }).subscribe((props) => {
      seen.push({ ...props });
    });

    grab(el, 10, 20);
    move(90, 60);
    const requested = await countRequestedFrames(async () => {
      release();
      await sleep(50);
    });

    const drop = seen.find(({ mode }) => mode === DRAG_MODES.DROP) as DragProps;
    const stop = seen.find(({ mode }) => mode === DRAG_MODES.STOP) as DragProps;
    expect(seen.map(({ mode }) => mode)).toEqual(['start', 'drag', 'drop', 'stop']);
    expect(drop.finalX).toBeGreaterThan(drop.x);
    expect(drop.finalY).toBeGreaterThan(drop.y);
    expect(stop.x).toBe(drop.finalX);
    expect(stop.y).toBe(drop.finalY);
    expect(stop.finalX).toBe(drop.finalX);
    expect(stop.finalY).toBe(drop.finalY);
    expect(useDrag(el, { inertia: false }).props().mode).toBe(DRAG_MODES.IDLE);
    expect(requested).toBe(0);

    unsubscribe();
  });

  it('drops when the button is released outside the window', () => {
    const el = render();
    const modes: DragMode[] = [];
    const unsubscribe = useDrag(el).subscribe((props) => modes.push(props.mode));

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
    const unsubscribe = useDrag(el).subscribe(() => {});

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
    const unsubscribe = useDrag(el).subscribe(() => {});

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

  it('owns the touch-action for its axis only when nothing else has', () => {
    for (const [axis, touchAction] of [
      ['x', 'pan-y'],
      ['y', 'pan-x'],
      ['both', 'none'],
    ] as const) {
      const el = render();
      el.style.touchAction = 'auto';
      const unsubscribe = useDrag(el, { axis }).subscribe(() => {});
      expect(el.style.touchAction).toBe(touchAction);
      unsubscribe();
      // The exact prior inline value is restored, not only its computed
      // equivalent.
      expect(el.style.touchAction).toBe('auto');
    }

    // Consumer CSS is deliberate, and wins.
    const styled = render();
    styled.style.touchAction = 'pan-y';
    const unsubscribeStyled = useDrag(styled, { axis: 'both' }).subscribe(() => {});
    expect(styled.style.touchAction).toBe('pan-y');
    unsubscribeStyled();
    expect(styled.style.touchAction).toBe('pan-y');
  });

  it('keeps shared touch-action ownership until the final option service leaves', () => {
    const el = render();
    const releaseX = useDrag(el, { axis: 'x' }).subscribe(() => {});
    const releaseXWithoutInertia = useDrag(el, { axis: 'x', inertia: false }).subscribe(() => {});
    expect(el.style.touchAction).toBe('pan-y');

    releaseX();
    expect(el.style.touchAction).toBe('pan-y');

    const releaseY = useDrag(el, { axis: 'y' }).subscribe(() => {});
    expect(el.style.touchAction).toBe('none');

    releaseXWithoutInertia();
    expect(el.style.touchAction).toBe('pan-x');
    releaseY();
    expect(el.style.touchAction).toBe('');
  });

  it('drags an SVG element as readily as an HTML one', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    svg.append(handle);
    document.body.append(svg);

    const modes: DragMode[] = [];
    const unsubscribe = useDrag(handle).subscribe(({ mode }) => modes.push(mode));
    handle.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    unsubscribe();

    expect(modes).toEqual(['start']);
  });

  it('starts no inertia when the drop takes the last subscriber with it', async () => {
    const el = render();
    const emits: DragMode[] = [];
    // A component that unmounts on drop: the unsubscribe runs *inside* the
    // `drop` update, so the service is already torn down when `drop()`
    // resumes. Subscribing the inertia tick there left a frame loop running
    // for the life of the page, computing inertia into a dead service.
    let unsubscribe = (): void => {};
    unsubscribe = useDrag(el, { dampFactor: 0.99 }).subscribe(({ mode }) => {
      emits.push(mode);
      if (mode === 'drop') {
        unsubscribe();
      }
    });

    grab(el, 0, 0);
    move(200, 0);

    const requested = await countRequestedFrames(async () => {
      release();
      // A real span rather than `frames()`, which would request its own.
      await sleep(150);
    });

    expect(emits.at(-1)).toBe('drop');
    expect(requested).toBe(0);
  });

  it('delivers a live gesture on subscribe, and nothing at rest', () => {
    const el = render();
    const service = useDrag(el);

    // At rest there is no position, no origin and no destination — which is
    // what `idle` says — so there is nothing to deliver.
    const cold: DragProps[] = [];
    const first = service.subscribe((props) => cold.push({ ...props }), { immediate: true });
    expect(cold).toEqual([]);
    expect(service.props().mode).toBe(DRAG_MODES.IDLE);

    grab(el, 10, 10);
    move(70, 40);

    // A component mounting in the middle of a gesture is the case this option
    // exists for here: it is handed the gesture rather than told about it one
    // move later.
    const warm: DragProps[] = [];
    const second = service.subscribe((props) => warm.push({ ...props }), { immediate: true });
    expect(warm).toHaveLength(1);
    expect(warm[0].mode).toBe(DRAG_MODES.DRAG);
    expect(warm[0].x).toBe(70);
    expect(warm[0].distanceX).toBe(60);

    first();
    second();
  });

  it('shares one service per element and releases it with the last subscriber', () => {
    const el = render();
    expect(useDrag(el)).toBe(useDrag(el));
    expect(useDrag(el)).not.toBe(useDrag(render()));

    let calls = 0;
    const unsubscribe = useDrag(el).subscribe(() => {
      calls += 1;
    });
    grab(el, 0, 0);
    expect(calls).toBe(1);

    unsubscribe();
    grab(el, 0, 0);
    expect(calls).toBe(1);
  });

  /**
   * The live half of REPORT.md gap 26: two components dragging the same
   * element with different options used to share the first caller's service,
   * so the second one silently got a damping and a threshold it never asked
   * for.
   */
  it('gives two callers with different options a service each', () => {
    const el = render();
    expect(useDrag(el, { dampFactor: 0.1 })).toBe(useDrag(el, { dampFactor: 0.1 }));
    expect(useDrag(el, { dampFactor: 0.1 })).not.toBe(useDrag(el, { dampFactor: 0.5 }));
    expect(useDrag(el, { dragThreshold: 4 })).not.toBe(useDrag(el));
    expect(useDrag(el, { axis: 'x' })).toBe(useDrag(el, { axis: 'x' }));
    expect(useDrag(el, { axis: 'x' })).not.toBe(useDrag(el, { axis: 'y' }));
    expect(useDrag(el, { inertia: false })).toBe(useDrag(el, { inertia: false }));
    expect(useDrag(el, { inertia: false })).not.toBe(useDrag(el));
  });
});
