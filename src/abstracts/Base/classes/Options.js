import deepmerge from 'deepmerge';
import { noCase } from 'no-case';
import isObject from '../../../utils/object/isObject';

/**
 * @typedef {StringConstructor|NumberConstructor|BooleanConstructor|ArrayConstructor|ObjectConstructor} OptionType
 * @typedef {{ [name:string]: OptionType | { type: OptionType, default: String|Number|Boolean|(() => Array|Object)} }} OptionsSchema
 */

/**
 * Get the attribute name based on the given option name.
 * @param {String} name The option name.
 */
function getAttributeName(name) {
  return `data-option-${noCase(name, { delimiter: '-' })}`;
}

/**
 * Class options to manage options as data attributes on an HTML element.
 */
export default class Options {
  /** @type {HTMLElement} The HTML element holding the options attributes. */
  #element;

  /** @type {Object} An object to store Array and Object values for reference. */
  #values = {};

  /** @type {Array} List of allowed types. */
  static types = [String, Number, Boolean, Array, Object];

  /**
   * The default values to return for each available type.
   * @type {Object}
   */
  #defaultValues = {
    String: '',
    Number: 0,
    Boolean: false,
    Array: () => [],
    Object: () => ({}),
  };

  /**
   * Class constructor.
   *
   * @param {HTMLElement}   element The HTML element storing the options.
   * @param {OptionsSchema} schema  A Base class config.
   */
  constructor(element, schema) {
    this.#element = element;

    Object.entries(schema).forEach(([name, config]) => {
      const isObjectConfig = !Options.types.includes(config);
      /** @type {OptionType} */
      // @ts-ignore
      const type = isObjectConfig ? config.type : config;

      if (!Options.types.includes(type)) {
        throw new Error(
          `The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`
        );
      }

      // @ts-ignore
      const defaultValue = isObjectConfig ? config.default : this.#defaultValues[type.name];

      if ((type === Array || type === Object) && typeof defaultValue !== 'function') {
        throw new Error(
          `The default value for options of type "${type.name}" must be returned by a function.`
        );
      }

      Object.defineProperty(this, name, {
        get() {
          return this.get(name, type, defaultValue);
        },
        set(value) {
          this.set(name, type, value);
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
    const attributeName = getAttributeName(name);
    const hasAttribute = this.#element.hasAttribute(attributeName);

    if (type === Boolean) {
      if (!hasAttribute && defaultValue) {
        this.#element.setAttribute(attributeName, '');
      }
      return hasAttribute || defaultValue;
    }

    const value = this.#element.getAttribute(attributeName);

    if (type === Number) {
      return hasAttribute ? Number(value) : defaultValue;
    }

    if (type === Array || type === Object) {
      const val = deepmerge(
        defaultValue(),
        hasAttribute ? JSON.parse(value) : this.#defaultValues[type.name]()
      );

      if (!this.#values[name]) {
        this.#values[name] = val;
      } else if (val !== this.#values[name]) {
        // When getting the value, wait for the next loop to update the data attribute
        // with the new value. This is a simple trick to avoid using a Proxy to watch
        // for any deep changes on an array or object. It should not break anything as
        // the original value is read once from the data attribute and is then read from
        // the private property `#values`.
        setTimeout(() => {
          this.#element.setAttribute(attributeName, JSON.stringify(this.#values[name]));
        }, 0);
      }

      return this.#values[name];
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
      throw new TypeError(
        `The "${val}" value for the "${name}" option must be of type "${type.name}"`
      );
    }

    switch (type) {
      case Boolean:
        if (value) {
          this.#element.setAttribute(attributeName, '');
        } else {
          this.#element.removeAttribute(attributeName);
        }
        break;
      case Array:
      case Object:
        this.#values[name] = value;
        this.#element.setAttribute(attributeName, JSON.stringify(value));
        break;
      default:
        this.#element.setAttribute(attributeName, value);
    }
  }
}
