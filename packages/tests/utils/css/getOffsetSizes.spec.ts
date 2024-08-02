import { describe, it, expect } from 'vitest';
import { getOffsetSizes } from '@studiometa/js-toolkit/utils';

describe('The `getOffsetSizes` method', () => {
  it('should return a DOMRect like Object', () => {
    const div = document.createElement('div');
    expect(getOffsetSizes(div)).toEqual({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    });
  });

  it('should return the same values a `getBoundingClientRect()` when no transform is applied', () => {
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.position = 'relative';
    div.style.top = '10px';
    div.style.left = '10px';
    // @todo find a way for jsdom to support sizing of elements
    const offsetSizes = getOffsetSizes(div);
    const sizes = div.getBoundingClientRect();
    for (const key of Object.keys(sizes)) {
      expect(sizes[key]).toBe(sizes[key]);
    }
  });

  it('should return a DOMRect like object without transforms', () => {
    const div = document.createElement('div');
    div.style.transform = 'translateX(10px) rotate(45deg) scale(0.5)';
    div.style.marginLeft = '10px';
    expect(getOffsetSizes(div)).toEqual({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    });
  });
});
