import matrix from '@studiometa/js-toolkit/utils/css/matrix';

describe('matrix method', () => {
  it('should work without arguments', () => {
    expect(matrix()).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });

  it('should work with some arguments', () => {
    expect(matrix({ scaleX: 2 })).toBe('matrix(2, 0, 0, 1, 0, 0)');
  });

  it('should work with 0 values', () => {
    expect(matrix({ scaleX: 0, scaleY: 0 })).toBe('matrix(0, 0, 0, 0, 0, 0)');
  });

  it('should return the default value when the parameter is not an object', () => {
    expect(matrix(true)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(matrix(false)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(matrix('string')).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(matrix(10)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(matrix([1, 2, 3])).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });
});
