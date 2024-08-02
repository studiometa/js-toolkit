import { describe, it, expect } from 'vitest';
import { clamp01 } from '@studiometa/js-toolkit/utils';

describe('clamp01 method', () => {
  it('should clamp a value between 0 and 1', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
});
