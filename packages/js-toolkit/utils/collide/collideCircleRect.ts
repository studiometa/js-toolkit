/**
 * @typedef {Object} Rect
 * @property {number} x Rectangle's x position
 * @property {number} y Rectangle's y position
 * @property {number} width Rectangle's width
 * @property {number} height Rectangle's height
 */

/**
 * @typedef {Object} Circle
 * @property {number} x Circle's x position
 * @property {number} y Circle's y position
 * @property {number} radius Circle's radius
 */

/**
 * Test if a circle collides with a rectangle.
 * Inspired by http://www.jeffreythompson.org/collision-detection/circle-rect.php
 *
 * @param {Circle} circle Circle
 * @param {Rect} rect Rectangle
 * @returns {boolean} Are the sides of the circle touching the rectangle ?
 */
export function collideCircleRect(circle, rect) {
  // temporary variables to set edges for testing
  let testX = circle.x;
  let testY = circle.y;

  // which edge is closest?
  if (circle.x < rect.x) {
    testX = rect.x; // test left edge
  } else if (circle.x > rect.x + rect.width) {
    testX = rect.x + rect.width; // right edge
  }

  if (circle.y < rect.y) {
    testY = rect.y; // top edge
  } else if (circle.y > rect.y + rect.height) {
    testY = rect.y + rect.height; // bottom edge
  }

  // get distance from closest edges
  const distX = circle.x - testX;
  const distY = circle.y - testY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the radius, collision!
  if (distance <= circle.radius) {
    return true;
  }
  return false;
}
