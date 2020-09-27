"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _nonSecure = _interopRequireDefault(require("nanoid/non-secure"));

var _autoBind = _interopRequireDefault(require("../../utils/object/autoBind"));

var _EventManager2 = _interopRequireDefault(require("../EventManager"));

var _utils = require("./utils");

var _children = require("./children");

var _options = require("./options");

var _refs = require("./refs");

var _components = require("./components");

var _services = _interopRequireDefault(require("./services"));

var _events = _interopRequireDefault(require("./events"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

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
  (0, _inherits2.default)(Base, _EventManager);

  var _super = _createSuper(Base);

  (0, _createClass2.default)(Base, [{
    key: "$refs",

    /**
     * Get the component's refs.
     * @return {Object}
     */
    get: function get() {
      return (0, _refs.getRefs)(this, this.$el);
    }
    /**
     * Get the component's children components.
     * @return {Object}
     */

  }, {
    key: "$children",
    get: function get() {
      return (0, _children.getChildren)(this, this.$el, this.config.components || {});
    }
    /**
     * Get the component's merged config and options.
     * @return {Object}
     */

  }, {
    key: "$options",
    get: function get() {
      return (0, _options.getOptions)(this, this.$el, this.config);
    }
    /**
     * Set the components option.
     * @param  {Object} value The new options values to merge with the old ones.
     * @return {void}
     */
    ,
    set: function set(newOptions) {
      (0, _options.setOptions)(this, this.$el, newOptions);
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

    (0, _classCallCheck2.default)(this, Base);
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

    Object.defineProperties((0, _assertThisInitialized2.default)(_this), {
      $id: {
        value: "".concat(_this.config.name, "-").concat((0, _nonSecure.default)())
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
          return (0, _assertThisInitialized2.default)(_this);
        },
        configurable: true
      });
    } // Autobind all methods to the instance


    (0, _autoBind.default)((0, _assertThisInitialized2.default)(_this), {
      exclude: ['$mount', '$destroy', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed'].concat((0, _toConsumableArray2.default)(_this._excludeFromAutoBind || []))
    });
    var unbindMethods = [];

    _this.$on('mounted', function () {
      (0, _components.mountComponents)((0, _assertThisInitialized2.default)(_this));
      unbindMethods = [].concat((0, _toConsumableArray2.default)((0, _services.default)((0, _assertThisInitialized2.default)(_this))), (0, _toConsumableArray2.default)((0, _events.default)((0, _assertThisInitialized2.default)(_this))));
      _this.$isMounted = true;
    });

    _this.$on('destroyed', function () {
      _this.$isMounted = false;
      unbindMethods.forEach(function (method) {
        return method();
      });
      (0, _components.destroyComponents)((0, _assertThisInitialized2.default)(_this));
    }); // Mount class which are not used as another component's child.


    if (!_this.__isChild__) {
      _this.$mount();

      Object.defineProperty((0, _assertThisInitialized2.default)(_this), '$parent', {
        get: function get() {
          return null;
        }
      });
    }

    (0, _utils.debug)((0, _assertThisInitialized2.default)(_this), 'constructor', (0, _assertThisInitialized2.default)(_this));
    return (0, _possibleConstructorReturn2.default)(_this, (0, _assertThisInitialized2.default)(_this));
  }
  /**
   * Small helper to log stuff.
   *
   * @param  {...any} args The arguments passed to the method
   * @return {void}
   */


  (0, _createClass2.default)(Base, [{
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
      (0, _utils.debug)(this, '$mount');
      (0, _utils.callMethod)(this, 'mounted');
      return this;
    }
    /**
     * Update the instance children.
     */

  }, {
    key: "$update",
    value: function $update() {
      (0, _utils.debug)(this, '$update');
      (0, _components.mountComponents)(this);
      return this;
    }
    /**
     * Trigger the `destroyed` callback.
     */

  }, {
    key: "$destroy",
    value: function $destroy() {
      (0, _utils.debug)(this, '$destroy');
      (0, _utils.callMethod)(this, 'destroyed');
      return this;
    }
    /**
     * Terminate a child instance when it is not needed anymore.
     * @return {void}
     */

  }, {
    key: "$terminate",
    value: function $terminate() {
      (0, _utils.debug)(this, '$terminate'); // First, destroy the component.

      this.$destroy(); // Execute the `terminated` hook if it exists

      (0, _utils.callMethod)(this, 'terminated'); // Delete the reference to the instance

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
}(_EventManager2.default);

exports.default = Base;
Base.__isBase__ = true;
//# sourceMappingURL=index.js.map