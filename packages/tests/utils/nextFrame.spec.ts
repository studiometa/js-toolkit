import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { nextFrame } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, runAllTimers, advanceTimersByTime } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('nextFrame method', () => {
  it('should execute the callback function in the next frame', () => {
    const fn = jest.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', () => {
    expect(nextFrame()).toBeInstanceOf(Promise);
  });

  it('should work server-side', () => {
    const fn = jest.fn();
    jest.unstable_mockModule('../../js-toolkit/utils/has.js', () => ({
      hasWindow: () => false,
    }));

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
