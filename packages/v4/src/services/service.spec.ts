import { describe, expect, it } from 'vitest';
import { createService, perTarget } from './service.js';

/**
 * A broken subscriber is reported through the platform's error channel, which
 * is the whole point of using `reportError()` — so a test that breaks one on
 * purpose has to take delivery of it.
 */
function catchReportedErrors(run: () => void): unknown[] {
  const reported: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    reported.push(event.error);
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  window.addEventListener('error', onError, { capture: true });
  try {
    run();
  } finally {
    window.removeEventListener('error', onError, { capture: true });
  }
  return reported;
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

    // Lazy: a service nobody listens to does nothing at all.
    expect(calls).toEqual([]);

    const first = service.subscribe(() => {});
    const second = service.subscribe(() => {});
    expect(calls).toEqual(['start']);

    first();
    expect(calls).toEqual(['start']);
    second();
    expect(calls).toEqual(['start', 'stop']);

    // And it comes back for the next subscriber.
    service.subscribe(() => {});
    expect(calls).toEqual(['start', 'stop', 'start']);
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
    // The second call must not be read as "the last subscriber left".
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

    // Two components sharing one handler — a module-level function, or the
    // same bound method — are two holders of the service, not one.
    let received = 0;
    const callback = () => {
      received += 1;
    };
    const first = service.subscribe(callback);
    const second = service.subscribe(callback);

    emit(1);
    expect(received).toBe(2);

    // And the first to leave must not release the service under the second.
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
    // The newcomer did not exist when these props were measured, so it waits
    // for the next update rather than being handed a value from before it.
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

    // Iterating the live set, this never returns: each call adds an entry the
    // same loop then visits. One emit is one pass over one snapshot.
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
      // A component destroyed inside another component's handler: it must not
      // be called in the update it just left, snapshot or no snapshot.
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
    // What a subscriber returns is between it and its service — `useRaf()`
    // collects render functions that way — so nothing comes back here.
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

    const reported = catchReportedErrors(() => {
      emit(1);
      emit(2);
    });

    expect(reached).toBe(2);
    // Reported, not swallowed: `reportError()` goes through the platform's
    // error channel, so an error reporter sees it.
    expect(reported).toHaveLength(2);
    expect((reported[0] as Error).message).toBe('boom');
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

    // The last subscriber of one target leaving releases that target only.
    unsubscribeFirst();
    expect(calls).toEqual(['start:first', 'start:second', 'stop:first']);

    unsubscribeSecond();
    expect(calls).toEqual(['start:first', 'start:second', 'stop:first', 'stop:second']);
  });

  it('joins the running service rather than reconfiguring it', () => {
    const { calls, use } = makeServices();
    const target = document.createElement('div');

    const first = use(target, 'first').subscribe(() => {});
    // The second caller's arguments are ignored: the service is already up.
    const second = use(target, 'second').subscribe(() => {});
    first();
    expect(calls).toEqual(['start:first']);

    second();
    expect(calls).toEqual(['start:first', 'stop:first']);
  });
});
