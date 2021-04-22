import { jest } from '@jest/globals';
import debounce from '@studiometa/js-toolkit/utils/debounce';
import wait from '../__utils__/wait';

describe('debounce method', () => {
  it('should wait the given delay to call given function', async () => {
    const fn = jest.fn(() => true);
    const debounced = debounce(fn, 400);

    debounced();
    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    await wait(150);
    expect(fn).not.toHaveBeenCalled();

    await wait(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should wait for 300ms when used without the delay parameter', async () => {
    const fn = jest.fn();
    const debounced = debounce(fn);

    debounced();
    debounced();

    await wait(200);
    expect(fn).not.toHaveBeenCalled();
    await wait(301);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
