import type { Base, BaseConstructor } from '../Base/Base.js';
import { getAncestorWhere } from '../utils/dom/ancestors.js';
import { getInstanceFromElement } from './getInstanceFromElement.js';

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
