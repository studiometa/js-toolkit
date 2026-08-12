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
    const unsubscribe = usePointer().add((props) => seen.push(snapshot(props)));

    move(100, 50);
    move(140, 90);
    unsubscribe();

    const [first, second] = seen;
    expect(first.x).toBe(100);
    expect(first.y).toBe(50);
    expect(second.deltaX).toBe(40);
    expect(second.deltaY).toBe(40);
    expect(second.lastX).toBe(100);
    expect(second.lastY).toBe(50);
    expect(second.changedX).toBe(true);
    expect(second.progressX).toBeCloseTo(140 / window.innerWidth, 5);
    expect(second.progressY).toBeCloseTo(90 / window.innerHeight, 5);
  });

  it('tracks the pressed state through pointerdown and pointerup', () => {
    const states: boolean[] = [];
    const unsubscribe = usePointer().add((props) => states.push(props.isDown));

    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 10, clientY: 10 }));
    // A canceled gesture releases just as well.
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
    document.dispatchEvent(new PointerEvent('pointercancel'));
    unsubscribe();

    expect(states).toEqual([true, false, true, false]);
  });

  it('stops listening when the last subscriber leaves', () => {
    let calls = 0;
    const unsubscribe = usePointer().add(() => {
      calls += 1;
    });

    move(10, 10);
    expect(calls).toBe(1);

    unsubscribe();
    move(20, 20);
    expect(calls).toBe(1);
  });
});
