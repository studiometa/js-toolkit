"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAllProperties;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

/**
 * Gets all non-builtin properties up the prototype chain.
 *
 * @param  {Object} object The object to get the propeties from.
 * @param  {Array}  props  The already existing properties.
 * @return {Array}         An array of properties and their value.
 */
function getAllProperties(object) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var proto = Object.getPrototypeOf(object);

  if (proto === Object.prototype) {
    return props;
  }

  return getAllProperties(proto, Object.getOwnPropertyNames(proto).map(function (name) {
    return [name, proto];
  }).reduce(function (acc, val) {
    return [].concat((0, _toConsumableArray2.default)(acc), [val]);
  }, props));
}
//# sourceMappingURL=getAllProperties.js.map