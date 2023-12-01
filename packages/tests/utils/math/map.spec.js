import { map } from '@studiometa/js-toolkit/utils';

describe('map method', () => {
  it('should map values', () => {
    expect(map(0, 0, 1, 0, 10)).toBe(0);
    expect(map(0.5, 0, 1, 0, 10)).toBe(5);
    expect(map(1, 0, 1, 0, 10)).toBe(10);
    expect(map(2, 0, 1, 0, 10)).toBe(20);
  });
});
