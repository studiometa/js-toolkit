import { INSTANCES } from './protocol-symbols.js';
import { selectorFor } from './utils/selectors.js';
import type { Base } from './Base.js';

/**
 * Return mounted instances of a component name in DOM order.
 * The search includes only descendants of `root` and excludes unmounted instances.
 */
export function getInstances<T extends Base = Base>(
  name: string,
  root: ParentNode = document,
): T[] {
  const instances: T[] = [];
  for (const el of root.querySelectorAll(selectorFor(name))) {
    const instance = el[INSTANCES]?.get(name);
    if (instance?.$isMounted) {
      instances.push(instance as T);
    }
  }
  return instances;
}
