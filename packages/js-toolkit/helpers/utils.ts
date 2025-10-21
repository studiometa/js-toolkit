/* eslint-disable import/prefer-default-export */
import { getComponentElements } from '../Base/utils.js';
import { isString, isArray } from '../utils/index.js';

/**
 * Get the target elements for the lazy import helper functions.
 *
 * @param {string|HTMLElement|HTMLElement[]} nameOrSelectorOrElement
 *   The original selector or element, or list of elements.
 * @param {HTMLElement} [context]
 *   The optional context to use to query for elements.
 * @return {HTMLElement[]} A normalized list of elements.
 */
export function getTargetElements(
  nameOrSelectorOrElement: string | HTMLElement | HTMLElement[],
  context: HTMLElement,
): HTMLElement[] {
  if (isString(nameOrSelectorOrElement)) {
    return getComponentElements(nameOrSelectorOrElement, context);
  }

  if (!isArray(nameOrSelectorOrElement)) {
    return [nameOrSelectorOrElement];
  }

  return nameOrSelectorOrElement;
}
