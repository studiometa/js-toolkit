"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _Base2 = _interopRequireDefault(require("./Base"));

var _resize = _interopRequireDefault(require("../services/resize"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {Base}           instance The component's instance.
 * @return {String|Boolean}          The action to call ($mount|$destroy) or false.
 */
function testBreakpoints(breakpoints) {
  var _useResize$props = (0, _resize.default)().props(),
      breakpoint = _useResize$props.breakpoint;

  breakpoints.forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
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
 * A cache object to hold each BreakpointManager sub-instances.
 * @type {Object}
 */


var instances = {};
/**
 * BreakpointManager class.
 */

var BreakpointManager = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(BreakpointManager, _Base);

  var _super = _createSuper(BreakpointManager);

  /**
   * Watch for the document resize to test the breakpoints.
   * @param  {HTMLElement} element The component's root element.
   * @return {BreakpointManager}          The current instance.
   */
  function BreakpointManager(element) {
    var _this;

    (0, _classCallCheck2.default)(this, BreakpointManager);
    _this = _super.call(this, element);

    var _useResize = (0, _resize.default)(),
        add = _useResize.add,
        props = _useResize.props;

    var _this$$options = _this.$options,
        name = _this$$options.name,
        breakpoints = _this$$options.breakpoints; // Do nothing if no breakpoint has been defined.
    // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

    if (!props().breakpoint) {
      throw new Error("[".concat(name, "] The `BreakpointManager` class requires breakpoints to be defined."));
    }

    if (!breakpoints) {
      throw new Error("[".concat(name, "] The `breakpoint` option must be defined."));
    }

    if (!Array.isArray(breakpoints)) {
      throw new Error("[".concat(name, "] The `breakpoint` option must be an array."));
    }

    if (breakpoints.length < 2) {
      throw new Error("[".concat(name, "] You must define at least 2 breakpoints when using the `BreakpointManager` class."));
    }

    instances[_this.$id] = breakpoints.map(function (_ref3) {
      var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
          bk = _ref4[0],
          ComponentClass = _ref4[1];

      // eslint-disable-next-line no-underscore-dangle
      ComponentClass.prototype.__isChild__ = true;
      var instance = new ComponentClass(_this.$el);
      Object.defineProperty(instance, '$parent', {
        get: function get() {
          return (0, _assertThisInitialized2.default)(_this);
        }
      });
      return [bk, instance];
    });
    add("BreakpointManager-".concat(_this.$id), function () {
      testBreakpoints(instances[_this.$id]);
    });
    return (0, _possibleConstructorReturn2.default)(_this, (0, _assertThisInitialized2.default)(_this));
  }
  /**
   * Override the default $mount method to prevent component's from being
   * mounted when they should not.
   * @return {BreakpointManager} The component's instance.
   */


  (0, _createClass2.default)(BreakpointManager, [{
    key: "$mount",
    value: function $mount() {
      testBreakpoints(instances[this.$id]);
      return (0, _get2.default)((0, _getPrototypeOf2.default)(BreakpointManager.prototype), "$mount", this).call(this);
    }
  }]);
  return BreakpointManager;
}(_Base2.default);

exports.default = BreakpointManager;
//# sourceMappingURL=BreakpointManager.js.map