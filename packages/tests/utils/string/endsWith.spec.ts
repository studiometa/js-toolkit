import { describe, it, expect } from 'vitest';
import { endsWith } from '@studiometa/js-toolkit/utils';

describe('The endsWith function', () => {
  it('should work with 0 letter search', () => {
    expect(endsWith('oof', '')).toBe(true);
    expect(endsWith('oof', '')).toBe(true);
  });

  it('should work with one letter search', () => {
    expect(endsWith('oof', 'f')).toBe(true);
    expect(endsWith('oof', 'b')).toBe(false);
  });

  it('should work with multiple letters search', () => {
    expect(endsWith('foo', 'foo')).toBe(true);
    expect(endsWith('foo', 'bar')).toBe(false);
  });

  it('should work with special characters', () => {
    expect(endsWith('foo[]', '[]')).toBe(true);
    expect(endsWith('foo', '[]')).toBe(false);
  });
});
