/**
 * @typedef {Object} Circle
 * @property {Number} x Circle's x position
 * @property {Number} y Circle's y position
 * @property {Number} radius Circle's radius
 */

/**
 * Test if a circle collides with another.
 * Inspired by http://www.jeffreythompson.org/collision-detection/circle-circle.php
 *
 * @param {Circle} circle1 Circle 1
 * @param {Circle} circle2 Circle 2
 * @return {boolean} Are the sides of one circle touching the other ?
 */
export default function collideCircleCircle(circle1, circle2) {
  // get distance between the circle's centers
  // use the Pythagorean Theorem to compute the distance
  const distX = circle1.x - circle2.x;
  const distY = circle1.y - circle2.y;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the sum of the circle's
  // radii, the circles are touching!
  if (distance <= circle1.radius + circle2.radius) {
    return true;
  }
  return false;
}
