import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import isObject from '../object/isObject';
/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}         element The element to update.
 * @param {CSSStyleDeclaration} styles  An object of styles properties and values.
 * @param {String}              method  The method to use: add or remove.
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
 * Add class names to an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @return {void}
 */

export function add(element, classNames) {
  setStyles(element, classNames);
}
/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement} element    The element to update.
 * @param  {String}      classNames A string of class names.
 * @return {void}
 */

export function remove(element, classNames) {
  setStyles(element, classNames, 'remove');
}
//# sourceMappingURL=styles.js.map