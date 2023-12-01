import { collideRectRect } from '@studiometa/js-toolkit/utils';

describe('collideRectRect method', () => {
  it('should be true when the rectangle 1 has the same position as the rectangle 2', () => {
    const rect1 = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    const rect2 = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    const result = collideRectRect(rect1, rect2);

    expect(result).toBe(true);
  });

  it('should be true when the rectangle 1 collides with the rectangle 2', () => {
    const rect1 = {
      x: 10,
      y: 10,
      width: 20,
      height: 20,
    };

    const rect2 = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    const result = collideRectRect(rect1, rect2);

    expect(result).toBe(true);
  });

  it('should be false when the rectangle 1 does not collide with the rectangle 2', () => {
    const rect1 = {
      x: 40,
      y: 40,
      width: 20,
      height: 20,
    };

    const rect2 = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    };

    const result = collideRectRect(rect1, rect2);

    expect(result).toBe(false);
  });
});
