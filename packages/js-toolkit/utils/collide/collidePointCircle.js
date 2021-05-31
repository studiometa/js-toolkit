/**
 * @typedef {Object} Point
 * @property {Number} x Point's x position
 * @property {Number} y Point's y position
 */

/**
 * @typedef {Object} Circle
 * @property {Number} x Circle's x position
 * @property {Number} y Circle's y position
 * @property {Number} radius Circle's radius
 */

/**
 * Test if a point is inside a circle.
 * Inspired by http://www.jeffreythompson.org/collision-detection/point-circle.php
 *
 * @param {Point} point Point
 * @param {Circle} circle Circle
 * @return {boolean} Is the point inside the circle's bounds ?
 */
export default function collidePointCircle(point, circle) {
  // get distance between the point and circle's center
  // using the Pythagorean Theorem
  const distX = point.x - circle.x;
  const distY = point.y - circle.y;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the circle's
  // radius the point is inside!
  return distance <= circle.radius;
}
