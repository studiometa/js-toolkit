import { jest } from '@jest/globals';
import throttle from '@studiometa/js-toolkit/utils/throttle';

describe('throttle method', () => {

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should call the given function only once in the given delay', async () => {
    const fn = jest.fn(() => true);
    const throttled = throttle(fn, 300);

    throttled();
    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(400);

    throttled();
    throttled();
    throttled();
    throttled();
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call the callback after 16ms when no delay provided', async () => {
    const fn = jest.fn(() => true);
    const throttled = throttle(fn);

    throttled();
    jest.advanceTimersByTime(10);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(20);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
