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
function getAllProperties(object, props = []) {
  const proto = Object.getPrototypeOf(object);

  if (proto === Object.prototype) {
    return props;
  }

  return getAllProperties(proto, Object.getOwnPropertyNames(proto).map(name => [name, proto]).reduce((acc, val) => [...acc, val], props));
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
  const {
    exclude,
    include
  } = options || {};

  const filter = key => {
    const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

    if (include) {
      return include.some(match);
    }

    if (exclude) {
      return !exclude.some(match);
    }

    return true;
  };

  getAllProperties(instance).filter(([key]) => key !== 'constructor' && filter(key)).forEach(([key, object]) => {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);

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
class EventManager {
  constructor() {
    this._events = {};
  }

  /**
   * Bind a listener function to an event.
   *
   * @param  {String}   event    Name of the event.
   * @param  {Function} listener Function to be called.
   * @return {Function}          A function to unbind the listener.
   */
  $on(event, listener) {
    if (!Array.isArray(this._events[event])) {
      this._events[event] = [];
    }

    this._events[event].push(listener);

    return () => {
      this.$off(event, listener);
    };
  }
  /**
   * Unbind a listener function from an event.
   *
   * @param  {String}       event    Name of the event.
   * @param  {Function}     listener Function to be removed.
   * @return {EventManager}          The current instance.
   */


  $off(event, listener) {
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

    const index = this._events[event].indexOf(listener);

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


  $emit(event, ...args) {
    if (!Array.isArray(this._events[event])) {
      return this;
    }

    this._events[event].forEach(listener => {
      listener.apply(this, args);
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


  $once(event, listener) {
    const instance = this;
    this.$on(event,
    /**
     * @param {...any} args
     */
    function handler(...args) {
      instance.$off(event, handler);
      listener.apply(instance, args);
    });
    return this;
  }

}

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
  const config = instance.constructor.config || instance.config;

  if (!config) {
    throw new Error('The `config` property must be defined.');
  }

  if (!config.name) {
    throw new Error('The `config.name` property is required.');
  } // @ts-ignore


  if (instance.config && !instance.constructor.config) {
    console.warn(`[${config.name}]`, 'Defining the `config` as a getter is deprecated, replace it with a static property.');
  }

  return config;
}
/**
 * Display a console warning for the given instance.
 *
 * @param {Base}      instance A Base instance.
 * @param {...String} msg   Values to display in the console.
 */

function warn(instance, ...msg) {
  const {
    name
  } = getConfig(instance);
  console.warn(`[${name}]`, ...msg);
}
/**
 * Display a console log for the given instance.
 *
 * @param {Base}   instance The instance to log information from.
 * @param {...any} msg      The data to print to the console.
 */

function log(instance, ...msg) {
  const {
    name
  } = getConfig(instance);
  console.log(`[${name}]`, ...msg);
}
/**
 * Verbose debug for the component.
 *
 * @param {Base}   instance The instance to debug.
 * @param {...any} args     The data to print.
 */

function debug(instance, ...args) {
  if (instance.$options.debug) {
    log(instance, ...args);
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

function callMethod(instance, method, ...args) {
  debug(instance, 'callMethod', method, ...args); // Prevent duplicate call of `mounted` and `destroyed`
  // methods based on the component status

  if (method === 'destroyed' && !instance.$isMounted || method === 'mounted' && instance.$isMounted) {
    debug(instance, 'not', method, 'because the method has already been triggered once.');
    return instance;
  }

  instance.$emit(method, ...args); // We always emit an event, but we do not call the method if it does not exist

  if (!hasMethod(instance, method)) {
    return instance;
  }

  instance[method].call(instance, ...args);
  debug(instance, method, instance, ...args);
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
    const child = new ComponentClass(el);
    Object.defineProperty(child, '$parent', {
      get: () => parent
    });
    return child;
  } // Resolve async components


  return ComponentClass().then(module => {
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


function getComponentElements(nameOrSelector, element = document) {
  const selector = `[data-component="${nameOrSelector}"]`;
  let elements = [];

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
  debug(instance, 'before:getChildren', element, components);
  const children = Object.entries(components).reduce((acc, [name, ComponentClass]) => {
    Object.defineProperty(acc, name, {
      get() {
        const elements = getComponentElements(name, element);

        if (elements.length === 0) {
          return [];
        }

        return elements.map(el => getChild(el, ComponentClass, instance)) // Filter out terminated children
        // @ts-ignore
        .filter(el => el !== 'terminated');
      },

      enumerable: true,
      configurable: true
    });
    return acc;
  }, {});
  instance.$emit('get:children', children);
  debug(instance, 'after:getChildren', children);
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
 * @typedef {{ [optionName:string]: any }} OptionsInterface
 */

/**
 * Get the attribute name based on the given option name.
 * @param {String} name The option name.
 */

function getAttributeName(name) {
  return `data-option-${noCase(name, {
    delimiter: '-'
  })}`;
}
/**
 * Class options to manage options as data attributes on an HTML element.
 * @augments {OptionsInterface}
 */


var _element = _classPrivateFieldLooseKey("element");

var _values = _classPrivateFieldLooseKey("values");

var _defaultValues = _classPrivateFieldLooseKey("defaultValues");

class Options {
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
  constructor(element, schema) {
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
        Array: () => [],
        Object: () => ({})
      }
    });
    _classPrivateFieldLooseBase(this, _element)[_element] = element;
    Object.entries(schema).forEach(([name, config]) => {
      const isObjectConfig = !Options.types.includes(config);
      /** @type {OptionType} */
      // @ts-ignore

      const type = isObjectConfig ? config.type : config;

      if (!Options.types.includes(type)) {
        throw new Error(`The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`);
      } // @ts-ignore


      const defaultValue = isObjectConfig ? config.default : _classPrivateFieldLooseBase(this, _defaultValues)[_defaultValues][type.name];

      if ((type === Array || type === Object) && typeof defaultValue !== 'function') {
        throw new Error(`The default value for options of type "${type.name}" must be returned by a function.`);
      }

      Object.defineProperty(this, name, {
        get() {
          return this.get(name, type, defaultValue);
        },

        set(value) {
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


  get(name, type, defaultValue) {
    const attributeName = getAttributeName(name);

    const hasAttribute = _classPrivateFieldLooseBase(this, _element)[_element].hasAttribute(attributeName);

    if (type === Boolean) {
      if (!hasAttribute && defaultValue) {
        _classPrivateFieldLooseBase(this, _element)[_element].setAttribute(attributeName, '');
      }

      return hasAttribute || defaultValue;
    }

    const value = _classPrivateFieldLooseBase(this, _element)[_element].getAttribute(attributeName);

    if (type === Number) {
      return hasAttribute ? Number(value) : defaultValue;
    }

    if (type === Array || type === Object) {
      const val = cjs(defaultValue(), hasAttribute ? JSON.parse(value) : _classPrivateFieldLooseBase(this, _defaultValues)[_defaultValues][type.name]());

      if (!_classPrivateFieldLooseBase(this, _values)[_values][name]) {
        _classPrivateFieldLooseBase(this, _values)[_values][name] = val;
      } else if (val !== _classPrivateFieldLooseBase(this, _values)[_values][name]) {
        // When getting the value, wait for the next loop to update the data attribute
        // with the new value. This is a simple trick to avoid using a Proxy to watch
        // for any deep changes on an array or object. It should not break anything as
        // the original value is read once from the data attribute and is then read from
        // the private property `#values`.
        setTimeout(() => {
          _classPrivateFieldLooseBase(this, _element)[_element].setAttribute(attributeName, JSON.stringify(_classPrivateFieldLooseBase(this, _values)[_values][name]));
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


  set(name, type, value) {
    const attributeName = getAttributeName(name);

    if (value.constructor.name !== type.name) {
      const val = Array.isArray(value) || isObject(value) ? JSON.stringify(value) : value;
      throw new TypeError(`The "${val}" value for the "${name}" option must be of type "${type.name}"`);
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
  }

}
Options.types = [String, Number, Boolean, Array, Object];

/**
 * @typedef {import('./index').default} Base
 * @typedef {import('./index').BaseOptions} BaseOptions
 * @typedef {import('./classes/Options').OptionsSchema} OptionsSchema
 */

/**
 * Get the legacy options from the `config` properties.
 *
 * @param {Base}   instance The component's instance.
 * @param {Object} config   The component's config.
 * @return {OptionsSchema}
 */

function getLegacyOptionsSchema(instance, config) {
  // Add legacy options to the schema
  const propsToExclude = ['name', 'log', 'debug', 'components', 'refs', 'options'];
  return Object.keys(config).reduce(
  /**
   * @param {OptionsSchema} schema
   * @param {String} propName
   */
  (schema, propName) => {
    if (propsToExclude.includes(propName)) {
      return schema;
    }

    const value = config[propName];
    let type = value === null || value === undefined ? Object : value.constructor; // Default to object type as it should work for any values.

    if (!Options.types.includes(type)) {
      type = Object;
    }

    warn(instance, '\n  Options must be defined in the `config.options` property.', `\n  Consider moving the \`config.${propName}\` option to \`config.options.${propName}\`.`);

    if (type === Array || type === Object) {
      schema[propName] = {
        type,
        default: () => value
      };
    } else {
      schema[propName] = {
        type,
        default: value
      };
    }

    return schema;
  }, {});
}
/**
 * Get the inherited options values from the current instance parent classes.
 * @param {Base} instance The component's instance.
 * @return {OptionsSchema}
 */


function getParentOptionsSchema(instance) {
  /** @type {OptionsSchema} [description] */
  let schema = {};
  /** @type {Base|false} Merge inherited options. */

  let prototype = instance;

  while (prototype) {
    const getterConfig = prototype.config; // @ts-ignore

    const staticConfig = prototype.constructor.config;

    if (getterConfig || staticConfig) {
      schema = Object.assign((getterConfig || {}).options || {}, (staticConfig || {}).options || {}, schema);
      prototype = Object.getPrototypeOf(prototype);
    } else {
      prototype = false;
    }
  }

  return schema;
}
/**
 * Update an Options object with the legacy values from the element's `data-options` attribute.
 *
 * @param {Base}        instance The component's instance.
 * @param {HTMLElement} element The component's root element.
 * @param {Options}     options The component's options.
 */


function updateOptionsWithLegacyValues(instance, element, options) {
  // Update legacy options with value from the `data-options` attribute
  let legacyOptionsValues = {};

  if (element.dataset.options) {
    warn(instance, 'The `data-options` attribute usage is deprecated, use multiple `data-option-...` attributes instead.');

    try {
      legacyOptionsValues = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  Object.entries(legacyOptionsValues).forEach(([optionName, optionValue]) => {
    options[optionName] = optionValue;
  });
}
/**
 * Get a component's options.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @param  {Object}      config   The component's default config.
 * @return {Options & BaseOptions}              The component's merged options.
 */


function getOptions(instance, element, config) {
  var _config$log, _config$debug;

  /** @type {OptionsSchema} */
  const schema = _extends({
    name: {
      type: String,
      default: config.name
    },
    log: {
      type: Boolean,
      default: (_config$log = config.log) != null ? _config$log : false
    },
    debug: {
      type: Boolean,
      default: (_config$debug = config.debug) != null ? _config$debug : false
    }
  }, getParentOptionsSchema(instance), getLegacyOptionsSchema(instance, config), config.options || {});

  const options = new Options(element, schema);
  updateOptionsWithLegacyValues(instance, element, options);
  instance.$emit('get:options', options);
  return (
    /** @type {Options & BaseOptions} */
    options
  );
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
  let list = [];

  try {
    list = Array.from(element.querySelectorAll(`:scope ${selector}`));
  } catch (err) {
    const attr = `data-uniq-id`;
    const scopedSelector = `[${attr}="${uniqId}"] ${selector}`;
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
  const definedRefs = getConfig(instance).refs || [];
  /** @type {Array<HTMLElement>} */

  const allRefs = Array.from(element.querySelectorAll(`[data-ref]`));
  const childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
  const elements = allRefs.filter(ref => !childrenRefs.includes(ref));
  const refs = elements.reduce(
  /**
   * @param {Object} $refs
   * @param {HTMLElement & {__base__?: Base}} $ref
   */
  ($refs, $ref) => {
    let refName = $ref.dataset.ref;

    if (!definedRefs.includes(refName)) {
      warn(instance, `The "${refName}" ref is not defined in the class configuration.`, 'Did you forgot to define it?');
    }

    const $realRef = $ref.__base__ ? $ref.__base__ : $ref;

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
        warn(instance, `The "${refName}" ref has been found multiple times.`, 'Did you forgot to add the `[]` suffix to its name?');
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
    component.then(instance => instance.$mount());
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
  debug(instance, 'mountComponents', instance.$children);
  Object.values(instance.$children).forEach($child => {
    debug(instance, 'mountComponent', $child);
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
    component.then(instance => instance.$destroy());
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
  debug(instance, 'destroyComponents', instance.$children);
  Object.values(instance.$children).forEach(
  /**
   * @param {Array<Base>} $child
   */
  $child => {
    $child.forEach(destroyComponent);
  });
}

/**
 * Service abstract class
 */
class Service {
  /**
   * Class constructor, used to test the abstract class implementation.
   */
  constructor() {
    this.callbacks = new Map();
    this.isInit = false;
  }
  /**
   * Getter to get the services properties.
   * This getter MUST be implementer by the service extending this class.
   * @return {Object}
   */


  get props() {
    throw new Error('The `props` getter must be implemented.');
  }
  /**
   * Method to initialize the service behaviors.
   * This method MUST be implemented by the service extending this class.
   *
   * @return {Service} The current instance
   */


  init() {
    throw new Error('The `init` method must be implemented.');
  }
  /**
   * Method to kill the service behaviors.
   * This method MUST be implemented by the service extending this class.
   *
   * @return {Service} The current instance
   */


  kill() {
    throw new Error('The `kill` method must be implemented.');
  }
  /**
   * Add a callback.
   *
   * @param  {String}   key      The callback's identifier
   * @param  {Function} callback The callback function
   * @return {InstanceType<typeof Service>} The current instance
   */


  add(key, callback) {
    if (this.has(key)) {
      throw new Error(`A callback with the key \`${key}\` has already been registered.`);
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


  has(key) {
    return this.callbacks.has(key);
  }
  /**
   * Get the callback tied to the given key.
   *
   * @param  {String}   key The identifier to get
   * @return {Function}     The callback function
   */


  get(key) {
    return this.callbacks.get(key);
  }
  /**
   * Remove the callback tied to the given key.
   *
   * @param  {String} key The identifier to remove
   * @return {Service}    The current instance
   */


  remove(key) {
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


  trigger(...args) {
    this.callbacks.forEach(callback => {
      callback(...args);
    });
    return this;
  }

}

/**
 * Simple throttling helper that limits a function to only run once every {delay}ms.
 *
 * @param {Function} fn The function to throttle
 * @param {Number=} [delay=16] The delay in ms
 * @return {Function} The throttled function.
 */
function throttle(fn, delay = 16) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = new Date().getTime();

    if (now - lastCall < delay) {
      return false;
    }

    lastCall = now;
    return fn(...args);
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
function debounce(fn, delay = 300) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @return {Function}
 */
const getRaf = () => typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
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

function nextFrame(fn = () => {}) {
  const raf = getRaf();
  return new Promise(resolve => {
    raf(() => raf(() => resolve(fn())));
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

class Raf extends Service {
  constructor(...args) {
    super(...args);
    this.isTicking = false;
  }

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {Raf}
   */
  init() {
    const raf = getRaf();

    const loop = () => {
      this.trigger(this.props);

      if (!this.isTicking) {
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


  kill() {
    this.isTicking = false;
    return this;
  }
  /**
   * Get raf props.
   *
   * @todo Return elapsed time / index?
   * @type {Object}
   */


  get props() {
    return {
      time: window.performance.now()
    };
  }

}

let instance = null;
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

  const add = instance.add.bind(instance);
  const remove = instance.remove.bind(instance);
  const has = instance.has.bind(instance);

  const props = () => instance.props;

  return {
    add,
    remove,
    has,
    props
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


class Pointer extends Service {
  constructor(...args) {
    super(...args);
    this.isDown = false;
    this.y = window.innerHeight / 2;
    this.yLast = window.innerHeight / 2;
    this.x = window.innerWidth / 2;
    this.xLast = window.innerWidth / 2;
  }

  /**
   * Bind the handler to the mousemove and touchmove events.
   * Bind the up and down handler to the mousedown, mouseup, touchstart and touchend events.
   *
   * @return {Pointer}
   */
  init() {
    const {
      add,
      remove
    } = useRaf();
    this.hasRaf = false;
    const debounced = debounce(event => {
      this.updateValues(event);
      remove('usePointer');
      this.trigger(this.props);
      this.hasRaf = false;
    }, 50);
    this.handler = throttle(event => {
      this.updateValues(event);

      if (!this.hasRaf) {
        add('usePointer', props => {
          this.trigger(this.props);
        });
        this.hasRaf = true;
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


  kill() {
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


  downHandler() {
    this.isDown = true;
    this.trigger(this.props);
  }
  /**
   * Handler for the pointer's up action.
   *
   * @return {void}
   */


  upHandler() {
    this.isDown = false;
    this.trigger(this.props);
  }
  /**
   * Update the pointer positions.
   *
   * @param  {MouseEvent|TouchEvent} event The event object.
   * @return {void}
   */


  updateValues(event) {
    var _event$touches$, _event$touches$2;

    this.event = event;
    this.yLast = this.y;
    this.xLast = this.x; // Check pointer Y
    // We either get data from a touch event `event.touches[0].clientY` or from
    // a mouse event `event.clientY`.

    const y = isTouchEvent(event) ?
    /** @type {TouchEvent} */
    (_event$touches$ = event.touches[0]) == null ? void 0 : _event$touches$.clientY :
    /** @type {MouseEvent} */
    event.clientY;

    if (y !== this.y) {
      this.y = y;
    } // Check pointer X
    // We either get data from a touch event `event.touches[0].clientX` or from
    // a mouse event `event.clientX`.


    const x = isTouchEvent(event) ?
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


  get props() {
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

}

let pointer = null;
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

  const add = pointer.add.bind(pointer);
  const remove = pointer.remove.bind(pointer);
  const has = pointer.has.bind(pointer);

  const props = () => pointer.props;

  return {
    add,
    remove,
    has,
    props
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

class Resize extends Service {
  /**
   * Bind the handler to the resize event.
   *
   * @return {this}
   */
  init() {
    this.handler = debounce(() => {
      this.trigger(this.props);
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


  kill() {
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


  get props() {
    /** @type {ResizeServiceProps} [description] */
    const props = {
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


  get breakpointElement() {
    return document.querySelector('[data-breakpoint]') || null;
  }
  /**
   * Get the current breakpoint.
   * @return {String}
   */


  get breakpoint() {
    return window.getComputedStyle(this.breakpointElement, '::before').getPropertyValue('content').replace(/"/g, '');
  }
  /**
   * Get all breakpoints.
   * @return {Array}
   */


  get breakpoints() {
    const breakpoints = window.getComputedStyle(this.breakpointElement, '::after').getPropertyValue('content').replace(/"/g, '');
    return breakpoints.split(',');
  }
  /**
   * Test if we can use the `ResizeObserver` API.
   * @return {Boolean}
   */


  get canUseResizeObserver() {
    // @ts-ignore
    return typeof window.ResizeObserver !== 'undefined';
  }

}

let resize = null;
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

  const add = resize.add.bind(resize);
  const remove = resize.remove.bind(resize);
  const has = resize.has.bind(resize);

  const props = () => resize.props;

  return {
    add,
    remove,
    has,
    props
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

class Scroll extends Service {
  constructor(...args) {
    super(...args);
    this.y = window.pageYOffset;
    this.yLast = window.pageYOffset;
    this.x = window.pageXOffset;
    this.xLast = window.pageXOffset;
  }

  /**
   * Bind the handler to the scroll event.
   *
   * @return {Scroll}
   */
  init() {
    const debounced = debounce(() => {
      this.trigger(this.props);
      nextFrame(() => {
        this.trigger(this.props);
      });
    }, 50);
    this.handler = throttle(() => {
      this.trigger(this.props); // Reset changed flags at the end of the scroll event

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


  kill() {
    document.removeEventListener('scroll', this.handler);
    return this;
  }
  /**
   * Get scroll props.
   *
   * @type {Object}
   */


  get props() {
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


  get max() {
    return {
      x: (document.scrollingElement || document.body).scrollWidth - window.innerWidth,
      y: (document.scrollingElement || document.body).scrollHeight - window.innerHeight
    };
  }

}

let scroll = null;
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

  const add = scroll.add.bind(scroll);
  const remove = scroll.remove.bind(scroll);
  const has = scroll.has.bind(scroll);

  const props = () => scroll.props;

  return {
    add,
    remove,
    has,
    props
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

class Key extends Service {
  constructor(...args) {
    super(...args);
    this.event = {};
    this.triggered = 0;
    this.previousEvent = {};
  }

  /**
   * Bind the handler to the keyboard event.
   *
   * @return {Key}
   */
  init() {
    this.handler = event => {
      this.event = event;
      this.trigger(this.props);
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


  kill() {
    document.removeEventListener('keydown', this.handler);
    document.removeEventListener('keyup', this.handler);
    return this;
  }
  /**
   * Get keyboard props.
   *
   * @type {Object}
   */


  get props() {
    const keys = Object.entries(keyCodes).reduce((acc, [name, code]) => {
      acc[name] = code === this.event.keyCode;
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

}

let key = null;
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

  const add = key.add.bind(key);
  const remove = key.remove.bind(key);
  const has = key.has.bind(key);

  const props = () => key.props;

  return {
    add,
    remove,
    has,
    props
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
    return () => {};
  }

  const {
    add,
    remove
  } = service();
  add(instance.$id,
  /**
   * @param {any[]} args
   */
  (...args) => {
    callMethod(instance, method, ...args);
  });
  return () => remove(instance.$id);
}
/**
 * Use the services.
 * @param  {Base} instance A Base class instance.
 * @return {Array}         A list of unbind methods.
 */


function bindServices(instance) {
  const unbindMethods = [initService(instance, 'scrolled', useScroll), initService(instance, 'resized', useResize), initService(instance, 'ticked', useRaf), initService(instance, 'moved', usePointer), initService(instance, 'keyed', useKey)]; // Fire the `loaded` method on window load
  // @todo remove this? or move it elsewhere?

  if (hasMethod(instance, 'loaded')) {
    /**
     * @param {Event} event
     */
    const loadedHandler = event => {
      callMethod(instance, 'loaded', {
        event
      });
    };

    window.addEventListener('load', loadedHandler);
    unbindMethods.push(() => {
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
  return eventMethods.map(eventMethod => {
    const eventName = eventMethod.replace(/^on/, '').toLowerCase();

    const handler = (...args) => {
      debug(instance, eventMethod, instance.$el, ...args);
      instance[eventMethod](...args);
    };

    instance.$el.addEventListener(eventName, handler);
    return () => {
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
  const unbindMethods = [];
  Object.entries(instance.$refs).forEach(([refName, $refOrRefs]) => {
    const $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
    const refEventMethod = `on${refName.replace(/^\w/, c => c.toUpperCase())}`;
    eventMethods.filter(eventMethod => eventMethod.startsWith(refEventMethod)).forEach(eventMethod => {
      $refs.forEach(($ref, index) => {
        const eventName = eventMethod.replace(refEventMethod, '').toLowerCase();

        const handler = (...args) => {
          debug(instance, eventMethod, $ref, ...args, index);
          instance[eventMethod](...args, index);
        };

        debug(instance, 'binding ref event', refName, eventName);

        if ($ref instanceof Base) {
          // eslint-disable-next-line no-param-reassign
          $ref = $ref.$el;
        }
        /** @type {HTMLElement} */


        $ref.addEventListener(eventName, handler);

        const unbindMethod = () => {
          debug(instance, 'unbinding ref event', refName, eventMethod);
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
  const unbindMethods = [];
  Object.entries(instance.$children).forEach(([childName, $children]) => {
    const childEventMethod = `on${childName.replace(/^\w/, c => c.toUpperCase())}`;
    eventMethods.filter(eventMethod => eventMethod.startsWith(childEventMethod)).forEach(eventMethod => {
      $children.forEach(
      /**
       * @param {Base} $child
       * @param {Number} index
       */
      ($child, index) => {
        const eventName = eventMethod.replace(childEventMethod, '').toLowerCase();

        const handler = (...args) => {
          debug(instance, eventMethod, $child, ...args, index);
          instance[eventMethod](...args, index);
        };

        debug(instance, 'binding child event', childName, eventName);
        const unbindMethod = $child.$on(eventName, handler);
        unbindMethods.push(() => {
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
  const ROOT_EVENT_REGEX = /^on[A-Z][a-z]+$/;
  const REFS_CHILDREN_EVENT_REGEX = /^on([A-Z][a-z]+)([A-Z][a-z]+)+$/; // Get all event methods

  const eventMethods = getAllProperties(instance).reduce((acc, [name]) => {
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
  const unbindMethods = [...bindRootEvents(instance, eventMethods.root), ...bindRefsEvents(instance, eventMethods.refsOrChildren), ...bindChildrenEvents(instance, eventMethods.refsOrChildren)];
  return unbindMethods;
}

/**
 * @typedef {typeof Base} BaseComponent
 * @typedef {() => Promise<BaseComponent | { default: BaseComponent }>} BaseAsyncComponent
 * @typedef {{ name: string, debug: boolean, log: boolean, [name:string]: any }} BaseOptions
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

class Base extends EventManager {
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
  get _excludeFromAutoBind() {
    return ['$mount', '$update', '$destroy', '$terminate', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
  }
  /**
   * @deprecated Use the static `config` property instead.
   * @return {BaseConfig}
   */


  get config() {
    return null;
  }
  /** @type {BaseConfig} */


  /**
   * Get the component's refs.
   * @return {BaseRefs}
   */
  get $refs() {
    return getRefs(this, this.$el);
  }
  /**
   * Class constructor where all the magic takes place.
   *
   * @param {HTMLElement} element The component's root element dd.
   */


  constructor(element) {
    super();
    this.$parent = null;
    this.$isMounted = false;

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    const {
      name
    } = getConfig(this);
    /** @type {String} */

    this.$id = `${name}-${nonSecure()}`;
    /** @type {HTMLElement} */

    this.$el = element;
    /** @type {BaseOptions} */

    this.$options = getOptions(this, element, getConfig(this));
    /** @type {BaseChildren} */

    this.$children = getChildren(this, this.$el, getConfig(this).components || {});

    if (!('__base__' in this.$el)) {
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
        configurable: true
      });
    } // Autobind all methods to the instance


    autoBind(this, {
      exclude: [...this._excludeFromAutoBind]
    });
    let unbindMethods = [];
    this.$on('mounted', () => {
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
      mountComponents(this);
      this.$isMounted = true;
    });
    this.$on('updated', () => {
      unbindMethods.forEach(method => method());
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
      mountComponents(this);
    });
    this.$on('destroyed', () => {
      this.$isMounted = false;
      unbindMethods.forEach(method => method());
      destroyComponents(this);
    });
    debug(this, 'constructor', this);
    return this;
  }
  /**
   * Small helper to log stuff.
   *
   * @return {(...args: any) => void} A log function if the log options is active.
   */


  get $log() {
    return this.$options.log ? window.console.log.bind(window, `[${this.$options.name}]`) : function noop() {};
  }
  /**
   * Trigger the `mounted` callback.
   */


  $mount() {
    debug(this, '$mount');
    callMethod(this, 'mounted');
    return this;
  }
  /**
   * Update the instance children.
   */


  $update() {
    debug(this, '$update');
    callMethod(this, 'updated');
    return this;
  }
  /**
   * Trigger the `destroyed` callback.
   */


  $destroy() {
    debug(this, '$destroy');
    callMethod(this, 'destroyed');
    return this;
  }
  /**
   * Terminate a child instance when it is not needed anymore.
   * @return {void}
   */


  $terminate() {
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


  static $factory(nameOrSelector) {
    if (!nameOrSelector) {
      throw new Error('The $factory method requires a component’s name or selector to be specified.');
    }

    return getComponentElements(nameOrSelector).map(el => new this(el).$mount());
  }

}
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
  const {
    config,
    methods
  } = options,
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


  class Component extends Base {}

  Component.config = config;
  const allowedHooks = ['mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated'];
  const filteredHooks = Object.entries(hooks).reduce((acc, [name, fn]) => {
    if (allowedHooks.includes(name)) {
      acc[name] = fn;
    } else {
      throw new Error(`
          The "${name}" method is not a Base lifecycle hook,
          it should be placed in the "method" property.
          The following hooks are available: ${allowedHooks.join(', ')}
        `);
    }

    return acc;
  }, {});
  [...Object.entries(methods || {}), ...Object.entries(filteredHooks)].forEach(([name, fn]) => {
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
  const Component = defineComponent(options);
  /** @type {HTMLElement} */

  const element = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
  return new Component(element);
}

export default Base;
export { createBase, defineComponent };
//# sourceMappingURL=index.modern.js.map
