import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import Service from '../abstracts/Service';
import throttle from '../utils/throttle';
import debounce from '../utils/debounce';
import useRaf from './raf';

function isTouchEvent(event) {
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

var Pointer = function (_Service) {
  _inherits(Pointer, _Service);

  var _super = _createSuper(Pointer);

  function Pointer() {
    var _this;

    _classCallCheck(this, Pointer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "isDown", false);

    _defineProperty(_assertThisInitialized(_this), "y", window.innerHeight / 2);

    _defineProperty(_assertThisInitialized(_this), "yLast", window.innerHeight / 2);

    _defineProperty(_assertThisInitialized(_this), "x", window.innerWidth / 2);

    _defineProperty(_assertThisInitialized(_this), "xLast", window.innerWidth / 2);

    _defineProperty(_assertThisInitialized(_this), "event", void 0);

    return _this;
  }

  _createClass(Pointer, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var _useRaf = useRaf(),
          add = _useRaf.add,
          remove = _useRaf.remove;

      this.hasRaf = false;
      var debounced = debounce(function (event) {
        _this2.updateValues(event);

        remove('usePointer');

        _this2.trigger(_this2.props);

        _this2.hasRaf = false;
      }, 50);
      this.handler = throttle(function (event) {
        _this2.updateValues(event);

        if (!_this2.hasRaf) {
          add('usePointer', function (props) {
            _this2.trigger(_this2.props);
          });
          _this2.hasRaf = true;
        }

        debounced(event);
      }, 32).bind(this);
      this.downHandler = this.downHandler.bind(this);
      this.upHandler = this.upHandler.bind(this);
      document.documentElement.addEventListener('mouseenter', this.handler, {
        once: true
      });
      document.addEventListener('mousemove', this.handler, {
        passive: true
      });
      document.addEventListener('touchmove', this.handler, {
        passive: true
      });
      document.addEventListener('mousedown', this.downHandler, {
        passive: true
      });
      document.addEventListener('touchstart', this.downHandler, {
        passive: true
      });
      document.addEventListener('mouseup', this.upHandler, {
        passive: true
      });
      document.addEventListener('touchend', this.upHandler, {
        passive: true
      });
      return this;
    }
  }, {
    key: "kill",
    value: function kill() {
      document.removeEventListener('mousemove', this.handler);
      document.removeEventListener('touchmove', this.handler);
      document.removeEventListener('mousedown', this.downHandler);
      document.removeEventListener('touchstart', this.downHandler);
      document.removeEventListener('mouseup', this.upHandler);
      document.removeEventListener('touchend', this.upHandler);
      return this;
    }
  }, {
    key: "downHandler",
    value: function downHandler() {
      this.isDown = true;
      this.trigger(this.props);
    }
  }, {
    key: "upHandler",
    value: function upHandler() {
      this.isDown = false;
      this.trigger(this.props);
    }
  }, {
    key: "updateValues",
    value: function updateValues(event) {
      var _event$touches$, _event$touches$2;

      this.event = event;
      this.yLast = this.y;
      this.xLast = this.x;
      var y = isTouchEvent(event) ? (_event$touches$ = event.touches[0]) === null || _event$touches$ === void 0 ? void 0 : _event$touches$.clientY : event.clientY;

      if (y !== this.y) {
        this.y = y;
      }

      var x = isTouchEvent(event) ? (_event$touches$2 = event.touches[0]) === null || _event$touches$2 === void 0 ? void 0 : _event$touches$2.clientX : event.clientX;

      if (x !== this.x) {
        this.x = x;
      }
    }
  }, {
    key: "props",
    get: function get() {
      return {
        event: this.event,
        isDown: this.isDown,
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
          x: this.x / window.innerWidth,
          y: this.y / window.innerHeight
        },
        max: {
          x: window.innerWidth,
          y: window.innerHeight
        }
      };
    }
  }]);

  return Pointer;
}(Service);

var pointer = null;
export default function usePointer() {
  if (!pointer) {
    pointer = new Pointer();
  }

  var add = pointer.add.bind(pointer);
  var remove = pointer.remove.bind(pointer);
  var has = pointer.has.bind(pointer);

  var props = function props() {
    return pointer.props;
  };

  return {
    add: add,
    remove: remove,
    has: has,
    props: props
  };
}
//# sourceMappingURL=pointer.js.map