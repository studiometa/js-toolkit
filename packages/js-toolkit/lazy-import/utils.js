/* eslint-disable import/prefer-default-export */
import { getComponentElements } from '../abstracts/Base/utils.js';

/**
 * Get the target elements for the lazy import helper functions.
 * @param {string|HTMLElement|HTMLElement} nameOrSelectorOrElement
 *   The original selector or element, or list of elements.
 * @param {Element=} [context]
 *   The optional context to use to query for elements.
 *
 * @return {HTMLElement[]} A normalized list of elements.
 */
export function getTargetElements(nameOrSelectorOrElement, context) {
  if (typeof nameOrSelectorOrElement === 'string') {
    return getComponentElements(nameOrSelectorOrElement, context);
  }

  if (!Array.isArray(nameOrSelectorOrElement)) {
    return [nameOrSelectorOrElement];
  }

  return nameOrSelectorOrElement;
}
