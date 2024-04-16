import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { nextFrame } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, runAllTimers, advanceTimersByTime } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('nextFrame method', () => {
  it('should execute the callback function in the next frame', () => {
    const fn = mock();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', () => {
    expect(nextFrame()).toBeInstanceOf(Promise);
  });

  it.todo('should work server-side', () => {
    const fn = mock();
    mock.module('../../js-toolkit/utils/has.js', () => ({
      hasWindow: () => false,
    }));

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
