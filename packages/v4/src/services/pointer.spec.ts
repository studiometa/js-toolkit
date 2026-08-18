import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { Base } from '../Base.js';
import {
  usePointer,
  withPointer,
  type ElementPointerProps,
  type PointerHook,
  type PointerMixinOptions,
  type PointerProps,
} from './pointer.js';
import type { Service } from './service.js';
import type { Toggle } from './toggle.js';

function snapshot(props: PointerProps) {
  return { ...props };
}

function move(x: number, y: number): void {
  document.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }));
}

/** A box at a known place in the viewport, whichever way the page is scrolled. */
function fixedBox(left: number, top: number, width: number, height: number): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
  document.body.append(el);
  return el;
}

/**
 * Count the layout reads one element serves, without touching the prototype.
 * `box()` measures without counting, so a test can check geometry itself.
 */
function countReads(el: Element) {
  const box = el.getBoundingClientRect.bind(el);
  let reads = 0;
  el.getBoundingClientRect = () => {
    reads += 1;
    return box();
  };
  return { box, reads: () => reads };
}

/** A `ResizeObserver` delivers after the frame's callbacks, so two frames is the safe wait. */
async function frames(count = 2): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

async function scrollWindowTo(y: number): Promise<void> {
  const scrolled = new Promise<void>((resolve) =>
    window.addEventListener('scroll', () => resolve(), { once: true }),
  );
  window.scrollTo(0, y);
  await scrolled;
}

function typeAssertions(instance: Follower): void {
  expectTypeOf(usePointer()).toEqualTypeOf<Service<PointerProps>>();
  expectTypeOf(usePointer(document.body)).toEqualTypeOf<Service<ElementPointerProps>>();
  expectTypeOf<PointerHook>().toMatchTypeOf<{
    moved?: (props: ElementPointerProps) => void;
  }>();
  expectTypeOf(instance.$services.moved).toEqualTypeOf<Toggle>();
  // @ts-expect-error service props belong to the service
  usePointer(document.body).props().relativeX = 1;
}
void typeAssertions;

const mixinOptionsTypeAssertions: PointerMixinOptions = {
  target: (instance) => instance.$el,
  manual: true,
  immediate: false,
};
void mixinOptionsTypeAssertions;

class Follower extends withPointer(Base) {
  seen: ElementPointerProps[] = [];

  moved(props: ElementPointerProps): void {
    this.seen.push({ ...props });
  }
}

describe('usePointer', () => {
  it('starts centered, so progress means something before the first move', () => {
    const props = usePointer().props();
    expect(props.x).toBe(window.innerWidth / 2);
    expect(props.progressX).toBe(0.5);
    expect(props.progressY).toBe(0.5);
  });

  it('has nothing to deliver on subscribe until the pointer has been seen', () => {
    expect(usePointer().props().event).toBeNull();

    const cold: PointerProps[] = [];
    const first = usePointer().subscribe((props) => cold.push(snapshot(props)), {
      immediate: true,
    });
    expect(cold).toEqual([]);

    move(120, 60);
    expect(cold).toHaveLength(1);

    const warm: PointerProps[] = [];
    const second = usePointer().subscribe((props) => warm.push(snapshot(props)), {
      immediate: true,
    });
    expect(warm.at(-1)?.x).toBe(120);
    expect(warm.at(-1)?.y).toBe(60);

    first();
    second();
    expect(usePointer().props().event).toBeNull();
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
    document.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10 }));
    document.dispatchEvent(new PointerEvent('pointercancel'));
    unsubscribe();

    expect(states).toEqual([true, false, true, false]);
  });

  it('reads the position of a press, not the one of the last move', () => {
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = usePointer().subscribe((props) => seen.push(snapshot(props)));

    move(207, 300);
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

    expect(usePointer().props().event).toBeNull();
  });
});

