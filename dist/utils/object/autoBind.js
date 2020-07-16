"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = autoBind;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _getAllProperties = _interopRequireDefault(require("./getAllProperties"));

/**
 * Auto-bind methods to an instance.
 *
 * @param  {Object}               instance        The instance.
 * @param  {Array<String|RegExp>} options.include Methods to include.
 * @param  {Array<String|RegExp>} options.exclude Methods to exclude.
 * @return {Object}                               The instance.
 */
function autoBind(instance) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      include = _ref.include,
      exclude = _ref.exclude;

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

  (0, _getAllProperties.default)(instance).filter(function (_ref2) {
    var _ref3 = (0, _slicedToArray2.default)(_ref2, 1),
        key = _ref3[0];

    return key !== 'constructor' && filter(key);
  }).forEach(function (_ref4) {
    var _ref5 = (0, _slicedToArray2.default)(_ref4, 2),
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