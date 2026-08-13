import { describe, it, expect } from 'vitest';
import { startsWith } from '@studiometa/js-toolkit/utils';

describe('The startsWith function', () => {
  it('should work with 0 letter search', () => {
    expect(startsWith('foo', '')).toBe(true);
    expect(startsWith('foo', '')).toBe(true);
  });

  it('should work with one letter search', () => {
    expect(startsWith('foo', 'f')).toBe(true);
    expect(startsWith('foo', 'b')).toBe(false);
  });

  it('should work with multiple letters search', () => {
    expect(startsWith('foo', 'foo')).toBe(true);
    expect(startsWith('foo', 'bar')).toBe(false);
  });
});
