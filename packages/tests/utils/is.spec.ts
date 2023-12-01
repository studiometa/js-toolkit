// eslint-disable-next-line import/no-unresolved
import * as is from '@studiometa/js-toolkit/utils/is.js';

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
