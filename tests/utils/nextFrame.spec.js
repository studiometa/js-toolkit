import nextFrame from '~/utils/nextFrame';
import wait from '../__utils__/wait';

describe('nextFrame method', () => {
  it('should execute the callback function in the next frame', async () => {
    const fn = jest.fn();
    nextFrame(fn);
    expect(fn).toHaveBeenCalledTimes(0);
    await wait(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work server-side', async () => {
    // Mock window === undefined
    // @see https://stackoverflow.com/a/56999581
    const windowSpy = jest.spyOn(global, 'window', 'get');
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
