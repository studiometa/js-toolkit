import { describe, it, expect } from 'bun:test';
import { isFunction } from '@studiometa/js-toolkit/utils';

describe('The `isFunction` utility function', () => {
  it('should return true when given a function', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function noop() {})).toBe(true);
    expect(isFunction(expect)).toBe(true);
  });

  it('should return false when given a value which is not a function', () => {
    expect(isFunction('string')).toBe(false);
    expect(isFunction(123)).toBe(false);
    expect(isFunction(true)).toBe(false);
    expect(isFunction(false)).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction(document)).toBe(false);
  });
});
