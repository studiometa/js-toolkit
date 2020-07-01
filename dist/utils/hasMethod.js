"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hasMethod;

/**
 * Test if an object has a method.
 *
 * @param  {Object}  obj The object to test
 * @param  {String}  fn  The method's name
 * @return {Boolean}
 */
function hasMethod(obj, name) {
  return typeof obj[name] === 'function';
}
//# sourceMappingURL=hasMethod.js.map