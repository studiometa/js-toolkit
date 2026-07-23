import { BaseConstructor } from '../Base/Base.js';
import { registerComponent } from './registerComponent.js';

/**
 * Register globally and mount multiple components at once.
 *
 * @link https://js-toolkit.studiometa.dev/api/helpers/registerComponents.html
 * @param ctors The component constructors or promises resolving to them.
 * @return A promise resolving to a flat array of mounted component instances.
 */
export async function registerComponents<T extends BaseConstructor = BaseConstructor>(
  ...ctors: (T | Promise<T>)[]
) {
  const instances = await Promise.all(ctors.map((ctor) => registerComponent(ctor)));
  return instances.flat();
}
