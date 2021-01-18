(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Base = {}));
}(this, (function (exports) {
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  // This alphabet uses a-z A-Z 0-9 _- symbols.
  // Symbols are generated for smaller size.
  // -_zyxwvutsrqponmlkjihgfedcba9876543210ZYXWVUTSRQPONMLKJIHGFEDCBA
  var url = '-_';
  // Loop from 36 to 0 (from z to a and 9 to 0 in Base36).
  var i = 36;
  while (i--) {
    // 36 is radix. Number.prototype.toString(36) returns number
    // in Base36 representation. Base36 is like hex, but it uses 0–9 and a-z.
    url += i.toString(36);
  }
  // Loop from 36 to 10 (from Z to A in Base36).
  i = 36;
  while (i-- - 10) {
    url += i.toString(36).toUpperCase();
  }

  /**
   * Generate URL-friendly unique ID. This method use non-secure predictable
   * random generator with bigger collision probability.
   *
   * @param {number} [size=21] The number of symbols in ID.
   *
   * @return {string} Random string.
   *
   * @example
   * const nanoid = require('nanoid/non-secure')
   * model.id = nanoid() //=> "Uakgb_J5m9g-0JDMbcJqL"
   *
   * @name nonSecure
   * @function
   */
  var nonSecure = function (size) {
    var id = '';
    i = size || 21;
    // Compact alternative for `for (var i = 0; i < size; i++)`
    while (i--) {
      // `| 0` is compact and faster alternative for `Math.floor()`
      id += url[Math.random() * 64 | 0];
    }
    return id
  };

  /**
   * Gets all non-builtin properties up the prototype chain.
   *
   * @param  {Object} object The object to get the propeties from.
   * @param  {Array}  props  The already existing properties.
   * @return {Array}         An array of properties and their value.
   */
  function getAllProperties(object, props) {
    if (props === void 0) {
      props = [];
    }

    var proto = Object.getPrototypeOf(object);

    if (proto === Object.prototype) {
      return props;
    }

    return getAllProperties(proto, Object.getOwnPropertyNames(proto).map(function (name) {
      return [name, proto];
    }).reduce(function (acc, val) {
      return [].concat(acc, [val]);
    }, props));
  }

  /**
   * Auto-bind methods to an instance.
   *
   * @param  {Object}               instance        The instance.
   * @param  {Array<String|RegExp>} options.include Methods to include.
   * @param  {Array<String|RegExp>} options.exclude Methods to exclude.
   * @return {Object}                               The instance.
   */

  function autoBind(instance, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        include = _ref.include,
        exclude = _ref.exclude;

    var filter = function filter(key) {
      var match = function match(pattern) {
        return typeof pattern === 'string' ? key === pattern : pattern.test(key);
      };

      if (include) {
        return include.some(match);
      }

      if (exclude) {
        return !exclude.some(match);
      }

      return true;
    };

    getAllProperties(instance).filter(function (_ref2) {
      var key = _ref2[0];
      return key !== 'constructor' && filter(key);
    }).forEach(function (_ref3) {
      var key = _ref3[0],
          object = _ref3[1];
      var descriptor = Object.getOwnPropertyDescriptor(object, key);

      if (descriptor && typeof descriptor.value === 'function') {
        instance[key] = instance[key].bind(instance);
      }
    });
    return instance;
  }

  /* eslint no-underscore-dangle: ["error", { "allow": ["_events"] }] */

  /**
   * Event management class.
   *
   * @method $on    Bind a given function to the given event.
   * @method $off   Unbind the given function from the given event.
   * @method $once  Bind a given function to the given event once.
   * @method $emit  Emit an event with custom props.
   */
  var EventManager = /*#__PURE__*/function () {
    function EventManager() {
      this._events = {};
    }

    var _proto = EventManager.prototype;

    /**
     * Bind a listener function to an event.
     *
     * @param  {String}   event    Name of the event.
     * @param  {Function} listener Function to be called.
     * @return {Function}          A function to unbind the listener.
     */
    _proto.$on = function $on(event, listener) {
      var _this = this;

      if (!Array.isArray(this._events[event])) {
        this._events[event] = [];
      }

      this._events[event].push(listener);

      return function () {
        _this.$off(event, listener);
      };
    }
    /**
     * Unbind a listener function from an event.
     *
     * @param  {String}       event    Name of the event.
     * @param  {Function}     listener Function to be removed.
     * @return {EventManager}          The current instance.
     */
    ;

    _proto.$off = function $off(event, listener) {
      // If no event specified, we remove them all.
      if (!event) {
        this._events = {};
        return this;
      } // If no listener have been specified, we remove all
      // the listeners for the given event.


      if (!listener) {
        this._events[event] = [];
        return this;
      }

      var index = this._events[event].indexOf(listener);

      if (index > -1) {
        this._events[event].splice(index, 1);
      }

      return this;
    }
    /**
     * Emits an event.
     *
     * @param  {String}       event Name of the event.
     * @param  {Array}        args  The arguments to apply to the functions bound to this event.
     * @return {EventManager}       The current instance.
     */
    ;

    _proto.$emit = function $emit(event) {
      var _arguments = arguments,
          _this2 = this;

      if (!Array.isArray(this._events[event])) {
        return this;
      }

      this._events[event].forEach(function (listener) {
        listener.apply(_this2, [].slice.call(_arguments, 1));
      });

      return this;
    }
    /**
     * Bind a listener function to an event for one execution only.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    ;

    _proto.$once = function $once(event, listener) {
      var instance = this;
      this.$on(event, function handler() {
        instance.$off(event, handler);
        listener.apply(instance, [].slice.call(arguments));
      });
      return this;
    };

    return EventManager;
  }();

  /**
   * Verbose debug for the component.
   *
   * @param  {...any} args The arguments passed to the method
   * @return {void}
   */
  function debug(instance) {
    return instance.$options.debug ? window.console.log.apply(window, [instance.config.name].concat([].slice.call(arguments, 1))) : function () {};
  }
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
   * Call the given method while applying the given arguments.
   *
   * @param {String} method The method to call
   * @param {...any} args   The arguments to pass to the method
   */

  function callMethod(instance, method) {
    var _instance$method;

    var args = [].slice.call(arguments, 2);
    debug.apply(void 0, [instance, 'callMethod', method].concat(args)); // Prevent duplicate call of `mounted` and `destroyed`
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
   * Get a child component.
   *
   * @param  {HTMLElement}  el             The root element of the child component.
   * @param  {Base|Promise} ComponentClass A Base class or a Promise for async components.
   * @param  {Base}         parent         The parent component instance.
   * @return {Base|Promise}                A Base instance or a Promise resolving to a Base instance.
   */
  function getChild(el, ComponentClass, parent) {
    // Return existing instance if it exists
    if (el.__base__) {
      return el.__base__;
    } // Return a new instance if the component class is a child of the Base class


    if (ComponentClass.__isBase__) {
      Object.defineProperty(ComponentClass.prototype, '__isChild__', {
        value: true
      });
      var child = new ComponentClass(el);
      Object.defineProperty(child, '$parent', {
        get: function get() {
          return parent;
        }
      });
      return child;
    } // Resolve async components


    var asyncComponent = ComponentClass().then(function (module) {
      return getChild(el, module.default ? module.default : module, parent);
    });
    asyncComponent.__isAsync__ = true;
    return asyncComponent;
  }
  /**
   * Get a list of elements based on the name of a component.
   * @param  {String}             nameOrSelector The name or selector to used for this component.
   * @param  {HTMLElement}        element        The root element on which to query the selector, defaults to `document`.
   * @return {Array<HTMLElement>}                A list of elements on which the component should be mounted.
   */


  function getComponentElements(nameOrSelector, element) {
    if (element === void 0) {
      element = document;
    }

    var selector = "[data-component=\"" + nameOrSelector + "\"]";
    var elements = [];

    try {
      elements = Array.from(element.querySelectorAll(selector)); // eslint-disable-next-line no-empty
    } catch (_unused) {} // If no child component found with the default selector, try a classic DOM selector


    if (elements.length === 0) {
      elements = Array.from(element.querySelectorAll(nameOrSelector));
    }

    return elements;
  }
  /**
   * Get child components.
   * @param  {Base}        instance   The component's instance.
   * @param  {HTMLElement} element    The component's root element
   * @param  {Object}      components The children components' classes
   * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
   */

  function getChildren(instance, element, components) {
    var children = Object.entries(components).reduce(function (acc, _ref) {
      var name = _ref[0],
          ComponentClass = _ref[1];
      var elements = getComponentElements(name, element);

      if (elements.length === 0) {
        return acc;
      }

      acc[name] = elements.map(function (el) {
        return getChild(el, ComponentClass, instance);
      }) // Filter out terminated children
      .filter(function (el) {
        return el !== 'terminated';
      });

      if (acc[name].length === 0) {
        delete acc[name];
      }

      return acc;
    }, {});
    instance.$emit('get:children', children);
    return children;
  }

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
  	return Array.isArray(val) ? [] : {}
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
  	return (options.clone !== false && options.isMergeableObject(value))
  		? deepmerge(emptyTarget(value), value, options)
  		: value
  }

  function defaultArrayMerge(target, source, options) {
  	return target.concat(source).map(function(element) {
  		return cloneUnlessOtherwiseSpecified(element, options)
  	})
  }

  function getMergeFunction(key, options) {
  	if (!options.customMerge) {
  		return deepmerge
  	}
  	var customMerge = options.customMerge(key);
  	return typeof customMerge === 'function' ? customMerge : deepmerge
  }

  function getEnumerableOwnPropertySymbols(target) {
  	return Object.getOwnPropertySymbols
  		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
  			return target.propertyIsEnumerable(symbol)
  		})
  		: []
  }

  function getKeys(target) {
  	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
  }

  function propertyIsOnObject(object, property) {
  	try {
  		return property in object
  	} catch(_) {
  		return false
  	}
  }

  // Protects from prototype poisoning and unexpected merging up the prototype chain.
  function propertyIsUnsafe(target, key) {
  	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
  		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
  			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
  }

  function mergeObject(target, source, options) {
  	var destination = {};
  	if (options.isMergeableObject(target)) {
  		getKeys(target).forEach(function(key) {
  			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
  		});
  	}
  	getKeys(source).forEach(function(key) {
  		if (propertyIsUnsafe(target, key)) {
  			return
  		}

  		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
  			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
  		} else {
  			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
  		}
  	});
  	return destination
  }

  function deepmerge(target, source, options) {
  	options = options || {};
  	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  	// implementations can use it. The caller may not replace it.
  	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  	var sourceIsArray = Array.isArray(source);
  	var targetIsArray = Array.isArray(target);
  	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  	if (!sourceAndTargetTypesMatch) {
  		return cloneUnlessOtherwiseSpecified(source, options)
  	} else if (sourceIsArray) {
  		return options.arrayMerge(target, source, options)
  	} else {
  		return mergeObject(target, source, options)
  	}
  }

  deepmerge.all = function deepmergeAll(array, options) {
  	if (!Array.isArray(array)) {
  		throw new Error('first argument should be an array')
  	}

  	return array.reduce(function(prev, next) {
  		return deepmerge(prev, next, options)
  	}, {})
  };

  var deepmerge_1 = deepmerge;

  var cjs = deepmerge_1;

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

    options = cjs(config, options);
    instance.$emit('get:options', options);
    return options;
  }
  /**
   * Set a component instance options.
   *
   * @param {Base}        instance   The component's instance.
   * @param {HTMLElement} element    The component's root element.
   * @param {Object}      newOptions The new options object.
   */

  function setOptions(instance, element, newOptions) {
    var options = {};

    if (element.dataset.options) {
      try {
        options = JSON.parse(element.dataset.options);
      } catch (err) {
        throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
      }
    }

    options = cjs(options, newOptions);
    element.dataset.options = JSON.stringify(options);
  }

  /**
   * A ponyfill for the CSS `:scope` selector which is not supported in IE11.
   * The following method will return an array of elements similare to the
   * `:scope ${selector}` selector.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/:scope
   * @see https://github.com/jonathantneal/element-qsa-scope
   *
   * @param  {HTMLElement} element  The element from which the scope is taken.
   * @param  {String}      selector The children selector.
   * @param  {String}      uniqId   A uniq ID to prefix the selector with.
   * @return {Array}                A list of elements.
   */
  function scopeSelectorPonyfill(element, selector, uniqId) {
    var list = [];

    try {
      list = Array.from(element.querySelectorAll(":scope " + selector));
    } catch (err) {
      var attr = "data-uniq-id";
      var scopedSelector = "[" + attr + "=\"" + uniqId + "\"] " + selector;
      element.setAttribute(attr, uniqId);
      list = Array.from(element.querySelectorAll(scopedSelector));
      element.removeAttribute(attr);
    }

    return list;
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
    var childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
    var elements = allRefs.filter(function (ref) {
      return !childrenRefs.includes(ref);
    });
    var refs = elements.reduce(function ($refs, $ref) {
      var refName = $ref.dataset.ref;
      var $realRef = $ref.__base__ ? $ref.__base__ : $ref;

      if (refName.endsWith('[]')) {
        refName = refName.replace(/\[\]$/, '');

        if (!$refs[refName]) {
          $refs[refName] = [];
        }
      }

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
   * Service abstract class
   */
  var Service = /*#__PURE__*/function () {
    /**
     * Class constructor, used to test the abstract class implementation.
     *
     * @return {Service} The current instance
     */
    function Service() {
      this.callbacks = new Map();
      this.isInit = false;
    }
    /**
     * Getter to get the services properties.
     * This getter MUST be implementer by the service extending this class.
     * @return {Object}
     */


    var _proto = Service.prototype;

    /**
     * Method to initialize the service behaviors.
     * This method MUST be implemented by the service extending this class.
     *
     * @return {Service} The current instance
     */
    _proto.init = function init() {
      throw new Error('The `init` method must be implemented.');
    }
    /**
     * Method to kill the service behaviors.
     * This method MUST be implemented by the service extending this class.
     *
     * @return {Service} The current instance
     */
    ;

    _proto.kill = function kill() {
      throw new Error('The `kill` method must be implemented.');
    }
    /**
     * Add a callback.
     *
     * @param  {String}   key      The callback's identifier
     * @param  {Function} callback The callback function
     * @return {Service}           The current instance
     */
    ;

    _proto.add = function add(key, callback) {
      if (this.has(key)) {
        throw new Error("A callback with the key `" + key + "` has already been registered.");
      } // Initialize the service when we add the first callback


      if (this.callbacks.size === 0 && !this.isInit) {
        this.init();
        this.isInit = true;
      }

      this.callbacks.set(key, callback);
      return this;
    }
    /**
     * Test if a callback with the given key has already been added.
     *
     * @param  {String}  key The identifier to test
     * @return {Boolean}     Whether or not the identifier already exists
     */
    ;

    _proto.has = function has(key) {
      return this.callbacks.has(key);
    }
    /**
     * Get the callback tied to the given key.
     *
     * @param  {String}   key The identifier to get
     * @return {Function}     The callback function
     */
    ;

    _proto.get = function get(key) {
      return this.callbacks.get(key);
    }
    /**
     * Remove the callback tied to the given key.
     *
     * @param  {String} key The identifier to remove
     * @return {Service}    The current instance
     */
    ;

    _proto.remove = function remove(key) {
      this.callbacks.delete(key); // Kill the service when we remove the last callback

      if (this.callbacks.size === 0 && this.isInit) {
        this.kill();
        this.isInit = false;
      }

      return this;
    }
    /**
     * Trigger each added callback with the given arguments.
     *
     * @param  {Array}   args All the arguments to apply to the callback
     * @return {Service}      The current instance
     */
    ;

    _proto.trigger = function trigger() {
      var _arguments = arguments;
      this.callbacks.forEach(function (callback) {
        callback.apply(void 0, [].slice.call(_arguments));
      });
      return this;
    };

    _createClass(Service, [{
      key: "props",
      get: function get() {
        throw new Error('The `props` getter must be implemented.');
      }
    }]);

    return Service;
  }();

  /**
   * Simple throttling helper that limits a
   * function to only run once every {delay}ms
   *
   * @param {Function} fn    The function to throttle
   * @param {Number}   delay The delay in ms
   */
  function throttle(fn, delay) {
    if (delay === void 0) {
      delay = 16;
    }

    var lastCall = 0;
    return function () {
      var now = new Date().getTime();

      if (now - lastCall < delay) {
        return false;
      }

      lastCall = now;
      return fn.apply(void 0, [].slice.call(arguments));
    };
  }

  /**
   * Returns a function, that, as long as it continues to be invoked,
   * will not be triggered. The function will be called after it stops
   * being called for N milliseconds.
   *
   * @param {Function} fn    The function to call
   * @param {Number}   delay The delay in ms to wait before calling the function
   */
  function debounce(fn, delay) {
    if (delay === void 0) {
      delay = 300;
    }

    var timeout;
    return function () {
      var _arguments = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(void 0, [].slice.call(_arguments));
      }, delay);
    };
  }

  /**
   * RequestAnimation frame polyfill.
   * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
   * @type {Function}
   */
  var getRaf = function getRaf() {
    return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
  };
  /**
   * Execute a callback in the next frame.
   * @param  {Function} fn The callback function to execute.
   * @return {Promise}
   */

  function nextFrame(fn) {
    if (fn === void 0) {
      fn = function fn() {};
    }

    var raf = getRaf();
    return new Promise(function (resolve) {
      raf(function () {
        return raf(function () {
          return resolve(fn());
        });
      });
    });
  }

  /**
   * Tick service
   *
   * ```
   * import { useRaf } from '@studiometa/js/services';
   * const { add, remove, props } = useRag();
   * add(id, (props) => {});
   * remove(id);
   * props();
   * ```
   */

  var Raf = /*#__PURE__*/function (_Service) {
    _inheritsLoose(Raf, _Service);

    function Raf() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Service.call.apply(_Service, [this].concat(args)) || this;
      _this.isTicking = false;
      return _this;
    }

    var _proto = Raf.prototype;

    /**
     * Start the requestAnimationFrame loop.
     *
     * @return {void}
     */
    _proto.init = function init() {
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
    }
    /**
     * Stop the requestAnimationFrame loop.
     *
     * @return {void}
     */
    ;

    _proto.kill = function kill() {
      this.isTicking = false;
    }
    /**
     * Get raf props.
     *
     * @todo Return elapsed time / index?
     * @type {Object}
     */
    ;

    _createClass(Raf, [{
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
  var useRaf = (function () {
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
  });

  /**
   * Pointer service
   *
   * ```
   * import { usePointer } from '@studiometa/js/services';
   * const { add, remove, props } = usePointer();
   * add(key, (props) => {});
   * remove(key);
   * props();
   * ```
   */

  var Pointer = /*#__PURE__*/function (_Service) {
    _inheritsLoose(Pointer, _Service);

    function Pointer() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Service.call.apply(_Service, [this].concat(args)) || this;
      _this.isDown = false;
      _this.y = window.innerHeight / 2;
      _this.yLast = window.innerHeight / 2;
      _this.x = window.innerWidth / 2;
      _this.xLast = window.innerWidth / 2;
      return _this;
    }

    var _proto = Pointer.prototype;

    /**
     * Bind the handler to the mousemove and touchmove events.
     * Bind the up and down handler to the mousedown, mouseup, touchstart and touchend events.
     *
     * @return {void}
     */
    _proto.init = function init() {
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
          add('usePointer', function () {
            _this2.trigger(_this2.props);
          });
          _this2.hasRaf = true;
        } // Reset changed flags at the end of the mousemove or touchmove event


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
    }
    /**
     * Unbind all handlers from their bounded event.
     *
     * @return {void}
     */
    ;

    _proto.kill = function kill() {
      document.removeEventListener('mousemove', this.handler);
      document.removeEventListener('touchmove', this.handler);
      document.removeEventListener('mousedown', this.downHandler);
      document.removeEventListener('touchstart', this.downHandler);
      document.removeEventListener('mouseup', this.upHandler);
      document.removeEventListener('touchend', this.upHandler);
    }
    /**
     * Handler for the pointer's down action.
     *
     * @return {void}
     */
    ;

    _proto.downHandler = function downHandler() {
      this.isDown = true;
      this.trigger(this.props);
    }
    /**
     * Handler for the pointer's up action.
     *
     * @return {void}
     */
    ;

    _proto.upHandler = function upHandler() {
      this.isDown = false;
      this.trigger(this.props);
    }
    /**
     * Update the pointer positions.
     *
     * @param  {Event} event The event object.
     * @return {void}
     */
    ;

    _proto.updateValues = function updateValues(event) {
      this.event = event;
      this.yLast = this.y;
      this.xLast = this.x; // Check pointer Y
      // We either get data from a touch event `event.touches[0].clientY` or from
      // a mouse event `event.clientY`.

      if (((event.touches || [])[0] || event || {}).clientY !== this.y) {
        this.y = ((event.touches || [])[0] || event || {}).clientY;
      } // Check pointer X
      // We either get data from a touch event `event.touches[0].clientX` or from
      // a mouse event `event.clientX`.


      if (((event.touches || [])[0] || event || {}).clientX !== this.x) {
        this.x = ((event.touches || [])[0] || event || {}).clientX;
      }
    }
    /**
     * Get the pointer props.
     *
     * @type {Object}
     */
    ;

    _createClass(Pointer, [{
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
  /**
   * Use the pointer.
   *
   * ```js
   * import usePointer from '@studiometa/js-toolkit/services';
   * const { add, remove, props } = usePointer();
   * add('id', () => {});
   * remove('id');
   * props();
   * ```
   */

  var usePointer = (function () {
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
  });

  /**
   * Resize service
   *
   * ```
   * import { useResize } from '@studiometa/js/services';
   * const { add, remove, props } = useResize();
   * add(key, (props) => {});
   * remove(key);
   * props();
   * ```
   */

  var Resize = /*#__PURE__*/function (_Service) {
    _inheritsLoose(Resize, _Service);

    function Resize() {
      return _Service.apply(this, arguments) || this;
    }

    var _proto = Resize.prototype;

    /**
     * Bind the handler to the resize event.
     *
     * @return {void}
     */
    _proto.init = function init() {
      var _this = this;

      this.handler = debounce(function () {
        _this.trigger(_this.props);
      }).bind(this);

      if (this.canUseResizeObserver) {
        this.resizeObserver = new ResizeObserver(this.handler);
        this.resizeObserver.observe(document.documentElement);
      } else {
        window.addEventListener('resize', this.handler);
      }
    }
    /**
     * Unbind the handler from the resize event.
     *
     * @return {void}
     */
    ;

    _proto.kill = function kill() {
      if (this.canUseResizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', this.handler);
      }

      delete this.resizeObserver;
    }
    /**
     * Get resize props.
     *
     * @type {Object}
     */
    ;

    _createClass(Resize, [{
      key: "props",
      get: function get() {
        var props = {
          width: window.innerWidth,
          height: window.innerHeight,
          ratio: window.innerWidth / window.innerHeight,
          orientation: 'square'
        };

        if (props.ratio > 1) {
          props.orientation = 'landscape';
        }

        if (props.ratio < 1) {
          props.orientation = 'portrait';
        }

        if (this.breakpointElement) {
          props.breakpoint = this.breakpoint;
          props.breakpoints = this.breakpoints;
        }

        return props;
      }
      /**
       * The element holding the breakpoints data.
       * @return {HTMLElement}
       */

    }, {
      key: "breakpointElement",
      get: function get() {
        return document.querySelector('[data-breakpoint]') || null;
      }
      /**
       * Get the current breakpoint.
       * @return {String}
       */

    }, {
      key: "breakpoint",
      get: function get() {
        return window.getComputedStyle(this.breakpointElement, '::before').getPropertyValue('content').replace(/"/g, '');
      }
      /**
       * Get all breakpoints.
       * @return {Array}
       */

    }, {
      key: "breakpoints",
      get: function get() {
        var breakpoints = window.getComputedStyle(this.breakpointElement, '::after').getPropertyValue('content').replace(/"/g, '');
        return breakpoints.split(',');
      }
      /**
       * Test if we can use the `ResizeObserver` API.
       * @return {Boolean}
       */

    }, {
      key: "canUseResizeObserver",
      get: function get() {
        return typeof window.ResizeObserver !== 'undefined';
      }
    }]);

    return Resize;
  }(Service);

  var resize = null;
  var useResize = (function () {
    if (!resize) {
      resize = new Resize();
    }

    var add = resize.add.bind(resize);
    var remove = resize.remove.bind(resize);
    var has = resize.has.bind(resize);

    var props = function props() {
      return resize.props;
    };

    return {
      add: add,
      remove: remove,
      has: has,
      props: props
    };
  });

  /**
   * Scroll service
   *
   * ```
   * import { useScroll } from '@studiometa/js-toolkit/services';
   * const { add, remove, props } = useScroll();
   * add(key, (props) => {});
   * remove(key);
   * props();
   * ```
   */

  var Scroll = /*#__PURE__*/function (_Service) {
    _inheritsLoose(Scroll, _Service);

    function Scroll() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Service.call.apply(_Service, [this].concat(args)) || this;
      _this.y = window.pageYOffset;
      _this.yLast = window.pageYOffset;
      _this.x = window.pageXOffset;
      _this.xLast = window.pageXOffset;
      return _this;
    }

    var _proto = Scroll.prototype;

    /**
     * Bind the handler to the scroll event.
     *
     * @return {void}
     */
    _proto.init = function init() {
      var _this2 = this;

      var debounced = debounce(function () {
        _this2.trigger(_this2.props);

        nextFrame(function () {
          _this2.trigger(_this2.props);
        });
      }, 50);
      this.handler = throttle(function () {
        _this2.trigger(_this2.props); // Reset changed flags at the end of the scroll event


        debounced();
      }, 32).bind(this); // Fire the `scrolled` method on document scroll

      document.addEventListener('scroll', this.handler, {
        passive: true
      });
    }
    /**
     * Unbind the handler from the scroll event.
     *
     * @return {void}
     */
    ;

    _proto.kill = function kill() {
      document.removeEventListener('scroll', this.handler);
    }
    /**
     * Get scroll props.
     *
     * @type {Object}
     */
    ;

    _createClass(Scroll, [{
      key: "props",
      get: function get() {
        this.yLast = this.y;
        this.xLast = this.x; // Check scroll Y

        if (window.pageYOffset !== this.y) {
          this.y = window.pageYOffset;
        } // Check scroll x


        if (window.pageXOffset !== this.x) {
          this.x = window.pageXOffset;
        }

        return {
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
            x: this.max.x === 0 ? 1 : this.x / this.max.x,
            y: this.max.y === 0 ? 1 : this.y / this.max.y
          },
          max: this.max
        };
      }
      /**
       * Get scroll max values.
       *
       * @type {Object}
       */

    }, {
      key: "max",
      get: function get() {
        return {
          x: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
          y: (document.scrollingElement || document.body).scrollHeight - window.innerHeight
        };
      }
    }]);

    return Scroll;
  }(Service);

  var scroll = null;
  var useScroll = (function () {
    if (!scroll) {
      scroll = new Scroll();
    }

    var add = scroll.add.bind(scroll);
    var remove = scroll.remove.bind(scroll);
    var has = scroll.has.bind(scroll);

    var props = function props() {
      return scroll.props;
    };

    return {
      add: add,
      remove: remove,
      has: has,
      props: props
    };
  });

  var keyCodes = {
    ENTER: 13,
    SPACE: 32,
    TAB: 9,
    ESC: 27,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };

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
    _inheritsLoose(Key, _Service);

    function Key() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Service.call.apply(_Service, [this].concat(args)) || this;
      _this.event = {};
      _this.triggered = 0;
      _this.previousEvent = {};
      return _this;
    }

    var _proto = Key.prototype;

    /**
     * Bind the handler to the keyboard event.
     *
     * @return {void}
     */
    _proto.init = function init() {
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
    ;

    _proto.kill = function kill() {
      document.removeEventListener('keydown', this.handler);
      document.removeEventListener('keyup', this.handler);
    }
    /**
     * Get keyboard props.
     *
     * @type {Object}
     */
    ;

    _createClass(Key, [{
      key: "props",
      get: function get() {
        var _this3 = this;

        var keys = Object.entries(keyCodes).reduce(function (acc, _ref) {
          var name = _ref[0],
              code = _ref[1];
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
        return _extends({
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
  var useKey = (function () {
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
      callMethod.apply(void 0, [instance, method].concat([].slice.call(arguments)));
    });
    return function () {
      return remove(instance.$id);
    };
  }
  /**
   * Use the services.
   * @param  {Base} instance A Base class instance.
   * @return {Array}         A list of unbind methods.
   */


  function bindServices(instance) {
    var unbindMethods = [initService(instance, 'scrolled', useScroll), initService(instance, 'resized', useResize), initService(instance, 'ticked', useRaf), initService(instance, 'moved', usePointer), initService(instance, 'keyed', useKey)]; // Fire the `loaded` method on window load
    // @todo remove this? or move it elsewhere?

    if (hasMethod(instance, 'loaded')) {
      var loadedHandler = function loadedHandler(event) {
        callMethod(instance, 'loaded', {
          event: event
        });
      };

      window.addEventListener('load', loadedHandler);
      unbindMethods.push(function () {
        window.removeEventListener('load', loadedHandler);
      });
    }

    return unbindMethods;
  }

  /**
   * Bind event handler methods to the root HTML element.
   *
   * @param  {Base}  instance     A Base instance.
   * @param  {Array} eventMethods A list of methods to bind.
   * @return {Array}              A list of unbind functions.
   */

  function bindRootEvents(instance, eventMethods) {
    return eventMethods.map(function (eventMethod) {
      var eventName = eventMethod.replace(/^on/, '').toLowerCase();

      var handler = function handler() {
        var args = [].slice.call(arguments);
        debug.apply(void 0, [instance, eventMethod, instance.$el].concat(args));
        instance[eventMethod].apply(instance, args);
      };

      instance.$el.addEventListener(eventName, handler);
      return function () {
        instance.$el.removeEventListener(eventName, handler);
      };
    });
  }
  /**
   * Bind event handler methods to refs HTML element.
   *
   * @param  {Base}  instance     A Base instance.
   * @param  {Array} eventMethods A list of methods to bind.
   * @return {Array}              A list of unbind functions.
   */


  function bindRefsEvents(instance, eventMethods) {
    var unbindMethods = [];
    Object.entries(instance.$refs).forEach(function (_ref) {
      var refName = _ref[0],
          $refOrRefs = _ref[1];
      var $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
      var refEventMethod = "on" + refName.replace(/^\w/, function (c) {
        return c.toUpperCase();
      });
      eventMethods.filter(function (eventMethod) {
        return eventMethod.startsWith(refEventMethod);
      }).forEach(function (eventMethod) {
        $refs.forEach(function ($ref, index) {
          var eventName = eventMethod.replace(refEventMethod, '').toLowerCase();

          var handler = function handler() {
            var args = [].slice.call(arguments);
            debug.apply(void 0, [instance, eventMethod, $ref].concat(args, [index]));
            instance[eventMethod].apply(instance, args.concat([index]));
          };

          debug(instance, 'binding ref event', refName, eventName);

          if ($ref.constructor && $ref.constructor.__isBase__) {
            // eslint-disable-next-line no-param-reassign
            $ref = $ref.$el;
          }

          $ref.addEventListener(eventName, handler);

          var unbindMethod = function unbindMethod() {
            debug(instance, 'unbinding ref event', eventMethods);
            $ref.removeEventListener(eventName, handler);
          };

          unbindMethods.push(unbindMethod);
        });
      });
    });
    return unbindMethods;
  }
  /**
   * Bind event handler methods to children Base instance.
   * @param  {Base}  instance     A Base instance.
   * @param  {Array} eventMethods A list of methods to bind.
   * @return {Array}              A list of unbind functions.
   */


  function bindChildrenEvents(instance, eventMethods) {
    var unbindMethods = [];
    Object.entries(instance.$children).forEach(function (_ref2) {
      var childName = _ref2[0],
          $children = _ref2[1];
      var childEventMethod = "on" + childName.replace(/^\w/, function (c) {
        return c.toUpperCase();
      });
      eventMethods.filter(function (eventMethod) {
        return eventMethod.startsWith(childEventMethod);
      }).forEach(function (eventMethod) {
        $children.forEach(function ($child, index) {
          var eventName = eventMethod.replace(childEventMethod, '').toLowerCase();

          var handler = function handler() {
            var args = [].slice.call(arguments);
            debug.apply(void 0, [instance, eventMethod, $child].concat(args, [index]));
            instance[eventMethod].apply(instance, args.concat([index]));
          };

          debug(instance, 'binding child event', childName, eventName);
          var unbindMethod = $child.$on(eventName, handler);
          unbindMethods.push(function () {
            debug(instance, 'unbinding child event', childName, eventName);
            unbindMethod();
          });
        });
      });
    });
    return unbindMethods;
  }
  /**
   * Bind ref and children component's events to their corresponding method.
   *
   * @param  {Base} instance  A Base instance.
   * @return {Array}          A list of methods to unbind the events.
   */


  function bindEvents(instance) {
    var ROOT_EVENT_REGEX = /^on[A-Z][a-z]+$/;
    var REFS_CHILDREN_EVENT_REGEX = /^on([A-Z][a-z]+)([A-Z][a-z]+)+$/; // Get all event methods

    var eventMethods = getAllProperties(instance).reduce(function (acc, _ref3) {
      var name = _ref3[0];

      // Testing camelCase with one word: onEvent.
      if (ROOT_EVENT_REGEX.test(name)) {
        acc.root.push(name);
        return acc;
      } // Testing camelCase with more than two words: onRefEvent.


      if (REFS_CHILDREN_EVENT_REGEX.test(name)) {
        acc.refsOrChildren.push(name);
      }

      return acc;
    }, {
      root: [],
      refsOrChildren: []
    });
    var unbindMethods = [].concat(bindRootEvents(instance, eventMethods.root), bindRefsEvents(instance, eventMethods.refsOrChildren), bindChildrenEvents(instance, eventMethods.refsOrChildren));
    return unbindMethods;
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
    _inheritsLoose(Base, _EventManager);

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

      _this = _EventManager.call(this) || this;

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
          value: _this.config.name + "-" + nonSecure()
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
        exclude: ['$mount', '$update', '$destroy', '$terminate', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'].concat(_this._excludeFromAutoBind || [])
      });
      var unbindMethods = [];

      _this.$on('mounted', function () {
        mountComponents(_assertThisInitialized(_this));
        unbindMethods = [].concat(bindServices(_assertThisInitialized(_this)), bindEvents(_assertThisInitialized(_this)));
        _this.$isMounted = true;
      });

      _this.$on('updated', function () {
        unbindMethods.forEach(function (method) {
          return method();
        });
        mountComponents(_assertThisInitialized(_this));
        unbindMethods = [].concat(bindServices(_assertThisInitialized(_this)), bindEvents(_assertThisInitialized(_this)));
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
      return _assertThisInitialized(_this) || _assertThisInitialized(_this);
    }
    /**
     * Small helper to log stuff.
     *
     * @param  {...any} args The arguments passed to the method
     * @return {void}
     */


    var _proto = Base.prototype;

    _proto.$log = function $log() {
      return this.$options.log ? window.console.log.apply(window, [this.config.name].concat([].slice.call(arguments))) : function () {};
    }
    /**
     * Trigger the `mounted` callback.
     */
    ;

    _proto.$mount = function $mount() {
      debug(this, '$mount');
      callMethod(this, 'mounted');
      return this;
    }
    /**
     * Update the instance children.
     */
    ;

    _proto.$update = function $update() {
      debug(this, '$update');
      callMethod(this, 'updated');
      return this;
    }
    /**
     * Trigger the `destroyed` callback.
     */
    ;

    _proto.$destroy = function $destroy() {
      debug(this, '$destroy');
      callMethod(this, 'destroyed');
      return this;
    }
    /**
     * Terminate a child instance when it is not needed anymore.
     * @return {void}
     */
    ;

    _proto.$terminate = function $terminate() {
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
    /**
     * Factory method to generate multiple instance of the class.
     *
     * @param  {String}      selector The selector on which to mount each instance.
     * @return {Array<Base>}          A list of the created instance.
     */
    ;

    Base.$factory = function $factory(nameOrSelector) {
      var _this2 = this;

      if (!nameOrSelector) {
        throw new Error('The $factory method requires a component’s name or selector to be specified.');
      }

      return getComponentElements(nameOrSelector).map(function (el) {
        return new _this2(el);
      });
    };

    return Base;
  }(EventManager);
  Base.__isBase__ = true;

  /**
   * Define a component without a class.
   *
   * @param  {Object} options The component's object
   * @return {Base}           A component's class.
   */

  function defineComponent(options) {
    var config = options.config,
        methods = options.methods,
        hooks = _objectWithoutPropertiesLoose(options, ["config", "methods"]);

    if (!config) {
      throw new Error('The `config` property is required.');
    }

    if (!config.name) {
      throw new Error('The `config.name` property is required.');
    }
    /**
     * Component class.
     */


    var Component = /*#__PURE__*/function (_Base) {
      _inheritsLoose(Component, _Base);

      function Component() {
        return _Base.apply(this, arguments) || this;
      }

      _createClass(Component, [{
        key: "config",

        /**
         * Component config.
         */
        get: function get() {
          return config;
        }
      }]);

      return Component;
    }(Base);

    var allowedHooks = ['mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
    var filteredHooks = Object.entries(hooks).reduce(function (acc, _ref) {
      var name = _ref[0],
          fn = _ref[1];

      if (allowedHooks.includes(name)) {
        acc[name] = fn;
      } else {
        throw new Error("\n          The \"" + name + "\" method is not a Base lifecycle hook,\n          it should be placed in the \"method\" property.\n          The following hooks are available: " + allowedHooks.join(', ') + "\n        ");
      }

      return acc;
    }, {});
    [].concat(Object.entries(methods || {}), Object.entries(filteredHooks)).forEach(function (_ref2) {
      var name = _ref2[0],
          fn = _ref2[1];
      Component.prototype[name] = fn;
    });
    return Component;
  }
  /**
   * Create a Base instance with the given object configuration.
   * @param {HTMLElement|String} elementOrSelector The instance root HTML element.
   * @param {Object}             options           The Base class configuration.
   */

  function createBase(elementOrSelector, options) {
    var Component = defineComponent(options);
    var element = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
    return new Component(element);
  }

  exports.createBase = createBase;
  exports.default = Base;
  exports.defineComponent = defineComponent;

})));
//# sourceMappingURL=index.umd.js.map
