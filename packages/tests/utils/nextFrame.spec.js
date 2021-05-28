import { jest } from '@jest/globals';
import nextFrame from '@studiometa/js-toolkit/utils/nextFrame';
import wait from '../__utils__/wait';

describe('nextFrame method', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should execute the callback function in the next frame', async () => {
    const fn = jest.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    wait(0);
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work server-side', async () => {
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
    windowSpy.mockRestore();
  });
});
