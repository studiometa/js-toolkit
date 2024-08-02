import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextFrame } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, runAllTimers, advanceTimersByTime } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('nextFrame method', () => {
  it('should execute the callback function in the next frame', () => {
    const fn = vi.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', () => {
    expect(nextFrame()).toBeInstanceOf(Promise);
  });

  it('should work server-side', () => {
    const fn = vi.fn();
    vi.mock('../../js-toolkit/utils/has.js', () => ({
      hasWindow: () => false,
    }));

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
