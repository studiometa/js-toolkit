import type { BaseConstructor } from '../Base/index.js';
import { getComponentResolver } from '../utils/index.js';

/**
 * Import a component if user does not reduce motion.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 * @returns {Promise<T>}
 */
export default function importWhenPrefersMotion<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
): Promise<T> {
  const resolver = getComponentResolver(fn);

  return new Promise((resolve) => {
    const { matches } = window.matchMedia('not (prefers-reduced-motion)');

    if (matches) {
      setTimeout(() => {
        resolver(resolve);
      }, 0);
    }
  });
}
