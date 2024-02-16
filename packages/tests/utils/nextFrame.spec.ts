import { describe, it, expect, jest, beforeAll, afterAll } from 'bun:test';
import { nextFrame, raf, cancelRaf } from '@studiometa/js-toolkit/utils';
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
    const fn = jest.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', () => {
    expect(nextFrame()).toBeInstanceOf(Promise);
  });

  it('should export a working `cancelRaf` function', () => {
    const fn = jest.fn();
    const frame = raf(() => fn());
    cancelRaf(frame);
    expect(fn).toHaveBeenCalledTimes(0);
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should work server-side', () => {
    // Mock window === undefined
    // @see https://stackoverflow.com/a/56999581
    const windowSpy = jest.spyOn(globalThis, 'window', 'get');
    const fn = jest.fn();
    windowSpy.mockImplementation(() => undefined);

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    advanceTimersByTime(1);
    advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);

    fn.mockClear();
    const frame = raf(() => fn());
    expect(fn).toHaveBeenCalledTimes(0);
    cancelRaf(frame);
    advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(0);

    windowSpy.mockRestore();
  });
});
