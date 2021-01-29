import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _get from "@babel/runtime/helpers/get";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import useResize from '../services/resize';

function testBreakpoints(instance) {
  var breakpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : useResize().props().breakpoint;
  var _instance$$options = instance.$options,
      activeBreakpoints = _instance$$options.activeBreakpoints,
      inactiveBreakpoints = _instance$$options.inactiveBreakpoints;
  var isInActiveBreakpoint = activeBreakpoints && activeBreakpoints.split(' ').includes(breakpoint);
  var isInInactiveBreakpoint = inactiveBreakpoints && inactiveBreakpoints.split(' ').includes(breakpoint);

  if (activeBreakpoints && isInActiveBreakpoint || inactiveBreakpoints && !isInInactiveBreakpoint) {
    return '$mount';
  }

  return '$destroy';
}

function hasBreakpointConfiguration(instance) {
  var _instance$$options2 = instance.$options,
      activeBreakpoints = _instance$$options2.activeBreakpoints,
      inactiveBreakpoints = _instance$$options2.inactiveBreakpoints;
  return Boolean(activeBreakpoints || inactiveBreakpoints);
}

function testConflictingBreakpointConfiguration(instance) {
  var _instance$$options3 = instance.$options,
      activeBreakpoints = _instance$$options3.activeBreakpoints,
      inactiveBreakpoints = _instance$$options3.inactiveBreakpoints,
      name = _instance$$options3.name;

  if (activeBreakpoints && inactiveBreakpoints) {
    throw new Error("[".concat(name, "] Incorrect configuration: the `activeBreakpoints` and `inactiveBreakpoints` are not compatible."));
  }
}

function addToResize(key, instance) {
  testConflictingBreakpointConfiguration(instance);

  var _useResize = useResize(),
      add = _useResize.add,
      has = _useResize.has;

  if (!has(key)) {
    add(key, function onResize(_ref) {
      var breakpoint = _ref.breakpoint;
      var action = testBreakpoints(instance, breakpoint);

      if (action === '$destroy' && instance.$isMounted) {
        instance[action]();
      } else if (action === '$mount' && !instance.$isMounted) {
        setTimeout(function () {
          return instance[action]();
        }, 0);
      }
    });
  }
}

export default (function (BaseClass) {
  var _class, _temp, _BaseClass$config$nam, _BaseClass$config, _BaseClass$config2;

  return _temp = _class = function (_BaseClass) {
    _inherits(BreakpointObserver, _BaseClass);

    var _super = _createSuper(BreakpointObserver);

    function BreakpointObserver(element) {
      var _this;

      _classCallCheck(this, BreakpointObserver);

      _this = _super.call(this, element);

      var _useResize2 = useResize(),
          add = _useResize2.add,
          has = _useResize2.has,
          remove = _useResize2.remove,
          props = _useResize2.props;

      var name = _this.$options.name;

      if (!props().breakpoint) {
        throw new Error("[".concat(name, "] The `BreakpointObserver` class requires breakpoints to be defined."));
      }

      var key = "BreakpointObserver-".concat(_this.$id);
      var mutationObserver = new MutationObserver(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 1),
            mutation = _ref3[0];

        if (mutation.type === 'attributes' && (mutation.attributeName === 'data-options' || mutation.attributeName.startsWith('data-option-'))) {
          if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
            _this.$mount();

            remove(key);
            return;
          }

          addToResize(key, _assertThisInitialized(_this));
        }
      });
      mutationObserver.observe(_this.$el, {
        attributes: true
      });

      if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
        return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
      }

      addToResize(key, _assertThisInitialized(_this));
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }

    _createClass(BreakpointObserver, [{
      key: "$mount",
      value: function $mount() {
        if (!hasBreakpointConfiguration(this)) {
          return _get(_getPrototypeOf(BreakpointObserver.prototype), "$mount", this).call(this);
        }

        var action = testBreakpoints(this);

        if (action === '$mount') {
          return _get(_getPrototypeOf(BreakpointObserver.prototype), "$mount", this).call(this);
        }

        return this;
      }
    }]);

    return BreakpointObserver;
  }(BaseClass), _defineProperty(_class, "config", _objectSpread(_objectSpread({}, BaseClass.config || {}), {}, {
    name: "".concat((_BaseClass$config$nam = BaseClass === null || BaseClass === void 0 ? void 0 : (_BaseClass$config = BaseClass.config) === null || _BaseClass$config === void 0 ? void 0 : _BaseClass$config.name) !== null && _BaseClass$config$nam !== void 0 ? _BaseClass$config$nam : '', "WithBreakpointObserver"),
    options: _objectSpread(_objectSpread({}, (BaseClass === null || BaseClass === void 0 ? void 0 : (_BaseClass$config2 = BaseClass.config) === null || _BaseClass$config2 === void 0 ? void 0 : _BaseClass$config2.options) || {}), {}, {
      activeBreakpoints: String,
      inactiveBreakpoints: String
    })
  })), _temp;
});
//# sourceMappingURL=withBreakpointObserver.js.map