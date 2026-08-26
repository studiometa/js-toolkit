import { afterEach, describe, expect, it, vi } from 'vitest';
import { random, randomInt, randomItem } from './random.js';

/** Make `Math.random()` answer the given values, in order. */
function stubRandom(...values: number[]): void {
  let index = 0;
  vi.spyOn(Math, 'random').mockImplementation(() => values[Math.min(index++, values.length - 1)]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('random', () => {
  it('stays between the bounds', () => {
    stubRandom(0, 0.5, 0.999999);
    expect(random(10, 20)).toBe(10);
    expect(random(10, 20)).toBe(15);
    expect(random(10, 20)).toBeLessThan(20);
  });

  it('defaults the second bound to zero', () => {
    stubRandom(0.5);
    expect(random(10)).toBe(5);
  });
});

describe('randomInt', () => {
  it('includes both bounds, and gives each integer the same chance', () => {
    // Four integers in `0…3`, so each owns a quarter of the range.
    stubRandom(0);
    expect(randomInt(0, 3)).toBe(0);
    stubRandom(0.2499);
    expect(randomInt(0, 3)).toBe(0);
    stubRandom(0.25);
    expect(randomInt(0, 3)).toBe(1);
    stubRandom(0.7499);
    expect(randomInt(0, 3)).toBe(2);
    stubRandom(0.9999);
    expect(randomInt(0, 3)).toBe(3);
  });

  it('accepts its bounds in any order, and a negative range', () => {
    stubRandom(0.9999);
    expect(randomInt(3, 0)).toBe(3);
    stubRandom(0);
    expect(randomInt(-2, 2)).toBe(-2);
    stubRandom(0.9999);
    expect(randomInt(-2, 2)).toBe(2);
  });

  it('defaults the second bound to zero', () => {
    stubRandom(0.9999);
    expect(randomInt(5)).toBe(5);
  });
});

describe('randomItem', () => {
  it('picks an item of an array', () => {
    stubRandom(0);
    expect(randomItem(['a', 'b', 'c'])).toBe('a');
    stubRandom(0.9999);
    expect(randomItem(['a', 'b', 'c'])).toBe('c');
  });

  it('picks a character of a string', () => {
    stubRandom(0.9999);
    expect(randomItem('abc')).toBe('c');
  });

  it('answers undefined for an empty array or string', () => {
    expect(randomItem([])).toBeUndefined();
    expect(randomItem('')).toBeUndefined();
  });
});
