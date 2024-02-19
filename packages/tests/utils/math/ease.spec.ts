import { describe, it, expect } from 'bun:test';
import { ease } from '@studiometa/js-toolkit/utils';

const values = Array(10)
  .fill(0)
  .map((value, index, array) => index / (array.length - 1));

describe('ease methods', () => {
  Object.keys(ease)
    .filter((key) => key.startsWith('ease'))
    .forEach((key) => {
      it(`the ${key} method should give the correct value`, () => {
        values.forEach((value) => {
          expect(ease[key](value)).toMatchSnapshot();
        });
      });
    });
});
