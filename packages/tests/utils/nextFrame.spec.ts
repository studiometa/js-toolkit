import { describe, it, expect, spyOn, mock, beforeAll, afterAll } from 'bun:test';
import { nextFrame } from '@studiometa/js-toolkit/utils';
import {
  useFakeTimers,
  useRealTimers,
  runAllTimers,
  advanceTimersByTime,
} from '../__utils__/faketimers.js';

describe('nextFrame method', () => {
  beforeAll(() => {
    useFakeTimers();
  });

  afterAll(() => {
    useRealTimers();
  });

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
