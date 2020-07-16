"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Base2 = _interopRequireDefault(require("../abstracts/Base"));

var _resize = _interopRequireDefault(require("../services/resize"));

var _nextFrame = _interopRequireDefault(require("../utils/nextFrame"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * MediaQuery component.
 *
 * <div data-component="MediaQuery" data-active-breakpoints="l xl">
 *   <div data-component="Foo"></div>
 * </div>
 */
var MediaQuery = /*#__PURE__*/function (_Base) {
  (0, _inherits2.default)(MediaQuery, _Base);

  var _super = _createSuper(MediaQuery);

  function MediaQuery() {
    (0, _classCallCheck2.default)(this, MediaQuery);
    return _super.apply(this, arguments);
  }

  (0, _createClass2.default)(MediaQuery, [{
    key: "mounted",

    /**
     * Mounted hook.
     */
    value: function mounted() {
      var _this = this;

      this.test();
      (0, _nextFrame.default)(function () {
        return _this.test();
      });
    }
    /**
     * Resized hook.
     */

  }, {
    key: "resized",
    value: function resized() {
      this.test();
    }
    /**
     * Get the first element child of the component, as it must be another Base component that could
     * be either $mounted or $destroyed.
     *
     * @return {Base|Boolean}
     */

  }, {
    key: "test",

    /**
     * Test if the child component should be either $mounted or $destroyed based on the current active
     * breakpoint and the given list of breakpoints.
     *
     * @return {void}
     */
    value: function test() {
      var isInBreakpoints = this.activeBreakpoints.includes(this.currentBreakpoint);

      if (isInBreakpoints && !this.child.$isMounted) {
        this.child.$mount();
        return;
      }

      if (!isInBreakpoints && this.child.$isMounted) {
        this.child.$destroy();
      }
    }
  }, {
    key: "config",

    /**
     * Component's configuration.
     *
     * @return {Object}
     */
    get: function get() {
      return {
        name: 'MediaQuery'
      };
    }
  }, {
    key: "child",
    get: function get() {
      var child = this.$el.firstElementChild ? this.$el.firstElementChild.__base__ : false;

      if (!child) {
        throw new Error('The first and only child of the MediaQuery component must be another Base component.');
      }

      return child;
    }
    /**
     * Get the current active breakpoint from the `useResize` service.
     *
     * @return {String}
     */

  }, {
    key: "currentBreakpoint",
    get: function get() {
      return (0, _resize.default)().props().breakpoint;
    }
    /**
     * Get a list of breakpoints in which the child component should be $mounted.
     *
     * @return {Array}
     */

  }, {
    key: "activeBreakpoints",
    get: function get() {
      if (this.$el.dataset.activeBreakpoints) {
        return this.$el.dataset.activeBreakpoints.split(' ');
      }

      return [];
    }
  }]);
  return MediaQuery;
}(_Base2.default);

exports.default = MediaQuery;
//# sourceMappingURL=MediaQuery.js.map