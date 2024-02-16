import { describe, it, expect } from 'bun:test';
import { transform } from '@studiometa/js-toolkit/utils';

describe('The `transform` utility function', () => {
  it('should set the transform of an element and return its value', () => {
    const div = document.createElement('div');
    const value = transform(div, {
      x: 100,
      y: 100,
      z: 100,
      scale: 0.5,
      rotate: 45,
      skew: 10,
    });
    const result = 'translate3d(100px, 100px, 100px) rotate(45deg) scale(0.5) skew(10deg) ';
    expect(value).toBe(result);
    expect(div.style.transform).toBe(result);
  });

  for (const [name, value, result] of [
    ['x', 100, 'translate3d(100px, 0px, 0px)'],
    ['y', 100, 'translate3d(0px, 100px, 0px)'],
    ['z', 100, 'translate3d(0px, 0px, 100px)'],
    ['scale', 0.5, 'scale(0.5)'],
    ['scaleX', 0.5, 'scaleX(0.5)'],
    ['scaleY', 0.5, 'scaleY(0.5)'],
    ['scaleZ', 0.5, 'scaleZ(0.5)'],
    ['rotate', 45, 'rotate(45deg)'],
    ['rotateX', 45, 'rotateX(45deg)'],
    ['rotateY', 45, 'rotateY(45deg)'],
    ['rotateZ', 45, 'rotateZ(45deg)'],
    ['skew', 10, 'skew(10deg)'],
    ['skewX', 10, 'skewX(10deg)'],
    ['skewY', 10, 'skewY(10deg)'],
  ]) {
    it(`should set the \`${name}\` property`, () => {
      const div = document.createElement('div');
      const props = {};
      props[name] = value;
      const transformValue = transform(div, props);
      expect(transformValue.trim()).toBe(result);
      expect(div.style.transform.trim()).toBe(result);
    });
  }
});
