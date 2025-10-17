import { clamp } from './clamp.js';

/**
 * Clamp a value in the 0–1 range.
 * @link https://js-toolkit.studiometa.dev/utils/math/clamp01.html
*/
export function clamp01(value: number) {
  return clamp(value, 0, 1);
}
