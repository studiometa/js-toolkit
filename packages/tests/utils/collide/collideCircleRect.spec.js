import { collideCircleRect } from '@studiometa/js-toolkit/utils';

describe('collideCircleRect method', () => {
  it('should be true when the circle and the rectangle are colliding from top left', () => {
    const circle = {
      x: 40,
      y: 40,
      radius: 40,
    };

    const rect = {
      x: 40,
      y: 40,
      width: 60,
      height: 60,
    };

    const result = collideCircleRect(circle, rect);

    expect(result).toBe(true);
  });

  it('should be true when the circle and the rectangle are colliding from bottom right', () => {
    const circle = {
      x: 80,
      y: 80,
      radius: 40,
    };

    const rect = {
      x: 0,
      y: 0,
      width: 60,
      height: 60,
    };

    const result = collideCircleRect(circle, rect);

    expect(result).toBe(true);
  });

  it('should be false when the circle and the rectangle are separated', () => {
    const circle = {
      x: 40,
      y: 40,
      radius: 40,
    };

    const rect = {
      x: 70,
      y: 70,
      width: 30,
      height: 30,
    };

    const result = collideCircleRect(circle, rect);

    expect(result).toBe(false);
  });
});
