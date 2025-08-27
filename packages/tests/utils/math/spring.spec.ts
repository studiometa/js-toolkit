import { describe, it, expect } from 'vitest';
import { spring } from '@studiometa/js-toolkit/utils';

describe('spring method', () => {
  it('should give the correct value and velocity', () => {
    // Starting from rest
    const result1 = spring(10, 0, 0, 0.1, 0.8);
    expect(result1[0]).toBe(1);
    expect(result1[1]).toBe(1);

    // With existing velocity
    const result2 = spring(10, 5, 2, 0.1, 0.8);
    expect(result2[0]).toBe(7.1);
    expect(result2[1]).toBe(2.1);

    // Already at target
    const result3 = spring(10, 10, 0, 0.1, 0.8);
    expect(result3[0]).toBe(10);
    expect(result3[1]).toBe(0);

    // Different stiffness
    const result4 = spring(10, 0, 0, 0.2, 0.8);
    expect(result4[0]).toBe(2);
    expect(result4[1]).toBe(2);

    // Different damping
    const result5 = spring(10, 5, 2, 0.1, 0.5);
    expect(result5[0]).toBe(6.5);
    expect(result5[1]).toBe(1.5);
  });

  it('should round the result when the difference and velocity are small', () => {
    const result = spring(10, 9.9999, 0.0001);
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(0);
  });

  it('should handle negative values', () => {
    const result = spring(-10, 0, 0, 0.1, 0.8);
    expect(result[0]).toBe(-1);
    expect(result[1]).toBe(-1);
  });

  it('should handle oscillation scenarios', () => {
    // Simulate a bouncing motion
    let currentValue = 0;
    let currentVelocity = 0;
    const targetValue = 10;
    
    // First step
    const step1 = spring(targetValue, currentValue, currentVelocity, 0.2, 0.7);
    expect(step1[0]).toBeCloseTo(2, 5);
    expect(step1[1]).toBeCloseTo(2, 5);

    // Second step with the new velocity
    const step2 = spring(targetValue, step1[0], step1[1], 0.2, 0.7);
    expect(step2[0]).toBeCloseTo(5, 5);
    expect(step2[1]).toBeCloseTo(3, 5);
  });
});
