import { describe, expect, it } from 'vitest';
import { matrix, transform, TRANSFORM_PROPS } from './transform.js';

describe('transform', () => {
  it('formats every property in a stable order', () => {
    expect(transform({ x: 100, y: 100, z: 100, scale: 0.5, rotate: 45, skew: 10 })).toBe(
      'translate3d(100px, 100px, 100px) rotate(45deg) scale(0.5) skew(10deg)',
    );
  });

  it.each([
    [{ x: 100 }, 'translate3d(100px, 0px, 0px)'],
    [{ y: 100 }, 'translate3d(0px, 100px, 0px)'],
    [{ z: 100 }, 'translate3d(0px, 0px, 100px)'],
    [{ scale: 0.5 }, 'scale(0.5)'],
    [{ scaleX: 0.5 }, 'scaleX(0.5)'],
    [{ scaleY: 0.5 }, 'scaleY(0.5)'],
    [{ scaleZ: 0.5 }, 'scaleZ(0.5)'],
    [{ rotate: 45 }, 'rotate(45deg)'],
    [{ rotateX: 45 }, 'rotateX(45deg)'],
    [{ rotateY: 45 }, 'rotateY(45deg)'],
    [{ rotateZ: 45 }, 'rotateZ(45deg)'],
    [{ skew: 10 }, 'skew(10deg)'],
    [{ skewX: 10 }, 'skewX(10deg)'],
    [{ skewY: 10 }, 'skewY(10deg)'],
  ])('formats %o', (props, expected) => {
    expect(transform(props)).toBe(expected);
  });

  it('prefers a shorthand over its per-axis properties', () => {
    expect(transform({ rotate: 45, rotateX: 10, rotateY: 10, rotateZ: 10 })).toBe('rotate(45deg)');
    expect(transform({ scale: 2, scaleX: 3, scaleY: 3, scaleZ: 3 })).toBe('scale(2)');
    expect(transform({ skew: 5, skewX: 1, skewY: 1 })).toBe('skew(5deg)');
  });

  it('combines per-axis properties', () => {
    expect(transform({ rotateX: 10, rotateZ: 20, scaleX: 2, skewY: 5 })).toBe(
      'rotateX(10deg) rotateZ(20deg) scaleX(2) skewY(5deg)',
    );
  });

  it('keeps a zero value', () => {
    expect(transform({ scale: 0 })).toBe('scale(0)');
    expect(transform({ x: 0 })).toBe('translate3d(0px, 0px, 0px)');
  });

  it('returns an empty string for no property', () => {
    expect(transform({})).toBe('');
  });

  it('lists the properties it formats', () => {
    expect(TRANSFORM_PROPS).toHaveLength(14);
    expect(TRANSFORM_PROPS).toContain('rotateZ');
    expect(Object.isFrozen(TRANSFORM_PROPS)).toBe(true);
  });
});

describe('matrix', () => {
  it('defaults to the identity matrix', () => {
    expect(matrix()).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(matrix({})).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });

  it('formats the values in matrix order', () => {
    expect(matrix({ scaleX: 0.5, scaleY: 0.5 })).toBe('matrix(0.5, 0, 0, 0.5, 0, 0)');
    expect(matrix({ scaleX: 2, skewY: 1, skewX: 3, scaleY: 4, translateX: 5, translateY: 6 })).toBe(
      'matrix(2, 1, 3, 4, 5, 6)',
    );
  });
});
