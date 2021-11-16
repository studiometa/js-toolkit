import { jest } from '@jest/globals';
import memoize from '@studiometa/js-toolkit/utils/memoize';

describe('The `memoize` function', () => {
  it('should cache results', () => {
    const fn = jest.fn((a,b) => a+b);
    const memFn = memoize(fn);
    expect(memFn(1, 2)).toBe(3);
    expect(memFn(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, 2);
  });

  it('should cache results of async functions', () => {
    const fn = jest.fn((arg) => {
      return new Promise(resolve => {
        setTimeout(() => resolve(arg), 500);
      });
    });
    jest.useFakeTimers();
    const memFn = memoize(fn);
    expect(memFn('foo')).toBe(memFn('foo'));
    jest.runAllTimers();
    expect(memFn('foo')).toBe(memFn('foo'));
    jest.useRealTimers();
  });

  it('should return new data if `maxAge` is reached', () => {
    const fn = jest.fn((a,b) => a+b);
    const memFn = memoize(fn, { maxAge: 0 });
    expect(memFn(1, 2)).toBe(3);
    expect(memFn(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
