import { describe, it, expect } from 'vitest';
import { fold } from '@studiometa/js-toolkit/utils';

describe('fold method', () => {
  it('should keep in-bounds values unchanged', () => {
    expect(fold(1, 0, 2)).toBe(1);
    expect(fold(0, 0, 2)).toBe(0);
    expect(fold(2, 0, 2)).toBe(2);
  });

  it('should reflect values above max back into the range', () => {
    expect(fold(3, 0, 2)).toBe(1);
    expect(fold(4, 0, 2)).toBe(0);
  });

  it('should reflect values below min back into the range', () => {
    expect(fold(-1, 0, 2)).toBe(1);
    expect(fold(-2, 0, 2)).toBe(2);
  });

  it('should fold values over multiple cycles', () => {
    expect(fold(5, 0, 2)).toBe(1);
    expect(fold(6, 0, 2)).toBe(2);
    expect(fold(-5, 0, 2)).toBe(1);
  });

  it('should support non-zero min', () => {
    expect(fold(7, 2, 4)).toBe(3);
    expect(fold(1, 2, 4)).toBe(3);
    expect(fold(9, 2, 4)).toBe(3);
  });

  it('should support negative ranges', () => {
    expect(fold(-5, -10, 0)).toBe(-5);
    expect(fold(-15, -10, 0)).toBe(-5);
    expect(fold(5, -10, 0)).toBe(-5);
  });

  it('should handle fractional values', () => {
    expect(fold(1.5, 0, 1)).toBeCloseTo(0.5, 10);
    expect(fold(2.3, 0, 1)).toBeCloseTo(0.3, 10);
    expect(fold(-0.7, 0, 1)).toBeCloseTo(0.7, 10);
  });

  it('should return min for degenerate ranges', () => {
    expect(fold(5, 0, 0)).toBe(0);
    expect(fold(-5, 5, 5)).toBe(5);
    expect(fold(5, 10, 0)).toBe(10);
  });

  it('should return min for non-finite ranges', () => {
    expect(fold(5, 0, Infinity)).toBe(0);
    expect(fold(5, -Infinity, 0)).toBe(-Infinity);
    expect(fold(5, 0, NaN)).toBe(0);
  });
});
