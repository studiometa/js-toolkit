"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.remove = remove;
exports.toggle = toggle;

/**
 * Manage a list of classes as string on an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @param {String}      method     The method to use: add, remove or toggle.
 */
function setClasses(element, classNames) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(function (className) {
    element.classList[method](className);
  });
}
/**
 * Add class names to an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @return {void}
 */


function add(element, classNames) {
  setClasses(element, classNames);
}
/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement} element    The element to update.
 * @param  {String}      classNames A string of class names.
 * @return {void}
 */


function remove(element, classNames) {
  setClasses(element, classNames, 'remove');
}
/**
 * Toggle class names from an element.
 *
 * @param  {HTMLElement} element    The element to update.
 * @param  {String}      classNames A string of class names.
 * @return {void}
 */


function toggle(element, classNames) {
  setClasses(element, classNames, 'toggle');
}
//# sourceMappingURL=classes.js.map