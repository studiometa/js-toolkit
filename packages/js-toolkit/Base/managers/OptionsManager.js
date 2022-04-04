import deepmerge from 'deepmerge';
import isObject from '../../utils/object/isObject.js';

/**
 * @typedef {import('deepmerge').Options} DeepmergeOptions
 * @typedef {import('../index.js').BaseConfig} BaseConfig
 * @typedef {StringConstructor|NumberConstructor|BooleanConstructor|ArrayConstructor|ObjectConstructor} OptionType
 * @typedef {{
 *   type: ArrayConstructor,
 *   default?: () => any[],
 *   merge?: boolean,
 * }} ArrayOption
 * @typedef {{
 *   type: ObjectConstructor,
 *   default?: () => any,
 *   merge?: boolean,
 * }} ObjectOption
 * @typedef {{
 *   type: StringConstructor,
 *   default?: string,
 * }} StringOption
 * @typedef {{
 *   type: NumberConstructor,
 *   default?: number,
 * }} NumberOption
 * @typedef {{
 *   type: BooleanConstructor,
 *   default?: boolean,
 * }} BooleanOption
 * @typedef {ArrayOption | ObjectOption | StringOption | NumberOption | BooleanOption} OptionObject
 * @typedef {{ [name:string]: OptionType | OptionObject }} OptionsSchema
 * @typedef {{ [optionName:string]: any }} OptionsInterface
 */

/**
 * Class options to manage options as data attributes on an HTML element.
 *
 * @todo Use `MutationObserver` to update values? Might be more performant.
 * @augments {OptionsInterface}
 */
export default class OptionsManager {
  /**
   * The HTML element holding the options attributes.
   * @type {HTMLElement}
   * @protected
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
   * @type {Set<OptionType>}
   * @private
   */
  static types = new Set([String, Number, Boolean, Array, Object]);

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
   * @type {boolean}
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
    Object.defineProperties(this, {
      __element: {
        enumerable: false,
        writable: false,
        value: element,
      },
      __values: {
        enumerable: false,
        writable: false,
        value: this.__values,
      },
      __defaultValues: {
        enumerable: false,
        writable: false,
        value: this.__defaultValues,
      },
    });

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
      this.__register(
        name,
        OptionsManager.types.has(/** @type {OptionType} */ (config))
          ? /** @type {OptionObject} */ ({ type: config })
          : /** @type {OptionObject} */ (config)
      );
    });
  }

  /**
   * Register an option.
   *
   * @param  {string} name
   * @param  {OptionObject} config
   * @returns {void}
   * @private
   */
  __register(name, config) {
    if (!OptionsManager.types.has(config.type)) {
      throw new Error(
        `The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`
      );
    }

    config.default = config.default ?? this.__defaultValues[config.type.name];

    if ((config.type === Array || config.type === Object) && typeof config.default !== 'function') {
      throw new Error(
        `The default value for options of type "${config.type.name}" must be returned by a function.`
      );
    }

    Object.defineProperty(this, name, {
      get: () => {
        return this.get(name, config);
      },
      set: (value) => {
        this.set(name, value, config);
      },
      enumerable: true,
    });
  }

  /**
   * Get an option value.
   *
   * @param   {string} name The option name.
   * @param   {OptionObject} config The option config.
   * @returns {any}
   */
  get(name, config) {
    const { type, default: defaultValue } = config;
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
      // eslint-disable-next-line no-param-reassign
      config =
        type === Array ? /** @type {ArrayOption} */ (config) : /** @type {ObjectOption} */ (config);

      if (!this.__values[name]) {
        let val = hasProperty ? JSON.parse(value) : config.default();

        if (typeof config.merge !== 'undefined') {
          val =
            typeof config.merge === 'boolean'
              ? deepmerge(config.default(), val)
              : deepmerge(config.default(), val, config.merge);
        }

        this.__values[name] = val;
      }

      return this.__values[name];
    }

    return hasProperty ? value : defaultValue;
  }

  /**
   * Set an option value.
   *
   * @param {string} name The option name.
   * @param {any} value The new value for this option.
   * @param {OptionObject} config The option config.
   */
  set(name, value, config) {
    const { type, default: defaultValue } = config;
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
   * @returns {boolean}
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
   * @param  {string} [prefix]
   * @returns {string}
   * @protected
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
