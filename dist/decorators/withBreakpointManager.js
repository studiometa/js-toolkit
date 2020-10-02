import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _get from "@babel/runtime/helpers/get";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import useResize from '../services/resize';
/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {Base}           instance The component's instance.
 * @return {String|Boolean}          The action to call ($mount|$destroy) or false.
 */

function testBreakpoints(breakpoints) {
  var _useResize$props = useResize().props(),
      breakpoint = _useResize$props.breakpoint;

  breakpoints.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        breakpointKeys = _ref2[0],
        instance = _ref2[1];

    if (breakpointKeys.includes(breakpoint)) {
      instance.$mount();
    } else {
      instance.$destroy();
    }
  });
}
/**
 * A cache object to hold each Base sub-instances.
 * @type {Object}
 */


var instances = {};
/**
 * BreakpointManager class.
 */

export default (function (BaseClass, breakpoints) {
  if (!Array.isArray(breakpoints)) {
    throw new Error('[withBreakpointManager] The `breakpoints` parameter must be an array.');
  }

  if (breakpoints.length < 2) {
    throw new Error('[withBreakpointManager] You must define at least 2 breakpoints.');
  }

  var _useResize = useResize(),
      add = _useResize.add,
      props = _useResize.props; // Do nothing if no breakpoint has been defined.
  // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint


  if (!props().breakpoint) {
    throw new Error("The `BreakpointManager` class requires breakpoints to be defined.");
  }

  return /*#__PURE__*/function (_BaseClass) {
    _inherits(BreakpointManager, _BaseClass);

    var _super = _createSuper(BreakpointManager);

    /**
     * Watch for the document resize to test the breakpoints.
     * @param  {HTMLElement} element The component's root element.
     * @return {BreakpointManager}          The current instance.
     */
    function BreakpointManager(element) {
      var _this;

      _classCallCheck(this, BreakpointManager);

      _this = _super.call(this, element);
      instances[_this.$id] = breakpoints.map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            bk = _ref4[0],
            ComponentClass = _ref4[1];

        // eslint-disable-next-line no-underscore-dangle
        ComponentClass.prototype.__isChild__ = true;
        var instance = new ComponentClass(_this.$el);
        Object.defineProperty(instance, '$parent', {
          get: function get() {
            return _assertThisInitialized(_this);
          }
        });
        return [bk, instance];
      });
      add("BreakpointManager-".concat(_this.$id), function () {
        testBreakpoints(instances[_this.$id]);
      });
      return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
    }
    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     * @return {Base} The Base instance.
     */


    _createClass(BreakpointManager, [{
      key: "$mount",
      value: function $mount() {
        testBreakpoints(instances[this.$id]);
        return _get(_getPrototypeOf(BreakpointManager.prototype), "$mount", this).call(this);
      }
      /**
       * Destroy all instances when the main one is destroyed.
       * @return {Base} The Base instance.
       */

    }, {
      key: "$destroy",
      value: function $destroy() {
        if (Array.isArray(instances[this.$id])) {
          instances[this.$id].forEach(function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
                instance = _ref6[1];

            instance.$destroy();
          });
        }

        return _get(_getPrototypeOf(BreakpointManager.prototype), "$destroy", this).call(this);
      }
    }]);

    return BreakpointManager;
  }(BaseClass);
});
//# sourceMappingURL=withBreakpointManager.js.map