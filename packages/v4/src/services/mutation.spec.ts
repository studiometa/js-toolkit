import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { Base } from '../Base.js';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from '../diagnostic-contract.js';
import { EVENTS } from '../events.js';
import {
  useMutation,
  withMutation,
  type MutationHook,
  type MutationMixinOptions,
  type MutationProps,
} from './mutation.js';
import type { Service } from './service.js';
import type { Toggle } from './toggle.js';

interface Observation {
  target: Node;
  init: MutationObserverInit;
}

class FakeMutationObserver {
  static instances: FakeMutationObserver[] = [];

  readonly observed: Observation[] = [];
  disconnects = 0;

  constructor(readonly callback: MutationCallback) {
    FakeMutationObserver.instances.push(this);
  }

  observe(target: Node, init: MutationObserverInit = {}): void {
    this.observed.push({ target, init });
  }

  disconnect(): void {
    this.disconnects += 1;
  }

  takeRecords(): MutationRecord[] {
    return [];
  }

  deliver(records: MutationRecord[]): void {
    this.callback(records, this as unknown as MutationObserver);
  }
}

const NativeMutationObserver = globalThis.MutationObserver;

/**
 * Core keeps its own document observer, which the fake constructor also
 * captures, so tests match observers by what they observe.
 */
function observersOf(target: Node): FakeMutationObserver[] {
  return FakeMutationObserver.instances.filter(({ observed }) =>
    observed.some((observation) => observation.target === target),
  );
}

function observerOf(target: Node): FakeMutationObserver {
  const [observer] = observersOf(target);
  expect(observer).toBeDefined();
  return observer as FakeMutationObserver;
}

function initOf(target: Node): MutationObserverInit | undefined {
  return observerOf(target).observed.find((observation) => observation.target === target)?.init;
}

/** The canonical form every resolved init is compared against. */
function resolvedInit(overrides: MutationObserverInit = {}): MutationObserverInit {
  return {
    childList: false,
    subtree: false,
    attributes: false,
    attributeOldValue: false,
    characterData: false,
    characterDataOldValue: false,
    ...overrides,
  };
}

function recordFor(target: Node, type: MutationRecordType = 'childList'): MutationRecord {
  const empty = document.createElement('div').childNodes;
  return {
    type,
    target,
    addedNodes: empty,
    removedNodes: empty,
    previousSibling: null,
    nextSibling: null,
    attributeName: null,
    attributeNamespace: null,
    oldValue: null,
  };
}

function catchDiagnostics(run: () => void): ToolkitDiagnosticDetail[] {
  const diagnostics: ToolkitDiagnosticDetail[] = [];
  const onDiagnostic = (event: Event) => {
    event.preventDefault();
    diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
  };
  document.addEventListener(EVENTS.diagnostic, onDiagnostic);
  try {
    run();
  } finally {
    document.removeEventListener(EVENTS.diagnostic, onDiagnostic);
  }
  return diagnostics;
}

function readonlyAssertions(props: MutationProps): void {
  // @ts-expect-error service props belong to the service
  props.records = [];
  // @ts-expect-error the batch is readonly too
  props.records.push(recordFor(document.body));
}
void readonlyAssertions;

class TypedWatcher extends withMutation(Base, { manual: true }) {
  mutated(_props: MutationProps): void {}
}

function mixinTypeAssertions(instance: TypedWatcher): void {
  expectTypeOf<MutationHook>().toMatchTypeOf<{
    mutated?: (props: MutationProps) => void;
  }>();
  expectTypeOf(instance.mutated).toEqualTypeOf<(props: MutationProps) => void>();
  expectTypeOf(instance.$services.mutated).toEqualTypeOf<Toggle>();
  instance.$services.mutated.start();
  instance.$services.mutated.stop();
  // @ts-expect-error only the mixin's fixed hook gets a service handle
  instance.$services.scrolled.start();
}
void mixinTypeAssertions;

const mixinOptionsTypeAssertions: MutationMixinOptions = {
  childList: true,
  subtree: true,
  attributeFilter: ['data-state'],
  manual: true,
  immediate: false,
  target: () => document,
};
void mixinOptionsTypeAssertions;