describe('usePointer(target)', () => {
  afterEach(async () => {
    window.scrollTo(0, 0);
    document.body.innerHTML = '';
    await frames(1);
  });

  it('places the pointer inside a positioned element', () => {
    const el = fixedBox(100, 50, 200, 100);
    const seen: ElementPointerProps[] = [];
    const unsubscribe = usePointer(el).subscribe((props) => seen.push({ ...props }));

    move(150, 80);
    expect(seen.at(-1)?.x).toBe(150);
    expect(seen.at(-1)?.relativeX).toBe(50);
    expect(seen.at(-1)?.relativeY).toBe(30);
    expect(seen.at(-1)?.relativeProgressX).toBeCloseTo(0.25, 5);
    expect(seen.at(-1)?.relativeProgressY).toBeCloseTo(0.3, 5);

    // Outside the box the position keeps its sign instead of clamping.
    move(80, 80);
    expect(seen.at(-1)?.relativeX).toBe(-20);
    expect(seen.at(-1)?.relativeProgressX).toBeCloseTo(-0.1, 5);

    unsubscribe();
  });

  it('answers a cold read from the shared pointer, placed in the box', () => {
    const el = fixedBox(100, 50, 200, 100);
    const props = usePointer(el).props();

    expect(props.event).toBeNull();
    expect(props.relativeX).toBe(usePointer().props().x - 100);
    expect(props.relativeY).toBe(usePointer().props().y - 50);
  });

  it('delivers immediately once the shared pointer has been seen', () => {
    const el = fixedBox(100, 50, 200, 100);
    const cold: ElementPointerProps[] = [];
    const first = usePointer(el).subscribe((props) => cold.push({ ...props }), {
      immediate: true,
    });
    expect(cold).toEqual([]);

    move(150, 80);
    expect(cold).toHaveLength(1);

    const warm: ElementPointerProps[] = [];
    const second = usePointer(el).subscribe((props) => warm.push({ ...props }), {
      immediate: true,
    });
    expect(warm.at(-1)?.relativeX).toBe(50);
    expect(cold).toHaveLength(1);

    first();
    second();
  });

  it('reads the target box once for a burst of events, not once per event', () => {
    const el = fixedBox(100, 50, 200, 100);
    const { reads } = countReads(el);
    const unsubscribe = usePointer(el).subscribe(() => {});

    expect(reads()).toBe(0);
    for (let index = 0; index < 100; index += 1) {
      move(100 + index, 50 + index);
    }
    expect(reads()).toBe(1);

    unsubscribe();
  });

  it('measures again when the page scrolled under the pointer', async () => {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;left:100px;top:800px;width:200px;height:100px';
    const spacer = document.createElement('div');
    spacer.style.cssText = 'height:3000px';
    document.body.append(el, spacer);

    const seen: ElementPointerProps[] = [];
    const { box, reads } = countReads(el);
    const unsubscribe = usePointer(el).subscribe((props) => seen.push({ ...props }));

    const before = box();
    move(150, before.top + 20);
    expect(seen.at(-1)?.relativeY).toBe(20);

    await scrollWindowTo(300);
    const after = box();
    expect(after.top).toBe(before.top - 300);

    move(150, after.top + 20);
    expect(seen.at(-1)?.relativeY).toBe(20);
    // One read for the first box, one for the box the scroll moved.
    expect(reads()).toBe(2);

    unsubscribe();
  });

  it('measures again when the target resized under the pointer', async () => {
    const el = fixedBox(100, 50, 200, 100);
    const seen: ElementPointerProps[] = [];
    const unsubscribe = usePointer(el).subscribe((props) => seen.push({ ...props }));

    move(150, 80);
    expect(seen.at(-1)?.relativeProgressX).toBeCloseTo(0.25, 5);

    el.style.width = '400px';
    await frames();

    move(150, 80);
    expect(seen.at(-1)?.relativeProgressX).toBeCloseTo(0.125, 5);

    unsubscribe();
  });

  it('shares one service per target and releases the shared pointer with its last subscriber', () => {
    const el = fixedBox(100, 50, 200, 100);
    const other = fixedBox(0, 0, 10, 10);
    expect(usePointer(el)).toBe(usePointer(el));
    expect(usePointer(el)).not.toBe(usePointer(other));

    let first = 0;
    let second = 0;
    const unsubscribeFirst = usePointer(el).subscribe(() => {
      first += 1;
    });
    const unsubscribeSecond = usePointer(el).subscribe(() => {
      second += 1;
    });

    move(150, 80);
    expect([first, second]).toEqual([1, 1]);

    unsubscribeFirst();
    move(160, 80);
    expect([first, second]).toEqual([1, 2]);

    unsubscribeSecond();
    move(170, 80);
    expect([first, second]).toEqual([1, 2]);
    // The shared viewport pointer is reference-counted through it.
    expect(usePointer().props().event).toBeNull();
  });
});

describe('withPointer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reads the pointer in the component root box', () => {
    const el = fixedBox(100, 50, 200, 100);
    const instance = new Follower(el).$mount();

    move(150, 80);
    expect(instance.seen.at(-1)?.x).toBe(150);
    expect(instance.seen.at(-1)?.relativeX).toBe(50);
    expect(instance.seen.at(-1)?.relativeY).toBe(30);

    instance.$destroy();
    move(160, 80);
    expect(instance.seen).toHaveLength(1);
  });

  it('shares one service and one layout read between two components on one target', () => {
    const box = fixedBox(100, 50, 200, 100);
    const { reads } = countReads(box);
    const seen: Array<[string, number]> = [];

    class Watcher extends withPointer(Base, { target: () => box }) {
      moved(props: ElementPointerProps): void {
        seen.push([this.$el.id, props.relativeX]);
      }
    }

    const hostA = document.createElement('div');
    hostA.id = 'a';
    const hostB = document.createElement('div');
    hostB.id = 'b';
    document.body.append(hostA, hostB);
    const a = new Watcher(hostA).$mount();
    const b = new Watcher(hostB).$mount();

    move(150, 80);
    expect(seen).toEqual([
      ['a', 50],
      ['b', 50],
    ]);
    expect(reads()).toBe(1);

    a.$destroy();
    move(160, 80);
    expect(seen.at(-1)).toEqual(['b', 60]);

    b.$destroy();
    move(170, 80);
    expect(seen).toHaveLength(3);
  });
});
