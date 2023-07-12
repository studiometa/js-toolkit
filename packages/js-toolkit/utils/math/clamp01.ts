import clamp from './clamp.js';

/**
 * Clamp a value in the 0–1 range.
 *
 * @param {number} value
 * @returns {number}
 */
export default function clamp01(value: number) {
  return clamp(value, 0, 1);
}
