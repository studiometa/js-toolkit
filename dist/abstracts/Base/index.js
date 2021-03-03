import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import { nanoid } from 'nanoid/non-secure';
import autoBind from "../../utils/object/autoBind.js";
import EventManager from "../EventManager.js";
import { callMethod, debug, getConfig } from "./utils.js";
import { getChildren, getComponentElements } from "./children.js";
import { getOptions } from "./options.js";
import { getRefs } from "./refs.js";
import { mountComponents, destroyComponents } from "./components.js";
import bindServices from "./services.js";
import bindEvents from "./events.js";

var Base = function (_EventManager) {
  _inherits(Base, _EventManager);

  var _super = _createSuper(Base);

  _createClass(Base, [{
    key: "_excludeFromAutoBind",
    get: function get() {
      return ['$mount', '$update', '$destroy', '$terminate', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
    }
  }, {
    key: "config",
    get: function get() {
      return null;
    }
  }, {
    key: "$refs",
    get: function get() {
      return getRefs(this, this.$el);
    }
  }]);

  function Base(element) {
    var _this;

    _classCallCheck(this, Base);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "$parent", null);

    _defineProperty(_assertThisInitialized(_this), "$isMounted", false);

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    var _getConfig = getConfig(_assertThisInitialized(_this)),
        name = _getConfig.name;

    _this.$id = "".concat(name, "-").concat(nanoid());
    _this.$el = element;
    _this.$options = getOptions(_assertThisInitialized(_this), element, getConfig(_assertThisInitialized(_this)));
    _this.$children = getChildren(_assertThisInitialized(_this), _this.$el, getConfig(_assertThisInitialized(_this)).components || {});

    if (!('__base__' in _this.$el)) {
      Object.defineProperty(_this.$el, '__base__', {
        get: function get() {
          return _assertThisInitialized(_this);
        },
        configurable: true
      });
    }

    autoBind(_assertThisInitialized(_this), {
      exclude: _toConsumableArray(_this._excludeFromAutoBind)
    });
    var unbindMethods = [];

    _this.$on('mounted', function () {
      unbindMethods = [].concat(_toConsumableArray(bindServices(_assertThisInitialized(_this))), _toConsumableArray(bindEvents(_assertThisInitialized(_this))));
      mountComponents(_assertThisInitialized(_this));
      _this.$isMounted = true;
    });

    _this.$on('updated', function () {
      unbindMethods.forEach(function (method) {
        return method();
      });
      unbindMethods = [].concat(_toConsumableArray(bindServices(_assertThisInitialized(_this))), _toConsumableArray(bindEvents(_assertThisInitialized(_this))));
      mountComponents(_assertThisInitialized(_this));
    });

    _this.$on('destroyed', function () {
      _this.$isMounted = false;
      unbindMethods.forEach(function (method) {
        return method();
      });
      destroyComponents(_assertThisInitialized(_this));
    });

    debug(_assertThisInitialized(_this), 'constructor', _assertThisInitialized(_this));
    return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
  }

  _createClass(Base, [{
    key: "$mount",
    value: function $mount() {
      debug(this, '$mount');
      callMethod(this, 'mounted');
      return this;
    }
  }, {
    key: "$update",
    value: function $update() {
      debug(this, '$update');
      callMethod(this, 'updated');
      return this;
    }
  }, {
    key: "$destroy",
    value: function $destroy() {
      debug(this, '$destroy');
      callMethod(this, 'destroyed');
      return this;
    }
  }, {
    key: "$terminate",
    value: function $terminate() {
      debug(this, '$terminate');
      this.$destroy();
      callMethod(this, 'terminated');
      Object.defineProperty(this.$el, '__base__', {
        value: 'terminated',
        configurable: false,
        writable: false
      });
    }
  }, {
    key: "$log",
    get: function get() {
      return this.$options.log ? window.console.log.bind(window, "[".concat(this.$options.name, "]")) : function noop() {};
    }
  }], [{
    key: "$factory",
    value: function $factory(nameOrSelector) {
      var _this2 = this;

      if (!nameOrSelector) {
        throw new Error('The $factory method requires a component’s name or selector to be specified.');
      }

      return getComponentElements(nameOrSelector).map(function (el) {
        return new _this2(el).$mount();
      });
    }
  }]);

  return Base;
}(EventManager);

_defineProperty(Base, "$isBase", true);

_defineProperty(Base, "config", void 0);

export { Base as default };
//# sourceMappingURL=index.js.map