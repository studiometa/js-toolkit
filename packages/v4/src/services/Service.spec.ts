import { describe, expect, it } from 'vitest';
import { createService, perTarget } from './Service.js';

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

    const first = service.add(() => {});
    const second = service.add(() => {});
    expect(calls).toEqual(['start']);

    first();
    expect(calls).toEqual(['start']);
    second();
    expect(calls).toEqual(['start', 'stop']);

    // And it comes back for the next subscriber.
    service.add(() => {});
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

    const unsubscribe = service.add(() => {});
    const other = service.add(() => {});
    unsubscribe();
    unsubscribe();
    // The second call must not be read as "the last subscriber left".
    expect(calls).toEqual(['start']);

    other();
    expect(calls).toEqual(['start', 'stop']);
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
    service.add((props) => seen.push(`first:${props}`));
    // What a subscriber returns is between it and its service — `useRaf()`
    // collects render functions that way — so nothing comes back here.
    service.add((props) => {
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
    service.add(() => {
      throw new Error('boom');
    });
    service.add(() => {
      reached += 1;
    });

    emit(1);
    emit(2);
    expect(reached).toBe(2);
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

    const unsubscribeFirst = use(first, 'first').add(() => {});
    const unsubscribeSecond = use(second, 'second').add(() => {});
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

    const first = use(target, 'first').add(() => {});
    // The second caller's arguments are ignored: the service is already up.
    const second = use(target, 'second').add(() => {});
    first();
    expect(calls).toEqual(['start:first']);

    second();
    expect(calls).toEqual(['start:first', 'stop:first']);
  });
});
