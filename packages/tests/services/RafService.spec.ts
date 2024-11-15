import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRaf } from '@studiometa/js-toolkit';
import { useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('useRaf', () => {
  const { add, remove, props } = useRaf();
  let rafProps;
  const fn = vi.fn((p) => {
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
    await advanceTimersByTimeAsync(16);
    expect(typeof props().time).toBe('number');
    expect(typeof rafProps.time).toBe('number');
  });

  it('should trigger the callbacks', async () => {
    await advanceTimersByTimeAsync(16);
    expect(fn).toHaveBeenCalled();
    await advanceTimersByTimeAsync(16);
    const totalCalls = fn.mock.calls.length;
    expect(totalCalls).toBeGreaterThan(1);
    remove('key');
    await advanceTimersByTimeAsync(16);
    expect(fn.mock.calls).toHaveLength(totalCalls);
  });

  it('should trigger the returned function after', async () => {
    const fn2 = vi.fn();
    add('fn2', () => {
      fn2('update');
      return () => {
        fn2('render');
        remove('fn2');
      };
    });
    await advanceTimersByTimeAsync(16);
    expect(fn2).toHaveBeenCalledTimes(2);
    expect(fn2.mock.calls).toEqual([['update'], ['render']]);
  });

  it('should stop triggering when having no callback', async () => {
    remove('key');
    await advanceTimersByTimeAsync(16);
    expect(fn).not.toHaveBeenCalled();
  });
});
