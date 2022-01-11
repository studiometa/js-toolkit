import * as ease from '@studiometa/js-toolkit/utils/math/ease';

const values = Array(10)
  .fill()
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
