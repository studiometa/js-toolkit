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
 * @param  {Object}               instance        The instance.
 * @param  {Array<String|RegExp>} options.include Methods to include.
 * @param  {Array<String|RegExp>} options.exclude Methods to exclude.
 * @return {Object}                               The instance.
 */

function autoBind(instance, {
  include,
  exclude
} = {}) {
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
 *
 * @method $on    Bind a given function to the given event.
 * @method $off   Unbind the given function from the given event.
 * @method $once  Bind a given function to the given event once.
 * @method $emit  Emit an event with custom props.
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
   * @param  {String}       listener Function to be called.
   * @return {EventManager}          The current instance.
   */


  $once(event, listener) {
    const instance = this;
    this.$on(event, function handler(...args) {
      instance.$off(event, handler);
      listener.apply(instance, args);
    });
    return this;
  }

}

/**
 * Verbose debug for the component.
 *
 * @param  {...any} args The arguments passed to the method
 * @return {void}
 */
function debug(instance, ...args) {
  return instance.$options.debug ? window.console.log.apply(window, [instance.config.name, ...args]) : () => {};
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
    const child = new ComponentClass(el);
    Object.defineProperty(child, '$parent', {
      get: () => parent
    });
    return child;
  } // Resolve async components


  const asyncComponent = ComponentClass().then(module => {
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
 * @param  {Base}        instance   The component's instance.
 * @param  {HTMLElement} element    The component's root element
 * @param  {Object}      components The children components' classes
 * @return {null|Object}            Returns `null` if no child components are defined or an object of all child component instances
 */

function getChildren(instance, element, components) {
  const children = Object.entries(components).reduce((acc, [name, ComponentClass]) => {
    const elements = getComponentElements(name, element);

    if (elements.length === 0) {
      return acc;
    }

    acc[name] = elements.map(el => getChild(el, ComponentClass, instance)) // Filter out terminated children
    .filter(el => el !== 'terminated');

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
  let options = {};

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
  let options = {};

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
  const allRefs = Array.from(element.querySelectorAll(`[data-ref]`));
  const childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
  const elements = allRefs.filter(ref => !childrenRefs.includes(ref));
  const refs = elements.reduce(($refs, $ref) => {
    let refName = $ref.dataset.ref;
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
  if (!instance.$children) {
    return;
  }

  debug(instance, 'mountComponents', instance.$children);
  Object.values(instance.$children).forEach($child => {
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
  if (!instance.$children) {
    return;
  }

  debug(instance, 'destroyComponents', instance.$children);
  Object.values(instance.$children).forEach($child => {
    $child.forEach(destroyComponent);
  });
}

/**
 * Service abstract class
 */
class Service {
  /**
   * Class constructor, used to test the abstract class implementation.
   *
   * @return {Service} The current instance
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
   * @return {Service}           The current instance
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
 * Simple throttling helper that limits a
 * function to only run once every {delay}ms
 *
 * @param {Function} fn    The function to throttle
 * @param {Number}   delay The delay in ms
 */
function throttle(fn, delay = 16) {
  let lastCall = 0;
  return (...args) => {
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
 * @param {Function} fn    The function to call
 * @param {Number}   delay The delay in ms to wait before calling the function
 */
function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @type {Function}
 */
const getRaf = () => typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
/**
 * Execute a callback in the next frame.
 * @param  {Function} fn The callback function to execute.
 * @return {Promise}
 */

function nextFrame(fn = () => {}) {
  const raf = getRaf();
  return new Promise(resolve => {
    raf(() => raf(() => resolve(fn())));
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

class Raf extends Service {
  constructor(...args) {
    super(...args);
    this.isTicking = false;
  }

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {void}
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
  }
  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {void}
   */


  kill() {
    this.isTicking = false;
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
var useRaf = (() => {
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
   * @return {void}
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
        add('usePointer', () => {
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
  }
  /**
   * Unbind all handlers from their bounded event.
   *
   * @return {void}
   */


  kill() {
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
   * @param  {Event} event The event object.
   * @return {void}
   */


  updateValues(event) {
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
 */

var usePointer = (() => {
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

class Resize extends Service {
  /**
   * Bind the handler to the resize event.
   *
   * @return {void}
   */
  init() {
    this.handler = debounce(() => {
      this.trigger(this.props);
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


  kill() {
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


  get props() {
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
    return typeof window.ResizeObserver !== 'undefined';
  }

}

let resize = null;
var useResize = (() => {
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
   * @return {void}
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
  }
  /**
   * Unbind the handler from the scroll event.
   *
   * @return {void}
   */


  kill() {
    document.removeEventListener('scroll', this.handler);
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
var useScroll = (() => {
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
   * @return {void}
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
  }
  /**
   * Unbind the handler from the keyboard event.
   *
   * @return {void}
   */


  kill() {
    document.removeEventListener('keydown', this.handler);
    document.removeEventListener('keyup', this.handler);
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
var useKey = (() => {
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
    return () => {};
  }

  const {
    add,
    remove
  } = service();
  add(instance.$id, (...args) => {
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

        if ($ref.constructor && $ref.constructor.__isBase__) {
          // eslint-disable-next-line no-param-reassign
          $ref = $ref.$el;
        }

        $ref.addEventListener(eventName, handler);

        const unbindMethod = () => {
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
  const unbindMethods = [];
  Object.entries(instance.$children).forEach(([childName, $children]) => {
    const childEventMethod = `on${childName.replace(/^\w/, c => c.toUpperCase())}`;
    eventMethods.filter(eventMethod => eventMethod.startsWith(childEventMethod)).forEach(eventMethod => {
      $children.forEach(($child, index) => {
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

class Base extends EventManager {
  /**
   * Get the component's refs.
   * @return {Object}
   */
  get $refs() {
    return getRefs(this, this.$el);
  }
  /**
   * Get the component's children components.
   * @return {Object}
   */


  get $children() {
    return getChildren(this, this.$el, this.config.components || {});
  }
  /**
   * Get the component's merged config and options.
   * @return {Object}
   */


  get $options() {
    return getOptions(this, this.$el, this.config);
  }
  /**
   * Set the components option.
   * @param  {Object} value The new options values to merge with the old ones.
   * @return {void}
   */


  set $options(newOptions) {
    setOptions(this, this.$el, newOptions);
  }
  /**
   * Class constructor where all the magic takes place.
   *
   * @param  {HTMLElement} element The component's root element.
   * @return {Base}                A Base instance.
   */


  constructor(element) {
    super();

    if (!this.config) {
      throw new Error('The `config` getter must be defined.');
    }

    if (!this.config.name) {
      throw new Error('The `config.name` property is required.');
    }

    if (!element) {
      throw new Error('The root element must be defined.');
    }

    Object.defineProperties(this, {
      $id: {
        value: `${this.config.name}-${nonSecure()}`
      },
      $isMounted: {
        value: false,
        writable: true
      },
      $el: {
        value: element
      }
    });

    if (!this.$el.__base__) {
      Object.defineProperty(this.$el, '__base__', {
        get: () => this,
        configurable: true
      });
    } // Autobind all methods to the instance


    autoBind(this, {
      exclude: ['$mount', '$update', '$destroy', '$terminate', '$log', '$on', '$once', '$off', '$emit', 'mounted', 'loaded', 'ticked', 'resized', 'moved', 'keyed', 'scrolled', 'destroyed', 'terminated', ...(this._excludeFromAutoBind || [])]
    });
    let unbindMethods = [];
    this.$on('mounted', () => {
      mountComponents(this);
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
      this.$isMounted = true;
    });
    this.$on('updated', () => {
      unbindMethods.forEach(method => method());
      mountComponents(this);
      unbindMethods = [...bindServices(this), ...bindEvents(this)];
    });
    this.$on('destroyed', () => {
      this.$isMounted = false;
      unbindMethods.forEach(method => method());
      destroyComponents(this);
    }); // Mount class which are not used as another component's child.

    if (!this.__isChild__) {
      this.$mount();
      Object.defineProperty(this, '$parent', {
        get: () => null
      });
    }

    debug(this, 'constructor', this);
    return this;
  }
  /**
   * Small helper to log stuff.
   *
   * @param  {...any} args The arguments passed to the method
   * @return {void}
   */


  $log(...args) {
    return this.$options.log ? window.console.log.apply(window, [this.config.name, ...args]) : () => {};
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


  static $factory(nameOrSelector) {
    if (!nameOrSelector) {
      throw new Error('The $factory method requires a component’s name or selector to be specified.');
    }

    return getComponentElements(nameOrSelector).map(el => new this(el));
  }

}
Base.__isBase__ = true;

/**
 * Define a component without a class.
 *
 * @param  {Object} options The component's object
 * @return {Base}           A component's class.
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


  class Component extends Base {
    /**
     * Component config.
     */
    get config() {
      return config;
    }

  }

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
  const element = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
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

function setStyles(element, styles, method = 'add') {
  if (!element || !styles || !isObject(styles)) {
    return;
  }

  Object.entries(styles).forEach(([prop, value]) => {
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
function setClasses(element, classNames, method = 'add') {
  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(className => {
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

function setClassesOrStyles(element, classesOrStyles, method = 'add') {
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

  const {
    transitionDuration
  } = window.getComputedStyle(element);
  return !!transitionDuration && transitionDuration !== '0s';
}
/**
 * Apply the from state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @return {Promise}
 */


async function start(element, classesOrStyles) {
  element.__isTransitioning__ = true;
  setClassesOrStyles(element, classesOrStyles.from);
  await nextFrame();
  setClassesOrStyles(element, classesOrStyles.active);
  await nextFrame();
}
/**
 * Apply the active state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @return {Promise}
 */


async function next(element, classesOrStyles) {
  const hasTransition = testTransition(element);
  /* eslint-disable-next-line */

  return new Promise(async resolve => {
    if (hasTransition) {
      element.__transitionEndHandler__ = resolve;
      element.addEventListener('transitionend', element.__transitionEndHandler__, false);
    }

    setClassesOrStyles(element, classesOrStyles.from, 'remove');
    setClassesOrStyles(element, classesOrStyles.to);
    await nextFrame();

    if (!hasTransition) {
      resolve();
    }
  });
}
/**
 * Apply the final state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @param {String}        mode            Whether to remove or keep the `to`  classes/styles.
 * @return {void}
 */


function end(element, classesOrStyles, mode = 'remove') {
  element.removeEventListener('transitionend', element.__transitionEndHandler__, false);

  if (mode === 'remove') {
    setClassesOrStyles(element, classesOrStyles.to, 'remove');
  }

  setClassesOrStyles(element, classesOrStyles.active, 'remove');
  delete element.__isTransitioning__;
  delete element.__transitionEndHandler__;
}
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


async function transition(element, name, endMode = 'remove') {
  const classesOrStyles = typeof name === 'string' ? {
    from: `${name}-from`,
    active: `${name}-active`,
    to: `${name}-to`
  } : _extends({
    from: '',
    active: '',
    to: ''
  }, name); // End any previous transition running on the element.

  if (element.__isTransitioning__) {
    end(element, classesOrStyles);
  }

  await start(element, classesOrStyles);
  await next(element, classesOrStyles);
  end(element, classesOrStyles, endMode);
  return Promise.resolve();
}

/**
 * AccordionItem class.
 */

class AccordionItem extends Base {
  /**
   * AccordionItem config
   * @return {Object}
   */
  get config() {
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
  /**
   * Add aria-attributes on mounted.
   * @return {void}
   */


  mounted() {
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


    const _this$$options$styles = this.$options.styles,
          otherStyles = _objectWithoutPropertiesLoose(_this$$options$styles, ["container"]);

    Object.entries(otherStyles).filter(([refName]) => this.$refs[refName]).forEach(([refName, {
      open,
      closed
    } = {}]) => {
      transition(this.$refs[refName], {
        to: this.isOpen ? open : closed
      }, 'keep');
    });
  }
  /**
   * Handler for the click event on the `btn` ref.
   * @return {void}
   */


  onBtnClick() {
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


  get contentId() {
    return `content-${this.$id}`;
  }
  /**
   * Update the refs' attributes according to the given type.
   *
   * @param  {Boolean} isOpen The state of the item.
   * @return {void}
   */


  updateAttributes(isOpen) {
    this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
  /**
   * Open an item.
   * @return {void}
   */


  async open() {
    if (this.isOpen) {
      return;
    }

    this.$log('open');
    this.$emit('open');
    this.isOpen = true;
    this.updateAttributes(this.isOpen);
    remove(this.$refs.container, {
      visibility: 'invisible'
    });

    const _this$$options$styles2 = this.$options.styles,
          {
      container
    } = _this$$options$styles2,
          otherStyles = _objectWithoutPropertiesLoose(_this$$options$styles2, ["container"]);

    await Promise.all([transition(this.$refs.container, {
      from: {
        height: 0
      },
      active: container.active,
      to: {
        height: `${this.$refs.content.offsetHeight}px`
      }
    }).then(() => {
      // Remove style only if the item has not been closed before the end
      if (this.isOpen) {
        remove(this.$refs.content, {
          position: 'absolute'
        });
      }

      return Promise.resolve();
    }), ...Object.entries(otherStyles).filter(([refName]) => this.$refs[refName]).map(([refName, {
      open,
      active,
      closed
    } = {}]) => transition(this.$refs[refName], {
      from: closed,
      active,
      to: open
    }, 'keep'))]);
  }
  /**
   * Close an item.
   * @return {void}
   */


  async close() {
    if (!this.isOpen) {
      return;
    }

    this.$log('close');
    this.$emit('close');
    this.isOpen = false;
    const height = this.$refs.container.offsetHeight;
    add(this.$refs.content, {
      position: 'absolute'
    });

    const _this$$options$styles3 = this.$options.styles,
          {
      container
    } = _this$$options$styles3,
          otherStyles = _objectWithoutPropertiesLoose(_this$$options$styles3, ["container"]);

    await Promise.all([transition(this.$refs.container, {
      from: {
        height: `${height}px`
      },
      active: container.active,
      to: {
        height: 0
      }
    }).then(() => {
      // Add end styles only if the item has not been re-opened before the end
      if (!this.isOpen) {
        add(this.$refs.container, {
          height: 0,
          visibility: 'invisible'
        });
        this.updateAttributes(this.isOpen);
      }

      return Promise.resolve();
    }), ...Object.entries(otherStyles).filter(([refName]) => this.$refs[refName]).map(([refName, {
      open,
      active,
      closed
    } = {}]) => transition(this.$refs[refName], {
      from: open,
      active,
      to: closed
    }, 'keep'))]);
  }

}

/**
 * Accordion class.
 */

class Accordion extends Base {
  /**
   * Accordion config.
   * @return {Object}
   */
  get config() {
    return {
      name: 'Accordion',
      autoclose: true,
      item: null,
      components: {
        AccordionItem
      }
    };
  }
  /**
   * Init autoclose behavior on mounted.
   * @return {void}
   */


  mounted() {
    this.unbindMethods = this.$children.AccordionItem.map((item, index) => {
      const unbindOpen = item.$on('open', () => {
        this.$emit('open', item, index);

        if (this.$options.autoclose) {
          this.$children.AccordionItem.filter((el, i) => index !== i).forEach(it => it.close());
        }
      });
      const unbindClose = item.$on('close', () => {
        this.$emit('close', item, index);
      });
      return () => {
        unbindOpen();
        unbindClose();
      };
    });
  }
  /**
   * Destroy autoclose behavior on destroyed.
   * @return {void}
   */


  destroyed() {
    this.unbindMethods.forEach(unbind => unbind());
  }

}

/**
 * MediaQuery component.
 *
 * <div data-component="MediaQuery" data-active-breakpoints="l xl">
 *   <div data-component="Foo"></div>
 * </div>
 */

class MediaQuery extends Base {
  /**
   * Component's configuration.
   *
   * @return {Object}
   */
  get config() {
    return {
      name: 'MediaQuery'
    };
  }
  /**
   * Mounted hook.
   */


  mounted() {
    this.test();
    nextFrame(() => this.test());
  }
  /**
   * Resized hook.
   */


  resized() {
    this.test();
  }
  /**
   * Get the first element child of the component, as it must be another Base component that could
   * be either $mounted or $destroyed.
   *
   * @return {Base|Boolean}
   */


  get child() {
    const child = this.$el.firstElementChild ? this.$el.firstElementChild.__base__ : false;

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


  get currentBreakpoint() {
    return useResize().props().breakpoint;
  }
  /**
   * Get a list of breakpoints in which the child component should be $mounted.
   *
   * @return {Array}
   */


  get activeBreakpoints() {
    if (this.$el.dataset.activeBreakpoints) {
      return this.$el.dataset.activeBreakpoints.split(' ');
    }

    return [];
  }
  /**
   * Test if the child component should be either $mounted or $destroyed based on the current active
   * breakpoint and the given list of breakpoints.
   *
   * @return {void}
   */


  test() {
    const isInBreakpoints = this.activeBreakpoints.includes(this.currentBreakpoint);

    if (isInBreakpoints && !this.child.$isMounted) {
      this.child.$mount();
      return;
    }

    if (!isInBreakpoints && this.child.$isMounted) {
      this.child.$destroy();
    }
  }

}

const FOCUSABLE_ELEMENTS = ['a[href]:not([tabindex^="-"]):not([inert])', 'area[href]:not([tabindex^="-"]):not([inert])', 'input:not([disabled]):not([inert])', 'select:not([disabled]):not([inert])', 'textarea:not([disabled]):not([inert])', 'button:not([disabled]):not([inert])', 'iframe:not([tabindex^="-"]):not([inert])', 'audio:not([tabindex^="-"]):not([inert])', 'video:not([tabindex^="-"]):not([inert])', '[contenteditable]:not([tabindex^="-"]):not([inert])', '[tabindex]:not([tabindex^="-"]):not([inert])'];
/**
 * Use a trap/untrap tabs logic.
 *
 * @return {Object} An object containing the trap and untrap methods.
 */

function useFocusTrap() {
  let focusedBefore;
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

    const focusableChildren = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS.join(', ')));
    const focusedItemIndex = focusableChildren.indexOf(document.activeElement);

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
    trap,
    untrap,
    saveActiveElement
  };
}

const {
  trap,
  untrap,
  saveActiveElement
} = useFocusTrap();
/**
 * Modal class.
 */

class Modal extends Base {
  /**
   * Modal options.
   */
  get config() {
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


  get onOpenClick() {
    return this.open;
  }
  /**
   * Close the modal on click on the `close` ref.
   *
   * @return {Function} The component's `close` method.
   */


  get onCloseClick() {
    return this.close;
  }
  /**
   * Close the modal on click on the `overlay` ref.
   *
   * @return {Function} The component's `close` method.
   */


  get onOverlayClick() {
    return this.close;
  }
  /**
   * Initialize the component's behaviours.
   *
   * @return {Modal} The current instance.
   */


  mounted() {
    this.isOpen = false;
    this.close();

    if (this.$options.move) {
      const target = document.querySelector(this.$options.move) || document.body;
      const refsBackup = this.$refs;
      this.refModalPlaceholder = document.createComment('');
      this.refModalParentBackup = this.$refs.modal.parentElement || this.$el;
      this.refModalParentBackup.insertBefore(this.refModalPlaceholder, this.$refs.modal);
      this.refModalUnbindGetRefFilter = this.$on('get:refs', refs => {
        Object.entries(refsBackup).forEach(([key, ref]) => {
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


  destroyed() {
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


  keyed({
    event,
    isUp,
    isDown,
    ESC
  }) {
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


  async open() {
    if (this.isOpen) {
      return Promise.resolve(this);
    }

    this.$refs.modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    this.isOpen = true;
    this.$emit('open');
    return Promise.all(Object.entries(this.$options.styles).map(([refName, {
      open,
      active,
      closed
    } = {}]) => transition(this.$refs[refName], {
      from: closed,
      active,
      to: open
    }, 'keep'))).then(() => {
      if (this.$options.autofocus && this.$refs.modal.querySelector(this.$options.autofocus)) {
        saveActiveElement();
        this.$refs.modal.querySelector(this.$options.autofocus).focus();
      }

      return Promise.resolve(this);
    });
  }
  /**
   * Close the modal.
   *
   * @return {Modal} The Modal instance.
   */


  async close() {
    if (!this.isOpen) {
      return Promise.resolve(this);
    }

    this.$refs.modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    this.isOpen = false;
    untrap();
    this.$emit('close');
    return Promise.all(Object.entries(this.$options.styles).map(([refName, {
      open,
      active,
      closed
    } = {}]) => transition(this.$refs[refName], {
      from: open,
      active,
      to: closed
    }, 'keep'))).then(() => Promise.resolve(this));
  }

}

/**
 * Tabs class.
 */

class Tabs extends Base {
  /**
   * Tabs options.
   */
  get config() {
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
  /**
   * Initialize the component's behaviours.
   *
   * @return {Tabs} The current instance.
   */


  mounted() {
    this.items = this.$refs.btn.map((btn, index) => {
      const id = `${this.$id}-${index}`;
      const content = this.$refs.content[index];
      btn.setAttribute('id', id);
      content.setAttribute('aria-labelledby', id);
      const item = {
        btn,
        content,
        isEnabled: index > 0
      };

      if (index > 0) {
        this.disableItem(item);
      } else {
        this.enableItem(item);
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


  onBtnClick(event, index) {
    this.items.forEach((item, i) => {
      if (i !== index) {
        this.disableItem(item);
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


  async enableItem(item) {
    if (!item || item.isEnabled) {
      return Promise.resolve(this);
    }

    item.isEnabled = true;
    const {
      btn,
      content
    } = item;
    const btnStyles = this.$options.styles.btn || {};
    const contentStyles = this.$options.styles.content || {};
    content.setAttribute('aria-hidden', 'false');
    this.$emit('enable', item);
    return Promise.all([transition(btn, {
      from: btnStyles.closed,
      active: btnStyles.active,
      to: btnStyles.open
    }, 'keep'), transition(content, {
      from: contentStyles.closed,
      active: contentStyles.active,
      to: contentStyles.open
    }, 'keep')]).then(() => Promise.resolve(this));
  }
  /**
   * Disable the given tab and its associated content.
   *
   * @param  {HTMLElement} btn     The tab element.
   * @param  {HTMLElement} content The content element.
   * @return {Tabs}                The Tabs instance.
   */


  async disableItem(item) {
    if (!item || !item.isEnabled) {
      return Promise.resolve(this);
    }

    item.isEnabled = false;
    const {
      btn,
      content
    } = item;
    const btnStyles = this.$options.styles.btn || {};
    const contentStyles = this.$options.styles.content || {};
    content.setAttribute('aria-hidden', 'true');
    this.$emit('disable', item);
    return Promise.all([transition(btn, {
      from: btnStyles.open,
      active: btnStyles.active,
      to: btnStyles.closed
    }, 'keep'), transition(content, {
      from: contentStyles.open,
      active: contentStyles.active,
      to: contentStyles.closed
    }, 'keep')]).then(() => Promise.resolve(this));
  }

}



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
  const {
    breakpoint
  } = useResize().props();
  breakpoints.forEach(([breakpointKeys, instance]) => {
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


const instances = {};
/**
 * BreakpointManager class.
 */

var withBreakpointManager = ((BaseClass, breakpoints) => {
  if (!Array.isArray(breakpoints)) {
    throw new Error('[withBreakpointManager] The `breakpoints` parameter must be an array.');
  }

  if (breakpoints.length < 2) {
    throw new Error('[withBreakpointManager] You must define at least 2 breakpoints.');
  }

  const {
    add,
    props
  } = useResize(); // Do nothing if no breakpoint has been defined.
  // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

  if (!props().breakpoint) {
    throw new Error(`The \`BreakpointManager\` class requires breakpoints to be defined.`);
  }

  return class BreakpointManager extends BaseClass {
    /**
     * Watch for the document resize to test the breakpoints.
     * @param  {HTMLElement} element The component's root element.
     * @return {BreakpointManager}          The current instance.
     */
    constructor(element) {
      super(element);
      instances[this.$id] = breakpoints.map(([bk, ComponentClass]) => {
        // eslint-disable-next-line no-underscore-dangle
        ComponentClass.prototype.__isChild__ = true;
        const instance = new ComponentClass(this.$el);
        Object.defineProperty(instance, '$parent', {
          get: () => this
        });
        return [bk, instance];
      });
      add(`BreakpointManager-${this.$id}`, () => {
        testBreakpoints(instances[this.$id]);
      });
      return this;
    }
    /**
     * Override the default $mount method to prevent component's from being
     * mounted when they should not.
     * @return {Base} The Base instance.
     */


    $mount() {
      testBreakpoints(instances[this.$id]);
      return super.$mount();
    }
    /**
     * Destroy all instances when the main one is destroyed.
     * @return {Base} The Base instance.
     */


    $destroy() {
      if (Array.isArray(instances[this.$id])) {
        instances[this.$id].forEach(([, instance]) => {
          instance.$destroy();
        });
      }

      return super.$destroy();
    }

  };
});

/**
 * Test the breakpoins of the given Base instance and return the hook to call.
 *
 * @param  {BreakpointObserver} instance The component's instance.
 * @return {Sring}                       The action to trigger.
 */

function testBreakpoints$1(instance, breakpoint = useResize().props().breakpoint) {
  const {
    activeBreakpoints,
    inactiveBreakpoints
  } = instance.$options;
  const isInActiveBreakpoint = activeBreakpoints && activeBreakpoints.split(' ').includes(breakpoint);
  const isInInactiveBreakpoint = inactiveBreakpoints && inactiveBreakpoints.split(' ').includes(breakpoint);

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
  const {
    activeBreakpoints,
    inactiveBreakpoints
  } = instance.$options;
  return Boolean(activeBreakpoints || inactiveBreakpoints);
}
/**
 * Test if the given instance has a conflicting configuration for breakpoints.
 * @param  {Base} instance A Base class instance.
 * @return {void}
 */


function testConflictingBreakpointConfiguration(instance) {
  const {
    activeBreakpoints,
    inactiveBreakpoints,
    name
  } = instance.$options;

  if (activeBreakpoints && inactiveBreakpoints) {
    throw new Error(`[${name}] Incorrect configuration: the \`activeBreakpoints\` and \`inactiveBreakpoints\` are not compatible.`);
  }
}
/**
 * Add the current instance to the resize service.
 * @param {String} key      The key for the resize service callback.
 * @param {Base}   instance The instance to observe.
 */


function addToResize(key, instance) {
  testConflictingBreakpointConfiguration(instance);
  const {
    add,
    has
  } = useResize();

  if (!has(key)) {
    add(key, function onResize({
      breakpoint
    }) {
      const action = testBreakpoints$1(instance, breakpoint); // Always destroy before mounting

      if (action === '$destroy' && instance.$isMounted) {
        instance[action]();
      } else if (action === '$mount' && !instance.$isMounted) {
        setTimeout(() => instance[action](), 0);
      }
    });
  }
}
/**
 * BreakpointObserver class.
 */


var withBreakpointObserver = (BaseClass => class BreakpointObserver extends BaseClass {
  /**
   * Watch for the document resize to test the breakpoints.
   * @param  {HTMLElement} element The component's root element.
   * @return {BreakpointObserver}          The current instance.
   */
  constructor(element) {
    super(element);
    const {
      add,
      has,
      remove,
      props
    } = useResize();
    const {
      name
    } = this.$options; // Do nothing if no breakpoint has been defined.
    // @see https://js-toolkit.meta.fr/services/resize.html#breakpoint

    if (!props().breakpoint) {
      throw new Error(`[${name}] The \`BreakpointObserver\` class requires breakpoints to be defined.`);
    }

    const key = `BreakpointObserver-${this.$id}`; // Watch change on the `data-options` attribute to emit the `set:options` event.

    const mutationObserver = new MutationObserver(([mutation]) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-options') {
        // Stop here silently when no breakpoint configuration given.
        if (!hasBreakpointConfiguration(this)) {
          this.$mount();
          remove(key);
          return;
        }

        addToResize(key, this);
      }
    });
    mutationObserver.observe(this.$el, {
      attributes: true
    }); // Stop here silently when no breakpoint configuration given.

    if (!hasBreakpointConfiguration(this)) {
      return this;
    }

    addToResize(key, this);
    return this;
  }
  /**
   * Override the default $mount method to prevent component's from being
   * mounted when they should not.
   * @return {BreakpointObserver} The component's instance.
   */


  $mount() {
    // Execute normal behavior when no breakpoint configuration given.
    if (!hasBreakpointConfiguration(this)) {
      return super.$mount();
    }

    const action = testBreakpoints$1(this);

    if (action === '$mount') {
      return super.$mount();
    }

    return this;
  }

});

/**
 * Create an array of number between 0 and 1 from the given length.
 * @param  {Number} length The length of the array.
 * @return {Array}        An array of number.
 */

function createArrayOfNumber(length) {
  return [...new Array(length + 1)].map((val, index) => index / length);
}
/**
 * IntersectionObserver decoration.
 */


var withIntersectionObserver = ((BaseClass, defaultOptions = {
  threshold: createArrayOfNumber(100)
}) => class extends BaseClass {
  /**
   * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
   */
  get _excludeFromAutoBind() {
    return [...(super._excludeFromAutoBind || []), 'intersected'];
  }
  /**
   * Create an observer when the class in instantiated.
   *
   * @param  {HTMLElement} element The component's root element.
   * @return {Base}                The class instace.
   */


  constructor(element) {
    super(element);

    if (!this.intersected || typeof this.intersected !== 'function') {
      throw new Error('[withIntersectionObserver] The `intersected` method must be defined.');
    }

    this.$observer = new IntersectionObserver(entries => {
      debug(this, 'intersected', entries);
      this.$emit('intersected', entries);
      this.intersected(entries);
    }, _extends({}, defaultOptions, this.$options.intersectionObserver || {}));

    if (this.$isMounted) {
      this.$observer.observe(this.$el);
    }

    this.$on('mounted', () => {
      this.$observer.observe(this.$el);
    });
    this.$on('destroyed', () => {
      this.$observer.unobserve(this.$el);
    });
    return this;
  }

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
 * @param  {Number} options.scaleX     The scale on the x axis.
 * @param  {Number} options.scaleY     The scale on the y axis.
 * @param  {Number} options.skewX      The skew on the x axis.
 * @param  {Number} options.skewY      The skew on the y axis.
 * @param  {Number} options.translateX The translate on the x axis.
 * @param  {Number} options.translateY The translate on the y axis.
 * @return {String}                    A formatted CSS matrix transform.
 */
function matrix(transform) {
  // eslint-disable-next-line no-param-reassign
  transform = transform || {};
  return `matrix(${transform.scaleX || 1}, ${transform.skewX || 0}, ${transform.skewY || 0}, ${transform.scaleY || 1}, ${transform.translateX || 0}, ${transform.translateY || 0})`;
}



var index$4 = {
  __proto__: null,
  classes: classes,
  styles: styles,
  matrix: matrix,
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
function damp(targetValue, currentValue, speed = 0.5) {
  const value = currentValue + (targetValue - currentValue) * speed;
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
function round(value, decimals = 0) {
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

/**
 * Set a param in a URLSearchParam instance.
 * @param  {URLSearchParams}                    params The params to update.
 * @param  {String}                             name   The name of the param to update.
 * @param  {String|Number|Boolean|Array|Object} value  The value for this param.
 * @return {URLSearchParams}                           The updated URLSearchParams instance.
 */

function updateUrlSearchParam(params, name, value) {
  if (!value) {
    if (params.has(name)) {
      params.delete(name);
    }

    return params;
  }

  if (Array.isArray(value)) {
    value.forEach((val, index) => {
      const arrayName = `${name}[${index}]`;
      updateUrlSearchParam(params, arrayName, val);
    });
    return params;
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([key, val]) => {
      const objectName = `${name}[${key}]`;
      updateUrlSearchParam(params, objectName, val);
    });
    return params;
  }

  params.set(name, value);
  return params;
}
/**
 * Transform an object to an URLSearchParams instance.
 *
 * @param  {Object}          obj           The object to convert.
 * @param  {String}          defaultSearch A string of defaults search params.
 * @return {URLSearchParams}
 */


function objectToURLSearchParams(obj, defaultSearch = window.location.search) {
  return Object.entries(obj).reduce((urlSearchParams, [name, value]) => updateUrlSearchParam(urlSearchParams, name, value), new URLSearchParams(defaultSearch));
}
/**
 * Update the history with a new state.
 * @param {String} mode             Wether to push or replace the new state.
 * @param {String} options.path     The new pathname.
 * @param {Object} options.search   The new search params.
 * @param {Object} options.hash     The new hash.
 */


function updateHistory(mode, {
  path = window.location.pathname,
  search = {},
  hash = window.location.hash
}, data = {}, title = '') {
  if (!window.history) {
    return;
  }

  let url = path;
  const mergedSearch = objectToURLSearchParams(search);

  if (mergedSearch.toString()) {
    url += `?${mergedSearch.toString()}`;
  }

  if (hash) {
    if (hash.startsWith('#')) {
      url += hash;
    } else {
      url += `#${hash}`;
    }
  }

  const method = `${mode}State`;
  window.history[method](data, title, url);
}
/**
 * Push a new state.
 *
 * @param {Object} options The new state.
 * @param {Object} data    The data for the new state.
 * @param {String} title   The title for the new state.
 */


function push(options, data, title) {
  updateHistory('push', options, data, title);
}
/**
 * Replace a new state.
 *
 * @param {Object} options The new state.
 * @param {Object} data    The data for the new state.
 * @param {String} title   The title for the new state.
 */

function replace(options, data, title) {
  updateHistory('replace', options, data, title);
}

var history = {
  __proto__: null,
  push: push,
  replace: replace
};



var index$7 = {
  __proto__: null,
  css: index$4,
  math: index$5,
  object: index$6,
  history: history,
  debounce: debounce,
  focusTrap: useFocusTrap,
  keyCodes: keyCodes,
  nextFrame: nextFrame,
  throttle: throttle
};

export { Base, index as abstracts, index$1 as components, createBase, index$2 as decorators, defineComponent, index$3 as services, index$7 as utils };
//# sourceMappingURL=full.modern.js.map
