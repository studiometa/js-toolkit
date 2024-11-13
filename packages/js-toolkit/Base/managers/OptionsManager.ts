import deepmerge from 'deepmerge';
import type { Options as DeepmergeOptions } from 'deepmerge';
import { AbstractManager } from './AbstractManager.js';
import {
  isDev,
  isFunction,
  isDefined,
  isBoolean,
  isArray,
  isObject,
  memo,
} from '../../utils/index.js';
import type { Base } from '../index.js';
import { features } from '../features.js';

export type OptionType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ArrayConstructor
  | ObjectConstructor;

type ArrayOption = {
  type: ArrayConstructor;
  default?: (instance: Base) => unknown[];
  merge?: boolean | DeepmergeOptions;
};

type ObjectOption = {
  type: ObjectConstructor;
  default?: (instance: Base) => unknown;
  merge?: boolean | DeepmergeOptions;
};

type StringOption = {
  type: StringConstructor;
  default?: string | ((instance: Base) => string);
};

type NumberOption = {
  type: NumberConstructor;
  default?: number | ((instance: Base) => number);
};

type BooleanOption = {
  type: BooleanConstructor;
  default?: boolean | ((instance: Base) => boolean);
};

export type OptionObject = ArrayOption | ObjectOption | StringOption | NumberOption | BooleanOption;
export type OptionsSchema = { [name: string]: OptionType | OptionObject };
export type OptionsInterface = { [optionName: string]: unknown };

/**
 * List of allowed types.
 */
const types: Set<OptionType> = new Set([String, Number, Boolean, Array, Object]);

/**
 * The default values to return for each available type.
 */
const __defaultValues = {
  String: '',
  Number: 0,
  Boolean: false,
  Array: () => [],
  Object: () => ({}),
};

const UPPERCASE_REGEX = /([A-Z])/g;

/**
 * Get a property name.
 */
export const __getPropertyName = memo(function __getPropertyName(name: string, prefix = '', optionAttribute = features.get('attributes').option) {
  return `${optionAttribute}${prefix ? `-${prefix}` : ''}-${name.replaceAll(UPPERCASE_REGEX, '-$1')}`;
});

/**
 * Register an option.
 *
 * @param  {OptionsManager} that
 * @param  {string} name
 * @param  {OptionObject} config
 * @returns {void}
 * @private
 */
function __register(that: OptionsManager, name: string, config: OptionObject) {
  if (!types.has(config.type)) {
    if (isDev) {
      throw new Error(
        `The "${name}" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.`,
      );
    }
    return;
  }

  config.default = config.default ?? __defaultValues[config.type.name];

  if ((config.type === Array || config.type === Object) && !isFunction(config.default)) {
    if (isDev) {
      throw new Error(
        `The default value for options of type "${config.type.name}" must be returned by a function.`,
      );
    }
    return;
  }

  Object.defineProperty(that, name, {
    get: () => that.get(name, config),
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
export class OptionsManager extends AbstractManager {
  /**
   * An object to store Array and Object values for reference.
   *
   * @private
   */
  __values = {};

  /**
   * Default value for the name property.
   */
  name = 'Base';

  /**
   * Default value for the debug property.
   */
  debug = false;

  /**
   * Default value for the log property.
   */
  log = false;

  /**
   * Class constructor.
   */
  constructor(base: Base) {
    super(base);

    this.__hideProperties(['__values', '__defaultValues']);
    const schema: OptionsSchema = this.__config.options || {};
    this.name = this.__config.name;

    schema.debug = {
      type: Boolean,
      default: this.__config.debug ?? false,
    };

    schema.log = {
      type: Boolean,
      default: this.__config.log ?? false,
    };

    for (const [name, config] of Object.entries(schema)) {
      __register(
        this,
        name,
        types.has(config as OptionType)
          ? ({ type: config as OptionType } as OptionObject)
          : (config as OptionObject),
      );
    }
  }

  /**
   * Get an option value.
   */
  get(name: string, config: OptionObject) {
    const { type } = config;
    const defaultValue = isFunction(config.default) ? config.default(this.__base) : config.default;
    const attributes = features.get('attributes');
    const propertyName = __getPropertyName(name, '', attributes.option);
    const hasProperty = this.__element.hasAttribute(propertyName);

    if (type === Boolean) {
      if (defaultValue) {
        const negatedPropertyName = __getPropertyName(name, 'no', attributes.option);
        const hasNegatedProperty = this.__element.hasAttribute(negatedPropertyName);

        return !hasNegatedProperty;
      }

      return hasProperty || defaultValue;
    }

    const value = this.__element.getAttribute(propertyName);

    if (type === Number) {
      return hasProperty ? Number(value) : defaultValue;
    }

    if (type === Array || type === Object) {
      // eslint-disable-next-line no-param-reassign
      config = type === Array ? (config as ArrayOption) : (config as ObjectOption);

      if (!this.__values[name]) {
        let val = hasProperty ? JSON.parse(value) : defaultValue;

        if (isDefined(config.merge)) {
          val = isBoolean(config.merge)
            ? deepmerge(defaultValue, val)
            : deepmerge(defaultValue, val, config.merge);
        }

        this.__values[name] = val;
      }

      return this.__values[name];
    }

    return hasProperty ? value : defaultValue;
  }

  /**
   * Set an option value.
   */
  set(name: string, value: unknown, config: OptionObject) {
    const { type, default: defaultValue } = config;
    const attributes = features.get('attributes');
    const propertyName = __getPropertyName(name, '', attributes.option);

    if (value.constructor.name !== type.name) {
      if (isDev) {
        const val = isArray(value) || isObject(value) ? JSON.stringify(value) : value;
        throw new TypeError(
          `The "${val}" value for the "${name}" option must be of type "${type.name}"`,
        );
      }
      return;
    }

    switch (type) {
      case Boolean:
        if (defaultValue) {
          const negatedPropertyName = __getPropertyName(name, 'no', attributes.option);

          if (value) {
            this.__element.removeAttribute(negatedPropertyName);
          } else {
            this.__element.setAttribute(negatedPropertyName, '');
          }
        } else if (value) {
          this.__element.setAttribute(propertyName, '');
        } else {
          this.__element.removeAttribute(propertyName);
        }
        break;
      case Array:
      case Object:
        this.__values[name] = value;
        break;
      default:
        this.__element.setAttribute(propertyName, value as string);
    }
  }
}
