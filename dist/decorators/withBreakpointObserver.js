import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _get from "@babel/runtime/helpers/get";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import useResize from '../services/resize';
/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {BreakpointObserver} instance The component's instance.
 * @return {Sring}                       The action to trigger.
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
 * @param  {Base}    instance A Base class instance.
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
 * @param  {Base} instance A Base class instance.
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
 * Add the current instance to the resize service.
 * @param {String} key      The key for the resize service callback.
 * @param {Base}   instance The instance to observe.
 */


function addToResize(key, instance) {
  testConflictingBreakpointConfiguration(instance);

  var _useResize = useResize(),
      add = _useResize.add,
      has = _useResize.has;

  if (!has(key)) {
    add(key, function onResize(_ref) {
      var breakpoint = _ref.breakpoint;
      var action = testBreakpoints(instance, breakpoint); // Always destroy before mounting

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
/**
 * BreakpointObserver class.
 */


export default (function (BaseClass) {
  return /*#__PURE__*/function (_BaseClass) {
    _inherits(BreakpointObserver, _BaseClass);

    var _super = _createSuper(BreakpointObserver);

    /**
     * Watch for the document resize to test the breakpoints.
     * @param  {HTMLElement} element The component's root element.
     * @return {BreakpointObserver}          The current instance.
     */
    function BreakpointObserver(element) {
      var _this;

      _classCallCheck(this, BreakpointObserver);

      _this = _super.call(this, element);

      var _useResize2 = useResize(),
          add = _useResize2.add,
          has = _useResize2.has,
          remove = _useResize2.remove,
          props = _useResize2.props;

      var name = _this.$options.name; // Do nothing if no breakpoint has been defined.
      // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

      if (!props().breakpoint) {
        throw new Error("[".concat(name, "] The `BreakpointObserver` class requires breakpoints to be defined."));
      }

      var key = "BreakpointObserver-".concat(_this.$id); // Watch change on the `data-options` attribute to emit the `set:options` event.

      var mutationObserver = new MutationObserver(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 1),
            mutation = _ref3[0];

        if (mutation.type === 'attributes' && mutation.attributeName === 'data-options') {
          // Stop here silently when no breakpoint configuration given.
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
      }); // Stop here silently when no breakpoint configuration given.

      if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
        return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
      }

      addToResize(key, _assertThisInitialized(_this));
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }
    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     * @return {BreakpointObserver} The component's instance.
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
  }(BaseClass);
});
//# sourceMappingURL=withBreakpointObserver.js.map