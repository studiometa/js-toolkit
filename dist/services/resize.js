import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Service from '../abstracts/Service';
import debounce from '../utils/debounce';
/**
 * Resize service
 *
 * ```
 * import { useResize } from '@studiometa/js/services';
 * const { add, remove, props } = useResize();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */

var Resize = /*#__PURE__*/function (_Service) {
  _inherits(Resize, _Service);

  var _super = _createSuper(Resize);

  function Resize() {
    _classCallCheck(this, Resize);

    return _super.apply(this, arguments);
  }

  _createClass(Resize, [{
    key: "init",

    /**
     * Bind the handler to the resize event.
     *
     * @return {void}
     */
    value: function init() {
      var _this = this;

      this.handler = debounce(function () {
        _this.trigger(_this.props);
      }).bind(this);

      if (this.canUseResizeObserver) {
        this.resizeObserver = new ResizeObserver(this.handler);
        this.resizeObserver.observe(document.documentElement);
      } else {
        window.addEventListener('resize', this.handler);
      }
    }
    /**
     * Unbind the handler from the resize event.
     *
     * @return {void}
     */

  }, {
    key: "kill",
    value: function kill() {
      if (this.canUseResizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', this.handler);
      }

      delete this.resizeObserver;
    }
    /**
     * Get resize props.
     *
     * @type {Object}
     */

  }, {
    key: "props",
    get: function get() {
      var props = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight,
        orientation: 'square'
      };

      if (props.ratio > 1) {
        props.orientation = 'landscape';
      }

      if (props.ratio < 1) {
        props.orientation = 'portrait';
      }

      if (this.breakpointElement) {
        props.breakpoint = this.breakpoint;
        props.breakpoints = this.breakpoints;
      }

      return props;
    }
    /**
     * The element holding the breakpoints data.
     * @return {HTMLElement}
     */

  }, {
    key: "breakpointElement",
    get: function get() {
      return document.querySelector('[data-breakpoint]') || null;
    }
    /**
     * Get the current breakpoint.
     * @return {String}
     */

  }, {
    key: "breakpoint",
    get: function get() {
      return window.getComputedStyle(this.breakpointElement, '::before').getPropertyValue('content').replace(/"/g, '');
    }
    /**
     * Get all breakpoints.
     * @return {Array}
     */

  }, {
    key: "breakpoints",
    get: function get() {
      var breakpoints = window.getComputedStyle(this.breakpointElement, '::after').getPropertyValue('content').replace(/"/g, '');
      return breakpoints.split(',');
    }
    /**
     * Test if we can use the `ResizeObserver` API.
     * @return {Boolean}
     */

  }, {
    key: "canUseResizeObserver",
    get: function get() {
      return typeof window.ResizeObserver !== 'undefined';
    }
  }]);

  return Resize;
}(Service);

var resize = null;
export default (function () {
  if (!resize) {
    resize = new Resize();
  }

  var add = resize.add.bind(resize);
  var remove = resize.remove.bind(resize);
  var has = resize.has.bind(resize);

  var props = function props() {
    return resize.props;
  };

  return {
    add: add,
    remove: remove,
    has: has,
    props: props
  };
});
//# sourceMappingURL=resize.js.map