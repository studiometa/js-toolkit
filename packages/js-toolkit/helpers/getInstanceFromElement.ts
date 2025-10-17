import type { BaseConstructor, BaseEl } from '../Base/index.js';

/**
 * Get a component instance from a DOM element.
 * @link https://js-toolkit.studiometa.dev/api/helpers/getInstanceFromElement.html
*/
export function getInstanceFromElement<T extends BaseConstructor>(
  element: BaseEl,
  Constructor: T,
): InstanceType<T> | null {
  if (!element || !element.__base__ || !element.__base__.has(Constructor.config.name)) {
    return null;
  }

  return element.__base__.get(Constructor.config.name) as InstanceType<T>;
}
