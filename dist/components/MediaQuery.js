import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Base from '../abstracts/Base';
import useResize from '../services/resize';
import nextFrame from '../utils/nextFrame';
/**
 * MediaQuery component.
 *
 * <div data-component="MediaQuery" data-active-breakpoints="l xl">
 *   <div data-component="Foo"></div>
 * </div>
 */

var MediaQuery = /*#__PURE__*/function (_Base) {
  _inherits(MediaQuery, _Base);

  var _super = _createSuper(MediaQuery);

  function MediaQuery() {
    _classCallCheck(this, MediaQuery);

    return _super.apply(this, arguments);
  }

  _createClass(MediaQuery, [{
    key: "mounted",

    /**
     * Mounted hook.
     */
    value: function mounted() {
      var _this = this;

      this.test();
      nextFrame(function () {
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
      return useResize().props().breakpoint;
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
}(Base);

export { MediaQuery as default };
//# sourceMappingURL=MediaQuery.js.map