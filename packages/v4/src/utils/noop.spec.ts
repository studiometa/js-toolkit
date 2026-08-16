import { describe, expect, it } from 'vitest';
import { noop, noopValue } from './noop.js';

describe('noop', () => {
  it('returns undefined', () => {
    expect(noop()).toBeUndefined();
  });

  it('takes the arguments of the callback it stands in for', () => {
    const handler: (event: Event, index: number) => void = noop;
    expect(handler(new Event('click'), 0)).toBeUndefined();
  });
});

describe('noopValue', () => {
  it('returns the very value it is given', () => {
    const object = { a: 1 };
    expect(noopValue(object)).toBe(object);
    expect(noopValue('a')).toBe('a');
    expect(noopValue(undefined)).toBeUndefined();
  });

  it('keeps the type of the value', () => {
    const value: number = noopValue(1);
    expect(value).toBe(1);
  });
});
