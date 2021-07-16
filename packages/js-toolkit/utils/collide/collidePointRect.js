/**
 * @typedef {Object} Point
 * @property {Number} x Point's x position
 * @property {Number} y Point's y position
 */

/**
 * @typedef {Object} Rect
 * @property {Number} x Rectangle's x position
 * @property {Number} y Rectangle's y position
 * @property {Number} width Rectangle's width
 * @property {Number} height Rectangle's height
 */

/**
 * Test if a point collides with a rectangle.
 * Inspired by http://www.jeffreythompson.org/collision-detection/point-rect.php
 *
 * @param {Point} point Point
 * @param {Rect} rect Rectangle
 * @return {boolean} Is the point inside the rectangle's bounds ?
 */
export default function collidePointRect(point, rect) {
  return (
    point.x >= rect.x && // right of the left edge AND
    point.x <= rect.x + rect.width && // left of the right edge AND
    point.y >= rect.y && // below the top AND
    point.y <= rect.y + rect.height // above the bottom
  );
}
