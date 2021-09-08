import deepmerge from 'deepmerge';
import { noCase } from 'no-case';
import mem from 'mem';
import isObject from '../../../utils/object/isObject.js';

/**
 * @typedef {import('../index.js').BaseConfig} BaseConfig
 * @typedef {StringConstructor|NumberConstructor|BooleanConstructor|ArrayConstructor|ObjectConstructor} OptionType
 * @typedef {{ [name:string]: OptionType | { type: OptionType, default: String|Number|Boolean|(() => Array|Object)} }} OptionsSchema
 * @typedef {{ [optionName:string]: any }} OptionsInterface
 */

/**
 * Get the attribute name based on the given option name.
 * @param {String} name The option name.
 */
function getAttributeName(name) {
  return `data-option-${noCase(name, { delimiter: '-' })}`;
}

const memoizedGetAttributeName = mem(getAttributeName);

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
      const isObjectConfig = !OptionsManager.types.includes(config);
      /** @type {OptionType} */
      // @ts-ignore
      const type = isObjectConfig ? config.type : config;

      if (!OptionsManager.types.includes(type)) {
        throw new Error(
          `The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`
        );
      }

      // @ts-ignore
      const defaultValue = isObjectConfig ? config.default : this.__defaultValues[type.name];

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
    const attributeName = memoizedGetAttributeName(name);
    const hasAttribute = this.__element.hasAttribute(attributeName);

    if (type === Boolean) {
      if (defaultValue) {
        const negatedAttributeName = memoizedGetAttributeName(`no-${name}`);
        const hasNegatedAttribute = this.__element.hasAttribute(negatedAttributeName);

        return !hasNegatedAttribute;
      }

      return hasAttribute || defaultValue;
    }

    const value = this.__element.getAttribute(attributeName);

    if (type === Number) {
      return hasAttribute ? Number(value) : defaultValue;
    }

    if (type === Array || type === Object) {
      const val = deepmerge(
        defaultValue(),
        hasAttribute ? JSON.parse(value) : this.__defaultValues[type.name]()
      );

      if (!this.__values[name]) {
        this.__values[name] = val;
      } else if (val !== this.__values[name]) {
        // When getting the value, wait for the next loop to update the data attribute
        // with the new value. This is a simple trick to avoid using a Proxy to watch
        // for any deep changes on an array or object. It should not break anything as
        // the original value is read once from the data attribute and is then read from
        // the private property `__values`.
        setTimeout(() => {
          this.__element.setAttribute(attributeName, JSON.stringify(this.__values[name]));
        }, 0);
      }

      return this.__values[name];
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
  set(name, type, value, defaultValue) {
    const attributeName = memoizedGetAttributeName(name);

    if (value.constructor.name !== type.name) {
      const val = Array.isArray(value) || isObject(value) ? JSON.stringify(value) : value;
      throw new TypeError(
        `The "${val}" value for the "${name}" option must be of type "${type.name}"`
      );
    }

    switch (type) {
      case Boolean:
        if (defaultValue) {
          const negatedAttributeName = memoizedGetAttributeName(`no-${name}`);

          if (value) {
            this.__element.removeAttribute(negatedAttributeName);
          } else {
            this.__element.setAttribute(negatedAttributeName, '');
          }
        } else if (value) {
          this.__element.setAttribute(attributeName, '');
        } else {
          this.__element.removeAttribute(attributeName);
        }
        break;
      case Array:
      case Object:
        this.__values[name] = value;
        this.__element.setAttribute(attributeName, JSON.stringify(value));
        break;
      default:
        this.__element.setAttribute(attributeName, value);
    }
  }
}
