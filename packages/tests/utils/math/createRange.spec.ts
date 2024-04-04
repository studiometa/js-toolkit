import { describe, it, expect } from 'bun:test';
import { createRange } from '@studiometa/js-toolkit/utils';

describe('The `createRange` function', () => {
  it('should create an array of numbers', () => {
    expect(createRange(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('should not work when min is greater than max', () => {
    expect(createRange(10, 0, 2)).not.toEqual([10, 8, 6, 4, 2, 0]);
  });
});
