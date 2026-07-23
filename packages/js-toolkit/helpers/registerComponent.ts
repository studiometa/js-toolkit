import { BaseConstructor, BaseAsyncConstructor } from '../Base/Base.js';
import { isDev, isFunction } from '../utils/index.js';

/**
 * Register globally and mount a given component.
 *
 * The component can be provided in any of the forms also accepted for child
 * components in `config.components`:
 * - a `Base` constructor;
 * - a promise resolving to a constructor or a module namespace (`import(...)`);
 * - a factory function returning such a promise (`() => import(...)`).
 *
 * Instances are mounted independently: an element that fails to mount is
 * skipped (and logged in development) instead of failing the whole call, so
 * the resolved array contains every instance that mounted successfully.
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

  let Ctor: T;
  if (ctor instanceof Promise) {
    const module = await ctor;
    // A resolved `Base` constructor is used as-is; only a module namespace is
    // unwrapped. Keying on `$isBase` (like the async child resolution) avoids
    // mistaking a user-defined static `default` member for a module namespace.
    Ctor = ('$isBase' in module ? module : (module as { default: T }).default) as T;
  } else {
    Ctor = ctor;
  }

  const results = await Promise.allSettled(Ctor.$register(nameOrSelector));

  return results.flatMap((result) => {
    if (result.status === 'fulfilled') {
      return [result.value];
    }

    if (isDev) {
      console.error(
        '[registerComponent] An instance failed to mount and was skipped.',
        result.reason,
      );
    }

    return [];
  });
}
