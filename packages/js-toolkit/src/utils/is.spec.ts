import { describe, it, expect } from 'vitest';
import * as is from '#private/utils/is.js';

const types = {
  boolean: true,
  string: 'string',
  emptyString: '',
  number: 0,
  fn: () => {},
  array: [],
  object: {},
  undefined: undefined,
  null: null,
};
const fns: Array<[string, string | string[]]> = [
  ['isArray', 'array'],
  ['isBoolean', 'boolean'],
  ['isDefined', ['boolean', 'string', 'emptyString', 'number', 'fn', 'array', 'object', 'null']],
  ['isEmptyString', 'emptyString'],
  ['isFunction', 'fn'],
  ['isNull', 'null'],
  ['isNumber', 'number'],
  ['isObject', 'object'],
  ['isString', ['string', 'emptyString']],
];

for (const [name, trueType] of fns) {
  describe(`The "${name}" utility function`, () => {
    it(`should be true with value of type "${trueType}"`, () => {
      for (const [type, value] of Object.entries(types)) {
        expect(is[name](value)).toBe(trueType.includes(type));
      }
    });
    it(`should be false with value different from type "${trueType}"`, () => {
      for (const [type, value] of Object.entries(types)) {
        expect(is[name](value)).toBe(trueType.includes(type));
      }
    });
  });
}

describe('The "isEmpty" utility function', () => {
  it('should return true when the given value is empty', () => {
    expect(is.isEmpty()).toBe(true);
    expect(is.isEmpty('')).toBe(true);
    expect(is.isEmpty(null)).toBe(true);
    expect(is.isEmpty([])).toBe(true);
    expect(is.isEmpty({})).toBe(true);
  });

  it('should return false when the given value is not empty', () => {
    expect(is.isEmpty(Number.NaN)).toBe(false);
    expect(is.isEmpty(1)).toBe(false);
    expect(is.isEmpty(0)).toBe(false);
    expect(is.isEmpty('foo')).toBe(false);
    expect(is.isEmpty(true)).toBe(false);
    expect(is.isEmpty(false)).toBe(false);
    expect(is.isEmpty([1, 2])).toBe(false);
    expect(is.isEmpty({ foo: 'foo' })).toBe(false);
    expect(is.isEmpty(/regex/)).toBe(false);

    class Foo {}
    const foo = new Foo();
    expect(is.isEmpty(foo)).toBe(false);
  });
});

describe('The "isNumber" utility function', () => {
  it('should return false for NaN', () => {
    expect(is.isNumber(Number.NaN)).toBe(false);
    expect(is.isNumber(Number('100px'))).toBe(false);
  });
});
