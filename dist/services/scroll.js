"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Service2 = _interopRequireDefault(require("../abstracts/Service"));

var _utils = require("../utils");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Scroll service
 *
 * ```
 * import { useScroll } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useScroll();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */
var Scroll = /*#__PURE__*/function (_Service) {
  (0, _inherits2["default"])(Scroll, _Service);

  var _super = _createSuper(Scroll);

  function Scroll() {
    var _this;

    (0, _classCallCheck2["default"])(this, Scroll);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "y", window.pageYOffset);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "yLast", window.pageYOffset);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "x", window.pageXOffset);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "xLast", window.pageXOffset);
    return _this;
  }

  (0, _createClass2["default"])(Scroll, [{
    key: "init",

    /**
     * Bind the handler to the scroll event.
     *
     * @return {void}
     */
    value: function init() {
      var _this2 = this;

      var debounced = (0, _utils.debounce)(function () {
        _this2.trigger(_this2.props);

        requestAnimationFrame(function () {
          _this2.trigger(_this2.props);
        });
      }, 50);
      this.handler = (0, _utils.throttle)(function () {
        _this2.trigger(_this2.props); // Reset changed flags at the end of the scroll event


        debounced();
      }, 32).bind(this); // Fire the `scrolled` method on document scroll

      document.addEventListener('scroll', this.handler, {
        passive: true
      });
    }
    /**
     * Unbind the handler from the scroll event.
     *
     * @return {void}
     */

  }, {
    key: "kill",
    value: function kill() {
      document.removeEventListener('scroll', this.handler);
    }
    /**
     * Get scroll props.
     *
     * @type {Object}
     */

  }, {
    key: "props",
    get: function get() {
      this.yLast = this.y;
      this.xLast = this.x; // Check scroll Y

      if (window.pageYOffset !== this.y) {
        this.y = window.pageYOffset;
        this.yProgress = this.y / this.max.y;
      } // Check scroll x


      if (window.pageXOffset !== this.x) {
        this.x = window.pageXOffset;
        this.xProgress = this.x / this.max.x;
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
          x: this.xProgress,
          y: this.yProgress
        },
        max: this.max
      };
    }
    /**
     * Get scroll max values.
     *
     * @type {Object}
     */

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
}(_Service2["default"]);

var scroll = null;

var _default = function _default() {
  if (!scroll) {
    scroll = new Scroll();
  }

  var add = scroll.add.bind(scroll);
  var remove = scroll.remove.bind(scroll);

  var props = function props() {
    return scroll.props;
  };

  return {
    add: add,
    remove: remove,
    props: props
  };
};

exports["default"] = _default;
//# sourceMappingURL=scroll.js.map