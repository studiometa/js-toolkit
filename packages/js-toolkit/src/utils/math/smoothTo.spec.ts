import { describe, it, expect, vi } from 'vitest';
import { smoothTo, wait } from '@studiometa/js-toolkit/utils';

describe('smoothTo method', () => {
  it('should create a smooth transition function with default options', () => {
    const smooth = smoothTo(0);
    expect(typeof smooth).toBe('function');
    expect(typeof smooth.subscribe).toBe('function');
    expect(typeof smooth.unsubscribe).toBe('function');
    expect(typeof smooth.raw).toBe('function');
    expect(typeof smooth.damping).toBe('function');
    expect(typeof smooth.precision).toBe('function');
    expect(typeof smooth.stiffness).toBe('function');
    expect(typeof smooth.spring).toBe('function');
  });

  it('should return current smoothed value when called without parameters', () => {
    const smooth = smoothTo(5);
    expect(smooth()).toBe(5);
  });

  it('should return raw target value', () => {
    const smooth = smoothTo(0);
    expect(smooth.raw()).toBe(0);
    expect(smooth()).toBe(0);
    smooth(10);
    expect(smooth.raw()).toBe(10);
    expect(smooth()).toBe(6);
  });

  it('should subscribe and unsubscribe to value updates', () => {
    const smooth = smoothTo(0);
    const callback = vi.fn();

    const unsubscribe = smooth.subscribe(callback);
    expect(typeof unsubscribe).toBe('function');

    expect(smooth.unsubscribe(callback)).toBe(true);
    expect(smooth.unsubscribe(callback)).toBe(false);
  });

  it('should allow changing options dynamically', () => {
    const smooth = smoothTo(0);

    expect(smooth.damping(0.8)).toBe(0.8);
    expect(smooth.damping()).toBe(0.8);
    expect(smooth.precision(0.001)).toBe(0.001);
    expect(smooth.precision()).toBe(0.001);
    expect(smooth.stiffness(0.15)).toBe(0.15);
    expect(smooth.stiffness()).toBe(0.15);
    expect(smooth.spring(true)).toBe(true);
    expect(smooth.spring()).toBe(true);
  });

  it('should ignore non-function subscribers', () => {
    const smooth = smoothTo(0);

    expect(() => {
      smooth.subscribe(null as any);
      smooth.subscribe(undefined as any);
      smooth.subscribe('invalid' as any);
    }).not.toThrow();
  });

  it('should return false when unsubscribing non-existent callback', () => {
    const smooth = smoothTo(0);
    const nonExistentFn = vi.fn();

    expect(smooth.unsubscribe(nonExistentFn)).toBe(false);
  });

  it('should handle start value initialization', () => {
    const smooth = smoothTo(42);
    expect(smooth()).toBe(42);
    expect(smooth.raw()).toBe(42);
  });

  it('should update target value and return smoothed value', () => {
    const smooth = smoothTo(0);

    const result = smooth(10);
    expect(smooth.raw()).toBe(10);
    expect(typeof result).toBe('number');
  });

  it('should increment target value with the `add` function', () => {
    const smooth = smoothTo(0, { damping: 1 });

    const result1 = smooth.add(10);
    expect(smooth.raw()).toBe(10);
    expect(result1).toBe(10);
    const result2 = smooth.add(-10);
    expect(smooth.raw()).toBe(0);
    expect(result2).toBe(0);
  });

  it('should support different starting values', () => {
    const smooth1 = smoothTo();
    const smooth2 = smoothTo(100);
    const smooth3 = smoothTo(-50);

    expect(smooth1()).toBe(0);
    expect(smooth2()).toBe(100);
    expect(smooth3()).toBe(-50);
  });

  it('should support different option configurations', () => {
    const smooth1 = smoothTo(0, { damping: 0.8 });
    const smooth2 = smoothTo(0, { spring: true });
    const smooth3 = smoothTo(0, { precision: 0.01 });
    const smooth4 = smoothTo(0, { stiffness: 0.2 });

    expect(typeof smooth1).toBe('function');
    expect(typeof smooth2).toBe('function');
    expect(typeof smooth3).toBe('function');
    expect(typeof smooth4).toBe('function');
  });

  it('should handle subscription management correctly', () => {
    const smooth = smoothTo(0);
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unsubscribe1 = smooth.subscribe(callback1);
    const unsubscribe2 = smooth.subscribe(callback2);

    expect(typeof unsubscribe1).toBe('function');
    expect(typeof unsubscribe2).toBe('function');

    unsubscribe1();
    unsubscribe2();
  });

  it('should execute subscribed functions correctly', async () => {
    const smooth = smoothTo(0);
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unsubscribe1 = smooth.subscribe(callback1);
    const unsubscribe2 = smooth.subscribe(callback2);

    smooth(1);
    await wait(100);
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();

    unsubscribe1();
    unsubscribe2();
  });

  it('should work with complex option combinations', () => {
    const smooth = smoothTo(0, {
      damping: 0.7,
      spring: true,
      stiffness: 0.3,
      precision: 0.001,
    });

    expect(smooth.damping(0.5)).toBe(0.5);
    expect(smooth.spring(false)).toBe(false);
    expect(smooth.stiffness(0.4)).toBe(0.4);
    expect(smooth.precision(0.01)).toBe(0.01);
  });
});
