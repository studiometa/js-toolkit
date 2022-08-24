import { isArray } from '../utils/index.js';

/**
 * @typedef {import('../Base/index.js').default} Base
 */

/**
 * Get direct children from a parent when working with nested components.
 *
 * @template {Base} T
 * @param   {Base} parentInstance
 * @param   {string} parentName
 * @param   {string} childrenName
 * @returns {T[]}
 */
export function getDirectChildren(parentInstance, parentName, childrenName) {
  const children = parentInstance.$children[childrenName];
  const nestedParents = parentInstance.$children[parentName];

  if (!isArray(children)) {
    return [];
  }

  if (!isArray(nestedParents) || nestedParents.length <= 0) {
    return /** @type {T[]} */ (children);
  }

  return /** @type {T[]} */ (
    [...children].filter((child) => {
      return [...nestedParents].every((nestedParent) => {
        // @ts-ignore
        const nestedChildren = nestedParent.$children[childrenName];
        /* istanbul ignore next */
        return isArray(nestedChildren) ? !nestedChildren.includes(child) : true;
      });
    })
  );
}

/**
 * Test if a component instance is a direct child from the given component.
 *
 * @param   {Base}    parentInstance
 * @param   {string}  parentName
 * @param   {string}  childrenName
 * @param   {Base}    childInstance
 * @returns {boolean}
 */
export function isDirectChild(parentInstance, parentName, childrenName, childInstance) {
  return getDirectChildren(parentInstance, parentName, childrenName).includes(childInstance);
}
