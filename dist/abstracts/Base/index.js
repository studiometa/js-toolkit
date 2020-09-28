import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _createClass from "@babel/runtime/helpers/createClass";
import _inherits from "@babel/runtime/helpers/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

import nanoid from 'nanoid/non-secure';
import autoBind from '../../utils/object/autoBind';
import EventManager from '../EventManager';
import { callMethod, debug } from './utils';
import { getChildren } from './children';
import { getOptions, setOptions } from './options';
import { getRefs } from './refs';
import { mountComponents, destroyComponents } from './components';
import bindServices from './services';
import bindEvents from './events';
/**
 * Page lifecycle class
 *
 * @method mounted   Fired when the class is instantiated
 * @method loaded    Fired on the window's load event
 * @method ticked    Fired each frame with `requestAnimationFrame`
 * @method resized   Fired when the window is resized (`resize` event)
 * @method moved     Fired when the pointer has moved (`touchmove` and `mousemove` events)
 * @method scrolled  Fired with debounce when the document is scrolled (`scroll` event)
 * @method destroyed Fired when the window is being unloaded (`unload` event)
 */

var Base = /*#__PURE__*/function (_EventManager) {
  _inherits(Base, _EventManager);

  var _super = _createSuper(Base);

  _createClass(Base, [{
    key: "$refs",

    /**
     * Get the component's refs.
     * @return {Object}
     */
    get: function get() {
      return getRefs(this, this.$el);
    }
    /**
     * Get the component's children components.
     * @return {Object}
     */

  }, {
    key: "$children",
    get: function get() {
      return getChildren(this, this.$el, this.config.components || {});
    }
    /**
     * Get the component's merged config and options.
     * @return {Object}
     */

  }, {
    key: "$options",
    get: function get() {
      return getOptions(this, this.$el, this.config);
    }
    /**
     * Set the components option.
     * @param  {Object} value The new options values to merge with the old ones.
     * @return {void}
     */
    ,
    set: function set(newOptions) {
      setOptions(this, this.$el, newOptions);
    }
    /**
     * Class constructor where all the magic takes place.
     *
     * @param  {HTMLElement} element The component's root element.
     * @return {Base}                A Base instance.
     */

  }]);

  function Base(element) {
    var _this;

    _classCallCheck(this, Base);

    _this = _super.call(this);

    if (!_this.config) {
      throw new Error('The `config` getter must be defined.');
    }

    if (!_this.config.name) {
      throw new Error('The `config.name` property is required.');
    }

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    Object.defineProperties(_assertThisInitialized(_this), {
      $id: {
        value: "".concat(_this.config.name, "-").concat(nanoid())
      },
      $isMounted: {
        value: false,
        writable: true
      },
      $el: {
        value: element
      }
    });

    if (!_this.$el.__base__) {
      Object.defineProperty(_this.$el, '__base__', {
        get: function get() {
          return _assertThisInitialized(_this);
        },
        configurable: true
      });
    } // Autobind all methods to the instance


    autoBind(_assertThisInitialized(_this), {
      exclude: ['$mount', '$destroy', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed'].concat(_toConsumableArray(_this._excludeFromAutoBind || []))
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
    }); // Mount class which are not used as another component's child.


    if (!_this.__isChild__) {
      _this.$mount();

      Object.defineProperty(_assertThisInitialized(_this), '$parent', {
        get: function get() {
          return null;
        }
      });
    }

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
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.$options.log ? window.console.log.apply(window, [this.config.name].concat(args)) : function () {};
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

      delete this.$el.__base__; // And update its status to prevent re-instantiation when accessing the
      // parent's `$children` property

      Object.defineProperty(this.$el, '__base__', {
        value: 'terminated',
        configurable: false,
        writable: false
      });
    }
  }]);

  return Base;
}(EventManager);

export { Base as default };
Base.__isBase__ = true;
//# sourceMappingURL=index.js.map