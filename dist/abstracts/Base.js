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

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _nonSecure = _interopRequireDefault(require("nanoid/non-secure"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _autoBind = _interopRequireDefault(require("../utils/object/autoBind"));

var _getAllProperties = _interopRequireDefault(require("../utils/object/getAllProperties"));

var _EventManager2 = _interopRequireDefault(require("./EventManager"));

var _pointer = _interopRequireDefault(require("../services/pointer"));

var _raf = _interopRequireDefault(require("../services/raf"));

var _resize = _interopRequireDefault(require("../services/resize"));

var _scroll = _interopRequireDefault(require("../services/scroll"));

var _key5 = _interopRequireDefault(require("../services/key"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Test if an object has a method.
 *
 * @param  {Object}  obj The object to test
 * @param  {String}  fn  The method's name
 * @return {Boolean}
 */
function hasMethod(obj, name) {
  return typeof obj[name] === 'function';
}
/**
 * Verbose debug for the component.
 *
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
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @return {Object}               Return an object containing all the component's refs.
 */


function getRefs(instance, element) {
  var allRefs = Array.from(element.querySelectorAll("[data-ref]"));
  var childrenRefs = Array.from(element.querySelectorAll(":scope [data-component] [data-ref]"));
  var elements = allRefs.filter(function (ref) {
    return !childrenRefs.includes(ref);
  });
  var refs = elements.reduce(function ($refs, $ref) {
    var refName = $ref.dataset.ref;
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
  instance.$emit('get:refs', refs);
  return refs;
}
/**
 *
 * @param  {Base}        instance   The component's instance.
 * @param  {HTMLElement} element    The component's root element
 * @param  {Object}      components The children components' classes
 * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
 */


function getChildren(instance, element, components) {
  var children = Object.entries(components).reduce(function (acc, _ref) {
    var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        name = _ref2[0],
        ComponentClass = _ref2[1];

    var selector = "[data-component=\"".concat(name, "\"]");
    var elements = Array.from(element.querySelectorAll(selector));

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements.map(function (el) {
      // Return existing instance if it exists
      if (el.__base__) {
        return el.__base__;
      } // Return a new instance if the component class is a child of the Base class


      if (ComponentClass.__isBase__) {
        Object.defineProperty(ComponentClass.prototype, '__isChild__', {
          value: true
        });
        return new ComponentClass(el);
      } // Resolve async components


      var asyncComponent = ComponentClass().then(function (module) {
        var ResolvedClass = module.default ? module.default : module;
        Object.defineProperty(ResolvedClass.prototype, '__isChild__', {
          value: true
        });
        return new ResolvedClass(el);
      });
      asyncComponent.__isAsync__ = true;
      return asyncComponent;
    });
    return acc;
  }, {});
  instance.$emit('get:children', children);
  return children;
}
/**
 * Get a component's options.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @param  {Object}      config   The component's default config.
 * @return {Object}               The component's merged options.
 */


function getOptions(instance, element, config) {
  var options = {};

  if (element.dataset.options) {
    try {
      options = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  options = (0, _deepmerge.default)(config, options);
  instance.$emit('get:options', options);
  return options;
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

  if (!hasMethod(instance, method)) {
    return instance;
  }

  (_instance$method = instance[method]).call.apply(_instance$method, [instance].concat(args));

  debug.apply(void 0, [instance, method, instance].concat(args));
  return instance;
}
/**
 * Mount a given component which might be async.
 *
 * @param  {Base|Promise} component The component to mount.
 * @return {void}
 */


function mountComponent(component) {
  if (component.__isAsync__) {
    component.then(function (instance) {
      return instance.$mount();
    });
  } else {
    component.$mount();
  }
}
/**
 * Mount children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */


function mountComponents(instance) {
  if (!instance.$children) {
    return;
  }

  debug(instance, 'mountComponents', instance.$children);
  Object.values(instance.$children).forEach(function ($child) {
    $child.forEach(mountComponent);
  });
}
/**
 * Destroy a given component which might be async.
 *
 * @param  {Base|Promise} component The component to destroy.
 * @return {void}
 */


function destroyComponent(component) {
  if (component.__isAsync__) {
    component.then(function (instance) {
      return instance.$destroy();
    });
  } else {
    component.$destroy();
  }
}
/**
 * Destroy children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */


function destroyComponents(instance) {
  if (!instance.$children) {
    return;
  }

  debug(instance, 'destroyComponents', instance.$children);
  Object.values(instance.$children).forEach(function ($child) {
    $child.forEach(destroyComponent);
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
  if (!hasMethod(instance, method)) {
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

  (0, _createClass2.default)(Base, [{
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
     * Class constructor where all the magic takes place
     * @param  {Object}    options An option object
     * @return {Base}         The mounted instance
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
    } // eslint-disable-next-line


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
    debug((0, _assertThisInitialized2.default)(_this), 'constructor', (0, _assertThisInitialized2.default)(_this));
    var unbindMethods = []; // Bind all the methods when the component is mounted,
    // we save the unbind methods to unbind them all when
    // the component is destroyed.

    _this.$on('mounted', function () {
      unbindMethods = []; // Fire the `loaded` method on window load

      if (hasMethod((0, _assertThisInitialized2.default)(_this), 'loaded')) {
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


      unbindMethods = [].concat((0, _toConsumableArray2.default)(unbindMethods), [initService((0, _assertThisInitialized2.default)(_this), 'scrolled', _scroll.default), initService((0, _assertThisInitialized2.default)(_this), 'resized', _resize.default), initService((0, _assertThisInitialized2.default)(_this), 'ticked', _raf.default), initService((0, _assertThisInitialized2.default)(_this), 'moved', _pointer.default), initService((0, _assertThisInitialized2.default)(_this), 'keyed', _key5.default)]); // Bind method to events on refs

      var eventMethods = (0, _getAllProperties.default)((0, _assertThisInitialized2.default)(_this)).filter(function (_ref3) {
        var _ref4 = (0, _slicedToArray2.default)(_ref3, 1),
            name = _ref4[0];

        return name.startsWith('on');
      });
      Object.entries(_this.$refs).forEach(function (_ref5) {
        var _ref6 = (0, _slicedToArray2.default)(_ref5, 2),
            refName = _ref6[0],
            $refOrRefs = _ref6[1];

        var $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
        var refEventMethod = "on".concat(refName.replace(/^\w/, function (c) {
          return c.toUpperCase();
        }));
        eventMethods.filter(function (_ref7) {
          var _ref8 = (0, _slicedToArray2.default)(_ref7, 1),
              eventMethod = _ref8[0];

          return eventMethod.startsWith(refEventMethod);
        }).forEach(function (_ref9) {
          var _ref10 = (0, _slicedToArray2.default)(_ref9, 1),
              eventMethod = _ref10[0];

          $refs.forEach(function ($ref, index) {
            var eventName = eventMethod.replace(refEventMethod, '').toLowerCase();

            var handler = function handler(event) {
              debug((0, _assertThisInitialized2.default)(_this), eventMethod, $ref, event, index);

              _this[eventMethod](event, index);
            };

            $ref.addEventListener(eventName, handler);
            unbindMethods.push(function () {
              $ref.removeEventListener(eventName, handler);
            });
          });
        });
        eventMethods = eventMethods.filter(function (_ref11) {
          var _ref12 = (0, _slicedToArray2.default)(_ref11, 1),
              eventMethod = _ref12[0];

          return !eventMethod.startsWith(refEventMethod);
        });
      });
      eventMethods.forEach(function (_ref13) {
        var _ref14 = (0, _slicedToArray2.default)(_ref13, 1),
            eventMethod = _ref14[0];

        var eventName = eventMethod.replace(/^on/, '').toLowerCase();

        var handler = function handler(event) {
          debug((0, _assertThisInitialized2.default)(_this), eventMethod, _this.$el, event);

          _this[eventMethod](event);
        };

        _this.$el.addEventListener(eventName, handler);

        unbindMethods.push(function () {
          _this.$el.removeEventListener(eventName, handler);
        });
      });
      mountComponents((0, _assertThisInitialized2.default)(_this));
      _this.$isMounted = true;
    });

    _this.$on('destroyed', function () {
      _this.$isMounted = false;
      unbindMethods.forEach(function (method) {
        return method();
      });
      destroyComponents((0, _assertThisInitialized2.default)(_this));
    });

    if (!_this.$el.__base__) {
      // Attach the instance to the root element
      Object.defineProperty(_this.$el, '__base__', {
        get: function get() {
          return (0, _assertThisInitialized2.default)(_this);
        }
      });
    } // Autobind all methods to the instance


    (0, _autoBind.default)((0, _assertThisInitialized2.default)(_this), {
      exclude: ['$mount', '$destroy', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed']
    }); // Mount class which are not used as another component's child.

    if (!_this.__isChild__) {
      _this.$mount();
    }

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
Base.__isBase__ = true;
//# sourceMappingURL=Base.js.map