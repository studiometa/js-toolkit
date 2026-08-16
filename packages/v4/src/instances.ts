import { INSTANCES } from './protocol-symbols.js';
import { selectorFor } from './utils/selectors.js';
import type { Base } from './Base.js';

/**
 * Return mounted instances of a component name in DOM order.
 * The search includes only descendants of `root` and excludes unmounted instances.
 */
export function getInstances<T extends Base = Base>(name: string, root?: ParentNode): T[];
/**
 * Return every mounted instance on one element, in mount order.
 *
 * The element form is the reason this overload exists rather than a second
 * export: both answer "which instances are mounted", and the argument picks the
 * scope. It also keeps the `INSTANCES` read in one place, which matters more
 * now that the key is a symbol and no longer spellable as `el.__base__`.
 */
export function getInstances<T extends Base = Base>(el: Element): T[];
export function getInstances<T extends Base = Base>(
  target: string | Element,
  root: ParentNode = document,
): T[] {
  if (typeof target !== 'string') {
    return [...(target[INSTANCES]?.values() ?? [])].filter(
      (instance) => instance.$isMounted,
    ) as T[];
  }

  const instances: T[] = [];
  for (const el of root.querySelectorAll(selectorFor(target))) {
    const instance = el[INSTANCES]?.get(target);
    if (instance?.$isMounted) {
      instances.push(instance as T);
    }
  }
  return instances;
}
