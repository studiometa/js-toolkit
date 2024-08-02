import { describe, it, expect } from 'vitest';
import { round } from '@studiometa/js-toolkit/utils';

describe('round method', () => {
  const number = 50.23456789;

  it('should round to 0 decimal', () => {
    expect(round(number)).toBe(50);
  });

  it('should round to 1 decimal', () => {
    expect(round(number, 1)).toBe(50.2);
  });

  it('should round to 2 decimal', () => {
    expect(round(number, 2)).toBe(50.23);
  });

  it('should round to 3 decimal', () => {
    expect(round(number, 3)).toBe(50.235);
  });

  it('should round to 4 decimal', () => {
    expect(round(number, 4)).toBe(50.2346);
  });
});
