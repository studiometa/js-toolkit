/**
 * Get direct children from a parent when working with nested components.
 *
 * @template {Base} T
 * @param   {Base} parentInstance
 * @param   {string} parentName
 * @param   {string} childrenName
 * @returns {Array<T>}
 */
export default function getDirectChildren(parentInstance, parentName, childrenName) {
  if (!parentInstance.$children[childrenName]) {
    return [];
  }

  if (!parentInstance.$children[parentName]) {
    return parentInstance.$children[childrenName];
  }

  return parentInstance.$children[childrenName].filter((child) =>
    parentInstance.$children[parentName].every((nestedParent) =>
      nestedParent.$children[childrenName]
        ? !nestedParent.$children[childrenName].includes(child)
        : true
    )
  );
}
