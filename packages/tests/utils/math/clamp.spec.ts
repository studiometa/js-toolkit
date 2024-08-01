import { describe, it, expect } from '@jest/globals';
import { clamp } from '@studiometa/js-toolkit/utils';

describe('clamp method', () => {
  it('should clamp a value between the given range', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(5, 10, 0)).toBe(5);
    expect(clamp(-5, 10, 0)).toBe(0);
    expect(clamp(15, 10, 0)).toBe(10);
  });
});
