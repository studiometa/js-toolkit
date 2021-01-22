import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import getAllProperties from './getAllProperties';
/**
 * Auto-bind methods to an instance.
 *
 * @param  {Object}               instance          The instance.
 * @param  {Object}               options           Specify methods to include or exlude.
 * @param  {Array<String|RegExp>} [options.include] Methods to include.
 * @param  {Array<String|RegExp>} [options.exclude] Methods to exclude.
 * @return {Object}                                 The instance.
 */

export default function autoBind(instance, options) {
  var _ref = options || {},
      exclude = _ref.exclude,
      include = _ref.include;

  var filter = function filter(key) {
    var match = function match(pattern) {
      return typeof pattern === 'string' ? key === pattern : pattern.test(key);
    };

    if (include) {
      return include.some(match);
    }

    if (exclude) {
      return !exclude.some(match);
    }

    return true;
  };

  getAllProperties(instance).filter(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 1),
        key = _ref3[0];

    return key !== 'constructor' && filter(key);
  }).forEach(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
        key = _ref5[0],
        object = _ref5[1];

    var descriptor = Object.getOwnPropertyDescriptor(object, key);

    if (descriptor && typeof descriptor.value === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
  return instance;
}
//# sourceMappingURL=autoBind.js.map