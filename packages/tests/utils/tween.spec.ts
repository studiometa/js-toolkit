import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tween } from '@studiometa/js-toolkit/utils';
import { useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('tween method', () => {
  it('should create a tween with control methods', () => {
    const callback = vi.fn();
    const tw = tween(callback);
    
    expect(typeof tw.start).toBe('function');
    expect(typeof tw.finish).toBe('function');
    expect(typeof tw.pause).toBe('function');
    expect(typeof tw.play).toBe('function');
    expect(typeof tw.progress).toBe('function');
  });

  it('should execute callback with progress values', () => {
    const callback = vi.fn();
    const tw = tween(callback);
    
    tw.progress(0.5);
    expect(callback).toHaveBeenCalledWith(0.5);
    
    tw.progress(1);
    expect(callback).toHaveBeenCalledWith(1);
  });

  it('should support custom easing function', () => {
    const callback = vi.fn();
    const customEase = (t: number) => t * t;
    const tw = tween(callback, { easing: customEase });
    
    tw.progress(0.5);
    expect(callback).toHaveBeenCalledWith(0.25);
  });

  it('should support bezier curve easing', () => {
    const callback = vi.fn();
    const tw = tween(callback, { easing: [0, 0, 1, 1] });
    
    tw.progress(0.5);
    expect(callback).toHaveBeenCalled();
    const callValue = callback.mock.calls[0]?.[0];
    expect(typeof callValue).toBe('number');
  });

  it('should support smooth mode', () => {
    const callback = vi.fn();
    const tw = tween(callback, { smooth: true });
    
    tw.progress(1);
    expect(callback).toHaveBeenCalled();
    
    const callValue = callback.mock.calls[0]?.[0];
    expect(typeof callValue).toBe('number');
  });

  it('should support smooth mode with custom factor', () => {
    const callback = vi.fn();
    const tw = tween(callback, { smooth: 0.2 });
    
    tw.progress(1);
    expect(callback).toHaveBeenCalled();
  });

  it('should support spring mode', () => {
    const callback = vi.fn();
    const tw = tween(callback, { spring: true });
    
    tw.progress(1);
    expect(callback).toHaveBeenCalled();
    
    const callValue = callback.mock.calls[0]?.[0];
    expect(typeof callValue).toBe('number');
  });

  it('should support spring mode with custom stiffness', () => {
    const callback = vi.fn();
    const tw = tween(callback, { spring: 0.2 });
    
    tw.progress(1);
    expect(callback).toHaveBeenCalled();
  });

  it('should support custom precision', () => {
    const callback = vi.fn();
    const tw = tween(callback, { precision: 0.01 });
    
    tw.progress(0.999);
    expect(callback).toHaveBeenCalled();
  });

  it('should call lifecycle callbacks', () => {
    const callback = vi.fn();
    const onStart = vi.fn();
    const onProgress = vi.fn();
    
    const tw = tween(callback, {
      onStart,
      onProgress
    });
    
    tw.start();
    expect(onStart).toHaveBeenCalledWith(0);
    
    tw.progress(0.5);
    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it('should support manual progress control', () => {
    const callback = vi.fn();
    const tw = tween(callback);
    
    expect(tw.progress()).toBe(0);
    
    tw.progress(0.5);
    expect(callback).toHaveBeenCalledWith(0.5);
    expect(tw.progress()).toBe(0.5);
  });

  it('should support finish method', () => {
    const callback = vi.fn();
    const tw = tween(callback);
    
    tw.finish();
    expect(callback).toHaveBeenCalledWith(1);
  });

  it('should handle spring and smooth mode parameters correctly', () => {
    const callback = vi.fn();
    
    const springTween = tween(callback, { spring: 0.3 });
    springTween.progress(0.5);
    expect(callback).toHaveBeenCalled();
    
    callback.mockClear();
    
    const smoothTween = tween(callback, { smooth: 0.4 });
    smoothTween.progress(0.5);
    expect(callback).toHaveBeenCalled();
  });

  it('should work with different precision values', () => {
    const callback = vi.fn();
    const tw = tween(callback, { precision: 0.1 });
    
    tw.progress(0.95);
    expect(callback).toHaveBeenCalled();
    
    const callValue = callback.mock.calls[0]?.[0];
    expect(callValue).toBe(1);
  });
});