describe('useMutation', () => {
  beforeEach(() => {
    FakeMutationObserver.instances = [];
    globalThis.MutationObserver = FakeMutationObserver as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    globalThis.MutationObserver = NativeMutationObserver;
    document.body.innerHTML = '';
  });

  it('is lazy and watches the subtree of its target by default', () => {
    const target = document.createElement('div');
    const service = useMutation(target);

    expectTypeOf(service).toEqualTypeOf<Service<MutationProps>>();
    expect(observersOf(target)).toEqual([]);

    const unsubscribe = service.subscribe(() => {});
    expect(observersOf(target)).toHaveLength(1);
    expect(initOf(target)).toEqual(resolvedInit({ childList: true, subtree: true }));

    unsubscribe();
  });

  it('publishes one batch and keeps nothing after the delivery', () => {
    const target = document.createElement('div');
    const service = useMutation(target);
    const seen: Array<readonly MutationRecord[]> = [];
    const unsubscribe = service.subscribe(({ records }) => seen.push(records));

    const record = recordFor(target);
    observerOf(target).deliver([record]);

    // A subscriber that retains the batch keeps it; the service does not.
    expect(seen).toEqual([[record]]);
    expect(service.props().records).toEqual([]);

    unsubscribe();
  });

  it('has no current props between two batches, so immediate waits', () => {
    const target = document.createElement('div');
    const service = useMutation(target);
    const early: MutationProps[] = [];
    const unsubscribeEarly = service.subscribe((props) => early.push(props), { immediate: true });

    expect(early).toEqual([]);

    observerOf(target).deliver([recordFor(target)]);
    expect(early).toHaveLength(1);

    const late: MutationProps[] = [];
    const unsubscribeLate = service.subscribe((props) => late.push(props), { immediate: true });
    expect(late).toEqual([]);

    unsubscribeEarly();
    unsubscribeLate();
  });

  it('serves two subscribers of one target and observation from one observer', () => {
    const target = document.createElement('div');
    const first = useMutation(target, { childList: true });
    const second = useMutation(target, { childList: true });
    expect(first).toBe(second);

    const seen: string[] = [];
    const unsubscribeFirst = first.subscribe(() => seen.push('first'));
    const unsubscribeSecond = second.subscribe(() => seen.push('second'));
    expect(observersOf(target)).toHaveLength(1);

    observerOf(target).deliver([recordFor(target)]);
    expect(seen).toEqual(['first', 'second']);

    unsubscribeFirst();
    unsubscribeSecond();
  });

  it('keys observationally identical options to one service', () => {
    const target = document.createElement('div');

    // Property order, and the platform's own `attributes` inference.
    expect(useMutation(target, { childList: true, subtree: true })).toBe(
      useMutation(target, { subtree: true, childList: true }),
    );
    expect(useMutation(target, { attributeOldValue: true })).toBe(
      useMutation(target, { attributes: true, attributeOldValue: true }),
    );
    expect(useMutation(target, { characterDataOldValue: true })).toBe(
      useMutation(target, { characterData: true, characterDataOldValue: true }),
    );
    // A filter is a set, so its written order and repeats do not matter.
    expect(useMutation(target, { attributeFilter: ['b', 'a', 'b'] })).toBe(
      useMutation(target, { attributeFilter: ['a', 'b'] }),
    );
    // An omitted init is the documented default, spelled out.
    expect(useMutation(target)).toBe(useMutation(target, { childList: true, subtree: true }));
  });

  it('keeps one observer per target and observation', () => {
    const target = document.createElement('div');
    const other = document.createElement('div');

    const children = useMutation(target, { childList: true });
    const deepChildren = useMutation(target, { childList: true, subtree: true });
    const filtered = useMutation(target, { attributeFilter: ['data-state'] });
    const elsewhere = useMutation(other, { childList: true });

    expect(children).not.toBe(deepChildren);
    expect(children).not.toBe(filtered);
    expect(children).not.toBe(elsewhere);

    const unsubscribes = [children, deepChildren, filtered, elsewhere].map((service) =>
      service.subscribe(() => {}),
    );
    expect(observersOf(target)).toHaveLength(3);
    expect(observersOf(other)).toHaveLength(1);
    expect(observersOf(target).map(({ observed }) => observed[0]?.init)).toEqual([
      resolvedInit({ childList: true }),
      resolvedInit({ childList: true, subtree: true }),
      resolvedInit({ attributes: true, attributeFilter: ['data-state'] }),
    ]);

    for (const unsubscribe of unsubscribes) unsubscribe();
  });

  it('disconnects on the last unsubscribe and observes again on restart', () => {
    const target = document.createElement('div');
    const service = useMutation(target);
    const unsubscribeFirst = service.subscribe(() => {});
    const unsubscribeSecond = service.subscribe(() => {});
    const observer = observerOf(target);

    unsubscribeFirst();
    expect(observer.disconnects).toBe(0);
    unsubscribeSecond();
    expect(observer.disconnects).toBe(1);

    const seen: number[] = [];
    const unsubscribeRestarted = service.subscribe(({ records }) => seen.push(records.length));
    expect(observersOf(target)).toHaveLength(2);

    // The released run must not publish into the one that replaced it.
    observer.deliver([recordFor(target)]);
    expect(seen).toEqual([]);

    observersOf(target)[1]?.deliver([recordFor(target)]);
    expect(seen).toEqual([1]);

    unsubscribeRestarted();
    expect(observersOf(target)[1]?.disconnects).toBe(1);
  });

  it('keeps serving the other subscribers when one throws', () => {
    const target = document.createElement('div');
    const service = useMutation(target);
    let reached = 0;

    const unsubscribeFailing = service.subscribe(() => {
      throw new Error('boom');
    });
    const unsubscribeHealthy = service.subscribe(() => {
      reached += 1;
    });

    const diagnostics = catchDiagnostics(() => {
      observerOf(target).deliver([recordFor(target)]);
      observerOf(target).deliver([recordFor(target)]);
    });

    expect(reached).toBe(2);
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics.every(({ code }) => code === DIAGNOSTICS.callback.serviceFailed)).toBe(true);

    unsubscribeFailing();
    unsubscribeHealthy();
  });
});

