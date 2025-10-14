import { BaseConstructor } from '../Base/Base.js';

/**
 * Register globally and mount a given component, or a promise resolving to a component.
 */
export async function registerComponent<T extends BaseConstructor = BaseConstructor>(
  ctor: T | Promise<T>,
) {
  if (ctor instanceof Promise) {
    ctor = await ctor;
  }

  const instances = await Promise.all(ctor.$register());
  return instances;
}
