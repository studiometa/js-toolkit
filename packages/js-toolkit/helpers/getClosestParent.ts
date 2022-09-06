import type { Base, BaseConstructor } from '../Base/index.js';
import getInstanceFromElement from './getInstanceFromElement.js';

/**
 * Walk through an element ancestors while the given condition is true with a
 * limit of 1000 iteration to avoid infinite loops.
 */
function walkAncestorsWhile(
  element: HTMLElement,
  condition: (element: HTMLElement) => boolean,
  limit = 1000,
): HTMLElement | null {
  let parent = element.parentElement;
  let count = 0;

  while (parent && condition(parent) && count < limit) {
    parent = parent.parentElement;
    count += 1;
  }

  return parent;
}

/**
 * Get the closest parent of a component.
 */
export default function getClosestParent<T extends BaseConstructor>(childInstance:Base, ParentConstructor:T) {
  const parentEl = walkAncestorsWhile(
    childInstance.$el,
    (element) => !getInstanceFromElement(element, ParentConstructor),
  );

  return parentEl ? getInstanceFromElement(parentEl, ParentConstructor) : null;
}
