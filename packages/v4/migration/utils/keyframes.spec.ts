import { describe, expect, it } from 'vitest';
import { applyStyles, compile } from './keyframes.js';

const size = { width: 200, height: 100 };

describe('compile', () => {
  it('interpolates opacity and transforms between two keyframes', () => {
    const interpolate = compile([
      { opacity: 0, x: 0 },
      { opacity: 1, x: 100 },
    ]);

    expect(interpolate(0, size).opacity).toBe('0');
    expect(interpolate(0, size).transform).toBe('translate3d(0px, 0px, 0px)');
    expect(interpolate(0.5, size).opacity).toBe('0.5');
    expect(interpolate(0.5, size).transform).toBe('translate3d(50px, 0px, 0px)');
    expect(interpolate(1, size).opacity).toBe('1');
    expect(interpolate(1, size).transform).toBe('translate3d(100px, 0px, 0px)');
  });

  it('resolves percentage units against the element size', () => {
    const interpolate = compile([{ x: 0 }, { x: [50, '%'], y: [100, '%'] }]);

    // 50% of the width, 100% of the height.
    expect(interpolate(1, size).transform).toBe('translate3d(100px, 100px, 0px)');
  });

  it('walks several keyframes through their offsets', () => {
    const interpolate = compile([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]);

    expect(interpolate(0, size).opacity).toBe('0');
    expect(interpolate(0.25, size).opacity).toBe('0.5');
    expect(interpolate(0.5, size).opacity).toBe('1');
    expect(interpolate(0.75, size).opacity).toBe('0.5');
    expect(interpolate(1, size).opacity).toBe('0');
  });

  it('honours explicit offsets', () => {
    const interpolate = compile([
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.2 },
      { opacity: 1, offset: 1 },
    ]);

    expect(interpolate(0.1, size).opacity).toBe('0.5');
    expect(interpolate(0.6, size).opacity).toBe('1');
  });

  it('applies a cubic bezier easing', () => {
    const eased = compile([{ opacity: 0 }, { opacity: 1 }], { easing: [0.5, 0, 0.5, 1] });
    const linear = compile([{ opacity: 0 }, { opacity: 1 }]);

    expect(Number(eased(0.5, size).opacity)).toBeCloseTo(0.5, 3);
    // An ease-in-out curve is behind the linear one at a quarter.
    expect(Number(eased(0.25, size).opacity)).toBeLessThan(Number(linear(0.25, size).opacity));
  });

  it('interpolates custom properties and rotation', () => {
    const interpolate = compile([
      { rotate: 0, '--shift': 0 },
      { rotate: 90, '--shift': 10 },
    ]);

    const styles = interpolate(0.5, size);
    expect(styles.transform).toBe('rotate(45deg)');
    expect(styles.customProperties).toEqual([['--shift', '5']]);
  });

  it('writes the style patch to an element', () => {
    const el = document.createElement('div');
    applyStyles(el, compile([{ opacity: 0 }, { opacity: 1, '--shift': 4 }])(1, size));

    expect(el.style.opacity).toBe('1');
    expect(el.style.getPropertyValue('--shift')).toBe('');

    const withVars = compile([{ '--shift': 0 }, { '--shift': 4 }]);
    applyStyles(el, withVars(0.5, size));
    expect(el.style.getPropertyValue('--shift')).toBe('2');
  });
});
