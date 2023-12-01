import { jest } from '@jest/globals';
import { debounce } from '@studiometa/js-toolkit/utils';

describe('debounce method', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should wait the given delay to call given function', async () => {
    const fn = jest.fn(() => true);
    const debounced = debounce(fn, 400);

    debounced();
    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(150);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should wait for 300ms when used without the delay parameter', async () => {
    const fn = jest.fn();
    const debounced = debounce(fn);

    debounced();
    debounced();

    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(301);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
