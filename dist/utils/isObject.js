"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isObject;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

/**
 * Test if the given value is an object
 *
 * @param  {*}       value The value to test
 * @return {Boolean}       Whether or not the value is an object
 */
function isObject(value) {
  var type = (0, _typeof2["default"])(value);
  return type === 'function' || type === 'value' && !!value;
}
//# sourceMappingURL=isObject.js.map