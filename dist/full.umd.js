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

  var id = 0;

  function _classPrivateFieldLooseKey(name) {
    return "__private_" + id++ + "_" + name;
  }

  function _classPrivateFieldLooseBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }

    return receiver;
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
   * @param  {Array=} [props=[]] The already existing properties.
   * @return {Array<[String, Object]>} An array of properties and the prototype they belong to.
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
   * @param  {Object}               instance          The instance.
   * @param  {Object}               options           Define specific methods to include or exlude.
   * @param  {Array<String|RegExp>} [options.include] Methods to include.
   * @param  {Array<String|RegExp>} [options.exclude] Methods to exclude.
   * @return {Object}                                 The instance.
   */

  function autoBind(instance, options) {
    var _ref = options || {},
        exclude = _ref.exclude,
        include = _ref.include;

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
     * @param  {Function}     listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    ;

    _proto.$once = function $once(event, listener) {
      var instance = this;
      this.$on(event,
      /**
       * @param {...any} args
       */
      function handler() {
        instance.$off(event, handler);
        listener.apply(instance, [].slice.call(arguments));
      });
      return this;
    };

    return EventManager;
  }();

  /**
   * @typedef {import('./index').default} Base
   * @typedef {import('./index').BaseConfig} BaseConfig
   */

  /**
   * Get the config from a Base instance, either the new static one or the old getter one.
   *
   * @param  {Base}       instance The instance to get the config from.
   * @return {BaseConfig}         A Base class configuration object.
   */
  function getConfig(instance) {
    // @ts-ignore
    var config = instance.constructor.config || instance.config;

    if (!config) {
      throw new Error('The `config` property must be defined.');
    }

    if (!config.name) {
      throw new Error('The `config.name` property is required.');
    } // @ts-ignore


    if (instance.config && !instance.constructor.config) {
      console.warn("[" + config.name + "]", 'Defining the `config` as a getter is deprecated, replace it with a static property.');
    }

    return config;
  }
  /**
   * Display a console warning for the given instance.
   *
   * @param {Base}      instance A Base instance.
   * @param {...String} msg   Values to display in the console.
   */

  function warn(instance) {
    var _console;

    var _getConfig = getConfig(instance),
        name = _getConfig.name;

    (_console = console).warn.apply(_console, ["[" + name + "]"].concat([].slice.call(arguments, 1)));
  }
  /**
   * Display a console log for the given instance.
   *
   * @param {Base}   instance The instance to log information from.
   * @param {...any} msg      The data to print to the console.
   */

  function log(instance) {
    var _console2;

    var _getConfig2 = getConfig(instance),
        name = _getConfig2.name;

    (_console2 = console).log.apply(_console2, ["[" + name + "]"].concat([].slice.call(arguments, 1)));
  }
  /**
   * Verbose debug for the component.
   *
   * @param {Base}   instance The instance to debug.
   * @param {...any} args     The data to print.
   */

  function debug(instance) {
    if (instance.$options.debug) {
      log.apply(void 0, [instance].concat([].slice.call(arguments, 1)));
    }
  }
  /**
   * Test if an object has a method.
   *
   * @param  {Object}  obj  The object to test
   * @param  {String}  name The method's name
   * @return {Boolean}
   */

  function hasMethod(obj, name) {
    return typeof obj[name] === 'function';
  }
  /**
   * Call the given method while applying the given arguments.
   *
   * @param {Base}   instance The Base instance on which to trigger the method.
   * @param {String} method   The method to call.
   * @param {...any} args     The arguments to pass to the method.
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
   * @typedef {import('./index.js').default} Base
   * @typedef {import('./index.js').BaseComponent} BaseComponent
   * @typedef {import('./index.js').BaseAsyncComponent} BaseAsyncComponent
   * @typedef {import('./index.js').BaseConfigComponents} BaseConfigComponents
   */

  /**
   * Get a child component.
   *
   * @param {HTMLElement & { __base__?: Base | 'terminated' }} el
   *   The root element of the child component.
   * @param {BaseComponent|BaseAsyncComponent} ComponentClass
   *   A Base class or a Promise for async components.
   * @param {Base} parent
   *   The parent component instance.
   * @return {Base|Promise|'terminated'}
   *   A Base instance or a Promise resolving to a Base instance.
   */
  function getChild(el, ComponentClass, parent) {
    // Return existing instance if it exists
    if (el.__base__) {
      return el.__base__;
    } // Return a new instance if the component class is a child of the Base class


    if ('$isBase' in ComponentClass) {
      var child = new ComponentClass(el);
      Object.defineProperty(child, '$parent', {
        get: function get() {
          return parent;
        }
      });
      return child;
    } // Resolve async components


    return ComponentClass().then(function (module) {
      var _module$default;

      // @ts-ignore
      return getChild(el, (_module$default = module.default) != null ? _module$default : module, parent);
    });
  }
  /**
   * Get a list of elements based on the name of a component.
   *
   * @param {String} nameOrSelector
   *   The name or selector to used for this component.
   * @param {HTMLElement|Document} element
   *   The root element on which to query the selector, defaults to `document`.
   * @return {Array<HTMLElement>}
   *   A list of elements on which the component should be mounted.
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
   * @param  {Base}                 instance   The component's instance.
   * @param  {HTMLElement}          element    The component's root element
   * @param  {BaseConfigComponents} components The children components' classes
   * @return {null|Object}                     Returns `null` if no child components are defined or an object of all child component instances
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
      // @ts-ignore
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
   * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
   */
  /**
   * Lower case as a function.
   */
  function lowerCase(str) {
      return str.toLowerCase();
  }

  // Support camel case ("camelCase" -> "camel Case" and "CAMELCase" -> "CAMEL Case").
  var DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];
  // Remove all non-word characters.
  var DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;
  /**
   * Normalize the string into something other libraries can manipulate easier.
   */
  function noCase(input, options) {
      if (options === void 0) { options = {}; }
      var _a = options.splitRegexp, splitRegexp = _a === void 0 ? DEFAULT_SPLIT_REGEXP : _a, _b = options.stripRegexp, stripRegexp = _b === void 0 ? DEFAULT_STRIP_REGEXP : _b, _c = options.transform, transform = _c === void 0 ? lowerCase : _c, _d = options.delimiter, delimiter = _d === void 0 ? " " : _d;
      var result = replace(replace(input, splitRegexp, "$1\0$2"), stripRegexp, "\0");
      var start = 0;
      var end = result.length;
      // Trim the delimiter from around the output string.
      while (result.charAt(start) === "\0")
          start++;
      while (result.charAt(end - 1) === "\0")
          end--;
      // Transform each token independently.
      return result.slice(start, end).split("\0").map(transform).join(delimiter);
  }
  /**
   * Replace `re` in the input string with the replacement value.
   */
  function replace(input, re, value) {
      if (re instanceof RegExp)
          return input.replace(re, value);
      return re.reduce(function (input, re) { return input.replace(re, value); }, input);
  }

  /**
   * Test if the given value is an object.
   *
   * @param {*} value The value to test.
   * @return {Boolean} Whether or not the value is an object.
   */
  function isObject(value) {
    return typeof value === 'object' && !!value && value.toString() === '[object Object]';
  }

  /**
   * @typedef {StringConstructor|NumberConstructor|BooleanConstructor|ArrayConstructor|ObjectConstructor} OptionType
   * @typedef {{ [name:string]: OptionType | { type: OptionType, default: String|Number|Boolean|(() => Array|Object)} }} OptionsSchema
   */

  /**
   * Get the attribute name based on the given option name.
   * @param {String} name The option name.
   */

  function getAttributeName(name) {
    return "data-option-" + noCase(name, {
      delimiter: '-'
    });
  }
  /**
   * Class options to manage options as data attributes on an HTML element.
   */


  var _element = _classPrivateFieldLooseKey("element");

  var _values = _classPrivateFieldLooseKey("values");

  var _defaultValues = _classPrivateFieldLooseKey("defaultValues");

  var Options = /*#__PURE__*/function () {
    /** @type {HTMLElement} The HTML element holding the options attributes. */

    /** @type {Object} An object to store Array and Object values for reference. */

    /** @type {Array} List of allowed types. */

    /**
     * The default values to return for each available type.
     * @type {Object}
     */

    /**
     * Class constructor.
     *
     * @param {HTMLElement}   element The HTML element storing the options.
     * @param {OptionsSchema} schema  A Base class config.
     */
    function Options(element, schema) {
      var _this = this;

      Object.defineProperty(this, _element, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _values, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _defaultValues, {
        writable: true,
        value: {
          String: '',
          Number: 0,
          Boolean: false,
          Array: function Array() {
            return [];
          },
          Object: function Object() {
            return {};
          }
        }
      });
      _classPrivateFieldLooseBase(this, _element)[_element] = element;
      Object.entries(schema).forEach(function (_ref) {
        var name = _ref[0],
            config = _ref[1];
        var isObjectConfig = !Options.types.includes(config);
        /** @type {OptionType} */
        // @ts-ignore

        var type = isObjectConfig ? config.type : config;

        if (!Options.types.includes(type)) {
          throw new Error("The \"" + name + "\" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.");
        } // @ts-ignore


        var defaultValue = isObjectConfig ? config.default : _classPrivateFieldLooseBase(_this, _defaultValues)[_defaultValues][type.name];

        if ((type === Array || type === Object) && typeof defaultValue !== 'function') {
          throw new Error("The default value for options of type \"" + type.name + "\" must be returned by a function.");
        }

        Object.defineProperty(_this, name, {
          get: function get() {
            return this.get(name, type, defaultValue);
          },
          set: function set(value) {
            this.set(name, type, value);
          },
          enumerable: true
        });
      });
      return this;
    }
    /**
     * Get an option value.
     *
     * @param {String} name The option name.
     * @param {ArrayConstructor|ObjectConstructor|StringConstructor|NumberConstructor|BooleanConstructor} type The option data's type.
     * @param {any} defaultValue The default value for this option.
     */


    var _proto = Options.prototype;

    _proto.get = function get(name, type, defaultValue) {
      var _this2 = this;

      var attributeName = getAttributeName(name);

      var hasAttribute = _classPrivateFieldLooseBase(this, _element)[_element].hasAttribute(attributeName);

      if (type === Boolean) {
        if (!hasAttribute && defaultValue) {
          _classPrivateFieldLooseBase(this, _element)[_element].setAttribute(attributeName, '');
        }

        return hasAttribute || defaultValue;
      }

      var value = _classPrivateFieldLooseBase(this, _element)[_element].getAttribute(attributeName);

      if (type === Number) {
        return hasAttribute ? Number(value) : defaultValue;
      }

      if (type === Array || type === Object) {
        var val = cjs(defaultValue(), hasAttribute ? JSON.parse(value) : _classPrivateFieldLooseBase(this, _defaultValues)[_defaultValues][type.name]());

        if (!_classPrivateFieldLooseBase(this, _values)[_values][name]) {
          _classPrivateFieldLooseBase(this, _values)[_values][name] = val;
        } else if (val !== _classPrivateFieldLooseBase(this, _values)[_values][name]) {
          // When getting the value, wait for the next loop to update the data attribute
          // with the new value. This is a simple trick to avoid using a Proxy to watch
          // for any deep changes on an array or object. It should not break anything as
          // the original value is read once from the data attribute and is then read from
          // the private property `#values`.
          setTimeout(function () {
            _classPrivateFieldLooseBase(_this2, _element)[_element].setAttribute(attributeName, JSON.stringify(_classPrivateFieldLooseBase(_this2, _values)[_values][name]));
          }, 0);
        }

        return _classPrivateFieldLooseBase(this, _values)[_values][name];
      }

      return hasAttribute ? value : defaultValue;
    }
    /**
     * Set an option value.
     *
     * @param {String} name The option name.
     * @param {ArrayConstructor|ObjectConstructor|StringConstructor|NumberConstructor|BooleanConstructor} type The option data's type.
     * @param {any} value The new value for this option.
     */
    ;

    _proto.set = function set(name, type, value) {
      var attributeName = getAttributeName(name);

      if (value.constructor.name !== type.name) {
        var val = Array.isArray(value) || isObject(value) ? JSON.stringify(value) : value;
        throw new TypeError("The \"" + val + "\" value for the \"" + name + "\" option must be of type \"" + type.name + "\"");
      }

      switch (type) {
        case Boolean:
          if (value) {
            _classPrivateFieldLooseBase(this, _element)[_element].setAttribute(attributeName, '');
          } else {
            _classPrivateFieldLooseBase(this, _element)[_element].removeAttribute(attributeName);
          }

          break;

        case Array:
        case Object:
          _classPrivateFieldLooseBase(this, _values)[_values][name] = value;

          _classPrivateFieldLooseBase(this, _element)[_element].setAttribute(attributeName, JSON.stringify(value));

          break;

        default:
          _classPrivateFieldLooseBase(this, _element)[_element].setAttribute(attributeName, value);

      }
    };

    return Options;
  }();

  Options.types = [String, Number, Boolean, Array, Object];

  /**
   * @typedef {import('./index').default} Base
   */

  /**
   * Get a component's options.
   *
   * @param  {Base}        instance The component's instance.
   * @param  {HTMLElement} element  The component's root element.
   * @param  {Object}      config   The component's default config.
   * @return {Object}               The component's merged options.
   */

  function getOptions(instance, element, config) {
    var schema = _extends({}, config.options || {});
    /** @type {Base|false} Merge inherited options. */


    var prototype = instance;

    while (prototype) {
      var getterConfig = prototype.config; // @ts-ignore

      var staticConfig = prototype.constructor.config;

      if (getterConfig || staticConfig) {
        schema = Object.assign((getterConfig || {}).options || {}, (staticConfig || {}).options || {}, schema);
        prototype = Object.getPrototypeOf(prototype);
      } else {
        prototype = false;
      }
    } // Add legacy options from the config


    var propsToInclude = [{
      name: 'log',
      type: Boolean
    }, {
      name: 'debug',
      type: Boolean
    }, {
      name: 'name',
      type: String
    }];
    propsToInclude.forEach(function (prop) {
      schema[prop.name] = {
        type: prop.type,
        default: prop.type(config[prop.name])
      };
    }); // Add legacy options to the schema

    var propsToExclude = ['name', 'log', 'debug', 'components', 'refs', 'options'];
    Object.keys(config).forEach(function (propName) {
      if (propsToExclude.includes(propName)) {
        return;
      }

      var value = config[propName];
      var type = value === null || value === undefined ? Object : value.constructor; // Default to object type as it should work for any values.

      if (!Options.types.includes(type)) {
        type = Object;
      }

      warn(instance, '\n  Options must be defined in the `config.options` property.', "\n  Consider moving the `config." + propName + "` option to `config.options." + propName + "`.");

      if (type === Array || type === Object) {
        schema[propName] = {
          type: type,
          default: function _default() {
            return value;
          }
        };
      } else {
        schema[propName] = {
          type: type,
          default: value
        };
      }
    });
    var options = new Options(element, schema); // Update legacy options with value from the `data-options` attribute

    var legacyOptions = {};

    if (element.dataset.options) {
      warn(instance, 'The `data-options` attribute usage is deprecated, use multiple `data-option-...` attributes instead.');

      try {
        legacyOptions = JSON.parse(element.dataset.options);
      } catch (err) {
        throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
      }
    }

    Object.entries(legacyOptions).forEach(function (_ref) {
      var optionName = _ref[0],
          optionValue = _ref[1];
      options[optionName] = optionValue;
    });
    instance.$emit('get:options', options);
    return options;
  }

  /**
   * @typedef {import('./index').default} Base
   */

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
    var definedRefs = getConfig(instance).refs || [];
    /** @type {Array<HTMLElement>} */

    var allRefs = Array.from(element.querySelectorAll("[data-ref]"));
    var childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
    var elements = allRefs.filter(function (ref) {
      return !childrenRefs.includes(ref);
    });
    var refs = elements.reduce(
    /**
     * @param {Object} $refs
     * @param {HTMLElement & {__base__?: Base}} $ref
     */
    function ($refs, $ref) {
      var refName = $ref.dataset.ref;

      if (!definedRefs.includes(refName)) {
        warn(instance, "The \"" + refName + "\" ref is not defined in the class configuration.", 'Did you forgot to define it?');
      }

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
          warn(instance, "The \"" + refName + "\" ref has been found multiple times.", 'Did you forgot to add the `[]` suffix to its name?');
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
   * @typedef {import('./index.js').default} Base
   */

  /**
   * Mount a given component which might be async.
   *
   * @param  {Base|Promise} component The component to mount.
   * @return {void}
   */

  function mountComponent(component) {
    if (component instanceof Promise) {
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
    if (component instanceof Promise) {
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
     * @return {InstanceType<typeof Service>} The current instance
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
   * Simple throttling helper that limits a function to only run once every {delay}ms.
   *
   * @param {Function} fn The function to throttle
   * @param {Number=} [delay=16] The delay in ms
   * @return {Function} The throttled function.
   */
  function throttle(fn, delay) {
    if (delay === void 0) {
      delay = 16;
    }

    var lastCall = 0;
    return function throttled() {
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
   * @param {Function} fn The function to call.
   * @param {Number=} [delay=300] The delay in ms to wait before calling the function.
   * @return {Function} The debounced function.
   */
  function debounce(fn, delay) {
    if (delay === void 0) {
      delay = 300;
    }

    var timeout;
    return function debounced() {
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
   * @return {Function}
   */
  var getRaf = function getRaf() {
    return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
  };
  /**
   * Wait for the next frame to execute a function.
   *
   * @param  {Function=} [fn=() => {}] The callback function to execute.
   * @return {Promise} A Promise resolving when the next frame is reached.
   *
   * @example
   * ```js
   * nextFrame(() => console.log('hello world'));
   *
   * await nextFrame();
   * console.log('hello world');
   * ```
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
   * @typedef {import('./index').ServiceInterface} ServiceInterface
   */

  /**
   * @typedef {Object} RafServiceProps
   * @property {DOMHighResTimeStamp} time
   */

  /**
   * @typedef {Object} RafService
   * @property {(key:String, callback:(props:RafServiceProps) => void) => void} add
   *   Add a function to the resize service. The key must be uniq.
   * @property {() => RafServiceProps} props
   *   Get the current values of the resize service props.
   */

  /**
   * Tick service
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
     * @return {Raf}
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
      return this;
    }
    /**
     * Stop the requestAnimationFrame loop.
     *
     * @return {Raf}
     */
    ;

    _proto.kill = function kill() {
      this.isTicking = false;
      return this;
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
  /**
   * Use the RequestAnimationFrame (raf) service.
   *
   * ```js
   * import { useRaf } from '@studiometa/js/services';
   * const { add, remove, props } = useRag();
   * add(id, (props) => {});
   * remove(id);
   * props();
   * ```
   *
   * @return {ServiceInterface & RafService}
   */

  function useRaf() {
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

  /**
   * @typedef {import('./index').ServiceInterface} ServiceInterface
   */

  /**
   * @typedef {Object} PointerServiceProps
   * @property {MouseEvent | TouchEvent} event
   * @property {Boolean} isDown
   * @property {Number} x
   * @property {Number} y
   * @property {{ x: Boolean, y: Boolean }} changed
   * @property {{ x: Number, y: Number }} last
   * @property {{ x: Number, y: Number }} delta
   * @property {{ x: Number, y: Number }} progress
   * @property {{ x: Number, y: Number }} max
   */

  /**
   * @typedef {Object} PointerService
   * @property {(key:String, callback:(props:PointerServiceProps) => void) => void} add
   *   Add a function to the resize service. The key must be uniq.
   * @property {() => PointerServiceProps} props
   *   Get the current values of the resize service props.
   */

  /**
   * Test if an event is an instance of TouchEvent.
   *
   * @param {TouchEvent|MouseEvent} event The event instance to test.
   * @return {Boolean}                    Is it a TouchEvent?
   */

  function isTouchEvent(event) {
    return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
  }
  /**
   * Pointer service
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
     * @return {Pointer}
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
          add('usePointer', function (props) {
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
      return this;
    }
    /**
     * Unbind all handlers from their bounded event.
     *
     * @return {Pointer}
     */
    ;

    _proto.kill = function kill() {
      document.removeEventListener('mousemove', this.handler);
      document.removeEventListener('touchmove', this.handler);
      document.removeEventListener('mousedown', this.downHandler);
      document.removeEventListener('touchstart', this.downHandler);
      document.removeEventListener('mouseup', this.upHandler);
      document.removeEventListener('touchend', this.upHandler);
      return this;
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
     * @param  {MouseEvent|TouchEvent} event The event object.
     * @return {void}
     */
    ;

    _proto.updateValues = function updateValues(event) {
      var _event$touches$, _event$touches$2;

      this.event = event;
      this.yLast = this.y;
      this.xLast = this.x; // Check pointer Y
      // We either get data from a touch event `event.touches[0].clientY` or from
      // a mouse event `event.clientY`.

      var y = isTouchEvent(event) ?
      /** @type {TouchEvent} */
      (_event$touches$ = event.touches[0]) == null ? void 0 : _event$touches$.clientY :
      /** @type {MouseEvent} */
      event.clientY;

      if (y !== this.y) {
        this.y = y;
      } // Check pointer X
      // We either get data from a touch event `event.touches[0].clientX` or from
      // a mouse event `event.clientX`.


      var x = isTouchEvent(event) ?
      /** @type {TouchEvent} */
      (_event$touches$2 = event.touches[0]) == null ? void 0 : _event$touches$2.clientX :
      /** @type {MouseEvent} */
      event.clientX;

      if (x !== this.x) {
        this.x = x;
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
   *
   * @return {ServiceInterface & PointerService}
   */

  function usePointer() {
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

  /**
   * @typedef {import('./index').ServiceInterface} ServiceInterface
   */

  /**
   * @typedef {Object} ResizeServiceProps
   * @property {Number} width
   * @property {Number} height
   * @property {Number} ratio
   * @property {'square'|'landscape'|'portrait'} orientation
   * @property {String} [breakpoint]
   * @property {String[]} [breakpoints]
   */

  /**
   * @typedef {Object} ResizeService
   * @property {(key:String, callback:(props:ResizeServiceProps) => void) => void} add
   *   Add a function to the resize service. The key must be uniq.
   * @property {() => ResizeServiceProps} props
   *   Get the current values of the resize service props.
   */

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
     * @return {this}
     */
    _proto.init = function init() {
      var _this = this;

      this.handler = debounce(function () {
        _this.trigger(_this.props);
      }).bind(this);

      if (this.canUseResizeObserver) {
        // @ts-ignore
        this.resizeObserver = new ResizeObserver(this.handler);
        this.resizeObserver.observe(document.documentElement);
      } else {
        window.addEventListener('resize', this.handler);
      }

      return this;
    }
    /**
     * Unbind the handler from the resize event.
     *
     * @return {this}
     */
    ;

    _proto.kill = function kill() {
      if (this.canUseResizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', this.handler);
      }

      delete this.resizeObserver;
      return this;
    }
    /**
     * Get resize props.
     *
     * @type {ResizeServiceProps}
     */
    ;

    _createClass(Resize, [{
      key: "props",
      get: function get() {
        /** @type {ResizeServiceProps} [description] */
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
        // @ts-ignore
        return typeof window.ResizeObserver !== 'undefined';
      }
    }]);

    return Resize;
  }(Service);

  var resize = null;
  /**
   * Use the resize service.
   *
   * ```js
   * import useResize from '@studiometa/js-toolkit/services/resize';
   * const { add, remove, props } = useResize();
   * add(key, (props) => {});
   * remove(key);
   * props();
   * ```
   * @return {ServiceInterface & ResizeService}
   */

  function useResize() {
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
  }

  /**
   * @typedef {import('./index').ServiceInterface} ServiceInterface
   */

  /**
   * @typedef {Object} ScrollServiceProps
   * @property {Number} x
   * @property {Number} y
   * @property {{ x: Boolean, y: Boolean }} changed
   * @property {{ x: Number, y: Number }} last
   * @property {{ x: Number, y: Number }} delta
   * @property {{ x: Number, y: Number }} progress
   * @property {{ x: Number, y: Number }} max
   */

  /**
   * @typedef {Object} ScrollService
   * @property {(key:String, callback:(props:ScrollServiceProps) => void) => void} add
   *   Add a function to the resize service. The key must be uniq.
   * @property {() => ScrollServiceProps} props
   *   Get the current values of the resize service props.
   */

  /**
   * Scroll service
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
     * @return {Scroll}
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
      return this;
    }
    /**
     * Unbind the handler from the scroll event.
     *
     * @return {Scroll}
     */
    ;

    _proto.kill = function kill() {
      document.removeEventListener('scroll', this.handler);
      return this;
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
  /**
   * Use the scroll service.
   *
   * ```js
   * import { useScroll } from '@studiometa/js-toolkit/services';
   * const { add, remove, props } = useScroll();
   * add(key, (props) => {});
   * remove(key);
   * props();
   * ```
   *
   * @return {ServiceInterface & ScrollService}
   */

  function useScroll() {
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
  }

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
   * @typedef {import('./index').ServiceInterface} ServiceInterface
   */

  /**
   * @typedef {Object} KeyServiceProps
   * @property {KeyboardEvent} event
   * @property {Number} triggered
   * @property {Boolean} isUp
   * @property {Boolean} isDown
   * @property {Boolean} ENTER
   * @property {Boolean} SPACE
   * @property {Boolean} TAB
   * @property {Boolean} ESC
   * @property {Boolean} LEFT
   * @property {Boolean} UP
   * @property {Boolean} RIGHT
   * @property {Boolean} DOWN
   */

  /**
   * @typedef {Object} KeyService
   * @property {(key:String, callback:(props:KeyServiceProps) => void) => void} add
   *   Add a function to the resize service. The key must be uniq.
   * @property {() => KeyServiceProps} props
   *   Get the current values of the resize service props.
   */

  /**
   * Scroll service
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
     * @return {Key}
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
      return this;
    }
    /**
     * Unbind the handler from the keyboard event.
     *
     * @return {Key}
     */
    ;

    _proto.kill = function kill() {
      document.removeEventListener('keydown', this.handler);
      document.removeEventListener('keyup', this.handler);
      return this;
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
  /**
   * Use the keyboard service.
   *
   * ```js
   * import { useKey } from '@studiometa/js-toolkit/services';
   * const { add, remove, props } = useKey();
   * add(key, (props) => {});
   * remove(key);
   * props();
   * ```
   *
   * @return {ServiceInterface & KeyService}
   */

  function useKey() {
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
  }

  /**
   * @typedef {import('./index').default} Base
   */

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

    add(instance.$id,
    /**
     * @param {any[]} args
     */
    function () {
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
      /**
       * @param {Event} event
       */
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

  // eslint-disable-next-line import/no-cycle
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

          if ($ref instanceof Base) {
            // eslint-disable-next-line no-param-reassign
            $ref = $ref.$el;
          }
          /** @type {HTMLElement} */


          $ref.addEventListener(eventName, handler);

          var unbindMethod = function unbindMethod() {
            debug(instance, 'unbinding ref event', eventMethod);
            /** @type {HTMLElement} */

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
        $children.forEach(
        /**
         * @param {Base} $child
         * @param {Number} index
         */
        function ($child, index) {
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
   * @typedef {typeof Base} BaseComponent
   * @typedef {() => Promise<BaseComponent | { default: BaseComponent }>} BaseAsyncComponent
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
   * Base class to easily create components.
   *
   * @example
   * ```js
   * class Component extends Base {
   *   static config = {
   *     name: 'Component',
   *     log: true,
   *   };
   *
   *   mounted() {
   *     this.$log('Component is mounted!');
   *   }
   * }
   *
   * class App extends Base {
   *   static config = {
   *     name: 'App',
   *     components: {
   *       Component,
   *     },
   *   };
   * }
   *
   * new App(document.body).$mount();
   * ```
   */

  var Base = /*#__PURE__*/function (_EventManager) {
    _inheritsLoose(Base, _EventManager);

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
       * @param {HTMLElement} element The component's root element dd.
       */

    }]);

    function Base(element) {
      var _this;

      _this = _EventManager.call(this) || this;
      _this.$parent = null;
      _this.$isMounted = false;

      if (!element) {
        throw new Error('The root element must be defined.');
      }

      var _getConfig2 = getConfig(_assertThisInitialized(_this)),
          name = _getConfig2.name;
      /** @type {String} */


      _this.$id = name + "-" + nonSecure();
      /** @type {HTMLElement} */

      _this.$el = element;
      /** @type {BaseOptions} */

      _this.$options = getOptions(_assertThisInitialized(_this), element, getConfig(_assertThisInitialized(_this)));

      if (!('__base__' in _this.$el)) {
        Object.defineProperty(_this.$el, '__base__', {
          get: function get() {
            return _assertThisInitialized(_this);
          },
          configurable: true
        });
      } // Autobind all methods to the instance


      autoBind(_assertThisInitialized(_this), {
        exclude: [].concat(_this._excludeFromAutoBind || [])
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
      });

      debug(_assertThisInitialized(_this), 'constructor', _assertThisInitialized(_this));
      return _assertThisInitialized(_this) || _assertThisInitialized(_this);
    }
    /**
     * Small helper to log stuff.
     *
     * @return {(...args: any) => void} A log function if the log options is active.
     */


    var _proto = Base.prototype;

    /**
     * Trigger the `mounted` callback.
     */
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
    ;

    Base.$factory = function $factory(nameOrSelector) {
      var _this2 = this;

      if (!nameOrSelector) {
        throw new Error('The $factory method requires a component’s name or selector to be specified.');
      }

      return getComponentElements(nameOrSelector).map(function (el) {
        return new _this2(el).$mount();
      });
    };

    _createClass(Base, [{
      key: "$log",
      get: function get() {
        return this.$options.log ? window.console.log.bind(window, "[" + this.$options.name + "]") : function noop() {};
      }
    }]);

    return Base;
  }(EventManager);

  Base.$isBase = true;

  /**
   * @typedef {import('./abstracts/Base').BaseComponent} BaseComponent
   */

  /**
   * Define a component without a class.
   *
   * @param  {Object} options The component's object
   * @return {BaseComponent}           A component's class.
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

      return Component;
    }(Base);

    Component.config = config;
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
    /** @type {HTMLElement} */

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
   * @typedef {Partial<CSSStyleDeclaration> & Record<string, string | null>} CssStyleObject
   */

  /**
   * Manage a list of style properties on an element.
   *
   * @param {HTMLElement}    element The element to update.
   * @param {CssStyleObject} styles  An object of styles properties and values.
   * @param {String}         method  The method to use: add or remove.
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
   * Add styles to an element.
   *
   * @param {HTMLElement}    element The element to update.
   * @param {CssStyleObject} styles  A string of class names.
   * @return {void}
   */

  function add(element, styles) {
    setStyles(element, styles);
  }
  /**
   * Remove class names from an element.
   *
   * @param  {HTMLElement}    element The element to update.
   * @param  {CssStyleObject} styles  A string of class names.
   * @return {void}
   */

  function remove(element, styles) {
    setStyles(element, styles, 'remove');
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
   * @param {HTMLElement} element The element to update.
   * @param {String} classNames A string of class names.
   * @param {String=} [method='add'] The method to use: add, remove or toggle.
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

  /** WeakMap to hold the transition instances. */

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
      }, name);
      var trs = Transition.getInstance(element); // End any previous transition running on the element.

      if (trs.isTransitioning) {
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
            var trs = Transition.getInstance(element);
            trs.transitionEndHandler = resolve;
            element.addEventListener('transitionend', trs.transitionEndHandler, false);
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
      var trs = Transition.getInstance(element);
      trs.isTransitioning = true;
      setClassesOrStyles(element, classesOrStyles.from);
      return Promise.resolve(nextFrame()).then(function () {
        setClassesOrStyles(element, classesOrStyles.active);
        return Promise.resolve(nextFrame()).then(function () {});
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  var cache = new WeakMap();
  /**
   * Transition class.
   */

  var Transition = /*#__PURE__*/function () {
    /**
     * Is a transition currently running?
     * @type {Boolean}
     */

    /**
     * A callback to execute when the transition ends.
     * @type {EventListenerOrEventListenerObject|null}
     */

    /**
     * Instantiate and save the instance to the cache.
     * @param {HTMLElement} element The HTML element.
     */
    function Transition(element) {
      this.isTransitioning = false;
      this.transitionEndHandler = null;
      cache.set(element, this);
    }
    /**
     * Get the transition class attached to the given element.
     * @param  {HTMLElement} element The HTML element concerned by the transition.
     * @return {Transition}          The transition instance tied to the given element.
     */


    Transition.getInstance = function getInstance(element) {
      var instance = cache.get(element);

      if (!instance) {
        instance = new this(element);
      }

      return instance;
    };

    return Transition;
  }();
  /**
   * Update either the classes or the styles of an element with the given method.
   *
   * @param {HTMLElement}   element         The element to update.
   * @param {String|Object} classesOrStyles The classes or styles to apply.
   * @param {String}        method          The method to use, one of `add` or `remove`.
   */


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

    var trs = Transition.getInstance(element);
    element.removeEventListener('transitionend', trs.transitionEndHandler, false);

    if (mode === 'remove') {
      setClassesOrStyles(element, classesOrStyles.to, 'remove');
    }

    setClassesOrStyles(element, classesOrStyles.active, 'remove');
    trs.isTransitioning = false;
    trs.transitionEndHandler = null;
  }

  /**
   * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
   * @typedef {import('../../utils/css/styles').CssStyleObject} CssStyleObject
   * @typedef {import('./index').AccordionInterface} AccordionInterface
   */

  /**
   * @typedef {Object} AccordionItemRefs
   * @property {HTMLElement} btn
   * @property {HTMLElement} content
   * @property {HTMLElement} container
   */

  /**
   * @typedef {Object} StylesOption
   * @property {String|CssStyleObject} open
   * @property {String|CssStyleObject} active
   * @property {String|CssStyleObject} closed
   */

  /**
   * @typedef {Object} AccordionItemOptions
   * @property {Boolean} isOpen
   * @property {{ [refName: string]: StylesOption }} styles
   */

  /**
   * @typedef {Object} AccordionItemInterface
   * @property {AccordionItemOptions} $options
   * @property {AccordionItemRefs} $refs
   * @property {Accordion & AccordionInterface} $parent
   */

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
     * AccordionItem config
     * @return {Object}
     */

    /**
     * Add aria-attributes on mounted.
     * @this {AccordionItem & AccordionItemInterface}
     */
    _proto.mounted = function mounted() {
      var _this = this;

      if (this.$parent && this.$parent instanceof Accordion && this.$parent.$options.item) {
        Object.entries(this.$parent.$options.item).forEach(function (_ref) {
          var key = _ref[0],
              value = _ref[1];

          if (key in _this.$options) {
            var type = AccordionItem.config.options[key].type || AccordionItem.config.options[key];

            if (type === Array || type === Object) {
              _this.$options[key] = cjs(_this.$options[key], value);
            } else {
              _this.$options[key] = value;
            }
          }
        });
      }

      this.$refs.btn.setAttribute('id', this.$id);
      this.$refs.btn.setAttribute('aria-controls', this.contentId);
      this.$refs.content.setAttribute('aria-labelledby', this.$id);
      this.$refs.content.setAttribute('id', this.contentId);
      var isOpen = this.$options.isOpen;
      this.updateAttributes(isOpen);

      if (!isOpen) {
        add(this.$refs.container, {
          visibility: 'invisible',
          height: '0'
        });
      } // Update refs styles on mount


      var _this$$options$styles = this.$options.styles,
          otherStyles = _objectWithoutPropertiesLoose(_this$$options$styles, ["container"]);
      /** @type {AccordionItemRefs} */


      var refs = this.$refs;
      Object.entries(otherStyles).filter(function (_ref2) {
        var refName = _ref2[0];
        return refs[refName];
      }).forEach(function (_ref3) {
        var refName = _ref3[0],
            _ref3$ = _ref3[1];
        _ref3$ = _ref3$ === void 0 ? {
          open: '',
          closed: ''
        } : _ref3$;
        var open = _ref3$.open,
            closed = _ref3$.closed;
        transition(refs[refName], {
          to: isOpen ? open : closed
        }, 'keep');
      });
    }
    /**
     * Handler for the click event on the `btn` ref.
     * @this {AccordionItem & AccordionItemInterface}
     */
    ;

    _proto.onBtnClick = function onBtnClick() {
      if (this.$options.isOpen) {
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
     * @this {AccordionItem & AccordionItemInterface}
     * @param  {Boolean} isOpen The state of the item.
     */
    _proto.updateAttributes = function updateAttributes(isOpen) {
      this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    /**
     * Open an item.
     * @this {AccordionItem & AccordionItemInterface}
     */
    ;

    _proto.open = function open() {
      try {
        var _this3 = this;

        if (_this3.$options.isOpen) {
          return Promise.resolve();
        }

        _this3.$log('open');

        _this3.$emit('open');

        _this3.$options.isOpen = true;

        _this3.updateAttributes(_this3.$options.isOpen);

        remove(_this3.$refs.container, {
          visibility: 'invisible'
        });

        var _this3$$options$style = _this3.$options.styles,
            container = _this3$$options$style.container,
            otherStyles = _objectWithoutPropertiesLoose(_this3$$options$style, ["container"]);
        /** @type {AccordionItemRefs} */


        var refs = _this3.$refs;
        return Promise.resolve(Promise.all([transition(refs.container, {
          from: {
            height: 0
          },
          active: container.active,
          to: {
            height: refs.content.offsetHeight + "px"
          }
        }).then(function () {
          // Remove style only if the item has not been closed before the end
          if (_this3.$options.isOpen) {
            remove(refs.content, {
              position: 'absolute'
            });
          }

          return Promise.resolve();
        })].concat(Object.entries(otherStyles).filter(function (_ref4) {
          var refName = _ref4[0];
          return refs[refName];
        }).map(function (_ref5) {
          var refName = _ref5[0],
              _ref5$ = _ref5[1];
          _ref5$ = _ref5$ === void 0 ? {
            open: '',
            active: '',
            closed: ''
          } : _ref5$;
          var open = _ref5$.open,
              active = _ref5$.active,
              closed = _ref5$.closed;
          return transition(refs[refName], {
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
     * @this {AccordionItem & AccordionItemInterface}
     */
    ;

    _proto.close = function close() {
      try {
        var _this5 = this;

        if (!_this5.$options.isOpen) {
          return Promise.resolve();
        }

        _this5.$log('close');

        _this5.$emit('close');

        _this5.$options.isOpen = false;
        var height = _this5.$refs.container.offsetHeight;
        add(_this5.$refs.content, {
          position: 'absolute'
        });

        var _this5$$options$style = _this5.$options.styles,
            container = _this5$$options$style.container,
            otherStyles = _objectWithoutPropertiesLoose(_this5$$options$style, ["container"]);
        /** @type {AccordionItemRefs} */


        var refs = _this5.$refs;
        return Promise.resolve(Promise.all([transition(refs.container, {
          from: {
            height: height + "px"
          },
          active: container.active,
          to: {
            height: '0'
          }
        }).then(function () {
          // Add end styles only if the item has not been re-opened before the end
          if (!_this5.$options.isOpen) {
            add(refs.container, {
              height: '0',
              visibility: 'invisible'
            });

            _this5.updateAttributes(_this5.$options.isOpen);
          }

          return Promise.resolve();
        })].concat(Object.entries(otherStyles).filter(function (_ref6) {
          var refName = _ref6[0];
          return refs[refName];
        }).map(function (_ref7) {
          var refName = _ref7[0],
              _ref7$ = _ref7[1];
          _ref7$ = _ref7$ === void 0 ? {
            open: '',
            active: '',
            closed: ''
          } : _ref7$;
          var open = _ref7$.open,
              active = _ref7$.active,
              closed = _ref7$.closed;
          return transition(refs[refName], {
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
      key: "contentId",
      get: function get() {
        return "content-" + this.$id;
      }
    }]);

    return AccordionItem;
  }(Base);

  AccordionItem.config = {
    name: 'AccordionItem',
    refs: ['btn', 'content', 'container'],
    options: {
      isOpen: Boolean,
      styles: {
        type: Object,
        default: function _default() {
          return {
            container: {
              open: '',
              active: '',
              closed: ''
            }
          };
        }
      }
    }
  };

  /**
   * @typedef {Object} AccordionRefs
   * @property {HTMLElement[]} btn
   * @property {HTMLElement[]} content
   */

  /**
   * @typedef {Object} AccordionOptions
   * @property {Boolean} autoclose
   * @property {Object} item
   */

  /**
   * @typedef {Object} AccordionChildren
   * @property {AccordionItem[]} AccordionItem
   */

  /**
   * @typedef {Object} AccordionInterface
   * @property {AccordionOptions} $options
   * @property {AccordionRefs} $refs
   * @property {AccordionChildren} $children
   */

  /**
   * Accordion class.
   */

  var Accordion = /*#__PURE__*/function (_Base) {
    _inheritsLoose(Accordion, _Base);

    function Accordion() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Base.call.apply(_Base, [this].concat(args)) || this;
      _this.unbindMethods = [];
      return _this;
    }

    var _proto = Accordion.prototype;

    /**
     * Init autoclose behavior on mounted.
     * @this {Accordion & AccordionInterface}
     * @return {Promise<void>}
     */
    _proto.mounted = function mounted() {
      try {
        var _this3 = this;

        // /** @type {AccordionItem[]} */
        // const items = await Promise.all(
        //   this.$children.AccordionItem.map((item) =>
        //     item instanceof Promise ? item : Promise.resolve(item)
        //   )
        // );
        _this3.unbindMethods = _this3.$children.AccordionItem.map(function (item, index) {
          var unbindOpen = item.$on('open', function () {
            _this3.$emit('open', item, index);

            if (_this3.$options.autoclose) {
              // @ts-ignore
              _this3.$children.AccordionItem.filter(function (el, i) {
                return index !== i;
              }).forEach(function (it) {
                return it.close();
              });
            }
          });
          var unbindClose = item.$on('close', function () {
            _this3.$emit('close', item, index);
          });
          return function () {
            unbindOpen();
            unbindClose();
          };
        });
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
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

    return Accordion;
  }(Base);

  Accordion.config = {
    name: 'Accordion',
    options: {
      autoclose: Boolean,
      item: Object
    },
    components: {
      AccordionItem: AccordionItem
    }
  };

  var FOCUSABLE_ELEMENTS = ['a[href]:not([tabindex^="-"]):not([inert])', 'area[href]:not([tabindex^="-"]):not([inert])', 'input:not([disabled]):not([inert])', 'select:not([disabled]):not([inert])', 'textarea:not([disabled]):not([inert])', 'button:not([disabled]):not([inert])', 'iframe:not([tabindex^="-"]):not([inert])', 'audio:not([tabindex^="-"]):not([inert])', 'video:not([tabindex^="-"]):not([inert])', '[contenteditable]:not([tabindex^="-"]):not([inert])', '[tabindex]:not([tabindex^="-"]):not([inert])'];
  var focusedBefore;
  /**
   * Save the current active element.
   */

  function saveActiveElement() {
    focusedBefore = document.activeElement;
  }
  /**
   * Trap tab navigation inside the given element.
   * @param {HTMLElement} element The element in which to trap the tabulations.
   * @param {KeyboardEvent} event The keydown or keyup event.
   */

  function trap(element, event) {
    if (event.keyCode !== keyCodes.TAB) {
      return;
    } // Save the previous focused element


    if (!focusedBefore) {
      focusedBefore = document.activeElement;
    }
    /** @type {Array<HTMLElement>} */


    var focusableChildren = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS.join(', ')));
    var focusedItemIndex = document.activeElement instanceof HTMLElement ? focusableChildren.indexOf(document.activeElement) : -1;

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
   */

  function untrap() {
    if (focusedBefore && typeof focusedBefore.focus === 'function') {
      focusedBefore.focus();
      focusedBefore = null;
    }
  }
  /**
   * Use a trap/untrap tabs logic.
   */

  function useFocusTrap() {
    return {
      trap: trap,
      untrap: untrap,
      saveActiveElement: saveActiveElement
    };
  }

  var focusTrap = {
    __proto__: null,
    saveActiveElement: saveActiveElement,
    trap: trap,
    untrap: untrap,
    'default': useFocusTrap
  };

  /**
   * @typedef {Object} ModalRefs
   * @property {HTMLElement} close
   * @property {HTMLElement} container
   * @property {HTMLElement} content
   * @property {HTMLElement} modal
   * @property {HTMLElement} open
   * @property {HTMLElement} overlay
   */

  /**
   * @typedef {Object} ModalOptions
   * @property {String} move      A selector where to move the modal to.
   * @property {String} autofocus A selector for the element to set the focus to when the modal opens.
   * @property {Object} styles    The styles for the different state of the modal.
   */

  /**
   * @typedef {Object} ModalInterface
   * @property {ModalRefs} $refs
   * @property {ModalOptions} $options
   * @property {Boolean} isOpen
   * @property {Comment} refModalPlaceholder
   * @property {HTMLElement} refModalParentBackup
   * @property {Function} refModalUnbindGetRefFilter
   */

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
     * @this {Modal & ModalInterface}
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
        this.refModalUnbindGetRefFilter = this.$on('get:refs',
        /**
         * @param {ModalRefs} refs
         */
        function (refs) {
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
     * @this {Modal & ModalInterface}
     * @return {Modal} The Modal instance.
     */
    ;

    _proto.destroyed = function destroyed() {
      this.close();

      if (this.$options.move && this.refModalParentBackup) {
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
     * @this {Modal & ModalInterface}
     * @param  {Object}        options
     * @param  {KeyboardEvent} options.event  The original keyboard event
     * @param  {Boolean}       options.isUp   Is it a keyup event?
     * @param  {Boolean}       options.isDown Is it a keydown event?
     * @param  {Boolean}       options.ESC    Is it the ESC key?
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
     * @this {Modal & ModalInterface}
     * @return {Promise<Modal>} The Modal instance.
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
        /** @type {ModalRefs} */


        var refs = _this2.$refs;
        return Promise.all(Object.entries(_this2.$options.styles).map(function (_ref3) {
          var refName = _ref3[0],
              _ref3$ = _ref3[1];
          _ref3$ = _ref3$ === void 0 ? {
            open: '',
            active: '',
            closed: ''
          } : _ref3$;
          var open = _ref3$.open,
              active = _ref3$.active,
              closed = _ref3$.closed;
          return transition(refs[refName], {
            from: closed,
            active: active,
            to: open
          }, 'keep');
        })).then(function () {
          if (_this2.$options.autofocus && _this2.$refs.modal.querySelector(_this2.$options.autofocus)) {
            saveActiveElement();
            /** @type {HTMLElement} */

            var autofocusElement = _this2.$refs.modal.querySelector(_this2.$options.autofocus);

            autofocusElement.focus();
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
     * @this {Modal & ModalInterface}
     * @return {Promise<Modal>} The Modal instance.
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
        /** @type {ModalRefs} */


        var refs = _this4.$refs;
        return Promise.all(Object.entries(_this4.$options.styles).map(function (_ref4) {
          var refName = _ref4[0],
              _ref4$ = _ref4[1];
          _ref4$ = _ref4$ === void 0 ? {
            open: '',
            active: '',
            closed: ''
          } : _ref4$;
          var open = _ref4$.open,
              active = _ref4$.active,
              closed = _ref4$.closed;
          return transition(refs[refName], {
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
      key: "onOpenClick",

      /**
       * Modal options.
       */

      /**
       * Open the modal on click on the `open` ref.
       *
       * @return {Function} The component's `open` method.
       */
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

  Modal.config = {
    name: 'Modal',
    refs: ['close', 'container', 'content', 'modal', 'open', 'overlay'],
    options: {
      move: String,
      autofocus: {
        type: String,
        default: '[autofocus]'
      },
      styles: {
        type: Object,
        default: function _default() {
          return {
            modal: {
              closed: {
                opacity: 0,
                pointerEvents: 'none',
                visibility: 'hidden'
              }
            }
          };
        }
      }
    }
  };

  /**
   * @typedef {import('../abstracts/Base').BaseOptions} BaseOptions
   */

  /**
   * @typedef {Object} TabItem
   * @property {HTMLElement} btn
   * @property {HTMLElement} content
   * @property {Boolean} isEnabled
   */

  /**
   * @typedef {Object} TabsRefs
   * @property {HTMLElement[]} btn
   * @property {HTMLElement[]} content
   */

  /**
   * @typedef {Object} TabsOptions
   * @property {Object} styles
   */

  /**
   * @typedef {Object} TabsInterface
   * @property {TabsOptions} $options
   * @property {TabsRefs} $refs
   * @property {Array<TabItem>} items
   */

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
     * Tabs config.
     */

    /**
     * Initialize the component's behaviours.
     * @this {Tabs & TabsInterface}
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
     * @this {Tabs & TabsInterface}
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
     * @this {Tabs & TabsInterface}
     * @param  {TabItem}       item The item to enable.
     * @return {Promise<Tabs & TabsInterface>}      Tabs instance.
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
     * @this {Tabs & TabsInterface}
     * @param  {TabItem}       item The item to disable.
     * @return {Promise<Tabs & TabsInterface>}      The Tabs instance.
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

    return Tabs;
  }(Base);

  Tabs.config = {
    name: 'Tabs',
    refs: ['btn[]', 'content[]'],
    options: {
      styles: {
        type: Object,
        default: function _default() {
          return {
            content: {
              closed: {
                position: 'absolute',
                opacity: '0',
                pointerEvents: 'none',
                visibility: 'hidden'
              }
            }
          };
        }
      }
    }
  };

  var index$1 = {
    __proto__: null,
    Accordion: Accordion,
    Modal: Modal,
    Tabs: Tabs
  };

  /**
   * @typedef {import('../abstracts/Base').default} Base
   * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
   */

  /**
   * Test the breakpoins of the given Base instance and return the hook to call.
   *
   * @param  {Array<[String[], Base]>} breakpoints The breakpoints's data.
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
   * Prepare the components.
   * @param {Base} instance
   * @param {Array<[String, BaseComponent]>} breakpoints
   * @return {Array<[String, Base]>}
   */


  function mountComponents$1(instance, breakpoints) {
    return breakpoints.map(function (_ref2) {
      var bk = _ref2[0],
          ComponentClass = _ref2[1];
      var child = new ComponentClass(instance.$el);
      Object.defineProperty(child, '$parent', {
        get: function get() {
          return instance;
        }
      });
      return [bk, child];
    });
  }
  /**
   * A cache object to hold each Base sub-instances.
   * @type {Object}
   */


  var instances = {};
  /**
   * BreakpointManager class.
   * @param {BaseComponent} BaseClass
   * @param {Array<[String, BaseComponent]>} breakpoints
   * @return {BaseComponent}
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
       * @this {Base & {}}
       * @param {HTMLElement} element The component's root element.
       */
      function BreakpointManager(element) {
        var _this;

        _this = _BaseClass.call(this, element) || this;

        if (!instances[_this.$id]) {
          instances[_this.$id] = mountComponents$1(_assertThisInitialized(_this), breakpoints);
        }

        testBreakpoints(instances[_this.$id]);
        add("BreakpointManager-" + _this.$id, function () {
          testBreakpoints(instances[_this.$id]);
        });
        return _assertThisInitialized(_this) || _assertThisInitialized(_this);
      }
      /**
       * Override the default $mount method to prevent component's from being
       * mounted when they should not.
       * @this {Base}
       * @return {this}
       */


      var _proto = BreakpointManager.prototype;

      _proto.$mount = function $mount() {
        if (!instances[this.$id]) {
          instances[this.$id] = mountComponents$1(this, breakpoints);
        }

        testBreakpoints(instances[this.$id]);
        return _BaseClass.prototype.$mount.call(this);
      }
      /**
       * Destroy all instances when the main one is destroyed.
       * @return {this}
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
   * @typedef {import('../abstracts/Base').default} Base
   * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
   */

  /**
   * @typedef {Object} WithBreakpointObserverOptions
   * @property {String} [activeBreakpoints]
   * @property {String} [inactiveBreakpoints]
   */

  /**
   * @typedef {Object} WithBreakpointObserverInterface
   * @property {WithBreakpointObserverOptions} $options
   */

  /**
   * Test the breakpoins of the given Base instance and return the hook to call.
   *
   * @param  {Base & WithBreakpointObserverInterface}   instance The component's instance.
   * @return {String}          The action to trigger.
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
   * @param  {Base & WithBreakpointObserverInterface}    instance A Base class instance.
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
   * @param  {Base & WithBreakpointObserverInterface} instance A Base class instance.
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
   *
   * @param {BaseComponent} BaseClass The Base class to extend from.
   * @return {BaseComponent}
   */


  var withBreakpointObserver = (function (BaseClass) {
    var _class, _temp, _BaseClass$config$nam, _BaseClass$config, _BaseClass$config2;

    return _temp = _class = /*#__PURE__*/function (_BaseClass) {
      _inheritsLoose(BreakpointObserver, _BaseClass);

      /**
       * Watch for the document resize to test the breakpoints.
       * @this {Base & WithBreakpointObserverInterface}
       * @param  {HTMLElement} element The component's root element.
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

          if (mutation.type === 'attributes' && (mutation.attributeName === 'data-options' || mutation.attributeName.startsWith('data-option-'))) {
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
       * @return {this}
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
    }(BaseClass), _class.config = _extends({}, BaseClass.config || {}, {
      name: ((_BaseClass$config$nam = BaseClass == null ? void 0 : (_BaseClass$config = BaseClass.config) == null ? void 0 : _BaseClass$config.name) != null ? _BaseClass$config$nam : '') + "WithBreakpointObserver",
      options: _extends({}, (BaseClass == null ? void 0 : (_BaseClass$config2 = BaseClass.config) == null ? void 0 : _BaseClass$config2.options) || {}, {
        activeBreakpoints: String,
        inactiveBreakpoints: String
      })
    }), _temp;
  });

  /**
   * @typedef {import('../abstracts/Base').default} Base
   * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
   */

  /**
   * @typedef {Object} WithIntersectionObserverOptions
   * @property {Object} intersectionObserver
   */

  /**
   * @typedef {Object} WithIntersectionObserverInterface
   * @property {WithIntersectionObserverOptions} $options
   * @property {IntersectionObserver} $observer
   * @property {(entries: IntersectionObserverEntry[]) => void} intersected
   */

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
   * @param {BaseComponent} BaseClass The Base class to extend.
   * @param {Object} [defaultOptions] The options for the IntersectionObserver instance.
   * @return {BaseComponent}
   */


  var withIntersectionObserver = (function (BaseClass, defaultOptions) {
    var _class, _temp, _BaseClass$config$nam, _BaseClass$config, _BaseClass$config2;

    if (defaultOptions === void 0) {
      defaultOptions = {
        threshold: createArrayOfNumber(100)
      };
    }

    return _temp = _class = /*#__PURE__*/function (_BaseClass) {
      _inheritsLoose(_class, _BaseClass);

      _createClass(_class, [{
        key: "_excludeFromAutoBind",

        /**
         * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
         */
        get: function get() {
          return [].concat(_BaseClass.prototype._excludeFromAutoBind || [], ['intersected']);
        }
      }]);

      /**
       * Create an observer when the class in instantiated.
       *
       * @this {Base & WithIntersectionObserverInterface}
       * @param  {HTMLElement} element The component's root element.
       */
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
    }(BaseClass), _class.config = _extends({}, BaseClass.config || {}, {
      name: ((_BaseClass$config$nam = BaseClass == null ? void 0 : (_BaseClass$config = BaseClass.config) == null ? void 0 : _BaseClass$config.name) != null ? _BaseClass$config$nam : '') + "WithIntersectionObserver",
      options: _extends({}, (BaseClass == null ? void 0 : (_BaseClass$config2 = BaseClass.config) == null ? void 0 : _BaseClass$config2.options) || {}, {
        intersectionObserver: Object
      })
    }), _temp;
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

  /**
   * Format a CSS transform matrix with the given values.
   *
   * @param  {Object}  transform
   * @param  {Number=} [transform.scaleX=1]     The scale on the x axis.
   * @param  {Number=} [transform.scaleY=1]     The scale on the y axis.
   * @param  {Number=} [transform.skewX=0]      The skew on the x axis.
   * @param  {Number=} [transform.skewY=0]      The skew on the y axis.
   * @param  {Number=} [transform.translateX=0] The translate on the x axis.
   * @param  {Number=} [transform.translateY=0] The translate on the y axis.
   * @return {String}                           A formatted CSS matrix transform.
   *
   * @example
   * ```js
   * matrix({ scaleX: 0.5, scaleY: 0.5 });
   * // matrix(0.5, 0, 0, 0.5, 0, 0)
   * ```
   */
  function matrix(transform) {
    // eslint-disable-next-line no-param-reassign
    transform = transform || {};
    return "matrix(" + (transform.scaleX || 1) + ", " + (transform.skewX || 0) + ", " + (transform.skewY || 0) + ", " + (transform.scaleY || 1) + ", " + (transform.translateX || 0) + ", " + (transform.translateY || 0) + ")";
  }

  var index$4 = {
    __proto__: null,
    classes: classes,
    styles: styles,
    matrix: matrix,
    transition: transition
  };

  /**
   * Get the next damped value for a given speed.
   *
   * @param  {Number} targetValue The final value.
   * @param  {Number} currentValue The current value.
   * @param  {Number=} [speed=0.5] The speed to reach the target value.
   * @return {Number} The next value.
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
   * @param  {Number} outputMin The output's minimum value.
   * @param  {Number} outputMax The output's maximum value.
   * @return {Number}           The input value mapped to the output range.
   */
  function map(value, inputMin, inputMax, outputMin, outputMax) {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
  }

  /**
   * Round a value with a given number of decimals.
   *
   * @param  {Number} value The number to round.
   * @param  {Number=} [decimals=0] The number of decimals to keep.
   * @return {Number} A rounded number to the given decimals length.
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

  var index$6 = {
    __proto__: null,
    autoBind: autoBind,
    getAllProperties: getAllProperties,
    isObject: isObject
  };

  var index$7 = {
    __proto__: null,
    css: index$4,
    math: index$5,
    object: index$6,
    debounce: debounce,
    focusTrap: focusTrap,
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
