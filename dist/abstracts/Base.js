"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _nonSecure = _interopRequireDefault(require("nanoid/non-secure"));

var _autoBind = _interopRequireDefault(require("auto-bind"));

var _EventManager2 = _interopRequireDefault(require("./EventManager"));

var _hasMethod = _interopRequireDefault(require("../utils/hasMethod"));

var _pointer = _interopRequireDefault(require("../services/pointer"));

var _raf = _interopRequireDefault(require("../services/raf"));

var _resize = _interopRequireDefault(require("../services/resize"));

var _scroll = _interopRequireDefault(require("../services/scroll"));

var _key5 = _interopRequireDefault(require("../services/key"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Verbose debug for the component.
 * @param  {...any} args The arguments passed to the method
 * @return {void}
 */
function debug(instance) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return instance.$options.debug ? window.console.log.apply(window, [instance.config.name].concat(args)) : function () {};
}
/**
 * Get all refs of a component.
 *
 * @param {HTMLElement}  element The component's root element
 * @param {String}       name    The component's name
 * @return {null|Object}         Returns `null` if no refs were found or an object of references
 */


function getRefs(element, name) {
  var elements = Array.from(element.querySelectorAll("[data-ref^=\"".concat(name, ".\"]")));

  if (elements.length === 0) {
    return null;
  }

  return elements.reduce(function ($refs, $ref) {
    var refName = $ref.dataset.ref.replace("".concat(name, "."), ''); // eslint-disable-next-line no-underscore-dangle

    var $realRef = $ref.__base__ ? $ref.__base__ : $ref;

    if ($refs[refName]) {
      if (Array.isArray($refs[refName])) {
        $refs[refName].push($realRef);
      } else {
        $refs[refName] = [$refs[refName], $realRef];
      }
    } else {
      $refs[refName] = $realRef;
    }

    return $refs;
  }, {});
}
/**
 *
 * @param  {HTMLElement} element    The component's root element
 * @param  {Object}      components The children components' classes
 * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
 */


function getChildren(element, components) {
  if (!components) {
    return null;
  }

  return Object.entries(components).reduce(function (acc, _ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        name = _ref2[0],
        ComponentClass = _ref2[1];

    var _ref3 = ComponentClass.prototype || {},
        config = _ref3.config;

    var selector = config.el || "[data-component=\"".concat(name, "\"]");
    var elements = Array.from(element.querySelectorAll(selector));

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements.map(function (el) {
      var options = el.dataset.options;
      return new ComponentClass(el, options);
    });
    return acc;
  }, {});
}
/**
 * Call the given method while applying the given arguments.
 *
 * @param {String} method The method to call
 * @param {...any} args   The arguments to pass to the method
 */


function call(instance, method) {
  var _instance$method;

  for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  debug.apply(void 0, [instance, 'call', method].concat(args)); // Prevent duplicate call of `mounted` and `destroyed`
  // methods based on the component status

  if (method === 'destroyed' && !instance.$isMounted || method === 'mounted' && instance.$isMounted) {
    debug(instance, 'not', method, 'because the method has already been triggered once.');
    return instance;
  }

  instance.$emit.apply(instance, [method].concat(args)); // We always emit an event, but we do not call the method if it does not exist

  if (!(0, _hasMethod.default)(instance, method)) {
    return instance;
  }

  (_instance$method = instance[method]).call.apply(_instance$method, [instance].concat(args));

  debug.apply(void 0, [instance, method, instance].concat(args));
  return instance;
}
/**
 * Tie the components' `mounted` method to the instance
 */


function mountComponents(instance) {
  if (!instance.$children) {
    return;
  }

  debug(instance, 'mountComponents', instance.$children);
  Object.values(instance.$children).forEach(function ($child) {
    if (Array.isArray($child)) {
      $child.forEach(function (c) {
        c.$mount();
      });
    } else {
      $child.$mount();
    }
  });
}
/**
 * Tie the components' `destroyed` method to the instance.
 *
 * @param  {Base} instance The base instance.
 * @return {void}
 */


function destroyComponents(instance) {
  if (!instance.$children) {
    return;
  }

  debug(instance, 'destroyComponents', instance.$children);
  Object.values(instance.$children).forEach(function ($child) {
    if (Array.isArray($child)) {
      $child.forEach(function (c) {
        c.$destroy();
      });
    } else {
      $child.$destroy();
    }
  });
}
/**
 * Init the given service and bind it to the given instance.
 *
 * @param  {Base}     instance The Base instance.
 * @param  {String}   method   The instance to test for binding
 * @param  {Function} service  The service `use...` function
 * @return {Function}          A function to unbind the service
 */


function initService(instance, method, service) {
  if (!(0, _hasMethod.default)(instance, method)) {
    return function () {};
  }

  var _service = service(),
      add = _service.add,
      remove = _service.remove;

  add(instance.$id, function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    call.apply(void 0, [instance, method].concat(args));
  });
  return function () {
    return remove(instance.$id);
  };
}
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

  /**
   * Class constructor where all the magic takes place
   * @param  {Object}    options An option object
   * @return {Base}         The mounted instance
   */
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

    _this.$isMounted = false;
    _this.$id = "".concat(_this.config.name, "-").concat((0, _nonSecure.default)());
    _this.$el = element || document.querySelector(_this.config.el);

    if (!_this.$el) {
      throw new Error('Unable to find the root element.');
    }

    var options = {};

    if (_this.$el.dataset.options) {
      try {
        options = JSON.parse(_this.$el.dataset.options);
      } catch (err) {
        throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
      }
    }

    _this.$options = _objectSpread({}, _this.config, {}, options || {});
    debug((0, _assertThisInitialized2.default)(_this), 'constructor', (0, _assertThisInitialized2.default)(_this));
    var $refs = getRefs(_this.$el, _this.config.name);

    if ($refs) {
      _this.$refs = $refs;
    }

    var $children = getChildren(_this.$el, _this.config.components);

    if ($children) {
      _this.$children = $children;
    }

    var unbindMethods = []; // Bind all the methods when the component is mounted,
    // we save the unbind methods to unbind them all when
    // the component is destroyed.

    _this.$on('mounted', function () {
      unbindMethods = []; // Fire the `loaded` method on window load

      if ((0, _hasMethod.default)((0, _assertThisInitialized2.default)(_this), 'loaded')) {
        var loadedHandler = function loadedHandler(event) {
          call((0, _assertThisInitialized2.default)(_this), 'loaded', {
            event: event
          });
        };

        window.addEventListener('load', loadedHandler);
        unbindMethods.push(function () {
          window.removeEventListener('load', loadedHandler);
        });
      } // Fire the `scrolled` method on window/document scroll


      unbindMethods = [].concat((0, _toConsumableArray2.default)(unbindMethods), [initService((0, _assertThisInitialized2.default)(_this), 'scrolled', _scroll.default), initService((0, _assertThisInitialized2.default)(_this), 'resized', _resize.default), initService((0, _assertThisInitialized2.default)(_this), 'ticked', _raf.default), initService((0, _assertThisInitialized2.default)(_this), 'moved', _pointer.default), initService((0, _assertThisInitialized2.default)(_this), 'keyed', _key5.default)]);
      mountComponents((0, _assertThisInitialized2.default)(_this));
      _this.$isMounted = true;
    });

    _this.$on('destroyed', function () {
      _this.$isMounted = false;
      unbindMethods.forEach(function (method) {
        return method();
      });
      destroyComponents((0, _assertThisInitialized2.default)(_this));
    }); // Attach the instance to the root element
    // eslint-disable-next-line no-underscore-dangle


    _this.$el.__base__ = (0, _assertThisInitialized2.default)(_this); // Autobind all methods to the instance

    (0, _autoBind.default)((0, _assertThisInitialized2.default)(_this)); // Fire the `mounted` method on the next frame so the class
    // properties are correctly loaded

    requestAnimationFrame(function () {
      _this.$mount();
    });
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
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
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
      call(this, 'mounted');
      return this;
    }
    /**
     * Trigger the `destroyed` callback.
     */

  }, {
    key: "$destroy",
    value: function $destroy() {
      debug(this, '$destroy');
      call(this, 'destroyed');
      return this;
    }
  }]);
  return Base;
}(_EventManager2.default);

exports.default = Base;
//# sourceMappingURL=Base.js.map