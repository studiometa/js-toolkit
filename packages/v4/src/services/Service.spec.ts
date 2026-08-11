import { describe, expect, it } from 'vitest';
import { createService } from './Service.js';

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

  it('fans props out to every subscriber and hands back what they returned', () => {
    let emit!: (props: number) => unknown[];
    const service = createService<number>({
      props: () => 0,
      start(fan) {
        emit = fan;
        return () => {};
      },
    });

    const seen: number[] = [];
    service.add((props) => seen.push(props));
    const render = () => {};
    service.add(() => render);

    const results = emit(42);
    expect(seen).toEqual([42]);
    expect(results).toEqual([1, render]);
  });

  it('keeps serving the other subscribers when one throws', () => {
    let emit!: (props: number) => unknown[];
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
