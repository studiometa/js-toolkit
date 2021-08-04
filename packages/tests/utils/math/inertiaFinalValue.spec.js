import inertiaFinalValue from '@studiometa/js-toolkit/utils/math/inertiaFinalValue';

describe('The inertiaFinalValue function', () => {
  it('should throw an error if the factor is not correct', () => {
    [0, 1, 10, -10].forEach((factor) => {
      expect(() => inertiaFinalValue(100, 10, factor)).toThrow();
    });
  });

  it('should have a minium theshold of 0.1', () => {
    const value = inertiaFinalValue(100, 0.01, 0.5);
    expect(value).toBe(100);
  });

  it('should return the correct value', () => {
    expect(inertiaFinalValue(100, 10, 0.1)).toBe(111);
    expect(inertiaFinalValue(100, 10, 0.5)).toBe(119.84375);
    expect(inertiaFinalValue(100, 10, 0.75)).toBe(139.69932212727144);
    expect(inertiaFinalValue(100, 10, 0.9)).toBe(199.0302262702125);
  });

  it('should have a default factor of 0.85', () => {
    expect(inertiaFinalValue(100, 10)).toBe(166.06817571805576);
  });
});
