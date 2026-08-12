import { describe, expect, it } from 'vitest';
import { usePointer, type PointerProps } from './pointer.js';

function snapshot(props: PointerProps) {
  return { ...props };
}

function move(x: number, y: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }));
}

describe('usePointer', () => {
  // First, because the props below are the ones every later test moves.
  it('starts centered, so progress means something before the first move', () => {
    // Read without subscribing: the service is not even running here.
    const props = usePointer().props();
    expect(props.x).toBe(window.innerWidth / 2);
    expect(props.progressX).toBe(0.5);
    expect(props.progressY).toBe(0.5);
  });

  it('follows the pointer and reports its delta and progress', () => {
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = usePointer().subscribe((props) => seen.push(snapshot(props)));

    move(100, 50);
    move(140, 90);
    unsubscribe();

    const [first, second] = seen;
    expect(first.x).toBe(100);
    expect(first.y).toBe(50);
    expect(second.deltaX).toBe(40);
    expect(second.deltaY).toBe(40);
    // The previous position is `x - deltaX`, so it is not a field.
    expect(second.x - second.deltaX).toBe(100);
    expect(second.y - second.deltaY).toBe(50);
    expect(second.progressX).toBeCloseTo(140 / window.innerWidth, 5);
    expect(second.progressY).toBeCloseTo(90 / window.innerHeight, 5);
  });

  it('tracks the pressed state through pointerdown and pointerup', () => {
    const states: boolean[] = [];
    const unsubscribe = usePointer().subscribe((props) => states.push(props.isDown));

    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 10, clientY: 10 }));
    // A canceled gesture releases just as well.
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
    document.dispatchEvent(new PointerEvent('pointercancel'));
    unsubscribe();

    expect(states).toEqual([true, false, true, false]);
  });

  it('reads the position of a press, not the one of the last move', () => {
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = usePointer().subscribe((props) => seen.push(snapshot(props)));

    move(207, 300);
    // A touch tap has no `pointermove` before it. Reading the position only
    // on move reported wherever the pointer had last been seen.
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 42, clientY: 84 }));

    const down = seen.at(-1);
    expect(down?.isDown).toBe(true);
    expect(down?.x).toBe(42);
    expect(down?.y).toBe(84);
    expect(down?.deltaX).toBe(42 - 207);

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 50, clientY: 84 }));
    const up = seen.at(-1);
    expect(up?.isDown).toBe(false);
    expect(up?.x).toBe(50);
    expect(up?.deltaX).toBe(8);
    expect(up?.deltaY).toBe(0);

    unsubscribe();
  });

  it('follows one pointer at a time, so a second finger cannot end the gesture', () => {
    const states: boolean[] = [];
    const unsubscribe = usePointer().subscribe((props) => states.push(props.isDown));

    const press = (pointerId: number, x: number) =>
      document.dispatchEvent(
        new PointerEvent('pointerdown', { pointerId, clientX: x, clientY: 0 }),
      );
    const lift = (pointerId: number, x: number) =>
      document.dispatchEvent(new PointerEvent('pointerup', { pointerId, clientX: x, clientY: 0 }));

    press(1, 10);
    expect(usePointer().props().isDown).toBe(true);

    // A pinch: the second finger comes and goes while the first holds.
    press(2, 200);
    lift(2, 200);
    expect(usePointer().props().isDown).toBe(true);
    expect(usePointer().props().x).toBe(10);

    lift(1, 10);
    expect(usePointer().props().isDown).toBe(false);
    expect(states).toEqual([true, false]);

    unsubscribe();
  });

  it('stops listening when the last subscriber leaves', () => {
    let calls = 0;
    const unsubscribe = usePointer().subscribe(() => {
      calls += 1;
    });

    move(10, 10);
    expect(calls).toBe(1);

    unsubscribe();
    move(20, 20);
    expect(calls).toBe(1);
  });

  it('lets go of the last event when it stops', () => {
    const el = document.createElement('div');
    document.body.append(el);

    const unsubscribe = usePointer().subscribe(() => {});
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 5, clientY: 5 }));
    expect(usePointer().props().event?.target).toBe(el);

    unsubscribe();
    el.remove();

    // The service is a module-level singleton, so a retained event pinned
    // its `target` — and every ancestor of the subtree that left with it —
    // for the life of the page.
    expect(usePointer().props().event).toBeNull();
  });
});
