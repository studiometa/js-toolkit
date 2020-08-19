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

var _Base2 = _interopRequireDefault(require("./Base"));

var _resize = _interopRequireDefault(require("../services/resize"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {BreakpointObserver} instance The component's instance.
 * @return {Sring}                       The action to trigger.
 */
function testBreakpoints(instance) {
  var breakpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _resize.default)().props().breakpoint;
  var _instance$$options = instance.$options,
      activeBreakpoints = _instance$$options.activeBreakpoints,
      inactiveBreakpoints = _instance$$options.inactiveBreakpoints;
  var isInActiveBreakpoint = activeBreakpoints && activeBreakpoints.split(' ').includes(breakpoint);
  var isInInactiveBreakpoint = inactiveBreakpoints && inactiveBreakpoints.split(' ').includes(breakpoint);
  instance.$log('isInActiveBreakpoint', isInActiveBreakpoint);
  instance.$log('isInInactiveBreakpoint', isInInactiveBreakpoint);

  if (activeBreakpoints && isInActiveBreakpoint || inactiveBreakpoints && !isInInactiveBreakpoint) {
    return '$mount';
  }

  if (activeBreakpoints && !isInActiveBreakpoint || inactiveBreakpoints && isInInactiveBreakpoint) {
    return '$destroy';
  }

  return '';
}
/**
 * BreakpointObserver class.
 */


var BreakpointObserver = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(BreakpointObserver, _Base);

  var _super = _createSuper(BreakpointObserver);

  /**
   * Watch for the document resize to test the breakpoints.
   * @param  {HTMLElement} element The component's root element.
   * @return {BreakpointObserver}          The current instance.
   */
  function BreakpointObserver(element) {
    var _this;

    (0, _classCallCheck2.default)(this, BreakpointObserver);
    _this = _super.call(this, element);

    var _useResize = (0, _resize.default)(),
        add = _useResize.add,
        props = _useResize.props;

    var _this$$options = _this.$options,
        activeBreakpoints = _this$$options.activeBreakpoints,
        inactiveBreakpoints = _this$$options.inactiveBreakpoints,
        name = _this$$options.name; // Do nothing if no breakpoint has been defined.
    // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

    if (!props().breakpoint) {
      throw new Error("[".concat(name, "] The `BreakpointObserver` class requires breakpoints to be defined."));
    } // Do nothing if no configuration set or if both configuration are set, as
    // they are not compatible.


    if (!activeBreakpoints && !inactiveBreakpoints || activeBreakpoints && inactiveBreakpoints) {
      var message = "[".concat(name, "] ");

      if (!activeBreakpoints && !inactiveBreakpoints) {
        message += 'Missing configuration: specify the `activeBreakpoints` or `inactiveBreakpoints` config.';
      } else {
        message += 'Incorrect configuration: the `activeBreakpoints` and `inactiveBreakpoints` are not compatible.';
      }

      throw new Error(message);
    }

    add("BreakpointObserver-".concat(_this.$id), function (_ref) {
      var breakpoint = _ref.breakpoint;
      var action = testBreakpoints((0, _assertThisInitialized2.default)(_this), breakpoint);

      if (action) {
        _this[action]();
      }
    });
    return (0, _possibleConstructorReturn2.default)(_this, (0, _assertThisInitialized2.default)(_this));
  }
  /**
   * Override the default $mount method to prevent component's from being
   * mounted when they should not.
   * @return {BreakpointObserver} The component's instance.
   */


  (0, _createClass2.default)(BreakpointObserver, [{
    key: "$mount",
    value: function $mount() {
      var action = testBreakpoints(this);

      if (action === '$mount') {
        return (0, _get2.default)((0, _getPrototypeOf2.default)(BreakpointObserver.prototype), "$mount", this).call(this);
      }

      return this;
    }
  }]);
  return BreakpointObserver;
}(_Base2.default);

exports.default = BreakpointObserver;
//# sourceMappingURL=BreakpointObserver.js.map