import { describe, bench } from 'vitest';
import { transform } from '@studiometa/js-toolkit/utils';

// Create elements once at module level
const elements: HTMLElement[] = [];
for (let i = 0; i < 100; i++) {
  const el = document.createElement('div');
  el.style.cssText = 'width: 100px; height: 100px;';
  document.body.appendChild(el);
  elements.push(el);
}

const el = elements[0];
const els5 = elements.slice(0, 5);
const els10 = elements.slice(0, 10);
const els50 = elements.slice(0, 50);

describe('transform', () => {
  describe('single element', () => {
    bench('translate3d only (x, y, z)', () => {
      transform(el, { x: 100, y: 50, z: 0 });
    });

    bench('translate3d (x only)', () => {
      transform(el, { x: 100 });
    });

    bench('scale', () => {
      transform(el, { scale: 1.5 });
    });

    bench('scaleX, scaleY, scaleZ', () => {
      transform(el, { scaleX: 1.5, scaleY: 0.8, scaleZ: 1 });
    });

    bench('rotate', () => {
      transform(el, { rotate: 45 });
    });

    bench('rotateX, rotateY, rotateZ', () => {
      transform(el, { rotateX: 10, rotateY: 20, rotateZ: 30 });
    });

    bench('skew', () => {
      transform(el, { skew: 15 });
    });

    bench('skewX, skewY', () => {
      transform(el, { skewX: 10, skewY: 5 });
    });

    bench('combined (x, y, scale, rotate)', () => {
      transform(el, { x: 100, y: 50, scale: 1.2, rotate: 45 });
    });

    bench('all transforms', () => {
      transform(el, {
        x: 100,
        y: 50,
        z: 10,
        scale: 1.2,
        scaleX: 1.1,
        scaleY: 0.9,
        rotate: 45,
        rotateX: 10,
        rotateY: 20,
        skewX: 5,
        skewY: 3,
      });
    });

    bench('empty props object', () => {
      transform(el, {});
    });
  });

  describe('multiple elements', () => {
    bench('5 elements (x, y, scale)', () => {
      transform(els5, { x: 100, y: 50, scale: 1.2 });
    });

    bench('10 elements (x, y, scale)', () => {
      transform(els10, { x: 100, y: 50, scale: 1.2 });
    });

    bench('50 elements (x, y, scale)', () => {
      transform(els50, { x: 100, y: 50, scale: 1.2 });
    });
  });
});
