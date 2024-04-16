import { describe, it, expect, beforeEach, afterEach, jest } from 'bun:test';
import { debounce } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, advanceTimersByTime } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('debounce method', () => {
  it('should wait the given delay to call given function', async () => {
    const fn = jest.fn(() => true);
    const debounced = debounce(fn, 400);

    debounced();
    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    advanceTimersByTime(150);
    expect(fn).not.toHaveBeenCalled();

    advanceTimersByTime(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should wait for 300ms when used without the delay parameter', async () => {
    const fn = jest.fn();
    const debounced = debounce(fn);

    debounced();
    debounced();

    advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    advanceTimersByTime(301);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
