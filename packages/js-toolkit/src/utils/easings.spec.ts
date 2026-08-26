import { describe, expect, it } from 'vitest';
import * as easings from './easings.js';
import { createEaseInOut, createEaseOut, easeLinear, type EasingFunction } from './easings.js';

const named = Object.entries(easings).filter((entry): entry is [string, EasingFunction] =>
  entry[0].startsWith('ease'),
);

describe('every easing', () => {
  it.each(named)('%s starts at 0 and ends at 1', (_name, ease) => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });

  it.each(named)('%s stays in range and never goes back', (_name, ease) => {
    let previous = 0;
    for (let progress = 0; progress <= 1; progress += 0.01) {
      const value = ease(progress);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('easeLinear', () => {
  it('answers the progress it is given', () => {
    expect(easeLinear(0.25)).toBe(0.25);
  });
});

describe('createEaseOut', () => {
  it('mirrors the ease-in function', () => {
    const out = createEaseOut((progress) => progress ** 2);
    expect(out(0.5)).toBeCloseTo(0.75, 10);
    expect(out(0.25)).toBeCloseTo(1 - 0.75 ** 2, 10);
  });
});

describe('createEaseInOut', () => {
  it('runs the ease-in over the first half and its mirror over the second', () => {
    const inOut = createEaseInOut((progress) => progress ** 2);
    expect(inOut(0)).toBe(0);
    expect(inOut(0.25)).toBeCloseTo(0.125, 10);
    expect(inOut(0.5)).toBeCloseTo(0.5, 10);
    expect(inOut(0.75)).toBeCloseTo(0.875, 10);
    expect(inOut(1)).toBe(1);
  });
});

describe('the eased shapes', () => {
  it('accelerates on an ease-in and decelerates on an ease-out', () => {
    expect(easings.easeInQuad(0.5)).toBeLessThan(0.5);
    expect(easings.easeOutQuad(0.5)).toBeGreaterThan(0.5);
    expect(easings.easeInOutQuad(0.5)).toBeCloseTo(0.5, 10);
  });

  it('steepens with the exponent', () => {
    expect(easings.easeInCubic(0.5)).toBeLessThan(easings.easeInQuad(0.5));
    expect(easings.easeInQuart(0.5)).toBeLessThan(easings.easeInCubic(0.5));
    expect(easings.easeInQuint(0.5)).toBeLessThan(easings.easeInQuart(0.5));
  });
});
