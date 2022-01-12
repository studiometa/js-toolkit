import * as math from '@studiometa/js-toolkit/utils/math';

describe('@studiometa/js-toolkit/utils/math exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(math)).toMatchSnapshot();
  });
});
