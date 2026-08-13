import { wrap } from './wrap.js';

/**
 * Fold a value back and forth in the min and max range.
 * @link https://js-toolkit.studiometa.dev/utils/math/fold.html
 */
export function fold(value: number, min: number, max: number): number {
  const range = max - min;

  if (!Number.isFinite(range) || range <= 0) {
    return min;
  }

  const cycle = range * 2;
  const wrapped = wrap(value, min, min + cycle);

  return wrapped > max ? 2 * max - wrapped : wrapped;
}
