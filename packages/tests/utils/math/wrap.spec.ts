import { describe, it, expect } from 'vitest';
import { wrap } from '@studiometa/js-toolkit/utils';

describe('wrap method', () => {
  it('should wrap a value within the given range', () => {
    expect(wrap(5, 0, 10)).toBe(5);
    expect(wrap(0, 0, 10)).toBe(0);
    expect(wrap(10, 0, 10)).toBe(0);
    expect(wrap(15, 0, 10)).toBe(5);
    expect(wrap(-5, 0, 10)).toBe(5);
    expect(wrap(25, 0, 10)).toBe(5);
  });

  it('should handle negative ranges', () => {
    expect(wrap(-5, -10, 0)).toBe(-5);
    expect(wrap(-15, -10, 0)).toBe(-5);
    expect(wrap(5, -10, 0)).toBe(-5);
  });

  it('should handle negative min with positive max', () => {
    expect(wrap(5, -5, 5)).toBe(-5);
    expect(wrap(-3, -5, 5)).toBe(-3);
    expect(wrap(12, -5, 5)).toBe(2);
    expect(wrap(-12, -5, 5)).toBe(-2);
  });

  it('should handle fractional values', () => {
    expect(wrap(1.5, 0, 1)).toBeCloseTo(0.5, 10);
    expect(wrap(2.3, 0, 1)).toBeCloseTo(0.3, 10);
    expect(wrap(-0.7, 0, 1)).toBeCloseTo(0.3, 10);
  });

  it('should handle same min and max values', () => {
    expect(wrap(5, 0, 0)).toBe(0);
    expect(wrap(-5, 0, 0)).toBe(0);
    expect(wrap(-5, 5, 5)).toBe(5);
  });

  it('should handle large ranges', () => {
    expect(wrap(1005, 0, 100)).toBe(5);
    expect(wrap(-995, 0, 100)).toBe(5);
  });
});
