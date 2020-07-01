"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setStyles;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _isObject = _interopRequireDefault(require("./isObject"));

/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}         element The element to update.
 * @param {CSSStyleDeclaration} styles  An object of styles properties and values.
 * @param {String}              method  The method to use: add or remove.
 */
function setStyles(element, styles) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !styles || !(0, _isObject.default)(styles)) {
    return;
  }

  Object.entries(styles).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        prop = _ref2[0],
        value = _ref2[1];

    element.style[prop] = method === 'add' ? value : '';
  });
}
//# sourceMappingURL=setStyles.js.map