import lerp from '~/utils/math/lerp';

describe('lerp method', () => {
  it('should return the correct number', () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0.75)).toBe(7.5);
  });
});
