import { collidePointCircle } from '@studiometa/js-toolkit/utils';

describe('collidePointCircle method', () => {
  it('should be true when the point is inside the circle', () => {
    const point = {
      x: 25,
      y: 25,
    };

    const circle = {
      x: 40,
      y: 40,
      radius: 40,
    };

    const result = collidePointCircle(point, circle);

    expect(result).toBe(true);
  });

  it('should be false when the point is outside the circle', () => {
    const point = {
      x: 10,
      y: 10,
    };

    const circle = {
      x: 40,
      y: 40,
      radius: 40,
    };

    const result = collidePointCircle(point, circle);

    expect(result).toBe(false);
  });
});
