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
import { getRaf } from "../utils/nextFrame.js";

var Raf = function (_Service) {
  _inherits(Raf, _Service);

  var _super = _createSuper(Raf);

  function Raf() {
    var _this;

    _classCallCheck(this, Raf);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "isTicking", false);

    return _this;
  }

  _createClass(Raf, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      var raf = getRaf();

      var loop = function loop() {
        _this2.trigger(_this2.props);

        if (!_this2.isTicking) {
          return;
        }

        raf(loop);
      };

      this.isTicking = true;
      loop();
      return this;
    }
  }, {
    key: "kill",
    value: function kill() {
      this.isTicking = false;
      return this;
    }
  }, {
    key: "props",
    get: function get() {
      return {
        time: window.performance.now()
      };
    }
  }]);

  return Raf;
}(Service);

var instance = null;
export default function useRaf() {
  if (!instance) {
    instance = new Raf();
  }

  var add = instance.add.bind(instance);
  var remove = instance.remove.bind(instance);
  var has = instance.has.bind(instance);

  var props = function props() {
    return instance.props;
  };

  return {
    add: add,
    remove: remove,
    has: has,
    props: props
  };
}
//# sourceMappingURL=raf.js.map