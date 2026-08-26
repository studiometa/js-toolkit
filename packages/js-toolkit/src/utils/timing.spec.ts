import { afterEach, describe, expect, it, vi } from 'vitest';
import { debounce, throttle, wait } from './timing.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('debounce', () => {
  it('runs once, after the calls stop', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('keeps the last call arguments', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    debounced('last');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith('last');
  });

  it('defaults to 300ms', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    debounce(fn)();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  it('runs on the leading edge and drops the calls inside the window', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');

    vi.advanceTimersByTime(100);
    throttled('c');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });

  it('defaults to one frame', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn);

    throttled();
    vi.advanceTimersByTime(15);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('wait', () => {
  it('resolves after the delay', async () => {
    const start = performance.now();
    await wait(20);
    expect(performance.now() - start).toBeGreaterThanOrEqual(15);
  });

  it('resolves on the next task by default', async () => {
    const order: string[] = [];
    const promise = wait().then(() => order.push('wait'));
    order.push('sync');
    await promise;
    expect(order).toEqual(['sync', 'wait']);
  });
});
