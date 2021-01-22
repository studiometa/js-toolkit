import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import isObject from '../object/isObject';
/**
 * @typedef {Partial<CSSStyleDeclaration> & Record<string, string | null>} CssStyleObject
 */

/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}    element The element to update.
 * @param {CssStyleObject} styles  An object of styles properties and values.
 * @param {String}         method  The method to use: add or remove.
 */

export default function setStyles(element, styles) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !styles || !isObject(styles)) {
    return;
  }

  Object.entries(styles).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        prop = _ref2[0],
        value = _ref2[1];

    element.style[prop] = method === 'add' ? value : '';
  });
}
/**
 * Add styles to an element.
 *
 * @param {HTMLElement}    element The element to update.
 * @param {CssStyleObject} styles  A string of class names.
 * @return {void}
 */

export function add(element, styles) {
  setStyles(element, styles);
}
/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement}    element The element to update.
 * @param  {CssStyleObject} styles  A string of class names.
 * @return {void}
 */

export function remove(element, styles) {
  setStyles(element, styles, 'remove');
}
//# sourceMappingURL=styles.js.map