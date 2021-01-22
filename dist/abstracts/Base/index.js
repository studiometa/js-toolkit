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

import nanoid from 'nanoid/non-secure';
import autoBind from '../../utils/object/autoBind';
import EventManager from '../EventManager';
import { callMethod, debug, log, getConfig } from './utils'; // eslint-disable-next-line import/no-cycle

import { getChildren, getComponentElements } from './children';
import { getOptions } from './options';
import { getRefs } from './refs';
import { mountComponents, destroyComponents } from './components';
import bindServices from './services'; // eslint-disable-next-line import/no-cycle

import bindEvents from './events';
/**
 * @typedef {typeof Base} BaseComponent
 * @typedef {() => Promise<BaseComponent | { default: BaseComponent }>} BaseAsyncComponent
 * @typedef {HTMLElement & { __base__?: Base | 'terminated' }} BaseHTMLElement
 * @typedef {{ name: string, debug: boolean, log: boolean }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | BaseComponent | Array<HTMLElement|BaseComponent> }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Array<Base | Promise<Base>> }} BaseChildren
 * @typedef {{ [nameOrSelector:string]: BaseComponent | BaseAsyncComponent }} BaseConfigComponents
 * @typedef {import('./classes/Options').OptionsSchema} BaseConfigOptions
 */

/**
 * @typedef {Object} BaseConfig
 * @property {String} name
 * @property {Boolean} [debug]
 * @property {Boolean} [log]
 * @property {String[]} [refs]
 * @property {BaseConfigComponents} [components]
 * @property {BaseConfigOptions} [options]
 */

/**
 * Page lifecycle class
 */

var Base = /*#__PURE__*/function (_EventManager) {
  _inherits(Base, _EventManager);

  var _super = _createSuper(Base);

  _createClass(Base, [{
    key: "_excludeFromAutoBind",

    /**
     * The instance parent.
     * @type {Base}
     */

    /**
     * The state of the component.
     * @type {Boolean}
     */

    /**
     * This is a Base instance.
     * @type {Boolean}
     */

    /**
     * Get properties to exclude from the autobind call.
     * @return {Array<String|RegExp>}
     */
    get: function get() {
      return ['$mount', '$update', '$destroy', '$terminate', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
    }
    /**
     * @deprecated Use the static `config` property instead.
     * @return {BaseConfig}
     */

  }, {
    key: "config",
    get: function get() {
      return null;
    }
    /** @type {BaseConfig} */

  }, {
    key: "$refs",

    /**
     * Get the component's refs.
     * @return {BaseRefs}
     */
    get: function get() {
      return getRefs(this, this.$el);
    }
    /**
     * Get the component's children components.
     * @return {BaseChildren}
     */

  }, {
    key: "$children",
    get: function get() {
      var _getConfig = getConfig(this),
          components = _getConfig.components;

      return getChildren(this, this.$el, components || {});
    }
    /**
     * Class constructor where all the magic takes place.
     *
     * @param {BaseHTMLElement} element The component's root element dd.
     */

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

    var _getConfig2 = getConfig(_assertThisInitialized(_this)),
        name = _getConfig2.name;
    /** @type {String} */


    _this.$id = "".concat(name, "-").concat(nanoid());
    /** @type {BaseHTMLElement} */

    _this.$el = element;
    /** @type {Boolean} */

    _this.$isMounted = false;
    /** @type {BaseOptions} */

    _this.$options = getOptions(_assertThisInitialized(_this), element, getConfig(_assertThisInitialized(_this)));

    if (!_this.$el.__base__) {
      Object.defineProperty(_this.$el, '__base__', {
        get: function get() {
          return _assertThisInitialized(_this);
        },
        configurable: true
      });
    } // Autobind all methods to the instance


    autoBind(_assertThisInitialized(_this), {
      exclude: _toConsumableArray(_this._excludeFromAutoBind || [])
    });
    var unbindMethods = [];

    _this.$on('mounted', function () {
      mountComponents(_assertThisInitialized(_this));
      unbindMethods = [].concat(_toConsumableArray(bindServices(_assertThisInitialized(_this))), _toConsumableArray(bindEvents(_assertThisInitialized(_this))));
      _this.$isMounted = true;
    });

    _this.$on('updated', function () {
      unbindMethods.forEach(function (method) {
        return method();
      });
      mountComponents(_assertThisInitialized(_this));
      unbindMethods = [].concat(_toConsumableArray(bindServices(_assertThisInitialized(_this))), _toConsumableArray(bindEvents(_assertThisInitialized(_this))));
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
  /**
   * Small helper to log stuff.
   *
   * @param  {...any} args The arguments passed to the method
   * @return {void}
   */


  _createClass(Base, [{
    key: "$log",
    value: function $log() {
      if (this.$options.log) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        log.apply(void 0, [this].concat(args));
      }
    }
    /**
     * Trigger the `mounted` callback.
     */

  }, {
    key: "$mount",
    value: function $mount() {
      debug(this, '$mount');
      callMethod(this, 'mounted');
      return this;
    }
    /**
     * Update the instance children.
     */

  }, {
    key: "$update",
    value: function $update() {
      debug(this, '$update');
      callMethod(this, 'updated');
      return this;
    }
    /**
     * Trigger the `destroyed` callback.
     */

  }, {
    key: "$destroy",
    value: function $destroy() {
      debug(this, '$destroy');
      callMethod(this, 'destroyed');
      return this;
    }
    /**
     * Terminate a child instance when it is not needed anymore.
     * @return {void}
     */

  }, {
    key: "$terminate",
    value: function $terminate() {
      debug(this, '$terminate'); // First, destroy the component.

      this.$destroy(); // Execute the `terminated` hook if it exists

      callMethod(this, 'terminated'); // Delete the reference to the instance
      // delete this.$el.__base__;
      // And update its status to prevent re-instantiation when accessing the
      // parent's `$children` property

      Object.defineProperty(this.$el, '__base__', {
        value: 'terminated',
        configurable: false,
        writable: false
      });
    }
    /**
     * Factory method to generate multiple instance of the class.
     *
     * @param  {String}      nameOrSelector The selector on which to mount each instance.
     * @return {Array<Base>}                A list of the created instance.
     */

  }, {
    key: "mounted",

    /**
     * Hello world.
     */
    value: function mounted() {}
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