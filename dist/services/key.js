import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Service from '../abstracts/Service';
import keyCodes from '../utils/keyCodes';
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
  _inherits(Key, _Service);

  var _super = _createSuper(Key);

  function Key() {
    var _this;

    _classCallCheck(this, Key);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "event", {});

    _defineProperty(_assertThisInitialized(_this), "triggered", 0);

    _defineProperty(_assertThisInitialized(_this), "previousEvent", {});

    return _this;
  }

  _createClass(Key, [{
    key: "init",

    /**
     * Bind the handler to the keyboard event.
     *
     * @return {Key}
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
      return this;
    }
    /**
     * Unbind the handler from the keyboard event.
     *
     * @return {Key}
     */

  }, {
    key: "kill",
    value: function kill() {
      document.removeEventListener('keydown', this.handler);
      document.removeEventListener('keyup', this.handler);
      return this;
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

      var keys = Object.entries(keyCodes).reduce(function (acc, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
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
}(Service);

var key = null;
export default (function () {
  if (!key) {
    key = new Key();
  }

  var add = key.add.bind(key);
  var remove = key.remove.bind(key);
  var has = key.has.bind(key);

  var props = function props() {
    return key.props;
  };

  return {
    add: add,
    remove: remove,
    has: has,
    props: props
  };
});
//# sourceMappingURL=key.js.map