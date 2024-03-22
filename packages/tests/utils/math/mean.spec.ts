import { describe, it, expect } from 'bun:test';
import { mean } from '@studiometa/js-toolkit/utils';

describe('mean method', () => {
  it('should mean values', () => {
    expect(mean([])).toBe(0);
    expect(mean([1])).toBe(1);
    expect(mean([0, 2])).toBe(1);
  });
});
