import { describe, test as it, expect } from 'bun:test';
import * as utils from '@studiometa/js-toolkit/utils';

const is = Object.fromEntries(Object.entries(utils).filter(([name]) => name.startsWith('is')));

const types = {
  boolean: true,
  string: 'string',
  number: 0,
  fn: () => {},
  array: [],
  object: {},
  // eslint-disable-next-line object-shorthand
  undefined: undefined,
};

Object.entries(is)
  .filter(([, fn]) => typeof fn === 'function')
  .forEach(([name, fn]) => {
    describe(`The "${name}" utility function`, () => {
      Object.entries(types).forEach(([type, value]) => {
        it(`should work with value of type "${type}"`, () => {
          expect(fn(value)).toMatchSnapshot();
        });
      });
    });
  });

describe('The "isNumber" utility function', () => {
  it('should return false for NaN', () => {
    expect(is.isNumber(Number.NaN)).toBe(false);
    expect(is.isNumber(Number('100px'))).toBe(false);
  });
});
