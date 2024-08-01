import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { throttle } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, advanceTimersByTime } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('throttle method', () => {
  it('should call the given function only once in the given delay', async () => {
    const fn = jest.fn(() => true);
    const throttled = throttle(fn, 300);

    throttled();
    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    advanceTimersByTime(400);

    throttled();
    throttled();
    throttled();
    throttled();
    advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call the callback after 16ms when no delay provided', async () => {
    const fn = jest.fn(() => true);
    const throttled = throttle(fn);

    throttled();
    advanceTimersByTime(10);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    advanceTimersByTime(20);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
