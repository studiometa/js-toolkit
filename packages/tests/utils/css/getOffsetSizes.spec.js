import { getOffsetSizes } from '@studiometa/js-toolkit/utils';

describe('The `getOffsetSizes` method', () => {
  it('should return a DOMRect like Object', () => {
    expect(getOffsetSizes(document.body)).toMatchSnapshot();
  });

  it('should return the same values a `getBoundingClientRect()` when no transform is applied', () => {
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.position = 'relative';
    div.style.top = '10px';
    div.style.left = '10px';
    // @todo find a way for jsdom to support sizing of elements
    expect(getOffsetSizes(div)).toEqual(div.getBoundingClientRect());
  });

  it('should return a DOMRect like object without transforms', () => {
    const div = document.createElement('div');
    div.style.transform = 'translateX(10px) rotate(45deg) scale(0.5)';
    div.style.marginLeft = '10px';
    expect(getOffsetSizes(div)).toMatchSnapshot();
  });
});
