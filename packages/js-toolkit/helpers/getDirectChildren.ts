import { Base, BaseProps } from '../Base/index.js';
import { isArray } from '../utils/index.js';

/**
 * Get direct children from a parent when working with nested components.
 *
 * @template {Base} T
 * @param   {Base} parentInstance
 * @param   {string} parentName
 * @param   {string} childrenName
 * @returns {T[]}
 */
export function getDirectChildren<T extends Base = Base>(
  parentInstance: Base,
  parentName: string,
  childrenName: string,
): T[] {
  const children = parentInstance.$children[childrenName] as Base<BaseProps>[];
  const nestedParents = parentInstance.$children[parentName] as Base<BaseProps>[];

  if (!isArray(children)) {
    return [];
  }

  if (!isArray(nestedParents) || nestedParents.length <= 0) {
    return children as T[];
  }

  return [...children].filter((child) =>
    [...nestedParents].every((nestedParent) => {
      const nestedChildren = nestedParent.$children[childrenName] as Base<BaseProps>[];
      /* istanbul ignore next */
      return isArray(nestedChildren) ? !nestedChildren.includes(child) : true;
    }),
  ) as T[];
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
