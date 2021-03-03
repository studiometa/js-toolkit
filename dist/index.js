import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _objectWithoutProperties from "@babel/runtime/helpers/objectWithoutProperties";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from "./abstracts/Base/index.js";
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

  var Component = function (_Base) {
    _inherits(Component, _Base);

    var _super = _createSuper(Component);

    function Component() {
      _classCallCheck(this, Component);

      return _super.apply(this, arguments);
    }

    return Component;
  }(Base);

  _defineProperty(Component, "config", config);

  var allowedHooks = ['mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
  var filteredHooks = Object.entries(hooks).reduce(function (acc, _ref) {
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
export function createBase(elementOrSelector, options) {
  var Component = defineComponent(options);
  var element = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
  return new Component(element);
}
export default Base;
//# sourceMappingURL=index.js.map