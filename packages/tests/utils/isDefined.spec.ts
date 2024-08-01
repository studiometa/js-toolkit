import { describe, test as it, expect } from '@jest/globals';
import { isDefined } from '@studiometa/js-toolkit/utils';

describe('The `isDefined` utility function', () => {
  it('should return true when given something defined', () => {
    expect(isDefined(() => {})).toBe(true);
    expect(isDefined(function noop() {})).toBe(true);
    expect(isDefined(expect)).toBe(true);
    expect(isDefined('string')).toBe(true);
    expect(isDefined(123)).toBe(true);
    expect(isDefined(true)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
    expect(isDefined(document)).toBe(true);
  });

  it('should return false when given `undefined`', () => {
    expect(isDefined({}.bar)).toBe(false);
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined([][0])).toBe(false);
  });
});
