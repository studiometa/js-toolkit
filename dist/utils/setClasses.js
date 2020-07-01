"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setClasses;

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
//# sourceMappingURL=setClasses.js.map