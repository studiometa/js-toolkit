import { BaseConstructor, BaseAsyncConstructor } from '../Base/Base.js';
import { isFunction } from '../utils/index.js';

/**
 * Register globally and mount a given component.
 *
 * The component can be provided in any of the forms also accepted for child
 * components in `config.components`:
 * - a `Base` constructor;
 * - a promise resolving to a constructor or a module namespace (`import(...)`);
 * - a factory function returning such a promise (`() => import(...)`).
 *
 * @link https://js-toolkit.studiometa.dev/api/helpers/registerComponent.html
 * @param ctor The component constructor, or a way to resolve it.
 * @param nameOrSelector The name or selector to used for this component.
 * @return A promise resolving to an array of mounted component instances.
 */
export async function registerComponent<T extends BaseConstructor = BaseConstructor>(
  ctor: T | Promise<T | { default: T }> | (() => Promise<T | { default: T }>),
  nameOrSelector?: string,
) {
  // Resolve factory functions such as `() => import('./Component.js')`, mirroring
  // how lazy child components are declared. A `Base` constructor is a function too,
  // so it is distinguished by its `$isBase` marker.
  if (isFunction(ctor) && !('$isBase' in ctor)) {
    ctor = (ctor as BaseAsyncConstructor)(undefined as never) as Promise<T | { default: T }>;
  }

  const resolved = ctor instanceof Promise ? await ctor : ctor;

  // Unwrap the module namespace returned by a dynamic import (`{ default: Ctor }`).
  const Ctor = ('default' in resolved ? resolved.default : resolved) as T;

  const instances = await Promise.all(Ctor.$register(nameOrSelector));
  return instances;
}
