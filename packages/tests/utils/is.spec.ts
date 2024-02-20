import { describe, test as it, expect } from 'bun:test';
import * as utils from '@studiometa/js-toolkit/utils';
import { isFunction } from '@studiometa/js-toolkit/utils';

const is = Object.fromEntries(
  Object.entries(utils).filter(([name, fn]) => name.startsWith('is') && isFunction(fn)),
);

const types = {
  boolean: true,
  string: 'string',
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
    expect(is.isEmpty()).toBeTrue();
    expect(is.isEmpty('')).toBeTrue();
    expect(is.isEmpty(null)).toBeTrue();
    expect(is.isEmpty([])).toBeTrue();
    expect(is.isEmpty({})).toBeTrue();
  });

  it('should return false when the given value is not empty', () => {
    expect(is.isEmpty('foo')).toBeFalse();
    expect(is.isEmpty(true)).toBeFalse();
    expect(is.isEmpty(false)).toBeFalse();
    expect(is.isEmpty([1, 2])).toBeFalse();
    expect(is.isEmpty({ foo: 'foo' })).toBeFalse();
    expect(is.isEmpty(/regex/)).toBeFalse();
  });
});

describe('The "isNumber" utility function', () => {
  it('should return false for NaN', () => {
    expect(is.isNumber(Number.NaN)).toBe(false);
    expect(is.isNumber(Number('100px'))).toBe(false);
  });
});
