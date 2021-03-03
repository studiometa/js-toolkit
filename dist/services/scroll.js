import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Service from "../abstracts/Service.js";
import throttle from "../utils/throttle.js";
import debounce from "../utils/debounce.js";
import nextFrame from "../utils/nextFrame.js";

var Scroll = function (_Service) {
  _inherits(Scroll, _Service);

  var _super = _createSuper(Scroll);

  function Scroll() {
    var _this;

    _classCallCheck(this, Scroll);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "y", window.pageYOffset);

    _defineProperty(_assertThisInitialized(_this), "yLast", window.pageYOffset);

    _defineProperty(_assertThisInitialized(_this), "x", window.pageXOffset);

    _defineProperty(_assertThisInitialized(_this), "xLast", window.pageXOffset);

    return _this;
  }

  _createClass(Scroll, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var debounced = debounce(function () {
        _this2.trigger(_this2.props);

        nextFrame(function () {
          _this2.trigger(_this2.props);
        });
      }, 50);
      this.handler = throttle(function () {
        _this2.trigger(_this2.props);

        debounced();
      }, 32).bind(this);
      document.addEventListener('scroll', this.handler, {
        passive: true
      });
      return this;
    }
  }, {
    key: "kill",
    value: function kill() {
      document.removeEventListener('scroll', this.handler);
      return this;
    }
  }, {
    key: "props",
    get: function get() {
      this.yLast = this.y;
      this.xLast = this.x;

      if (window.pageYOffset !== this.y) {
        this.y = window.pageYOffset;
      }

      if (window.pageXOffset !== this.x) {
        this.x = window.pageXOffset;
      }

      return {
        x: this.x,
        y: this.y,
        changed: {
          x: this.x !== this.xLast,
          y: this.y !== this.yLast
        },
        last: {
          x: this.xLast,
          y: this.yLast
        },
        delta: {
          x: this.x - this.xLast,
          y: this.y - this.yLast
        },
        progress: {
          x: this.max.x === 0 ? 1 : this.x / this.max.x,
          y: this.max.y === 0 ? 1 : this.y / this.max.y
        },
        max: this.max
      };
    }
  }, {
    key: "max",
    get: function get() {
      return {
        x: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
        y: (document.scrollingElement || document.body).scrollHeight - window.innerHeight
      };
    }
  }]);

  return Scroll;
}(Service);

var scroll = null;
export default function useScroll() {
  if (!scroll) {
    scroll = new Scroll();
  }

  var add = scroll.add.bind(scroll);
  var remove = scroll.remove.bind(scroll);
  var has = scroll.has.bind(scroll);

  var props = function props() {
    return scroll.props;
  };

  return {
    add: add,
    remove: remove,
    has: has,
    props: props
  };
}
//# sourceMappingURL=scroll.js.map