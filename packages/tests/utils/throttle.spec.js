import { jest } from '@jest/globals';
import throttle from '@studiometa/js-toolkit/utils/throttle';
import wait from '../__utils__/wait';

describe('throttle method', () => {
  it('should call the given function only once in the given delay', async () => {
    const fn = jest.fn(() => true);
    const throttled = throttle(fn, 300);

    throttled();
    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    await wait(400);
    throttled();
    throttled();
    throttled();
    throttled();
    await wait(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call the callback after 16ms when no delay provided', async () => {
    const fn = jest.fn(() => true);
    const throttled = throttle(fn);

    throttled();
    await wait(10);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    await wait(20);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
