import type { BaseConstructor } from '../Base/index.js';

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
  let ResolvedClass;

  const resolver = (resolve) => {
    fn().then((module) => {
      ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);
    });
  };
  return new Promise((resolve) => {
    const { matches } = window.matchMedia('not (prefers-reduced-motion)');

    if (matches) {
      setTimeout(() => {
        resolver(resolve);
      }, 0);
    }
  });
}
