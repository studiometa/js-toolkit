"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Service2 = _interopRequireDefault(require("../abstracts/Service"));

var _keyCodes = _interopRequireDefault(require("../utils/keyCodes"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Scroll service
 *
 * ```
 * import { useKey } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useKey();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 */
var Key = /*#__PURE__*/function (_Service) {
  (0, _inherits2.default)(Key, _Service);

  var _super = _createSuper(Key);

  function Key() {
    var _this;

    (0, _classCallCheck2.default)(this, Key);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "event", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "triggered", 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "previousEvent", {});
    return _this;
  }

  (0, _createClass2.default)(Key, [{
    key: "init",

    /**
     * Bind the handler to the keyboard event.
     *
     * @return {void}
     */
    value: function init() {
      var _this2 = this;

      this.handler = function (event) {
        _this2.event = event;

        _this2.trigger(_this2.props);
      };

      document.addEventListener('keydown', this.handler, {
        passive: false
      });
      document.addEventListener('keyup', this.handler, {
        passive: false
      });
    }
    /**
     * Unbind the handler from the keyboard event.
     *
     * @return {void}
     */

  }, {
    key: "kill",
    value: function kill() {
      document.removeEventListener('keydown', this.handler);
      document.removeEventListener('keyup', this.handler);
    }
    /**
     * Get keyboard props.
     *
     * @type {Object}
     */

  }, {
    key: "props",
    get: function get() {
      var _this3 = this;

      var keys = Object.entries(_keyCodes.default).reduce(function (acc, _ref) {
        var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
            name = _ref2[0],
            code = _ref2[1];

        acc[name] = code === _this3.event.keyCode;
        return acc;
      }, {});

      if (!this.previousEvent.type) {
        this.triggered = 0;
      }

      if (this.event.type === 'keydown' && this.previousEvent.type === 'keydown') {
        this.triggered += 1;
      } else {
        this.triggered = 1;
      }

      this.previousEvent = this.event;
      return _objectSpread({
        event: this.event,
        triggered: this.triggered,
        direction: this.event.type === 'keydown' ? 'down' : 'up',
        isUp: this.event.type === 'keyup',
        isDown: this.event.type === 'keydown'
      }, keys);
    }
  }]);
  return Key;
}(_Service2.default);

var key = null;

var _default = function _default() {
  if (!key) {
    key = new Key();
  }

  var add = key.add.bind(key);
  var remove = key.remove.bind(key);

  var props = function props() {
    return key.props;
  };

  return {
    add: add,
    remove: remove,
    props: props
  };
};

exports.default = _default;
//# sourceMappingURL=key.js.map