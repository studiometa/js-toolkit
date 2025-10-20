import { BaseConstructor } from '../Base/Base.js';

/**
 * Register globally and mount a given component, or a promise resolving to a component.
 *
 * @link https://js-toolkit.studiometa.dev/api/helpers/registerComponent.html
 * @param ctor The component constructor or a promise resolving to it.
 * @param nameOrSelector The name or selector to used for this component.
 * @return A promise resolving to an array of mounted component instances.
 */
export async function registerComponent<T extends BaseConstructor = BaseConstructor>(
  ctor: T | Promise<T>,
  nameOrSelector?: string,
) {
  if (ctor instanceof Promise) {
    ctor = await ctor;
  }

  const instances = await Promise.all(ctor.$register(nameOrSelector));
  return instances;
}