describe('useMutation on the platform observer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('reports real records for the observation it was given', async () => {
    const target = document.createElement('section');
    document.body.append(target);

    const seen: MutationRecord[] = [];
    const unsubscribe = useMutation(target).subscribe(({ records }) => seen.push(...records));

    const child = document.createElement('p');
    target.append(child);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(seen).toHaveLength(1);
    expect(seen[0]?.type).toBe('childList');
    expect(seen[0]?.target).toBe(target);
    expect([...(seen[0]?.addedNodes ?? [])]).toEqual([child]);

    unsubscribe();
    target.append(document.createElement('p'));
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    expect(seen).toHaveLength(1);
  });
});

describe('withMutation', () => {
  beforeEach(() => {
    FakeMutationObserver.instances = [];
    globalThis.MutationObserver = FakeMutationObserver as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    globalThis.MutationObserver = NativeMutationObserver;
    document.body.innerHTML = '';
  });

  it('supports the no-build mixin form and watches the component root', () => {
    const seen: number[] = [];

    class Watcher extends withMutation(Base) {
      mutated({ records }: MutationProps): void {
        seen.push(records.length);
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Watcher(el).$mount();

    expect(initOf(el)).toEqual(resolvedInit({ childList: true, subtree: true }));

    observerOf(el).deliver([recordFor(el)]);
    expect(seen).toEqual([1]);
    instance.$terminate();
  });

  it('supports the stage-3 decorator form', () => {
    const seen: number[] = [];

    @withMutation({ attributeFilter: ['data-state'] })
    class Watcher extends Base {
      mutated({ records }: MutationProps): void {
        seen.push(records.length);
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Watcher(el).$mount();

    expect(initOf(el)).toEqual(resolvedInit({ attributes: true, attributeFilter: ['data-state'] }));
    observerOf(el).deliver([recordFor(el, 'attributes')]);
    expect(seen).toEqual([1]);
    instance.$terminate();
  });

  it('resolves a custom target and forwards only MutationObserverInit fields', () => {
    class Watcher extends withMutation(Base, {
      childList: true,
      characterData: true,
      subtree: true,
      target: (instance) => instance.$el.firstElementChild as Node,
      manual: false,
      immediate: true,
    }) {
      mutated(): void {}
    }

    const el = document.createElement('article');
    const target = document.createElement('figure');
    el.append(target);
    document.body.append(el);
    const instance = new Watcher(el).$mount();

    expect(observersOf(el)).toEqual([]);
    expect(initOf(target)).toEqual(
      resolvedInit({ childList: true, characterData: true, subtree: true }),
    );
    expect(initOf(target)).not.toHaveProperty('target');
    expect(initOf(target)).not.toHaveProperty('manual');
    expect(initOf(target)).not.toHaveProperty('immediate');
    instance.$terminate();
  });

  it('releases each automatic mount cycle and observes again on remount', () => {
    const seen: number[] = [];

    class Watcher extends withMutation(Base) {
      mutated({ records }: MutationProps): void {
        seen.push(records.length);
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Watcher(el).$mount();
    const first = observerOf(el);
    first.deliver([recordFor(el)]);
    expect(seen).toHaveLength(1);

    instance.$destroy();
    expect(first.disconnects).toBe(1);

    instance.$mount();
    const second = observersOf(el)[1];
    expect(second?.observed[0]?.target).toBe(el);

    second?.deliver([recordFor(el)]);
    expect(seen).toHaveLength(2);

    instance.$terminate();
    expect(second?.disconnects).toBe(1);
  });

  it('leaves a manual hook stopped on mount and releases starts on destroy', () => {
    const seen: number[] = [];

    class Watcher extends withMutation(Base, { manual: true }) {
      mutated({ records }: MutationProps): void {
        seen.push(records.length);
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Watcher(el).$mount();

    expect(observersOf(el)).toEqual([]);
    expect(instance.$services.mutated.isActive).toBe(false);

    instance.$services.mutated.start();
    const observer = observerOf(el);
    expect(instance.$services.mutated.isActive).toBe(true);
    observer.deliver([recordFor(el)]);
    expect(seen).toHaveLength(1);

    instance.$destroy();
    expect(instance.$services.mutated.isActive).toBe(false);
    expect(observer.disconnects).toBe(1);
    instance.$terminate();
  });
});
