import matrix from '~/utils/css/matrix';

describe('matrix method', () => {
  it('should work without arguments', () => {
    expect(matrix()).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });

  it('should work with some arguments', () => {
    expect(matrix({ scaleX: 2 })).toBe('matrix(2, 0, 0, 1, 0, 0)');
  });
});
