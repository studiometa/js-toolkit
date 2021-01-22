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
/**
 * @typedef {import('../abstracts/Base').default} Base
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * @typedef {Object} WithBreakpointObserverOptions
 * @property {String} [activeBreakpoints]
 * @property {String} [inactiveBreakpoints]
 */

/**
 * @typedef {Object} WithBreakpointObserverInterface
 * @property {WithBreakpointObserverOptions} $options
 */

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {Base & WithBreakpointObserverInterface}   instance The component's instance.
 * @return {String}          The action to trigger.
 */

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
/**
 * Test if the given instance is configured for breakpoints.
 * @param  {Base & WithBreakpointObserverInterface}    instance A Base class instance.
 * @return {Boolean}          True if configured correctly, false otherwise.
 */


function hasBreakpointConfiguration(instance) {
  var _instance$$options2 = instance.$options,
      activeBreakpoints = _instance$$options2.activeBreakpoints,
      inactiveBreakpoints = _instance$$options2.inactiveBreakpoints;
  return Boolean(activeBreakpoints || inactiveBreakpoints);
}
/**
 * Test if the given instance has a conflicting configuration for breakpoints.
 * @param  {Base & WithBreakpointObserverInterface} instance A Base class instance.
 * @return {void}
 */


function testConflictingBreakpointConfiguration(instance) {
  var _instance$$options3 = instance.$options,
      activeBreakpoints = _instance$$options3.activeBreakpoints,
      inactiveBreakpoints = _instance$$options3.inactiveBreakpoints,
      name = _instance$$options3.name;

  if (activeBreakpoints && inactiveBreakpoints) {
    throw new Error("[".concat(name, "] Incorrect configuration: the `activeBreakpoints` and `inactiveBreakpoints` are not compatible."));
  }
}
/**
 * BreakpointObserver class.
 *
 * @param {BaseComponent} BaseClass The Base class to extend from.
 * @return {BaseComponent}
 */


export default (function (BaseClass) {
  var _class, _temp, _BaseClass$config$nam, _BaseClass$config, _BaseClass$config2;

  return _temp = _class = /*#__PURE__*/function (_BaseClass) {
    _inherits(BreakpointObserver, _BaseClass);

    var _super = _createSuper(BreakpointObserver);

    /**
     * Watch for the document resize to test the breakpoints.
     * @this {Base & WithBreakpointObserverInterface}
     * @param  {HTMLElement} element The component's root element.
     */
    function BreakpointObserver(element) {
      var _this;

      _classCallCheck(this, BreakpointObserver);

      _this = _super.call(this, element);

      var _useResize = useResize(),
          add = _useResize.add,
          has = _useResize.has,
          remove = _useResize.remove,
          props = _useResize.props;

      var name = _this.$options.name; // Do nothing if no breakpoint has been defined.
      // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

      if (!props().breakpoint) {
        throw new Error("[".concat(name, "] The `BreakpointObserver` class requires breakpoints to be defined."));
      }

      var key = "BreakpointObserver-".concat(_this.$id); // Watch change on the `data-options` attribute to emit the `set:options` event.

      var mutationObserver = new MutationObserver(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            mutation = _ref2[0];

        if (mutation.type === 'attributes' && (mutation.attributeName === 'data-options' || mutation.attributeName.startsWith('data-option-'))) {
          // Stop here silently when no breakpoint configuration given.
          if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
            _this.$mount();

            remove(key);
            return;
          }

          testConflictingBreakpointConfiguration(_assertThisInitialized(_this));

          if (!has(key)) {
            add(key, function (_ref3) {
              var breakpoint = _ref3.breakpoint;
              var action = testBreakpoints(_assertThisInitialized(_this), breakpoint);

              _this[action]();
            });
          }
        }
      });
      mutationObserver.observe(_this.$el, {
        attributes: true
      }); // Stop here silently when no breakpoint configuration given.

      if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
        return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
      }

      testConflictingBreakpointConfiguration(_assertThisInitialized(_this));
      add(key, function (_ref4) {
        var breakpoint = _ref4.breakpoint;
        var action = testBreakpoints(_assertThisInitialized(_this), breakpoint);

        _this[action]();
      });
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }
    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     * @return {this}
     */


    _createClass(BreakpointObserver, [{
      key: "$mount",
      value: function $mount() {
        // Execute normal behavior when no breakpoint configuration given.
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