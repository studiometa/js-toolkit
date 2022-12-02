import type { BaseConstructor } from '../Base/index.js';

type ImportWhenIdleOptions = {
  timeout?: number;
};

/**
 * Import a component when user is idle.
 *
 * @template {BaseConstructor} T
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {ImportWhenIdleOptions} [options]
 *   The time to wait before triggering the callback if never idle.
 * @returns {Promise<T>}
 */
export default function importWhenIdle<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
  { timeout = 1 }: ImportWhenIdleOptions = {},
): Promise<T> {
  let ResolvedClass;

  const resolver = (resolve) => {
    fn().then((module) => {
      ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);
    });
  };

  return new Promise((resolve) => {
    if (!('requestIdleCallback' in window)) {
      setTimeout(() => {
        resolver(resolve);
      }, timeout);
    } else {
      window.requestIdleCallback(
        () => {
          setTimeout(() => {
            resolver(resolve);
          }, 0);
        },
        { timeout },
      );
    }
  });
}
