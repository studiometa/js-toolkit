import { collideCircleCircle } from '@studiometa/js-toolkit/utils/collide';

describe('collideCircleCircle method', () => {
  it('should be true when circles are colliding', () => {
    const circle1 = {
      x: 40,
      y: 40,
      radius: 40,
    };

    const circle2 = {
      x: 100,
      y: 100,
      radius: 60,
    };

    const result = collideCircleCircle(circle1, circle2);

    expect(result).toBe(true);
  });

  it('should be false when circles are separated', () => {
    const circle1 = {
      x: 40,
      y: 40,
      radius: 40,
    };

    const circle2 = {
      x: 120,
      y: 120,
      radius: 40,
    };

    const result = collideCircleCircle(circle1, circle2);

    expect(result).toBe(false);
  });
});
