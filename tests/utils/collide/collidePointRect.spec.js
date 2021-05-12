import { collidePointRect } from '~/utils/collide';

describe('collidePointRect method', () => {
  it('should be true when the point is inside the rectangle', () => {
    const point = {
      x: 0,
      y: 0,
    };

    const rect = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    const result = collidePointRect(point, rect);

    expect(result).toBe(true);
  });

  it('should be false when the point is outside the rectangle', () => {
    const point = {
      x: 40,
      y: 40,
    };

    const rect = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    const result = collidePointRect(point, rect);

    expect(result).toBe(false);
  });
});
