import { describe, it, expect } from 'vitest';
import { randomInt, randomItem } from '@studiometa/js-toolkit/utils';

describe('The random function', () => {
  it ('should return a random number between bounds values', ()=> {
    for (const [a, b] of Array.from({ length: 100 }).map(() => [0.5, 3.4])) {
      const result1 = randomInt(a);
      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThanOrEqual(a);

      const result2 = randomInt(a, b);
      expect(result2).toBeGreaterThanOrEqual(a);
      expect(result2).toBeLessThanOrEqual(b);
    }
  })
});

describe('The randomInt function,', () => {
  it('should return a random integer between bounds values', () => {
    for (const [a, b] of Array.from({ length: 100 }).map(() => [10, 20])) {
      const result1 = randomInt(a);
      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result1).toBeLessThanOrEqual(a);

      const result2 = randomInt(a, b);
      expect(result2).toBeGreaterThanOrEqual(a);
      expect(result2).toBeLessThanOrEqual(b);
    }
  });
});

describe('The randomItem function,', () => {
  it('should return a random item of the provided array', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(items).toContain(randomItem(items));
  });

  it('should return a random character of the provided string', () => {
    const items = 'abcdef';
    expect(items).toContain(randomItem(items));
  });

  it('should return undefined if the array is empty', () => {
    const emptyArray = [];
    expect(randomItem(emptyArray)).toBeUndefined();
  });

  it('should return undefined if the string is empty', () => {
    const emptyString = [];
    expect(randomItem(emptyString)).toBeUndefined();
  });

  it('should return undefined if the provided parameter is not valid', () => {
    for (const parameter of [{ 0: 'value0', 1: 'value1', 2: 'value2' }, 3, true]) {
      expect(() => {
        randomItem(parameter);
      }).toThrow();
    }
  });
});
