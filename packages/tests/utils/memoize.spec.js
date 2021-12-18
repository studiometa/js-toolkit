import { describe, it, expect, sinon } from 'vitest';
import memoize from '@studiometa/js-toolkit/utils/memoize';

describe('The `memoize` function', () => {
  it('should cache results', () => {
    const fn = sinon.fake((a, b) => a + b);
    const memFn = memoize(fn);
    expect(memFn(1, 2)).toBe(3);
    expect(memFn(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, 2);
  });

  it('should cache results of async functions', () => {
    const fn = sinon.fake((arg) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(arg), 500);
      });
    });
    const clock = sinon.useFakeTimers();
    const memFn = memoize(fn);
    expect(memFn('foo')).toBe(memFn('foo'));
    clock.runAll();
    expect(memFn('foo')).toBe(memFn('foo'));
    clock.restore();
  });

  it('should return new data if `maxAge` is reached', () => {
    const fn = sinon.fake((a, b) => a + b);
    const memFn = memoize(fn, { maxAge: 0 });
    expect(memFn(1, 2)).toBe(3);
    expect(memFn(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
