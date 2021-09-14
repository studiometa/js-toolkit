import deepmerge from 'deepmerge';
import isObject from '../../utils/object/isObject.js';

/**
 * @typedef {import('../index.js').BaseConfig} BaseConfig
 * @typedef {StringConstructor|NumberConstructor|BooleanConstructor|ArrayConstructor|ObjectConstructor} OptionType
 * @typedef {{ type: OptionType, default: String|Number|Boolean|(() => Array|Object)}} OptionWithDefault
 * @typedef {OptionType | OptionWithDefault} OptionValue
 * @typedef {{ [name:string]: OptionValue }} OptionsSchema
 * @typedef {{ [optionName:string]: any }} OptionsInterface
 */

/**
 * Class options to manage options as data attributes on an HTML element.
 * @augments {OptionsInterface}
 */
export default class OptionsManager {
  /**
   * The HTML element holding the options attributes.
   * @type {HTMLElement}
   * @private
   */
  __element;

  /**
   * An object to store Array and Object values for reference.
   * @type {Object}
   * @private
   */
  __values = {};

  /**
   * List of allowed types.
   * @type {Array}
   * @private
   */
  static types = [String, Number, Boolean, Array, Object];

  /**
   * The default values to return for each available type.
   * @type {Object}
   * @private
   */
  __defaultValues = {
    String: '',
    Number: 0,
    Boolean: false,
    Array: () => [],
    Object: () => ({}),
  };

  /**
   * Default value for the name property.
   * @type {string}
   */
  name = 'Base';

  /**
   * Default value for the debug property.
   * @type {boolean}
   */
  debug = false;

  /**
   * Default value for the log property.
   * @type {Boolean}
   */
  log = false;

  /**
   * Class constructor.
   *
   * @param {HTMLElement}   element The HTML element storing the options.
   * @param {OptionsSchema} schema  A Base class config options.
   * @param {BaseConfig}    baseConfig  A Base class config.
   */
  constructor(element, schema, baseConfig) {
    this.__element = element;
    this.name = baseConfig.name;

    schema.debug = {
      type: Boolean,
      default: baseConfig.debug ?? false,
    };

    schema.log = {
      type: Boolean,
      default: baseConfig.log ?? false,
    };

    Object.entries(schema).forEach(([name, config]) => {
      this.__register(name, config);
    });

    return this;
  }

  /**
   * Register an option.
   *
   * @param  {string} name
   * @param  {OptionValue} config
   * @return {void}
   * @private
   */
  __register(name, config) {
    const hasDefaultValue = !OptionsManager.types.includes(config);
    const type = hasDefaultValue
      ? /** @type {OptionWithDefault} */ (config).type
      : /** @type {OptionType} */ (config);

    if (!OptionsManager.types.includes(type)) {
      throw new Error(
        `The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`
      );
    }

    // @ts-ignore
    const defaultValue = hasDefaultValue ? config.default : this.__defaultValues[type.name];

    if ((type === Array || type === Object) && typeof defaultValue !== 'function') {
      throw new Error(
        `The default value for options of type "${type.name}" must be returned by a function.`
      );
    }

    Object.defineProperty(this, name, {
      get: () => {
        return this.get(name, type, defaultValue);
      },
      set: (value) => {
        this.set(name, type, value, defaultValue);
      },
      enumerable: true,
    });
  }

  /**
   * Get an option value.
   *
   * @param {String} name The option name.
   * @param {OptionType} type The option data's type.
   * @param {any} defaultValue The default value for this option.
   */
  get(name, type, defaultValue) {
    const propertyName = OptionsManager.__getPropertyName(name);
    const hasProperty = this.__hasProperty(propertyName);

    if (type === Boolean) {
      if (defaultValue) {
        const negatedPropertyName = OptionsManager.__getPropertyName(name, 'No');
        const hasNegatedProperty = this.__hasProperty(negatedPropertyName);

        return !hasNegatedProperty;
      }

      return hasProperty || defaultValue;
    }

    const value = this.__element.dataset[propertyName];

    if (type === Number) {
      return hasProperty ? Number(value) : defaultValue;
    }

    if (type === Array || type === Object) {
      const val = deepmerge(
        defaultValue(),
        hasProperty ? JSON.parse(value) : this.__defaultValues[type.name]()
      );

      if (!this.__values[name]) {
        this.__values[name] = val;
      }

      return this.__values[name];
    }

    return hasProperty ? value : defaultValue;
  }

  /**
   * Set an option value.
   *
   * @param {String} name The option name.
   * @param {OptionType} type The option data's type.
   * @param {any} value The new value for this option.
   */
  set(name, type, value, defaultValue) {
    const propertyName = OptionsManager.__getPropertyName(name);

    if (value.constructor.name !== type.name) {
      const val = Array.isArray(value) || isObject(value) ? JSON.stringify(value) : value;
      throw new TypeError(
        `The "${val}" value for the "${name}" option must be of type "${type.name}"`
      );
    }

    switch (type) {
      case Boolean:
        if (defaultValue) {
          const negatedPropertyName = OptionsManager.__getPropertyName(name, 'No');

          if (value) {
            delete this.__element.dataset[negatedPropertyName];
          } else {
            this.__element.dataset[negatedPropertyName] = '';
          }
        } else if (value) {
          this.__element.dataset[propertyName] = '';
        } else {
          delete this.__element.dataset[propertyName];
        }
        break;
      case Array:
      case Object:
        this.__values[name] = value;
        break;
      default:
        this.__element.dataset[propertyName] = value;
    }
  }

  /**
   * Test if the element has a given property.
   *
   * @param  {string} prop
   * @return {boolean}
   */
  __hasProperty(prop) {
    return typeof this.__element.dataset[prop] !== 'undefined';
  }

  /**
   * Property name cache.
   * @type {Map}
   * @private
   */
  static __propertyNameCache = new Map();

  /**
   * Get a property name.
   *
   * @param  {string} name
   * @return {string}
   * @private
   */
  static __getPropertyName(name, prefix = '') {
    const key = name + prefix;

    if (OptionsManager.__propertyNameCache.has(key)) {
      return OptionsManager.__propertyNameCache.get(key);
    }

    const propertyName = `option${prefix}${name.replace(/^\w/, (c) => c.toUpperCase())}`;
    OptionsManager.__propertyNameCache.set(key, propertyName);
    return propertyName;
  }
}
