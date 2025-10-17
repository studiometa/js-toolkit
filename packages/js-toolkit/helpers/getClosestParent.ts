import type { Base, BaseConstructor } from '../Base/index.js';
import { getInstanceFromElement } from './getInstanceFromElement.js';
import { getAncestorWhere } from '../utils/index.js';

/**
 * Get the closest parent of a component.
 * @link https://js-toolkit.studiometa.dev/api/helpers/getClosestParent.html
*/
export function getClosestParent<T extends BaseConstructor>(
  childInstance: Base,
  ParentConstructor: T,
) {
  const parentEl = getAncestorWhere(
    childInstance.$el,
    (element) => element && getInstanceFromElement(element, ParentConstructor) !== null,
  );

  return parentEl ? getInstanceFromElement(parentEl, ParentConstructor) : null;
}
