import { Base, BaseProps } from '../Base/index.js';
import { isArray } from '../utils/index.js';

/**
 * Get direct children from a parent when working with nested components.
 *
 * @template {Base} T
 * @param  {Base} parentInstance
 * @param  {string} parentName
 * @param  {string} childrenName
 * @return {T[]}
 * @link https://js-toolkit.studiometa.dev/api/helpers/getDirectChildren.html
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

  const directChildren = [];

  for (const child of children) {
    for (const nestedParent of nestedParents) {
      const nestedChildren = nestedParent.$children[childrenName] as Base<BaseProps>[];

      if (isArray(nestedChildren) && nestedChildren.includes(child)) {
        continue;
      }

      directChildren.push(child);
    }
  }

  return directChildren;
}

/**
 * Test if a component instance is a direct child from the given component.
 *
 * @param  {Base}    parentInstance
 * @param  {string}  parentName
 * @param  {string}  childrenName
 * @param  {Base}    childInstance
 * @return {boolean}
 * @link https://js-toolkit.studiometa.dev/api/helpers/isDirectChild.html
*/
export function isDirectChild(parentInstance, parentName, childrenName, childInstance) {
  return getDirectChildren(parentInstance, parentName, childrenName).includes(childInstance);
}
