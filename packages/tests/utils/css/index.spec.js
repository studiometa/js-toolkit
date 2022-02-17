import * as css from '@studiometa/js-toolkit/utils/css';

describe('@studiometa/js-toolkit/utils/css exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(css)).toMatchSnapshot();
  });
});
