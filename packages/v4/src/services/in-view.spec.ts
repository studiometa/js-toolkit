import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { Base } from '../Base.js';
import {
  useInView,
  withInView,
  type InViewHook,
  type InViewMixinOptions,
  type InViewProps,
} from './in-view.js';
import type { Service } from './service.js';
import type { Toggle } from './toggle.js';

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

class TypedReveal extends withInView(Base, { manual: true }) {
  intersected(_props: InViewProps): void {}
}

function mixinTypeAssertions(instance: TypedReveal): void {
  expectTypeOf<InViewHook>().toMatchTypeOf<{
    intersected?: (props: InViewProps) => void;
  }>();
  expectTypeOf(instance.intersected).toEqualTypeOf<(props: InViewProps) => void>();
  expectTypeOf(instance.$services.intersected).toEqualTypeOf<Toggle>();
  instance.$services.intersected.start();
  instance.$services.intersected.stop();
  // @ts-expect-error only the mixin's fixed hook gets a service handle
  instance.$services.scrolled.start();
}
void mixinTypeAssertions;

const mixinOptionsTypeAssertions: InViewMixinOptions = {
  threshold: 0.5,
  rootMargin: '100px',
  manual: true,
  immediate: false,
  target: (instance) => instance.$el,
};
void mixinOptionsTypeAssertions;

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

    expect(first).toEqual([]);

    const entry = entryFor(target, false);
    FakeIntersectionObserver.instances[0]?.deliver([entry]);
    expect(first).toEqual([{ isInView: false, entry }]);

    const immediate: InViewProps[] = [];
    const unsubscribeImmediate = service.subscribe((props) => immediate.push({ ...props }), {
      immediate: true,
    });
    expect(immediate).toEqual([{ isInView: false, entry }]);
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

  it('keys an init by its meaning, not by the order it was written in', () => {
    const target = document.createElement('div');
    const root = document.createElement('section');

    const written = useInView(target, { rootMargin: '0px', threshold: 0.5 });
    const rewritten = useInView(target, { threshold: 0.5, rootMargin: '0px' });
    expect(written).toBe(rewritten);
    // The root keeps its own weak identity through the canonical key.
    expect(useInView(target, { root, threshold: 0.5 })).toBe(
      useInView(target, { threshold: 0.5, root }),
    );

    const unsubscribes = [written, rewritten].map((service) => service.subscribe(() => {}));
    // Two spellings of one observation, one `IntersectionObserver`.
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
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
    firstObserver?.deliver([entryFor(target, true)]);
    expect(seen).toEqual([]);

    const entry = entryFor(target, false);
    FakeIntersectionObserver.instances[1]?.deliver([entry]);
    expect(seen).toEqual([{ isInView: false, entry }]);
    unsubscribeRestarted();
    expect(FakeIntersectionObserver.instances[1]?.disconnects).toBe(1);
  });
});

