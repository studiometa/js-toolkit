import { describe, test as it, expect } from '@jest/globals';
import * as utils from '@studiometa/js-toolkit/utils';
import { isFunction } from '@studiometa/js-toolkit/utils';

const is = Object.fromEntries(
  Object.entries(utils).filter(([name, fn]) => name.startsWith('is') && isFunction(fn)),
);

const types = {
  boolean: true,
  string: 'string',
  emptyString: '',
  number: 0,
  fn: () => {},
  array: [],
  object: {},
  // eslint-disable-next-line object-shorthand
  undefined: undefined,
  null: null,
};

for (const [name, fn] of Object.entries(is)) {
  describe(`The "${name}" utility function`, () => {
    for (const [type, value] of Object.entries(types)) {
      it(`should work with value of type "${type}"`, () => {
        expect(fn(value)).toMatchSnapshot();
      });
    }
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
