import { isObject } from '../is.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';

/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement|HTMLElement[]|NodeListOf<HTMLElement>}                  elementOrElements The element to update.
 * @param {Partial<CSSStyleDeclaration>} styles  An object of styles properties and values.
 * @param {string}                       method  The method to use: add or remove.
 */
function setStyles(elementOrElements, styles, method = 'add') {
  if (!elementOrElements || !styles || !isObject(styles)) {
    return;
  }

  eachElements(elementOrElements, (el) => {
    Object.entries(styles).forEach(([prop, value]) => {
      el.style[prop] = method === 'add' ? value : '';
    });
  });
}

/**
 * Add styles to an element.
 *
 * @param {HTMLElement|HTMLElement[]|NodeListOf<HTMLElement>}                  elementOrElements The element to update.
 * @param {Partial<CSSStyleDeclaration>} styles  A string of class names.
 * @returns {void}
 */
export function add(elementOrElements, styles) {
  setStyles(elementOrElements, styles);
}

/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement|HTMLElement[]|NodeListOf<HTMLElement>}                  elementOrElements The element to update.
 * @param  {Partial<CSSStyleDeclaration>} styles  A string of class names.
 * @returns {void}
 */
export function remove(elementOrElements, styles) {
  setStyles(elementOrElements, styles, 'remove');
}
