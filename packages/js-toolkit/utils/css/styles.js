import { isObject } from '../is.js';

/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}                  element The element to update.
 * @param {Partial<CSSStyleDeclaration>} styles  An object of styles properties and values.
 * @param {string}                       method  The method to use: add or remove.
 */
function setStyles(element, styles, method = 'add') {
  if (!element || !styles || !isObject(styles)) {
    return;
  }

  Object.entries(styles).forEach(([prop, value]) => {
    element.style[prop] = method === 'add' ? value : '';
  });
}

/**
 * Add styles to an element.
 *
 * @param {HTMLElement}                  element The element to update.
 * @param {Partial<CSSStyleDeclaration>} styles  A string of class names.
 * @returns {void}
 */
export function add(element, styles) {
  setStyles(element, styles);
}

/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement}                  element The element to update.
 * @param  {Partial<CSSStyleDeclaration>} styles  A string of class names.
 * @returns {void}
 */
export function remove(element, styles) {
  setStyles(element, styles, 'remove');
}
