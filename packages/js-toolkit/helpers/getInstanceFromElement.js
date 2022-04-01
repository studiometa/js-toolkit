/**
 * @typedef {import('../Base/index.js').BaseConstructor} BaseConstructor
 */

/**
 * Get a component instance from a DOM element.
 * @template {BaseConstructor} T
 * @param    {HTMLElement & { __base__?: WeakMap<T, InstanceType<T>> }} element
 * @param    {T} Constructor
 * @returns  {null|InstanceType<T>}
 */
export default function getInstanceFromElement(element, Constructor) {
  if (!element.__base__) {
    return null;
  }

  return element.__base__.get(Constructor) ?? null;
}