describe('withInView', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    globalThis.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = NativeIntersectionObserver;
    document.body.innerHTML = '';
  });

  it('supports the no-build mixin form and observes the component root', () => {
    const seen: InViewProps[] = [];

    class Reveal extends withInView(Base, { threshold: 0.5, rootMargin: '100px' }) {
      intersected(props: InViewProps): void {
        seen.push({ ...props });
      }
    }

    const target = document.createElement('article');
    document.body.append(target);
    const instance = new Reveal(target).$mount();
    const observer = FakeIntersectionObserver.instances[0];

    expect(observer?.observed).toEqual([target]);
    expect(observer?.init).toEqual({ rootMargin: '100px', threshold: 0.5 });

    const entry = entryFor(target, true);
    observer?.deliver([entry]);
    expect(seen).toEqual([{ isInView: true, entry }]);
    instance.$destroy();
  });

  it('supports the stage-3 decorator form', () => {
    const seen: InViewProps[] = [];

    @withInView({ threshold: 0.5 })
    class Reveal extends Base {
      intersected(props: InViewProps): void {
        seen.push({ ...props });
      }
    }

    const target = document.createElement('article');
    document.body.append(target);
    const instance = new Reveal(target).$mount();
    const observer = FakeIntersectionObserver.instances[0];

    expect(observer?.observed).toEqual([target]);
    expect(observer?.init).toEqual({ threshold: 0.5 });
    const entry = entryFor(target, false);
    observer?.deliver([entry]);
    expect(seen).toEqual([{ isInView: false, entry }]);
    instance.$destroy();
  });

  it('resolves a custom target and forwards only IntersectionObserverInit fields', () => {
    const root = document.createElement('main');

    class Reveal extends withInView(Base, {
      root,
      rootMargin: '10px',
      scrollMargin: '20px',
      threshold: [0, 0.5, 1],
      target: (instance) => instance.$el.firstElementChild as Element,
      manual: false,
      immediate: false,
    }) {
      intersected(): void {}
    }

    const host = document.createElement('article');
    const target = document.createElement('figure');
    host.append(target);
    document.body.append(root, host);
    const instance = new Reveal(host).$mount();
    const observer = FakeIntersectionObserver.instances[0];

    expect(observer?.observed).toEqual([target]);
    expect(observer?.init).toEqual({
      root,
      rootMargin: '10px',
      scrollMargin: '20px',
      threshold: [0, 0.5, 1],
    });
    expect(observer?.init).not.toHaveProperty('target');
    expect(observer?.init).not.toHaveProperty('manual');
    expect(observer?.init).not.toHaveProperty('immediate');
    instance.$destroy();
  });

  it('defaults to honest immediate delivery and honours an explicit false', () => {
    const target = document.createElement('article');
    document.body.append(target);
    const first: InViewProps[] = [];
    const later: InViewProps[] = [];
    const quiet: InViewProps[] = [];

    class First extends withInView(Base) {
      intersected(props: InViewProps): void {
        first.push({ ...props });
      }
    }
    class Later extends withInView(Base) {
      intersected(props: InViewProps): void {
        later.push({ ...props });
      }
    }
    class Quiet extends withInView(Base, { immediate: false }) {
      intersected(props: InViewProps): void {
        quiet.push({ ...props });
      }
    }

    const firstInstance = new First(target).$mount();
    expect(first).toEqual([]);

    const observer = FakeIntersectionObserver.instances[0];
    const initialEntry = entryFor(target, false);
    observer?.deliver([initialEntry]);
    expect(first).toEqual([{ isInView: false, entry: initialEntry }]);

    const laterInstance = new Later(target).$mount();
    expect(later).toEqual([{ isInView: false, entry: initialEntry }]);

    const quietInstance = new Quiet(target).$mount();
    expect(quiet).toEqual([]);
    expect(FakeIntersectionObserver.instances).toHaveLength(1);

    const nextEntry = entryFor(target, true);
    observer?.deliver([nextEntry]);
    expect(first.at(-1)).toEqual({ isInView: true, entry: nextEntry });
    expect(later.at(-1)).toEqual({ isInView: true, entry: nextEntry });
    expect(quiet).toEqual([{ isInView: true, entry: nextEntry }]);

    firstInstance.$destroy();
    laterInstance.$destroy();
    quietInstance.$destroy();
  });

  it('releases each automatic mount cycle and waits for a new real entry on remount', () => {
    const seen: InViewProps[] = [];

    class Reveal extends withInView(Base) {
      intersected(props: InViewProps): void {
        seen.push({ ...props });
      }
    }

    const target = document.createElement('article');
    document.body.append(target);
    const instance = new Reveal(target).$mount();
    const firstObserver = FakeIntersectionObserver.instances[0];
    firstObserver?.deliver([entryFor(target, true)]);
    expect(seen).toHaveLength(1);

    instance.$destroy();
    expect(firstObserver?.disconnects).toBe(1);

    instance.$mount();
    const secondObserver = FakeIntersectionObserver.instances[1];
    expect(secondObserver?.observed).toEqual([target]);
    expect(seen).toHaveLength(1);

    secondObserver?.deliver([entryFor(target, false)]);
    expect(seen).toHaveLength(2);
    instance.$destroy();
    expect(secondObserver?.disconnects).toBe(1);
  });

  it('leaves a manual hook stopped on mount and releases every start on destroy', () => {
    const seen: InViewProps[] = [];

    class Reveal extends withInView(Base, { manual: true }) {
      intersected(props: InViewProps): void {
        seen.push({ ...props });
      }
    }

    const target = document.createElement('article');
    document.body.append(target);
    const instance = new Reveal(target).$mount();

    expect(FakeIntersectionObserver.instances).toEqual([]);
    expect(instance.$services.intersected.isActive).toBe(false);

    instance.$services.intersected.start();
    const firstObserver = FakeIntersectionObserver.instances[0];
    expect(instance.$services.intersected.isActive).toBe(true);
    firstObserver?.deliver([entryFor(target, true)]);
    expect(seen).toHaveLength(1);

    instance.$destroy();
    expect(instance.$services.intersected.isActive).toBe(false);
    expect(firstObserver?.disconnects).toBe(1);

    instance.$mount();
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    instance.$services.intersected.start();
    const secondObserver = FakeIntersectionObserver.instances[1];
    expect(instance.$services.intersected.isActive).toBe(true);

    instance.$destroy();
    expect(instance.$services.intersected.isActive).toBe(false);
    expect(secondObserver?.disconnects).toBe(1);
  });
});
