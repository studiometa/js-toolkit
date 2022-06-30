import deepmerge from 'deepmerge';
import AbstractManager from './AbstractManager.js';
import { isDev, isFunction, isDefined, isBoolean, isArray, isObject } from '../../utils/index.js';

/**
 * @typedef {import('deepmerge').Options} DeepmergeOptions
 * @typedef {import('../index.js').default} Base
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
 * List of allowed types.
 * @type {Set<OptionType>}
 * @private
 */
const types = new Set([String, Number, Boolean, Array, Object]);

/**
 * The default values to return for each available type.
 * @type {Object}
 * @private
 */
const __defaultValues = {
  String: '',
  Number: 0,
  Boolean: false,
  Array: () => [],
  Object: () => ({}),
};

/**
 * Property name cache.
 * @type {Map}
 * @private
 */
const __propertyNameCache = new Map();

/**
 * Get a property name.
 *
 * @param  {string} name
 * @param  {string} [prefix]
 * @returns {string}
 * @protected
 */
export function __getPropertyName(name, prefix = '') {
  const key = name + prefix;

  if (__propertyNameCache.has(key)) {
    return __propertyNameCache.get(key);
  }

  const propertyName = `option${prefix}${name.replace(/^\w/, (c) => c.toUpperCase())}`;
  __propertyNameCache.set(key, propertyName);
  return propertyName;
}

/**
 * Register an option.
 *
 * @param  {OptionsManager} that
 * @param  {string} name
 * @param  {OptionObject} config
 * @returns {void}
 * @private
 */
function __register(that, name, config) {
  if (!types.has(config.type)) {
    if (isDev) {
      throw new Error(
        `The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`
      );
    }
    return;
  }

  config.default = config.default ?? __defaultValues[config.type.name];

  if ((config.type === Array || config.type === Object) && !isFunction(config.default)) {
    if (isDev) {
      throw new Error(
        `The default value for options of type "${config.type.name}" must be returned by a function.`
      );
    }
    return;
  }

  Object.defineProperty(that, name, {
    get: () => {
      return that.get(name, config);
    },
    set: (value) => {
      that.set(name, value, config);
    },
    enumerable: true,
  });
}

/**
 * Class options to manage options as data attributes on an HTML element.
 *
 * @todo Use `MutationObserver` to update values? Might be more performant.
 */
export default class OptionsManager extends AbstractManager {
  /**
   * An object to store Array and Object values for reference.
   * @type {Object}
   * @private
   */
  __values = {};

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
   * @param   {Base} base
   */
  constructor(base) {
    super(base);

    this.__hideProperties(['__values', '__defaultValues']);
    const schema = this.__config.options || {};
    this.name = this.__config.name;

    schema.debug = {
      type: Boolean,
      default: this.__config.debug ?? false,
    };

    schema.log = {
      type: Boolean,
      default: this.__config.log ?? false,
    };

    Object.entries(schema).forEach(([name, config]) => {
      __register(
        this,
        name,
        types.has(/** @type {OptionType} */ (config))
          ? /** @type {OptionObject} */ ({ type: config })
          : /** @type {OptionObject} */ (config)
      );
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
    const propertyName = __getPropertyName(name);
    const hasProperty = isDefined(this.__element.dataset[propertyName]);

    if (type === Boolean) {
      if (defaultValue) {
        const negatedPropertyName = __getPropertyName(name, 'No');
        const hasNegatedProperty = isDefined(this[negatedPropertyName]);

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

        if (isDefined(config.merge)) {
          val = isBoolean(config.merge)
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
    const propertyName = __getPropertyName(name);

    if (value.constructor.name !== type.name) {
      if (isDev) {
        const val = isArray(value) || isObject(value) ? JSON.stringify(value) : value;
        throw new TypeError(
          `The "${val}" value for the "${name}" option must be of type "${type.name}"`
        );
      }
      return;
    }

    switch (type) {
      case Boolean:
        if (defaultValue) {
          const negatedPropertyName = __getPropertyName(name, 'No');

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
}
