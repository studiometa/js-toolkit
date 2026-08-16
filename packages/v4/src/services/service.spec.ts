import { describe, expect, it } from 'vitest';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from '../diagnostic-contract.js';
import { EVENTS } from '../events.js';
import { createService, perTarget } from './service.js';

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

describe('createService', () => {
  it('starts with the first subscriber and stops with the last', () => {
    const calls: string[] = [];
    const service = createService<number>({
      props: () => 1,
      start() {
        calls.push('start');
        return () => calls.push('stop');
      },
    });

    expect(calls).toEqual([]);

    const first = service.subscribe(() => {});
    const second = service.subscribe(() => {});
    expect(calls).toEqual(['start']);

    first();
    expect(calls).toEqual(['start']);
    second();
    expect(calls).toEqual(['start', 'stop']);

    service.subscribe(() => {});
    expect(calls).toEqual(['start', 'stop', 'start']);
  });

  it('joins a subscription created by a synchronous startup emit to the same run', () => {
    const calls: string[] = [];
    const service = createService<number>({
      props: () => 1,
      start(emit) {
        calls.push('start');
        emit(1);
        return () => calls.push('stop');
      },
    });

    let didNest = false;
    let unsubscribeNested = () => {};
    const unsubscribeFirst = service.subscribe(() => {
      if (!didNest) {
        didNest = true;
        unsubscribeNested = service.subscribe(() => {});
      }
    });

    expect(calls).toEqual(['start']);
    unsubscribeFirst();
    expect(calls).toEqual(['start']);
    unsubscribeNested();
    expect(calls).toEqual(['start', 'stop']);
  });

  it('restarts after a reentrant startup run is fully released', () => {
    const calls: string[] = [];
    const service = createService<number>({
      props: () => 1,
      start(emit) {
        calls.push('start');
        emit(1);
        return () => calls.push('stop');
      },
    });

    function subscribeRun() {
      let didNest = false;
      let unsubscribeNested = () => {};
      const unsubscribeFirst = service.subscribe(() => {
        if (!didNest) {
          didNest = true;
          unsubscribeNested = service.subscribe(() => {});
        }
      });
      return () => {
        unsubscribeFirst();
        unsubscribeNested();
      };
    }

    subscribeRun()();
    subscribeRun()();
    expect(calls).toEqual(['start', 'stop', 'start', 'stop']);
  });

  it('rolls back a subscriber when startup throws and can recover', () => {
    const startupError = new Error('startup failed');
    const failedCalls: number[] = [];
    const recoveredCalls: number[] = [];
    let starts = 0;
    let stops = 0;
    const service = createService<number>({
      props: () => starts,
      start(emit) {
        starts += 1;
        if (starts === 1) {
          throw startupError;
        }
        emit(starts);
        return () => {
          stops += 1;
        };
      },
    });

    expect(() => service.subscribe((value) => failedCalls.push(value))).toThrow(startupError);

    const unsubscribe = service.subscribe((value) => recoveredCalls.push(value));
    expect(starts).toBe(2);
    expect(failedCalls).toEqual([]);
    expect(recoveredCalls).toEqual([2]);

    unsubscribe();
    expect(stops).toBe(1);
  });

  it('ignores a repeated unsubscribe', () => {
    const calls: string[] = [];
    const service = createService<number>({
      props: () => 1,
      start() {
        calls.push('start');
        return () => calls.push('stop');
      },
    });

    const unsubscribe = service.subscribe(() => {});
    const other = service.subscribe(() => {});
    unsubscribe();
    unsubscribe();
    expect(calls).toEqual(['start']);

    other();
    expect(calls).toEqual(['start', 'stop']);
  });

  it('lets the same callback subscribe twice, and counts both holders', () => {
    const calls: string[] = [];
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        calls.push('start');
        return () => calls.push('stop');
      },
    });

    let received = 0;
    const callback = () => {
      received += 1;
    };
    const first = service.subscribe(callback);
    const second = service.subscribe(callback);

    emit(1);
    expect(received).toBe(2);

    first();
    expect(calls).toEqual(['start']);
    emit(2);
    expect(received).toBe(3);

    second();
    expect(calls).toEqual(['start', 'stop']);
  });

  it('does not call a subscriber that arrived during the update', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    const seen: string[] = [];
    service.subscribe((props) => {
      seen.push(`first:${props}`);
      service.subscribe((next) => seen.push(`late:${next}`));
    });

    emit(1);
    expect(seen).toEqual(['first:1']);

    emit(2);
    expect(seen).toEqual(['first:1', 'first:2', 'late:2']);
  });

  it('terminates when a subscriber subscribes from inside its own callback', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    let calls = 0;
    const subscribeAgain = () => {
      service.subscribe(() => {
        calls += 1;
        subscribeAgain();
      });
    };
    subscribeAgain();

    emit(1);
    expect(calls).toBe(1);
  });

  it('skips a subscriber released by another one mid-update', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    const seen: string[] = [];
    let releaseSecond = () => {};
    service.subscribe(() => {
      seen.push('first');
      releaseSecond();
    });
    releaseSecond = service.subscribe(() => seen.push('second'));

    emit(1);
    expect(seen).toEqual(['first']);
  });

  it('fans props out to every subscriber, in subscription order', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    const seen: string[] = [];
    service.subscribe((props) => seen.push(`first:${props}`));
    service.subscribe((props) => {
      seen.push(`second:${props}`);
      return () => {};
    });

    expect(emit(42)).toBeUndefined();
    expect(seen).toEqual(['first:42', 'second:42']);
  });

  it('keeps serving the other subscribers when one throws', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    let reached = 0;
    service.subscribe(() => {
      throw new Error('boom');
    });
    service.subscribe(() => {
      reached += 1;
    });

    const diagnostics = catchDiagnostics(() => {
      emit(1);
      emit(2);
    });

    expect(reached).toBe(2);
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics.every(({ code }) => code === DIAGNOSTICS.callback.serviceFailed)).toBe(true);
    expect(
      diagnostics.every(
        (detail) => detail.severity === 'error' && (detail.error as Error).message === 'boom',
      ),
    ).toBe(true);
  });

  it('delivers the current props to a subscriber that asks, and to nobody else', () => {
    const service = createService<number>({
      props: () => 42,
      start: () => () => {},
    });

    const seen: string[] = [];
    service.subscribe((props) => seen.push(`plain:${props}`));
    service.subscribe((props) => seen.push(`immediate:${props}`), { immediate: true });

    expect(seen).toEqual(['immediate:42']);
  });

  it('waits for the next update when nothing asked for the current props', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 42,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    const seen: number[] = [];
    service.subscribe((props) => seen.push(props));
    expect(seen).toEqual([]);
    emit(1);
    expect(seen).toEqual([1]);
  });

  it('starts the service before delivering, so the props are current', () => {
    const calls: string[] = [];
    let value = 0;
    const service = createService<number>({
      props: () => value,
      start() {
        value = 7;
        calls.push('start');
        return () => {};
      },
    });

    service.subscribe((props) => calls.push(`call:${props}`), { immediate: true });
    expect(calls).toEqual(['start', 'call:7']);
  });

  it('delivers nothing for a source that has no current props', () => {
    let emit!: (props: number) => void;
    let isObserved = false;
    const service = createService<number>({
      props: () => 1,
      hasProps: () => isObserved,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    const seen: number[] = [];
    service.subscribe((props) => seen.push(props), { immediate: true });
    expect(seen).toEqual([]);

    isObserved = true;
    service.subscribe((props) => seen.push(props), { immediate: true });
    expect(seen).toEqual([1]);

    emit(2);
    expect(seen).toEqual([1, 2, 2]);
  });

  it('reports a throwing immediate subscriber and keeps its subscription', () => {
    let emit!: (props: number) => void;
    const service = createService<number>({
      props: () => 1,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    let calls = 0;
    const diagnostics = catchDiagnostics(() => {
      const unsubscribe = service.subscribe(
        () => {
          calls += 1;
          throw new Error('boom');
        },
        { immediate: true },
      );
      expect(typeof unsubscribe).toBe('function');
      emit(2);
    });

    expect(calls).toBe(2);
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics.every(({ code }) => code === DIAGNOSTICS.callback.serviceFailed)).toBe(true);
  });

  it('reads its props without subscribing', () => {
    let value = 1;
    const service = createService<number>({
      props: () => value,
      start: () => () => {},
    });

    expect(service.props()).toBe(1);
    value = 2;
    expect(service.props()).toBe(2);
  });
});

describe('perTarget', () => {
  function makeServices() {
    const calls: string[] = [];
    const use = perTarget((target: Element, label = 'default') =>
      createService<number>({
        props: () => 0,
        start() {
          calls.push(`start:${label}`);
          return () => calls.push(`stop:${label}`);
        },
      }),
    );
    return { calls, use };
  }

  it('builds one service per target and returns the same one after that', () => {
    const { use } = makeServices();
    const first = document.createElement('div');
    const second = document.createElement('div');

    expect(use(first)).toBe(use(first));
    expect(use(first)).not.toBe(use(second));
  });

  it('counts the subscribers of each target on its own', () => {
    const { calls, use } = makeServices();
    const first = document.createElement('div');
    const second = document.createElement('div');

    const unsubscribeFirst = use(first, 'first').subscribe(() => {});
    const unsubscribeSecond = use(second, 'second').subscribe(() => {});
    expect(calls).toEqual(['start:first', 'start:second']);

    unsubscribeFirst();
    expect(calls).toEqual(['start:first', 'start:second', 'stop:first']);

    unsubscribeSecond();
    expect(calls).toEqual(['start:first', 'start:second', 'stop:first', 'stop:second']);
  });

  it('shares one service between two callers asking for the same observation', () => {
    const { calls, use } = makeServices();
    const target = document.createElement('div');

    const first = use(target, 'same').subscribe(() => {});
    const second = use(target, 'same').subscribe(() => {});
    expect(use(target, 'same')).toBe(use(target, 'same'));
    first();
    expect(calls).toEqual(['start:same']);

    second();
    expect(calls).toEqual(['start:same', 'stop:same']);
  });

  it('builds a service of its own for a caller whose arguments differ', () => {
    const { calls, use } = makeServices();
    const target = document.createElement('div');

    expect(use(target, 'first')).not.toBe(use(target, 'second'));

    const first = use(target, 'first').subscribe(() => {});
    const second = use(target, 'second').subscribe(() => {});
    expect(calls).toEqual(['start:first', 'start:second']);

    first();
    expect(calls).toEqual(['start:first', 'start:second', 'stop:first']);
    second();
    expect(calls).toEqual(['start:first', 'start:second', 'stop:first', 'stop:second']);
  });

  it('keys an options object by its contents, not by its identity', () => {
    const use = perTarget((_target: Element, options: { threshold: number }) =>
      createService<number>({ props: () => options.threshold, start: () => () => {} }),
    );
    const target = document.createElement('div');

    expect(use(target, { threshold: 0.5 })).toBe(use(target, { threshold: 0.5 }));
    expect(use(target, { threshold: 0.5 })).not.toBe(use(target, { threshold: 0 }));
  });

  it('keys an options object by its meaning, not by the order it was written in', () => {
    const use = perTarget((_target: Element, options: object) =>
      createService<object>({ props: () => options, start: () => () => {} }),
    );
    const target = document.createElement('div');

    expect(use(target, { axis: 'x', inertia: false })).toBe(
      use(target, { inertia: false, axis: 'x' }),
    );
    // Nested records are canonical too, at every depth.
    expect(use(target, { nested: { a: 1, b: 2 } })).toBe(use(target, { nested: { b: 2, a: 1 } }));
    // Naming an option without a value is not naming it.
    expect(use(target, { axis: undefined })).toBe(use(target, {}));
    // An array is ordered data, so two orders stay two observations.
    expect(use(target, { threshold: [0, 1] })).not.toBe(use(target, { threshold: [1, 0] }));
  });

  it('takes a key function for arguments that do not serialise', () => {
    const use = perTarget(
      (_target: Element, root: Element) =>
        createService<Element>({ props: () => root, start: () => () => {} }),
      (root) => root.id,
    );
    const target = document.createElement('div');
    const a = document.createElement('div');
    a.id = 'a';
    const b = document.createElement('div');
    b.id = 'b';

    expect(use(target, a)).toBe(use(target, a));
    expect(use(target, a)).not.toBe(use(target, b));
  });
});
