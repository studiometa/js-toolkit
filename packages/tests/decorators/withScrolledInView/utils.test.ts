import { describe, it, expect, jest, beforeAll } from 'bun:test';
import { parseNamedOffset, getEdgeWithOffset, normalizeOffset } from '../../../js-toolkit/decorators/withScrolledInView/utils.js';

describe('The `normalizeOffset` function', () => {
  it('should normalize the offset', () => {
    expect(normalizeOffset('start start / start start')).toEqual([
      ['start', 'start'],
      ['start', 'start'],
    ]);
    expect(normalizeOffset('end end / end end')).toEqual([
      ['end', 'end'],
      ['end', 'end'],
    ]);
    expect(normalizeOffset('center center / center center')).toEqual([
      ['center', 'center'],
      ['center', 'center'],
    ]);
    expect(normalizeOffset('0 1 / 0 1')).toEqual([
      ['0', '1'],
      ['0', '1'],
    ]);
  });
});

describe('The `parseNamedOffset` function', () => {
  it('should return the given number', () => {
    expect(parseNamedOffset(0)).toBe(0);
    expect(parseNamedOffset(1)).toBe(1);
    expect(parseNamedOffset(0.5)).toBe(0.5);
  });

  it('should return the given string as a number', () => {
    expect(parseNamedOffset('0')).toBe(0);
    expect(parseNamedOffset('1')).toBe(1);
    expect(parseNamedOffset('0.5')).toBe(0.5);
  });

  it('should return the given string as a number divided by 100', () => {
    expect(parseNamedOffset('0%')).toBe(0);
    expect(parseNamedOffset('100%')).toBe(1);
    expect(parseNamedOffset('50%')).toBe(0.5);
  });

  it('should return the matching value for keywords', () => {
    expect(parseNamedOffset('start')).toBe(0);
    expect(parseNamedOffset('center')).toBe(0.5);
    expect(parseNamedOffset('end')).toBe(1);
  });

  it('should return the given value is it does not match a parser', () => {
    ['100px', '100vh', '100vw', '100vmin', '100vmax'].forEach((value) => {
      expect(parseNamedOffset(value)).toBe(value);
    });
  });
});

describe('The `getEdgeWithOffset` function', () => {
  it('should return the start value if the offset is neither a string nor a number', () => {
    expect(getEdgeWithOffset(0, 100, null)).toBe(0);
    expect(getEdgeWithOffset(0, 100, undefined)).toBe(0);
    expect(getEdgeWithOffset(0, 100, {})).toBe(0);
    expect(getEdgeWithOffset(0, 100, [])).toBe(0);
  });

  it('should return the given start value if the offset is 0', () => {
    expect(getEdgeWithOffset(0, 100, 0)).toBe(0);
    expect(getEdgeWithOffset(0, 100, '0')).toBe(0);
    expect(getEdgeWithOffset(0, 100, '0%')).toBe(0);
    expect(getEdgeWithOffset(0, 100, 'start')).toBe(0);
  });

  it('should return the given start value plus the size if the offset is 1', () => {
    expect(getEdgeWithOffset(0, 100, 1)).toBe(100);
    expect(getEdgeWithOffset(0, 100, '1')).toBe(100);
    expect(getEdgeWithOffset(0, 100, '100%')).toBe(100);
    expect(getEdgeWithOffset(0, 100, 'end')).toBe(100);
  });

  it('should return the given start value plus half the size if the offset is 0.5', () => {
    expect(getEdgeWithOffset(0, 100, 0.5)).toBe(50);
    expect(getEdgeWithOffset(0, 100, '0.5')).toBe(50);
    expect(getEdgeWithOffset(0, 100, '50%')).toBe(50);
    expect(getEdgeWithOffset(0, 100, 'center')).toBe(50);
  });

  it('should return the given start value plus the given offset if it is expressed in pixelx', () => {
    expect(getEdgeWithOffset(0, 100, '10px')).toBe(10);
    expect(getEdgeWithOffset(0, 100, '-10px')).toBe(-10);
  });

  it('should return the given start value plus the given offset if it is expressed in viewport units', () => {
    window.innerWidth = 1000;
    window.innerHeight = 1000;
    expect(getEdgeWithOffset(0, 100, '10vw')).toBe(0.1 * window.innerWidth);
    expect(getEdgeWithOffset(0, 100, '-10vw')).toBe(-0.1 * window.innerWidth);
    expect(getEdgeWithOffset(0, 100, '10vh')).toBe(0.1 * window.innerHeight);
    expect(getEdgeWithOffset(0, 100, '-10vh')).toBe(-0.1 * window.innerHeight);
    expect(getEdgeWithOffset(0, 100, '10vmin')).toBe(0.1 * Math.min(window.innerWidth, window.innerHeight));
    expect(getEdgeWithOffset(0, 100, '-10vmin')).toBe(-0.1 * Math.min(window.innerWidth, window.innerHeight));
    expect(getEdgeWithOffset(0, 100, '10vmax')).toBe(0.1 * Math.max(window.innerWidth, window.innerHeight));
    expect(getEdgeWithOffset(0, 100, '-10vmax')).toBe(-0.1 * Math.max(window.innerWidth, window.innerHeight));
  });
});
