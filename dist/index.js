import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from './abstracts/Base';
/**
 * Define a component without a class.
 *
 * @param  {Object} options The component's object
 * @return {Base}           A component's class.
 */

export function defineComponent(options) {
  var config = options.config,
      methods = options.methods,
      hooks = _objectWithoutProperties(options, ["config", "methods"]);

  if (!config) {
    throw new Error('The `config` property is required.');
  }

  if (!config.name) {
    throw new Error('The `config.name` property is required.');
  }
  /**
   * Component class.
   */


  var Component = /*#__PURE__*/function (_Base) {
    _inherits(Component, _Base);

    var _super = _createSuper(Component);

    function Component() {
      _classCallCheck(this, Component);

      return _super.apply(this, arguments);
    }

    _createClass(Component, [{
      key: "config",

      /**
       * Component config.
       */
      get: function get() {
        return config;
      }
    }]);

    return Component;
  }(Base);

  var allowedHooks = ['mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
  var filteredHooks = Object.entries(hooks || {}).reduce(function (acc, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        name = _ref2[0],
        fn = _ref2[1];

    if (allowedHooks.includes(name)) {
      acc[name] = fn;
    } else {
      throw new Error("\n          The \"".concat(name, "\" method is not a Base lifecycle hook,\n          it should be placed in the \"method\" property.\n          The following hooks are available: ").concat(allowedHooks.join(', '), "\n        "));
    }

    return acc;
  }, {});
  [].concat(_toConsumableArray(Object.entries(methods || {})), _toConsumableArray(Object.entries(filteredHooks))).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        name = _ref4[0],
        fn = _ref4[1];

    Component.prototype[name] = fn;
  });
  return Component;
}
/**
 * Create a Base instance with the given object configuration.
 * @param {HTMLElement|String} elementOrSelector The instance root HTML element.
 * @param {Object}             options           The Base class configuration.
 */

export function createBase(elementOrSelector, options) {
  var Component = defineComponent(options);
  return typeof elementOrSelector === 'string' ? Component.$factory(elementOrSelector) : new Component(elementOrSelector);
}
export default Base;
//# sourceMappingURL=index.js.map