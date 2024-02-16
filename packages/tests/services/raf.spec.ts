import { describe, it, expect, jest, beforeEach } from 'bun:test';
import { useRaf } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';

describe('useRaf', () => {
  const { add, remove, props } = useRaf();
  let rafProps;
  const fn = jest.fn((p) => {
    rafProps = p;
  });

  beforeEach(() => {
    remove('key');
    fn.mockClear();
    add('key', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should have a `time` prop', async () => {
    await wait(16);
    expect(typeof props().time).toBe('number');
    expect(typeof rafProps.time).toBe('number');
  });

  it('should trigger the callbacks', async () => {
    await wait(16);
    expect(fn).toHaveBeenCalled();
    await wait(16);
    const totalCalls = fn.mock.calls.length;
    expect(totalCalls).toBeGreaterThan(1);
    remove('key');
    await wait(16);
    expect(fn.mock.calls).toHaveLength(totalCalls);
  });

  it('should trigger the returned function after', async () => {
    const fn2 = jest.fn();
    add('fn2', () => {
      fn2('update');
      return () => {
        fn2('render');
        remove('fn2');
      };
    });
    await wait();
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(fn2.mock.calls).toEqual([['update'], ['render']]);
  });

  it('should stop triggering when having no callback', async () => {
    remove('key');
    await wait(16);
    expect(fn).not.toHaveBeenCalled();
  });
});
