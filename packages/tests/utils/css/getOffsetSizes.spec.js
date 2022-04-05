import { getOffsetSizes } from '@studiometa/js-toolkit/utils';

describe('The `getOffsetSizes` method', () => {
  it('should return a DOMRect like Object', () => {
    expect(getOffsetSizes(document.body)).toMatchSnapshot();
  });

  it('should return a DOMRect like object without transforms', () => {
    const div = document.createElement('div');
    div.style.transform = 'translateX(10px) rotate(45deg) scale(0.5)';
    div.style.marginLeft = '10px';
    expect(getOffsetSizes(div)).toMatchSnapshot();
  });
});
