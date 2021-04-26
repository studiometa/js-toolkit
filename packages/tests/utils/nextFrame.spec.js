import { jest } from '@jest/globals';
import retry from 'jest-retries';
import nextFrame from '@studiometa/js-toolkit/utils/nextFrame';
import wait from '../__utils__/wait';

describe('nextFrame method', () => {
  retry('should execute the callback function in the next frame', 5, async () => {
    const fn = jest.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  retry('should work server-side', 5, async () => {
    // Mock window === undefined
    // @see https://stackoverflow.com/a/56999581
    const windowSpy = jest.spyOn(globalThis, 'window', 'get');
    const fn = jest.fn();
    windowSpy.mockImplementation(() => undefined);

    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(1);
    await wait(1);
    expect(fn).toHaveBeenCalledTimes(1);
    windowSpy.mockRestore();
  });
});
