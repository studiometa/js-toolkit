import damp from '@studiometa/js-toolkit/utils/math/damp';

describe('damp method', () => {
  it('should give the correct value', () => {
    expect(damp(10, 0, 0.5)).toBe(5);
    expect(damp(10, 5, 0.5)).toBe(7.5);
    expect(damp(10, 10, 0.5)).toBe(10);
    expect(damp(10, 0, 0.25)).toBe(2.5);
    expect(damp(10, 5, 0.25)).toBe(6.25);
    expect(damp(10, 10, 0.25)).toBe(10);
    expect(damp(10, 10, 1)).toBe(10);
  });

  it('should round the result when the difference between the current and target value is small', () => {
    expect(damp(10, 9.9999)).toBe(10);
  });
});
