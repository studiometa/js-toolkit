import { jest } from '@jest/globals';
// eslint-disable-next-line import/no-unresolved
import { nextFrame, getCancelRaf, getRaf } from '@studiometa/js-toolkit/utils/nextFrame';

describe('nextFrame method', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should execute the callback function in the next frame', () => {
    const fn = jest.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', () => {
    expect(nextFrame()).toBeInstanceOf(Promise);
  });

  it('should export a working `getCancelRaf` function', () => {
    const fn = jest.fn();
    const raf = getRaf();
    const cancelRaf = getCancelRaf();
    const frame = raf(() => fn());
    cancelRaf(frame);
    expect(fn).toHaveBeenCalledTimes(0);
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(0);
  })

  it('should work server-side', () => {
    // Mock window === undefined
    // @see https://stackoverflow.com/a/56999581
    const windowSpy = jest.spyOn(globalThis, 'window', 'get');
    const fn = jest.fn();
    windowSpy.mockImplementation(() => undefined);

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(1);
    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);

    fn.mockClear();
    const raf = getRaf();
    const cancelRaf = getCancelRaf();
    const frame = raf(() => fn());
    expect(fn).toHaveBeenCalledTimes(0);
    cancelRaf(frame);
    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledTimes(0);

    windowSpy.mockRestore();
  });
});
