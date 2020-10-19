(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.JsToolkit = {}));
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
     * @param  {String}   listener Function to be called.
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
     * @param  {String}       listener Function to be removed.
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
      var ResolvedClass = module.default ? module.default : module;
      Object.defineProperty(ResolvedClass.prototype, '__isChild__', {
        value: true
      });
      var child = new ResolvedClass(el);
      Object.defineProperty(child, '$parent', {
        get: function get() {
          return parent;
        }
      });
      return child;
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
    var elements = Array.from(element.querySelectorAll(selector)); // If no child component found with the default selector, try a classic DOM selector

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



  var index = {
    __proto__: null,
    Base: Base,
    EventManager: EventManager,
    Service: Service
  };

  /**
   * Test if the given value is an object.
   *
   * @param  {*}       value The value to test.
   * @return {Boolean}       Whether or not the value is an object.
   */
  function isObject(value) {
    return typeof value === 'object' && !!value && value.toString() === '[object Object]';
  }

  /**
   * Manage a list of style properties on an element.
   *
   * @param {HTMLElement}         element The element to update.
   * @param {CSSStyleDeclaration} styles  An object of styles properties and values.
   * @param {String}              method  The method to use: add or remove.
   */

  function setStyles(element, styles, method) {
    if (method === void 0) {
      method = 'add';
    }

    if (!element || !styles || !isObject(styles)) {
      return;
    }

    Object.entries(styles).forEach(function (_ref) {
      var prop = _ref[0],
          value = _ref[1];
      element.style[prop] = method === 'add' ? value : '';
    });
  }
  /**
   * Add class names to an element.
   *
   * @param {HTMLElement} element    The element to update.
   * @param {String}      classNames A string of class names.
   * @return {void}
   */

  function add(element, classNames) {
    setStyles(element, classNames);
  }
  /**
   * Remove class names from an element.
   *
   * @param  {HTMLElement} element    The element to update.
   * @param  {String}      classNames A string of class names.
   * @return {void}
   */

  function remove(element, classNames) {
    setStyles(element, classNames, 'remove');
  }

  var styles = {
    __proto__: null,
    'default': setStyles,
    add: add,
    remove: remove
  };

  /**
   * Manage a list of classes as string on an element.
   *
   * @param {HTMLElement} element    The element to update.
   * @param {String}      classNames A string of class names.
   * @param {String}      method     The method to use: add, remove or toggle.
   */
  function setClasses(element, classNames, method) {
    if (method === void 0) {
      method = 'add';
    }

    if (!element || !classNames) {
      return;
    }

    classNames.split(' ').forEach(function (className) {
      element.classList[method](className);
    });
  }
  /**
   * Add class names to an element.
   *
   * @param {HTMLElement} element    The element to update.
   * @param {String}      classNames A string of class names.
   * @return {void}
   */


  function add$1(element, classNames) {
    setClasses(element, classNames);
  }
  /**
   * Remove class names from an element.
   *
   * @param  {HTMLElement} element    The element to update.
   * @param  {String}      classNames A string of class names.
   * @return {void}
   */

  function remove$1(element, classNames) {
    setClasses(element, classNames, 'remove');
  }
  /**
   * Toggle class names from an element.
   *
   * @param  {HTMLElement} element    The element to update.
   * @param  {String}      classNames A string of class names.
   * @return {void}
   */

  function toggle(element, classNames) {
    setClasses(element, classNames, 'toggle');
  }

  var classes = {
    __proto__: null,
    add: add$1,
    remove: remove$1,
    toggle: toggle
  };

  /**
   * Update either the classes or the styles of an element with the given method.
   *
   * @param {HTMLElement}   element         The element to update.
   * @param {String|Object} classesOrStyles The classes or styles to apply.
   * @param {String}        method          The method to use, one of `add` or `remove`.
   */

  /**
   * Manage CSS transition with class.
   *
   * This is heavily inspired by the Vue `<transition>` component
   * and the `@barba/css` package, many thanks to them!
   *
   * @param  {HTMLElement}   element The target element.
   * @param  {String|Object} name    The name of the transition or an object with the hooks classesOrStyles.
   * @param  {String}        endMode    Whether to remove or keep the `to` classes/styles
   * @return {Promise}               A promise resolving at the end of the transition.
   */
  var transition = function transition(element, name, endMode) {
    try {
      if (endMode === void 0) {
        endMode = 'remove';
      }

      var classesOrStyles = typeof name === 'string' ? {
        from: name + "-from",
        active: name + "-active",
        to: name + "-to"
      } : _extends({
        from: '',
        active: '',
        to: ''
      }, name); // End any previous transition running on the element.

      if (element.__isTransitioning__) {
        end(element, classesOrStyles);
      }

      return Promise.resolve(start(element, classesOrStyles)).then(function () {
        return Promise.resolve(next(element, classesOrStyles)).then(function () {
          end(element, classesOrStyles, endMode);
          return Promise.resolve();
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Apply the active state.
   *
   * @param {HTMLElement}   element         The target element.
   * @param {String|Object} classesOrStyles The classes or styles definition.
   * @return {Promise}
   */
  var next = function next(element, classesOrStyles) {
    try {
      var hasTransition = testTransition(element);
      /* eslint-disable-next-line */

      return Promise.resolve(new Promise(function (resolve) {
        try {
          if (hasTransition) {
            element.__transitionEndHandler__ = resolve;
            element.addEventListener('transitionend', element.__transitionEndHandler__, false);
          }

          setClassesOrStyles(element, classesOrStyles.from, 'remove');
          setClassesOrStyles(element, classesOrStyles.to);
          return Promise.resolve(nextFrame()).then(function () {
            if (!hasTransition) {
              resolve();
            }
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Apply the final state.
   *
   * @param {HTMLElement}   element         The target element.
   * @param {String|Object} classesOrStyles The classes or styles definition.
   * @param {String}        mode            Whether to remove or keep the `to`  classes/styles.
   * @return {void}
   */


  /**
   * Apply the from state.
   *
   * @param {HTMLElement}   element         The target element.
   * @param {String|Object} classesOrStyles The classes or styles definition.
   * @return {Promise}
   */
  var start = function start(element, classesOrStyles) {
    try {
      element.__isTransitioning__ = true;
      setClassesOrStyles(element, classesOrStyles.from);
      return Promise.resolve(nextFrame()).then(function () {
        setClassesOrStyles(element, classesOrStyles.active);
        return Promise.resolve(nextFrame()).then(function () {});
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  function setClassesOrStyles(element, classesOrStyles, method) {
    if (method === void 0) {
      method = 'add';
    }

    if (typeof classesOrStyles === 'string') {
      classes[method](element, classesOrStyles, method);
    } else {
      styles[method](element, classesOrStyles, method);
    }
  }
  /**
   * Test if the given element has a transition duration.
   *
   * @param  {HTMLElement} element The element to test.
   * @return {Boolean}             The result of the test.
   */

  function testTransition(element) {
    if (typeof window === 'undefined') {
      return false;
    }

    var _window$getComputedSt = window.getComputedStyle(element),
        transitionDuration = _window$getComputedSt.transitionDuration;

    return !!transitionDuration && transitionDuration !== '0s';
  }

  function end(element, classesOrStyles, mode) {
    if (mode === void 0) {
      mode = 'remove';
    }

    element.removeEventListener('transitionend', element.__transitionEndHandler__, false);

    if (mode === 'remove') {
      setClassesOrStyles(element, classesOrStyles.to, 'remove');
    }

    setClassesOrStyles(element, classesOrStyles.active, 'remove');
    delete element.__isTransitioning__;
    delete element.__transitionEndHandler__;
  }

  /**
   * AccordionItem class.
   */

  var AccordionItem = /*#__PURE__*/function (_Base) {
    _inheritsLoose(AccordionItem, _Base);

    function AccordionItem() {
      return _Base.apply(this, arguments) || this;
    }

    var _proto = AccordionItem.prototype;

    /**
     * Add aria-attributes on mounted.
     * @return {void}
     */
    _proto.mounted = function mounted() {
      var _this = this;

      if (this.$parent && this.$parent.$options.item) {
        this.$options = this.$parent.$options.item;
      }

      this.$refs.btn.setAttribute('id', this.$id);
      this.$refs.btn.setAttribute('aria-controls', this.contentId);
      this.$refs.content.setAttribute('aria-labelledby', this.$id);
      this.$refs.content.setAttribute('id', this.contentId);
      this.isOpen = this.$options.isOpen;
      this.updateAttributes(this.isOpen);

      if (!this.isOpen) {
        add(this.$refs.container, {
          visibility: 'invisible',
          height: 0
        });
      } // Update refs styles on mount


      var _this$$options$styles = this.$options.styles,
          otherStyles = _objectWithoutPropertiesLoose(_this$$options$styles, ["container"]);

      Object.entries(otherStyles).filter(function (_ref) {
        var refName = _ref[0];
        return _this.$refs[refName];
      }).forEach(function (_ref2) {
        var refName = _ref2[0],
            _ref2$ = _ref2[1];
        _ref2$ = _ref2$ === void 0 ? {} : _ref2$;
        var open = _ref2$.open,
            closed = _ref2$.closed;
        transition(_this.$refs[refName], {
          to: _this.isOpen ? open : closed
        }, 'keep');
      });
    }
    /**
     * Handler for the click event on the `btn` ref.
     * @return {void}
     */
    ;

    _proto.onBtnClick = function onBtnClick() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    /**
     * Get the content ID.
     * @return {String}
     */
    ;

    /**
     * Update the refs' attributes according to the given type.
     *
     * @param  {Boolean} isOpen The state of the item.
     * @return {void}
     */
    _proto.updateAttributes = function updateAttributes(isOpen) {
      this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    /**
     * Open an item.
     * @return {void}
     */
    ;

    _proto.open = function open() {
      try {
        var _this3 = this;

        if (_this3.isOpen) {
          return Promise.resolve();
        }

        _this3.$log('open');

        _this3.$emit('open');

        _this3.isOpen = true;

        _this3.updateAttributes(_this3.isOpen);

        remove(_this3.$refs.container, {
          visibility: 'invisible'
        });

        var _this3$$options$style = _this3.$options.styles,
            container = _this3$$options$style.container,
            otherStyles = _objectWithoutPropertiesLoose(_this3$$options$style, ["container"]);

        return Promise.resolve(Promise.all([transition(_this3.$refs.container, {
          from: {
            height: 0
          },
          active: container.active,
          to: {
            height: _this3.$refs.content.offsetHeight + "px"
          }
        }).then(function () {
          // Remove style only if the item has not been closed before the end
          if (_this3.isOpen) {
            remove(_this3.$refs.content, {
              position: 'absolute'
            });
          }

          return Promise.resolve();
        })].concat(Object.entries(otherStyles).filter(function (_ref3) {
          var refName = _ref3[0];
          return _this3.$refs[refName];
        }).map(function (_ref4) {
          var refName = _ref4[0],
              _ref4$ = _ref4[1];
          _ref4$ = _ref4$ === void 0 ? {} : _ref4$;
          var open = _ref4$.open,
              active = _ref4$.active,
              closed = _ref4$.closed;
          return transition(_this3.$refs[refName], {
            from: closed,
            active: active,
            to: open
          }, 'keep');
        })))).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Close an item.
     * @return {void}
     */
    ;

    _proto.close = function close() {
      try {
        var _this5 = this;

        if (!_this5.isOpen) {
          return Promise.resolve();
        }

        _this5.$log('close');

        _this5.$emit('close');

        _this5.isOpen = false;
        var height = _this5.$refs.container.offsetHeight;
        add(_this5.$refs.content, {
          position: 'absolute'
        });

        var _this5$$options$style = _this5.$options.styles,
            container = _this5$$options$style.container,
            otherStyles = _objectWithoutPropertiesLoose(_this5$$options$style, ["container"]);

        return Promise.resolve(Promise.all([transition(_this5.$refs.container, {
          from: {
            height: height + "px"
          },
          active: container.active,
          to: {
            height: 0
          }
        }).then(function () {
          // Add end styles only if the item has not been re-opened before the end
          if (!_this5.isOpen) {
            add(_this5.$refs.container, {
              height: 0,
              visibility: 'invisible'
            });

            _this5.updateAttributes(_this5.isOpen);
          }

          return Promise.resolve();
        })].concat(Object.entries(otherStyles).filter(function (_ref5) {
          var refName = _ref5[0];
          return _this5.$refs[refName];
        }).map(function (_ref6) {
          var refName = _ref6[0],
              _ref6$ = _ref6[1];
          _ref6$ = _ref6$ === void 0 ? {} : _ref6$;
          var open = _ref6$.open,
              active = _ref6$.active,
              closed = _ref6$.closed;
          return transition(_this5.$refs[refName], {
            from: open,
            active: active,
            to: closed
          }, 'keep');
        })))).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _createClass(AccordionItem, [{
      key: "config",

      /**
       * AccordionItem config
       * @return {Object}
       */
      get: function get() {
        return {
          name: 'AccordionItem',
          isOpen: false,
          styles: {
            container: {
              open: '',
              active: '',
              closed: ''
            }
          }
        };
      }
    }, {
      key: "contentId",
      get: function get() {
        return "content-" + this.$id;
      }
    }]);

    return AccordionItem;
  }(Base);

  /**
   * Accordion class.
   */

  var Accordion = /*#__PURE__*/function (_Base) {
    _inheritsLoose(Accordion, _Base);

    function Accordion() {
      return _Base.apply(this, arguments) || this;
    }

    var _proto = Accordion.prototype;

    /**
     * Init autoclose behavior on mounted.
     * @return {void}
     */
    _proto.mounted = function mounted() {
      var _this = this;

      this.unbindMethods = this.$children.AccordionItem.map(function (item, index) {
        var unbindOpen = item.$on('open', function () {
          _this.$emit('open', item, index);

          if (_this.$options.autoclose) {
            _this.$children.AccordionItem.filter(function (el, i) {
              return index !== i;
            }).forEach(function (it) {
              return it.close();
            });
          }
        });
        var unbindClose = item.$on('close', function () {
          _this.$emit('close', item, index);
        });
        return function () {
          unbindOpen();
          unbindClose();
        };
      });
    }
    /**
     * Destroy autoclose behavior on destroyed.
     * @return {void}
     */
    ;

    _proto.destroyed = function destroyed() {
      this.unbindMethods.forEach(function (unbind) {
        return unbind();
      });
    };

    _createClass(Accordion, [{
      key: "config",

      /**
       * Accordion config.
       * @return {Object}
       */
      get: function get() {
        return {
          name: 'Accordion',
          autoclose: true,
          item: null,
          components: {
            AccordionItem: AccordionItem
          }
        };
      }
    }]);

    return Accordion;
  }(Base);

  /**
   * MediaQuery component.
   *
   * <div data-component="MediaQuery" data-active-breakpoints="l xl">
   *   <div data-component="Foo"></div>
   * </div>
   */

  var MediaQuery = /*#__PURE__*/function (_Base) {
    _inheritsLoose(MediaQuery, _Base);

    function MediaQuery() {
      return _Base.apply(this, arguments) || this;
    }

    var _proto = MediaQuery.prototype;

    /**
     * Mounted hook.
     */
    _proto.mounted = function mounted() {
      var _this = this;

      this.test();
      nextFrame(function () {
        return _this.test();
      });
    }
    /**
     * Resized hook.
     */
    ;

    _proto.resized = function resized() {
      this.test();
    }
    /**
     * Get the first element child of the component, as it must be another Base component that could
     * be either $mounted or $destroyed.
     *
     * @return {Base|Boolean}
     */
    ;

    /**
     * Test if the child component should be either $mounted or $destroyed based on the current active
     * breakpoint and the given list of breakpoints.
     *
     * @return {void}
     */
    _proto.test = function test() {
      var isInBreakpoints = this.activeBreakpoints.includes(this.currentBreakpoint);

      if (isInBreakpoints && !this.child.$isMounted) {
        this.child.$mount();
        return;
      }

      if (!isInBreakpoints && this.child.$isMounted) {
        this.child.$destroy();
      }
    };

    _createClass(MediaQuery, [{
      key: "config",

      /**
       * Component's configuration.
       *
       * @return {Object}
       */
      get: function get() {
        return {
          name: 'MediaQuery'
        };
      }
    }, {
      key: "child",
      get: function get() {
        var child = this.$el.firstElementChild ? this.$el.firstElementChild.__base__ : false;

        if (!child) {
          throw new Error('The first and only child of the MediaQuery component must be another Base component.');
        }

        return child;
      }
      /**
       * Get the current active breakpoint from the `useResize` service.
       *
       * @return {String}
       */

    }, {
      key: "currentBreakpoint",
      get: function get() {
        return useResize().props().breakpoint;
      }
      /**
       * Get a list of breakpoints in which the child component should be $mounted.
       *
       * @return {Array}
       */

    }, {
      key: "activeBreakpoints",
      get: function get() {
        if (this.$el.dataset.activeBreakpoints) {
          return this.$el.dataset.activeBreakpoints.split(' ');
        }

        return [];
      }
    }]);

    return MediaQuery;
  }(Base);

  var FOCUSABLE_ELEMENTS = ['a[href]:not([tabindex^="-"]):not([inert])', 'area[href]:not([tabindex^="-"]):not([inert])', 'input:not([disabled]):not([inert])', 'select:not([disabled]):not([inert])', 'textarea:not([disabled]):not([inert])', 'button:not([disabled]):not([inert])', 'iframe:not([tabindex^="-"]):not([inert])', 'audio:not([tabindex^="-"]):not([inert])', 'video:not([tabindex^="-"]):not([inert])', '[contenteditable]:not([tabindex^="-"]):not([inert])', '[tabindex]:not([tabindex^="-"]):not([inert])'];
  /**
   * Use a trap/untrap tabs logic.
   *
   * @return {Object} An object containing the trap and untrap methods.
   */

  function useFocusTrap() {
    var focusedBefore;
    /**
     * Save the current active element.
     *
     * @return {void}
     */

    function saveActiveElement() {
      focusedBefore = document.activeElement;
    }
    /**
     * Trap tab navigation inside the given element.
     *
     * @param  {HTMLElement} element The element in which to trap the tabulations.
     * @param  {Event}       event   The keydown or keyup event.
     * @return {void}
     */


    function trap(element, event) {
      if (event.keyCode !== keyCodes.TAB) {
        return;
      } // Save the previous focused element


      if (!focusedBefore) {
        focusedBefore = document.activeElement;
      }

      var focusableChildren = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS.join(', ')));
      var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

      if (!focusableChildren.length) {
        return;
      }

      if (focusedItemIndex < 0) {
        focusableChildren[0].focus();
        event.preventDefault();
      } // If the SHIFT key is being pressed while tabbing (moving backwards) and
      // the currently focused item is the first one, move the focus to the last
      // focusable item from the dialog element


      if (event.shiftKey && focusedItemIndex === 0) {
        focusableChildren[focusableChildren.length - 1].focus();
        event.preventDefault();
      } // If the SHIFT key is not being pressed (moving forwards) and the currently
      // focused item is the last one, move the focus to the first focusable item
      // from the dialog element
      else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
          focusableChildren[0].focus();
          event.preventDefault();
        }
    }
    /**
     * Untrap the tab navigation.
     *
     * @return {void}
     */


    function untrap() {
      if (focusedBefore && typeof focusedBefore.focus === 'function') {
        focusedBefore.focus();
        focusedBefore = null;
      }
    }

    return {
      trap: trap,
      untrap: untrap,
      saveActiveElement: saveActiveElement
    };
  }

  var _focusTrap = useFocusTrap(),
      trap = _focusTrap.trap,
      untrap = _focusTrap.untrap,
      saveActiveElement = _focusTrap.saveActiveElement;
  /**
   * Modal class.
   */


  var Modal = /*#__PURE__*/function (_Base) {
    _inheritsLoose(Modal, _Base);

    function Modal() {
      return _Base.apply(this, arguments) || this;
    }

    var _proto = Modal.prototype;

    /**
     * Initialize the component's behaviours.
     *
     * @return {Modal} The current instance.
     */
    _proto.mounted = function mounted() {
      this.isOpen = false;
      this.close();

      if (this.$options.move) {
        var target = document.querySelector(this.$options.move) || document.body;
        var refsBackup = this.$refs;
        this.refModalPlaceholder = document.createComment('');
        this.refModalParentBackup = this.$refs.modal.parentElement || this.$el;
        this.refModalParentBackup.insertBefore(this.refModalPlaceholder, this.$refs.modal);
        this.refModalUnbindGetRefFilter = this.$on('get:refs', function (refs) {
          Object.entries(refsBackup).forEach(function (_ref) {
            var key = _ref[0],
                ref = _ref[1];

            if (!refs[key]) {
              refs[key] = ref;
            }
          });
        });
        target.appendChild(this.$refs.modal);
      }

      return this;
    }
    /**
     * Unbind all events on destroy.
     *
     * @return {Modal} The Modal instance.
     */
    ;

    _proto.destroyed = function destroyed() {
      this.close();

      if (this.$options.move) {
        this.refModalParentBackup.insertBefore(this.$refs.modal, this.refModalPlaceholder);
        this.refModalUnbindGetRefFilter();
        this.refModalPlaceholder.remove();
        delete this.refModalPlaceholder;
        delete this.refModalParentBackup;
        delete this.refModalUnbindGetRefFilter;
      }

      return this;
    }
    /**
     * Close the modal on `ESC` and trap the tabulation.
     *
     * @param  {KeyboardEvent} options.event  The original keyboard event
     * @param  {Boolean}       options.isUp   Is it a keyup event?
     * @param  {Boolean}       options.isDown Is it a keydown event?
     * @param  {Boolean}       options.ESC    Is it the ESC key?
     * @return {void}
     */
    ;

    _proto.keyed = function keyed(_ref2) {
      var event = _ref2.event,
          isUp = _ref2.isUp,
          isDown = _ref2.isDown,
          ESC = _ref2.ESC;

      if (!this.isOpen) {
        return;
      }

      if (isDown) {
        trap(this.$refs.modal, event);
      }

      if (ESC && isUp) {
        this.close();
      }
    }
    /**
     * Open the modal.
     *
     * @return {Modal} The Modal instance.
     */
    ;

    _proto.open = function open() {
      try {
        var _this2 = this;

        if (_this2.isOpen) {
          return Promise.resolve(_this2);
        }

        _this2.$refs.modal.setAttribute('aria-hidden', 'false');

        document.documentElement.style.overflow = 'hidden';
        _this2.isOpen = true;

        _this2.$emit('open');

        return Promise.all(Object.entries(_this2.$options.styles).map(function (_ref3) {
          var refName = _ref3[0],
              _ref3$ = _ref3[1];
          _ref3$ = _ref3$ === void 0 ? {} : _ref3$;
          var open = _ref3$.open,
              active = _ref3$.active,
              closed = _ref3$.closed;
          return transition(_this2.$refs[refName], {
            from: closed,
            active: active,
            to: open
          }, 'keep');
        })).then(function () {
          if (_this2.$options.autofocus && _this2.$refs.modal.querySelector(_this2.$options.autofocus)) {
            saveActiveElement();

            _this2.$refs.modal.querySelector(_this2.$options.autofocus).focus();
          }

          return Promise.resolve(_this2);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Close the modal.
     *
     * @return {Modal} The Modal instance.
     */
    ;

    _proto.close = function close() {
      try {
        var _this4 = this;

        if (!_this4.isOpen) {
          return Promise.resolve(_this4);
        }

        _this4.$refs.modal.setAttribute('aria-hidden', 'true');

        document.documentElement.style.overflow = '';
        _this4.isOpen = false;
        untrap();

        _this4.$emit('close');

        return Promise.all(Object.entries(_this4.$options.styles).map(function (_ref4) {
          var refName = _ref4[0],
              _ref4$ = _ref4[1];
          _ref4$ = _ref4$ === void 0 ? {} : _ref4$;
          var open = _ref4$.open,
              active = _ref4$.active,
              closed = _ref4$.closed;
          return transition(_this4.$refs[refName], {
            from: open,
            active: active,
            to: closed
          }, 'keep');
        })).then(function () {
          return Promise.resolve(_this4);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _createClass(Modal, [{
      key: "config",

      /**
       * Modal options.
       */
      get: function get() {
        return {
          name: 'Modal',
          move: false,
          autofocus: '[autofocus]',
          styles: {
            modal: {
              closed: {
                opacity: 0,
                pointerEvents: 'none',
                visibility: 'hidden'
              }
            }
          }
        };
      }
      /**
       * Open the modal on click on the `open` ref.
       *
       * @return {Function} The component's `open` method.
       */

    }, {
      key: "onOpenClick",
      get: function get() {
        return this.open;
      }
      /**
       * Close the modal on click on the `close` ref.
       *
       * @return {Function} The component's `close` method.
       */

    }, {
      key: "onCloseClick",
      get: function get() {
        return this.close;
      }
      /**
       * Close the modal on click on the `overlay` ref.
       *
       * @return {Function} The component's `close` method.
       */

    }, {
      key: "onOverlayClick",
      get: function get() {
        return this.close;
      }
    }]);

    return Modal;
  }(Base);

  /**
   * Tabs class.
   */

  var Tabs = /*#__PURE__*/function (_Base) {
    _inheritsLoose(Tabs, _Base);

    function Tabs() {
      return _Base.apply(this, arguments) || this;
    }

    var _proto = Tabs.prototype;

    /**
     * Initialize the component's behaviours.
     *
     * @return {Tabs} The current instance.
     */
    _proto.mounted = function mounted() {
      var _this = this;

      this.items = this.$refs.btn.map(function (btn, index) {
        var id = _this.$id + "-" + index;
        var content = _this.$refs.content[index];
        btn.setAttribute('id', id);
        content.setAttribute('aria-labelledby', id);
        var item = {
          btn: btn,
          content: content,
          isEnabled: index > 0
        };

        if (index > 0) {
          _this.disableItem(item);
        } else {
          _this.enableItem(item);
        }

        return item;
      });
      return this;
    }
    /**
     * Switch tab on button click.
     *
     * @param  {Event}  event The click event object.
     * @param  {Number} index The index of the clicked button.
     * @return {void}
     */
    ;

    _proto.onBtnClick = function onBtnClick(event, index) {
      var _this2 = this;

      this.items.forEach(function (item, i) {
        if (i !== index) {
          _this2.disableItem(item);
        }
      });
      this.enableItem(this.items[index]);
    }
    /**
     * Enable the given tab and its associated content.
     *
     * @param  {HTMLElement} btn     The tab element.
     * @param  {HTMLElement} content The content element.
     * @return {Tabs}                The Tabs instance.
     */
    ;

    _proto.enableItem = function enableItem(item) {
      try {
        var _this4 = this;

        if (!item || item.isEnabled) {
          return Promise.resolve(_this4);
        }

        item.isEnabled = true;
        var btn = item.btn,
            content = item.content;
        var btnStyles = _this4.$options.styles.btn || {};
        var contentStyles = _this4.$options.styles.content || {};
        content.setAttribute('aria-hidden', 'false');

        _this4.$emit('enable', item);

        return Promise.all([transition(btn, {
          from: btnStyles.closed,
          active: btnStyles.active,
          to: btnStyles.open
        }, 'keep'), transition(content, {
          from: contentStyles.closed,
          active: contentStyles.active,
          to: contentStyles.open
        }, 'keep')]).then(function () {
          return Promise.resolve(_this4);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Disable the given tab and its associated content.
     *
     * @param  {HTMLElement} btn     The tab element.
     * @param  {HTMLElement} content The content element.
     * @return {Tabs}                The Tabs instance.
     */
    ;

    _proto.disableItem = function disableItem(item) {
      try {
        var _this6 = this;

        if (!item || !item.isEnabled) {
          return Promise.resolve(_this6);
        }

        item.isEnabled = false;
        var btn = item.btn,
            content = item.content;
        var btnStyles = _this6.$options.styles.btn || {};
        var contentStyles = _this6.$options.styles.content || {};
        content.setAttribute('aria-hidden', 'true');

        _this6.$emit('disable', item);

        return Promise.all([transition(btn, {
          from: btnStyles.open,
          active: btnStyles.active,
          to: btnStyles.closed
        }, 'keep'), transition(content, {
          from: contentStyles.open,
          active: contentStyles.active,
          to: contentStyles.closed
        }, 'keep')]).then(function () {
          return Promise.resolve(_this6);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _createClass(Tabs, [{
      key: "config",

      /**
       * Tabs options.
       */
      get: function get() {
        return {
          name: 'Tabs',
          styles: {
            content: {
              closed: {
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                visibility: 'hidden'
              }
            }
          }
        };
      }
    }]);

    return Tabs;
  }(Base);



  var index$1 = {
    __proto__: null,
    Accordion: Accordion,
    MediaQuery: MediaQuery,
    Modal: Modal,
    Tabs: Tabs
  };

  /**
   * Test the breakpoins of the given Base instance and return the hook to call.
   *
   * @param  {Base}           instance The component's instance.
   * @return {String|Boolean}          The action to call ($mount|$destroy) or false.
   */

  function testBreakpoints(breakpoints) {
    var _useResize$props = useResize().props(),
        breakpoint = _useResize$props.breakpoint;

    breakpoints.forEach(function (_ref) {
      var breakpointKeys = _ref[0],
          instance = _ref[1];

      if (breakpointKeys.includes(breakpoint)) {
        instance.$mount();
      } else {
        instance.$destroy();
      }
    });
  }
  /**
   * A cache object to hold each Base sub-instances.
   * @type {Object}
   */


  var instances = {};
  /**
   * BreakpointManager class.
   */

  var withBreakpointManager = (function (BaseClass, breakpoints) {
    if (!Array.isArray(breakpoints)) {
      throw new Error('[withBreakpointManager] The `breakpoints` parameter must be an array.');
    }

    if (breakpoints.length < 2) {
      throw new Error('[withBreakpointManager] You must define at least 2 breakpoints.');
    }

    var _useResize = useResize(),
        add = _useResize.add,
        props = _useResize.props; // Do nothing if no breakpoint has been defined.
    // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint


    if (!props().breakpoint) {
      throw new Error("The `BreakpointManager` class requires breakpoints to be defined.");
    }

    return /*#__PURE__*/function (_BaseClass) {
      _inheritsLoose(BreakpointManager, _BaseClass);

      /**
       * Watch for the document resize to test the breakpoints.
       * @param  {HTMLElement} element The component's root element.
       * @return {BreakpointManager}          The current instance.
       */
      function BreakpointManager(element) {
        var _this;

        _this = _BaseClass.call(this, element) || this;
        instances[_this.$id] = breakpoints.map(function (_ref2) {
          var bk = _ref2[0],
              ComponentClass = _ref2[1];
          // eslint-disable-next-line no-underscore-dangle
          ComponentClass.prototype.__isChild__ = true;
          var instance = new ComponentClass(_this.$el);
          Object.defineProperty(instance, '$parent', {
            get: function get() {
              return _assertThisInitialized(_this);
            }
          });
          return [bk, instance];
        });
        add("BreakpointManager-" + _this.$id, function () {
          testBreakpoints(instances[_this.$id]);
        });
        return _assertThisInitialized(_this) || _assertThisInitialized(_this);
      }
      /**
       * Override the default $mount method to prevent component's from being
       * mounted when they should not.
       * @return {Base} The Base instance.
       */


      var _proto = BreakpointManager.prototype;

      _proto.$mount = function $mount() {
        testBreakpoints(instances[this.$id]);
        return _BaseClass.prototype.$mount.call(this);
      }
      /**
       * Destroy all instances when the main one is destroyed.
       * @return {Base} The Base instance.
       */
      ;

      _proto.$destroy = function $destroy() {
        if (Array.isArray(instances[this.$id])) {
          instances[this.$id].forEach(function (_ref3) {
            var instance = _ref3[1];
            instance.$destroy();
          });
        }

        return _BaseClass.prototype.$destroy.call(this);
      };

      return BreakpointManager;
    }(BaseClass);
  });

  /**
   * Test the breakpoins of the given Base instance and return the hook to call.
   *
   * @param  {BreakpointObserver} instance The component's instance.
   * @return {Sring}                       The action to trigger.
   */

  function testBreakpoints$1(instance, breakpoint) {
    if (breakpoint === void 0) {
      breakpoint = useResize().props().breakpoint;
    }

    var _instance$$options = instance.$options,
        activeBreakpoints = _instance$$options.activeBreakpoints,
        inactiveBreakpoints = _instance$$options.inactiveBreakpoints;
    var isInActiveBreakpoint = activeBreakpoints && activeBreakpoints.split(' ').includes(breakpoint);
    var isInInactiveBreakpoint = inactiveBreakpoints && inactiveBreakpoints.split(' ').includes(breakpoint);

    if (activeBreakpoints && isInActiveBreakpoint || inactiveBreakpoints && !isInInactiveBreakpoint) {
      return '$mount';
    }

    return '$destroy';
  }
  /**
   * Test if the given instance is configured for breakpoints.
   * @param  {Base}    instance A Base class instance.
   * @return {Boolean}          True if configured correctly, false otherwise.
   */


  function hasBreakpointConfiguration(instance) {
    var _instance$$options2 = instance.$options,
        activeBreakpoints = _instance$$options2.activeBreakpoints,
        inactiveBreakpoints = _instance$$options2.inactiveBreakpoints;
    return Boolean(activeBreakpoints || inactiveBreakpoints);
  }
  /**
   * Test if the given instance has a conflicting configuration for breakpoints.
   * @param  {Base} instance A Base class instance.
   * @return {void}
   */


  function testConflictingBreakpointConfiguration(instance) {
    var _instance$$options3 = instance.$options,
        activeBreakpoints = _instance$$options3.activeBreakpoints,
        inactiveBreakpoints = _instance$$options3.inactiveBreakpoints,
        name = _instance$$options3.name;

    if (activeBreakpoints && inactiveBreakpoints) {
      throw new Error("[" + name + "] Incorrect configuration: the `activeBreakpoints` and `inactiveBreakpoints` are not compatible.");
    }
  }
  /**
   * BreakpointObserver class.
   */


  var withBreakpointObserver = (function (BaseClass) {
    return /*#__PURE__*/function (_BaseClass) {
      _inheritsLoose(BreakpointObserver, _BaseClass);

      /**
       * Watch for the document resize to test the breakpoints.
       * @param  {HTMLElement} element The component's root element.
       * @return {BreakpointObserver}          The current instance.
       */
      function BreakpointObserver(element) {
        var _this;

        _this = _BaseClass.call(this, element) || this;

        var _useResize = useResize(),
            add = _useResize.add,
            has = _useResize.has,
            remove = _useResize.remove,
            props = _useResize.props;

        var name = _this.$options.name; // Do nothing if no breakpoint has been defined.
        // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

        if (!props().breakpoint) {
          throw new Error("[" + name + "] The `BreakpointObserver` class requires breakpoints to be defined.");
        }

        var key = "BreakpointObserver-" + _this.$id; // Watch change on the `data-options` attribute to emit the `set:options` event.

        var mutationObserver = new MutationObserver(function (_ref) {
          var mutation = _ref[0];

          if (mutation.type === 'attributes' && mutation.attributeName === 'data-options') {
            // Stop here silently when no breakpoint configuration given.
            if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
              _this.$mount();

              remove(key);
              return;
            }

            testConflictingBreakpointConfiguration(_assertThisInitialized(_this));

            if (!has(key)) {
              add(key, function (_ref2) {
                var breakpoint = _ref2.breakpoint;
                var action = testBreakpoints$1(_assertThisInitialized(_this), breakpoint);

                _this[action]();
              });
            }
          }
        });
        mutationObserver.observe(_this.$el, {
          attributes: true
        }); // Stop here silently when no breakpoint configuration given.

        if (!hasBreakpointConfiguration(_assertThisInitialized(_this))) {
          return _assertThisInitialized(_this) || _assertThisInitialized(_this);
        }

        testConflictingBreakpointConfiguration(_assertThisInitialized(_this));
        add(key, function (_ref3) {
          var breakpoint = _ref3.breakpoint;
          var action = testBreakpoints$1(_assertThisInitialized(_this), breakpoint);

          _this[action]();
        });
        return _assertThisInitialized(_this) || _assertThisInitialized(_this);
      }
      /**
       * Override the default $mount method to prevent component's from being
       * mounted when they should not.
       * @return {BreakpointObserver} The component's instance.
       */


      var _proto = BreakpointObserver.prototype;

      _proto.$mount = function $mount() {
        // Execute normal behavior when no breakpoint configuration given.
        if (!hasBreakpointConfiguration(this)) {
          return _BaseClass.prototype.$mount.call(this);
        }

        var action = testBreakpoints$1(this);

        if (action === '$mount') {
          return _BaseClass.prototype.$mount.call(this);
        }

        return this;
      };

      return BreakpointObserver;
    }(BaseClass);
  });

  /**
   * Create an array of number between 0 and 1 from the given length.
   * @param  {Number} length The length of the array.
   * @return {Array}        An array of number.
   */

  function createArrayOfNumber(length) {
    return [].concat(new Array(length + 1)).map(function (val, index) {
      return index / length;
    });
  }
  /**
   * IntersectionObserver decoration.
   */


  var withIntersectionObserver = (function (BaseClass, defaultOptions) {
    if (defaultOptions === void 0) {
      defaultOptions = {
        threshold: createArrayOfNumber(100)
      };
    }

    return /*#__PURE__*/function (_BaseClass) {
      _inheritsLoose(_class, _BaseClass);

      _createClass(_class, [{
        key: "_excludeFromAutoBind",

        /**
         * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
         */
        get: function get() {
          return [].concat(_BaseClass.prototype._excludeFromAutoBind || [], ['intersected']);
        }
        /**
         * Create an observer when the class in instantiated.
         *
         * @param  {HTMLElement} element The component's root element.
         * @return {Base}                The class instace.
         */

      }]);

      function _class(element) {
        var _this;

        _this = _BaseClass.call(this, element) || this;

        if (!_this.intersected || typeof _this.intersected !== 'function') {
          throw new Error('[withIntersectionObserver] The `intersected` method must be defined.');
        }

        _this.$observer = new IntersectionObserver(function (entries) {
          debug(_assertThisInitialized(_this), 'intersected', entries);

          _this.$emit('intersected', entries);

          _this.intersected(entries);
        }, _extends({}, defaultOptions, _this.$options.intersectionObserver || {}));

        if (_this.$isMounted) {
          _this.$observer.observe(_this.$el);
        }

        _this.$on('mounted', function () {
          _this.$observer.observe(_this.$el);
        });

        _this.$on('destroyed', function () {
          _this.$observer.unobserve(_this.$el);
        });

        return _assertThisInitialized(_this) || _assertThisInitialized(_this);
      }

      return _class;
    }(BaseClass);
  });



  var index$2 = {
    __proto__: null,
    withBreakpointManager: withBreakpointManager,
    withBreakpointObserver: withBreakpointObserver,
    withIntersectionObserver: withIntersectionObserver
  };



  var index$3 = {
    __proto__: null,
    useKey: useKey,
    usePointer: usePointer,
    useRaf: useRaf,
    useResize: useResize,
    useScroll: useScroll
  };



  var index$4 = {
    __proto__: null,
    classes: classes,
    styles: styles,
    transition: transition
  };

  /**
   * Smooth step from currentValue to targetValue
   *
   * @param  {Int} targetValue we want to reech
   * @param  {Int} currentValue
   * @param  {Int} speed to reech target value
   * @return {Int}
   */
  function damp(targetValue, currentValue, speed) {
    if (speed === void 0) {
      speed = 0.5;
    }

    var value = currentValue + (targetValue - currentValue) * speed;
    return Math.abs(targetValue - currentValue) < 0.001 ? targetValue : value;
  }

  /**
   * Interpolate the ratio between a given interval.
   *
   * @param  {Number} min   The interval minimum value.
   * @param  {Number} max   The inverval maximum value.
   * @param  {Number} ratio The ratio to get.
   * @return {Number}       The value between min and max corresponding to ratio.
   */
  function lerp(min, max, ratio) {
    return (1 - ratio) * min + ratio * max;
  }

  /**
   * Maps the value from one range of [inputMin..inputMax] to another range of [outputMin..outputMax].
   *
   * @param  {Number} value     The value to map.
   * @param  {Number} inputMin  The input's minimum value.
   * @param  {Number} inputMax  The input's maximum value.
   * @param  {Number} ouptutMin The output's minimum value.
   * @param  {Number} outputMax The intput's maximum value.
   * @return {Number}           The input value mapped to the output range.
   */
  function map(value, inputMin, inputMax, outputMin, outputMax) {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
  }

  /**
   * Round a value with a given number of decimals.
   *
   * @param  {Number} value    The number to round.
   * @param  {Number} decimals The number of decimals to keep.
   * @return {Number}          A rounded number to the given decimals length.
   */
  function round(value, decimals) {
    if (decimals === void 0) {
      decimals = 0;
    }

    return Number(value.toFixed(decimals));
  }



  var index$5 = {
    __proto__: null,
    damp: damp,
    lerp: lerp,
    map: map,
    round: round
  };

  /**
   * Get an object deep value by giving its path.
   *
   * @param  {Object}    obj  The object to get the value from.
   * @param  {String}    path The dotted path of the value.
   * @return {any|false}      The value, of false if it was not found.
   */
  function getValueDeep(obj, path) {
    if (!path) {
      return obj;
    }

    var keys = path.split('.');
    var data = obj;

    while (keys.length) {
      if (data === undefined) {
        return false;
      }

      data = data[keys.shift()];
    }

    return data || false;
  }



  var index$6 = {
    __proto__: null,
    autoBind: autoBind,
    getAllProperties: getAllProperties,
    getValueDeep: getValueDeep,
    isObject: isObject
  };



  var index$7 = {
    __proto__: null,
    css: index$4,
    math: index$5,
    object: index$6,
    debounce: debounce,
    focusTrap: useFocusTrap,
    keyCodes: keyCodes,
    nextFrame: nextFrame,
    throttle: throttle
  };

  exports.Base = Base;
  exports.abstracts = index;
  exports.components = index$1;
  exports.createBase = createBase;
  exports.decorators = index$2;
  exports.defineComponent = defineComponent;
  exports.services = index$3;
  exports.utils = index$7;

})));
//# sourceMappingURL=full.umd.js.map
