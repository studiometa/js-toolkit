import { describe, expect, it } from 'vitest';
import { getEdgeWithOffset, getEdges, normalizeOffset } from './scroll-progress-offset.js';

describe('scroll progress offsets', () => {
  it('parses two target/viewport edge pairs', () => {
    expect(normalizeOffset('start end / end start')).toEqual([
      ['start', 'end'],
      ['end', 'start'],
    ]);
    expect(normalizeOffset('25% center / 0.75 10px')).toEqual([
      ['25%', 'center'],
      ['0.75', '10px'],
    ]);
  });

  it('resolves named, numeric, percent and pixel tokens', () => {
    expect(getEdgeWithOffset(100, 200, 'start')).toBe(100);
    expect(getEdgeWithOffset(100, 200, 'center')).toBe(200);
    expect(getEdgeWithOffset(100, 200, 'end')).toBe(300);
    expect(getEdgeWithOffset(100, 200, 0.25)).toBe(150);
    expect(getEdgeWithOffset(100, 200, '0.25')).toBe(150);
    expect(getEdgeWithOffset(100, 200, '25%')).toBe(150);
    expect(getEdgeWithOffset(100, 200, '25px')).toBe(125);
    expect(getEdgeWithOffset(100, 200, 'unknown')).toBe(100);
  });

  it('resolves every viewport unit against the viewport', () => {
    expect(getEdgeWithOffset(10, 999, '10vh')).toBe(10 + window.innerHeight / 10);
    expect(getEdgeWithOffset(10, 999, '10vw')).toBe(10 + window.innerWidth / 10);
    expect(getEdgeWithOffset(10, 999, '10vmin')).toBe(
      10 + Math.min(window.innerWidth, window.innerHeight) / 10,
    );
    expect(getEdgeWithOffset(10, 999, '10vmax')).toBe(
      10 + Math.max(window.innerWidth, window.innerHeight) / 10,
    );
  });

  it('subtracts each viewport edge from its target edge', () => {
    expect(
      getEdges(
        { position: 800, size: 200 },
        { position: 0, size: 600 },
        normalizeOffset('start end / end start'),
      ),
    ).toEqual([200, 1000]);
    expect(
      getEdges(
        { position: 800, size: 200 },
        { position: 0, size: 600 },
        normalizeOffset('center center / 75% 25%'),
      ),
    ).toEqual([600, 800]);
  });
});
