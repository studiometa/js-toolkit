import { BaseConstructor } from '../Base/Base.js';
import { isDev } from '../utils/index.js';
import { registerComponent } from './registerComponent.js';

/**
 * Register globally and mount multiple components at once.
 *
 * Each component accepts the same forms as {@link registerComponent}: a `Base`
 * constructor, a promise resolving to a constructor or module namespace, or a
 * factory function returning such a promise.
 *
 * Components are registered independently: a single failure (e.g. a rejected
 * dynamic import) does not prevent the others from being registered, and the
 * returned array contains every instance that mounted successfully. Failures
 * are logged in development.
 *
 * @link https://js-toolkit.studiometa.dev/api/helpers/registerComponents.html
 * @param ctors The components, or ways to resolve them.
 * @return A promise resolving to a flat array of mounted component instances.
 */
export async function registerComponents<T extends BaseConstructor = BaseConstructor>(
  ...ctors: (T | Promise<T | { default: T }> | (() => Promise<T | { default: T }>))[]
) {
  const results = await Promise.allSettled(ctors.map((ctor) => registerComponent(ctor)));

  return results.flatMap((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    if (isDev) {
      console.error(
        '[registerComponents] A component failed to register and was skipped.',
        result.reason,
      );
    }

    return [];
  });
}
