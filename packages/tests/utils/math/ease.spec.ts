import { describe, it, expect } from 'bun:test';
import { ease } from '@studiometa/js-toolkit/utils';

const values = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

describe('ease methods', () => {
  for (const key of Object.keys(ease)) {
    if (key.startsWith('ease')) {
      for (const value of values) {
        it(`the "${key}" method should give the correct value for "${value}"`, () => {
          expect(ease[key](value).toFixed(5)).toMatchSnapshot();
        });
      }
    }
  }
});
