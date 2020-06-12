"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Service2 = _interopRequireDefault(require("../abstracts/Service"));

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Tick service
 *
 * ```
 * import { useRaf } from '@studiometa/js/services';
 * const { add, remove, props } = useRag();
 * add(id, (props) => {});
 * remove(id);
 * props();
 * ```
 */
var Raf = /*#__PURE__*/function (_Service) {
  (0, _inherits2.default)(Raf, _Service);

  var _super = _createSuper(Raf);

  function Raf() {
    var _this;

    (0, _classCallCheck2.default)(this, Raf);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "isTicking", false);
    return _this;
  }

  (0, _createClass2.default)(Raf, [{
    key: "init",

    /**
     * Start the requestAnimationFrame loop.
     *
     * @return {void}
     */
    value: function init() {
      var _this2 = this;

      var loop = function loop() {
        _this2.trigger(_this2.props);

        if (!_this2.isTicking) {
          return;
        }

        requestAnimationFrame(loop);
      };

      this.isTicking = true;
      loop();
    }
    /**
     * Stop the requestAnimationFrame loop.
     *
     * @return {void}
     */

  }, {
    key: "kill",
    value: function kill() {
      this.isTicking = false;
    }
    /**
     * Get raf props.
     *
     * @todo Return elapsed time / index?
     * @type {Object}
     */

  }, {
    key: "props",
    get: function get() {
      return {
        time: window.performance.now()
      };
    }
  }]);
  return Raf;
}(_Service2.default);

var raf = null;

var _default = function _default() {
  if (!raf) {
    raf = new Raf();
  }

  var add = raf.add.bind(raf);
  var remove = raf.remove.bind(raf);

  var props = function props() {
    return raf.props;
  };

  return {
    add: add,
    remove: remove,
    props: props
  };
};

exports.default = _default;
//# sourceMappingURL=raf.js.map