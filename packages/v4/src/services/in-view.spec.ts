import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { useInView, type InViewProps } from './in-view.js';
import type { Service } from './service.js';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly observed: Element[] = [];
  disconnects = 0;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly init: IntersectionObserverInit = {},
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  disconnect(): void {
    this.disconnects += 1;
  }

  deliver(entries: IntersectionObserverEntry[]): void {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

const NativeIntersectionObserver = globalThis.IntersectionObserver;

function entryFor(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  const rect = new DOMRectReadOnly();
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    time: performance.now(),
    boundingClientRect: rect,
    intersectionRect: rect,
    rootBounds: null,
  };
}

function readonlyAssertions(props: InViewProps): void {
  // @ts-expect-error service props belong to the service
  props.isInView = false;
  // @ts-expect-error the latest entry is readonly too
  props.entry = null;
}
void readonlyAssertions;

describe('useInView', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    globalThis.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = NativeIntersectionObserver;
    document.body.innerHTML = '';
  });

  it('is lazy and observes only its target', () => {
    const target = document.createElement('div');
    const service = useInView(target);

    expectTypeOf(service).toEqualTypeOf<Service<InViewProps>>();
    expect(FakeIntersectionObserver.instances).toEqual([]);

    const unsubscribe = service.subscribe(() => {});
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    expect(FakeIntersectionObserver.instances[0]?.observed).toEqual([target]);

    unsubscribe();
  });

  it('publishes the first entry for its target from a defensive callback batch', () => {
    const target = document.createElement('div');
    const other = document.createElement('div');
    const seen: InViewProps[] = [];
    const unsubscribe = useInView(target).subscribe((props) => seen.push({ ...props }));
    const observer = FakeIntersectionObserver.instances[0];

    observer?.deliver([entryFor(other, true)]);
    expect(seen).toEqual([]);

    const entry = entryFor(target, true);
    observer?.deliver([entryFor(target, false), entryFor(other, false), entry]);

    // Several queued crossings for the target still leave the service on the
    // latest one in the batch.
    expect(seen).toEqual([{ isInView: true, entry }]);
    expect(useInView(target).props()).toMatchObject({ isInView: true, entry });
    unsubscribe();
  });

  it('honours immediate only after a real entry exists', () => {
    const target = document.createElement('div');
    const service = useInView(target);
    const first: InViewProps[] = [];
    const unsubscribeFirst = service.subscribe((props) => first.push({ ...props }), {
      immediate: true,
    });

    // Starting the observer did not invent an entry for the immediate call.
    expect(first).toEqual([]);

    const entry = entryFor(target, false);
    FakeIntersectionObserver.instances[0]?.deliver([entry]);
    expect(first).toEqual([{ isInView: false, entry }]);

    const immediate: InViewProps[] = [];
    const unsubscribeImmediate = service.subscribe((props) => immediate.push({ ...props }), {
      immediate: true,
    });
    expect(immediate).toEqual([{ isInView: false, entry }]);
    // Existing subscribers do not receive a duplicate when the newcomer asks.
    expect(first).toHaveLength(1);

    unsubscribeFirst();
    unsubscribeImmediate();
  });

  it('shares one observer between subscriptions for the same target and init', () => {
    const target = document.createElement('div');
    const firstService = useInView(target, { threshold: 0.5 });
    const secondService = useInView(target, { threshold: 0.5 });
    expect(firstService).toBe(secondService);

    const seen: string[] = [];
    const unsubscribeFirst = firstService.subscribe(() => seen.push('first'));
    const unsubscribeSecond = secondService.subscribe(() => seen.push('second'));
    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    FakeIntersectionObserver.instances[0]?.deliver([entryFor(target, true)]);
    expect(seen).toEqual(['first', 'second']);

    unsubscribeFirst();
    unsubscribeSecond();
  });

  it('keeps separate services for different observer init values and roots', () => {
    const target = document.createElement('div');
    const firstRoot = document.createElement('section');
    const secondRoot = document.createElement('section');

    const low = useInView(target, { root: firstRoot, rootMargin: '10px', threshold: 0 });
    const same = useInView(target, { root: firstRoot, rootMargin: '10px', threshold: 0 });
    const high = useInView(target, { root: firstRoot, rootMargin: '10px', threshold: 0.9 });
    const otherRoot = useInView(target, {
      root: secondRoot,
      rootMargin: '10px',
      threshold: 0,
    });

    expect(low).toBe(same);
    expect(low).not.toBe(high);
    expect(low).not.toBe(otherRoot);

    const unsubscribes = [low, high, otherRoot].map((service) => service.subscribe(() => {}));
    expect(FakeIntersectionObserver.instances).toHaveLength(3);
    expect(FakeIntersectionObserver.instances.map(({ init }) => init)).toEqual([
      { root: firstRoot, rootMargin: '10px', threshold: 0 },
      { root: firstRoot, rootMargin: '10px', threshold: 0.9 },
      { root: secondRoot, rootMargin: '10px', threshold: 0 },
    ]);
    for (const unsubscribe of unsubscribes) unsubscribe();
  });

  it('disconnects after the final unsubscribe and waits for a new entry on restart', () => {
    const target = document.createElement('div');
    const service = useInView(target);
    const unsubscribeFirst = service.subscribe(() => {});
    const unsubscribeSecond = service.subscribe(() => {});
    const firstObserver = FakeIntersectionObserver.instances[0];

    firstObserver?.deliver([entryFor(target, true)]);
    unsubscribeFirst();
    expect(firstObserver?.disconnects).toBe(0);
    unsubscribeSecond();
    expect(firstObserver?.disconnects).toBe(1);

    const seen: InViewProps[] = [];
    const unsubscribeRestarted = service.subscribe((props) => seen.push({ ...props }), {
      immediate: true,
    });
    expect(FakeIntersectionObserver.instances).toHaveLength(2);
    // The old observer's entry is not a current entry for this new run.
    expect(seen).toEqual([]);

    const entry = entryFor(target, false);
    FakeIntersectionObserver.instances[1]?.deliver([entry]);
    expect(seen).toEqual([{ isInView: false, entry }]);
    unsubscribeRestarted();
    expect(FakeIntersectionObserver.instances[1]?.disconnects).toBe(1);
  });
});
