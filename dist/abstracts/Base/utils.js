"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = debug;
exports.hasMethod = hasMethod;
exports.callMethod = callMethod;

/**
 * Verbose debug for the component.
 *
 * @param  {...any} args The arguments passed to the method
 * @return {void}
 */
function debug(instance) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return instance.$options.debug ? window.console.log.apply(window, [instance.config.name].concat(args)) : function () {};
}
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
/**
 * Call the given method while applying the given arguments.
 *
 * @param {String} method The method to call
 * @param {...any} args   The arguments to pass to the method
 */


function callMethod(instance, method) {
  var _instance$method;

  for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  debug.apply(void 0, [instance, 'callMethod', method].concat(args)); // Prevent duplicate call of `mounted` and `destroyed`
  // methods based on the component status

  if (method === 'destroyed' && !instance.$isMounted || method === 'mounted' && instance.$isMounted) {
    debug(instance, 'not', method, 'because the method has already been triggered once.');
    return instance;
  }

  instance.$emit.apply(instance, [method].concat(args)); // We always emit an event, but we do not call the method if it does not exist

  if (!hasMethod(instance, method)) {
    return instance;
  }

  (_instance$method = instance[method]).call.apply(_instance$method, [instance].concat(args));

  debug.apply(void 0, [instance, method, instance].concat(args));
  return instance;
}
//# sourceMappingURL=utils.js.map