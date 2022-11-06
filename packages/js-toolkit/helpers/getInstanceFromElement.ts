import type { BaseConstructor, BaseEl } from '../Base/index.js';

/**
 * Get a component instance from a DOM element.
 */
export default function getInstanceFromElement<T extends BaseConstructor>(
  element: BaseEl,
  Constructor: T,
): InstanceType<T> | null {
  if (!element.__base__ || !element.__base__.has(Constructor)) {
    return null;
  }

  return element.__base__.get(Constructor) as InstanceType<T>;
}
