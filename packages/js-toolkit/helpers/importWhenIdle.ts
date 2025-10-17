import type { BaseConstructor } from '../Base/index.js';
import { getComponentResolver } from '../utils/index.js';

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
 * @return {Promise<T>}
 * @link https://js-toolkit.studiometa.dev/api/helpers/importWhenIdle.html
*/
export function importWhenIdle<T extends BaseConstructor = BaseConstructor>(
  fn: () => Promise<T | { default: T }>,
  { timeout = 1 }: ImportWhenIdleOptions = {},
): Promise<T> {
  const resolver = getComponentResolver(fn);

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
