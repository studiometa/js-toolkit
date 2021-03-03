import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Service from "../abstracts/Service.js";
import debounce from "../utils/debounce.js";

var Resize = function (_Service) {
  _inherits(Resize, _Service);

  var _super = _createSuper(Resize);

  function Resize() {
    _classCallCheck(this, Resize);

    return _super.apply(this, arguments);
  }

  _createClass(Resize, [{
    key: "init",
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

      return this;
    }
  }, {
    key: "kill",
    value: function kill() {
      if (this.canUseResizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', this.handler);
      }

      delete this.resizeObserver;
      return this;
    }
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
  }, {
    key: "breakpointElement",
    get: function get() {
      return document.querySelector('[data-breakpoint]') || null;
    }
  }, {
    key: "breakpoint",
    get: function get() {
      return window.getComputedStyle(this.breakpointElement, '::before').getPropertyValue('content').replace(/"/g, '');
    }
  }, {
    key: "breakpoints",
    get: function get() {
      var breakpoints = window.getComputedStyle(this.breakpointElement, '::after').getPropertyValue('content').replace(/"/g, '');
      return breakpoints.split(',');
    }
  }, {
    key: "canUseResizeObserver",
    get: function get() {
      return typeof window.ResizeObserver !== 'undefined';
    }
  }]);

  return Resize;
}(Service);

var resize = null;
export default function useResize() {
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
}
//# sourceMappingURL=resize.js.map