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
    const { requestAnimationFrame, cancelAnimationFrame} = window;
    delete window.requestAnimationFrame;
    delete window.cancelAnimationFrame;
    const fn = jest.fn();

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    advanceTimersByTime(16);
    advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);

    fn.mockClear();
    const frame = raf(() => fn());
    expect(fn).toHaveBeenCalledTimes(0);
    cancelRaf(frame);
    advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(0);

    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
  });
});
