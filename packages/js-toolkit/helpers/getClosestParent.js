import getInstanceFromElement from './getInstanceFromElement.js';

/**
 * @typedef {import('@studiometa/js-toolkit/Base').default} Base
 * @typedef {import('@studiometa/js-toolkit/Base').BaseConstructor} BaseConstructor
 */

/**
 * Walk through an element ancestors while the given condition is true with a
 * limit of 1000 iteration to avoid infinite loops.
 *
 * @param   {HTMLElement} element
 * @param   {(element:HTMLElement) => boolean} condition
 * @param   {number} limit
 * @returns {HTMLElement|null}
 */
function walkAncestorsWhile(element, condition, limit = 1000) {
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
 *
 * @template {BaseConstructor} T
 * @param   {Base} childInstance
 * @param   {T} ParentConstructor
 * @returns {null|InstanceType<T>}
 */
export default function getClosestParent(childInstance, ParentConstructor) {
  const parentEl = walkAncestorsWhile(
    childInstance.$el,
    (element) => !getInstanceFromElement(element, ParentConstructor)
  );

  return parentEl ? getInstanceFromElement(parentEl, ParentConstructor) : null;
}
