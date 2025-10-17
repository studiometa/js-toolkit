import type { BaseConstructor } from '../Base/index.js';
import { importOnMediaQuery } from './importOnMediaQuery.js';

/**
 * Import a component if user does not reduce motion.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 * @return {Promise<T>}
 * @link https://js-toolkit.studiometa.dev/api/helpers/importWhenPrefersMotion.html
*/
export function importWhenPrefersMotion<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
): Promise<T> {
  return importOnMediaQuery(fn, 'not (prefers-reduced-motion)');
}
