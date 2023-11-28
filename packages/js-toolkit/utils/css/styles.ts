import { isObject } from '../is.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';

/**
 * Manage a list of style properties on an element.
 */
function setStyles(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  styles: Partial<CSSStyleDeclaration>,
  method: 'add' | 'remove' = 'add',
) {
  if (!elementOrElements || !styles || !isObject(styles)) {
    return;
  }

  eachElements(elementOrElements, (el) => {
    for (const [prop, value] of Object.entries(styles)) {
      el.style[prop] = method === 'add' ? value : '';
    }
  });
}

/**
 * Add styles to an element.
 */
export function add(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  styles: Partial<CSSStyleDeclaration>,
) {
  setStyles(elementOrElements, styles);
}

/**
 * Remove class names from an element.
 */
export function remove(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  styles: Partial<CSSStyleDeclaration>,
) {
  setStyles(elementOrElements, styles, 'remove');
}
