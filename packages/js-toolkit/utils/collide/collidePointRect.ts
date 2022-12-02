/**
 * @typedef {Object} Point
 * @property {number} x Point's x position
 * @property {number} y Point's y position
 */

/**
 * @typedef {Object} Rect
 * @property {number} x Rectangle's x position
 * @property {number} y Rectangle's y position
 * @property {number} width Rectangle's width
 * @property {number} height Rectangle's height
 */

/**
 * Test if a point collides with a rectangle.
 * Inspired by http://www.jeffreythompson.org/collision-detection/point-rect.php
 *
 * @param {Point} point Point
 * @param {Rect} rect Rectangle
 * @returns {boolean} Is the point inside the rectangle's bounds ?
 */
export default function collidePointRect(point, rect) {
  return (
    point.x >= rect.x && // right of the left edge AND
    point.x <= rect.x + rect.width && // left of the right edge AND
    point.y >= rect.y && // below the top AND
    point.y <= rect.y + rect.height // above the bottom
  );
}
