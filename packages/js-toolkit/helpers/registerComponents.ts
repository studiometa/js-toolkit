import { BaseConstructor } from '../Base/Base.js';
import { registerComponent } from './registerComponent.js';

/**
 * Register globally and mount multiple components at once.
 *
 * Each component accepts the same forms as {@link registerComponent}: a `Base`
 * constructor, a promise resolving to a constructor or module namespace, or a
 * factory function returning such a promise.
 *
 * @link https://js-toolkit.studiometa.dev/api/helpers/registerComponents.html
 * @param ctors The components, or ways to resolve them.
 * @return A promise resolving to a flat array of mounted component instances.
 */
export async function registerComponents<T extends BaseConstructor = BaseConstructor>(
  ...ctors: (T | Promise<T | { default: T }> | (() => Promise<T | { default: T }>))[]
) {
  const instances = await Promise.all(ctors.map((ctor) => registerComponent(ctor)));
  return instances.flat();
}
