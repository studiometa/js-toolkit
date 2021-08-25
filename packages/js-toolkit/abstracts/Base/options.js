import OptionsManager from './managers/OptionsManager.js';
import { warn } from './utils.js';

// @todo use only the OptionsManager instead of the functions in this file.

/**
 * @typedef {import('./index.js').default} Base
 * @typedef {import('./index.js').BaseOptions} BaseOptions
 * @typedef {import('./managers/OptionsManager.js').OptionsSchema} OptionsSchema
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
      let type = value === null || value === undefined ? Object : value.constructor;

      // Default to object type as it should work for any values.
      if (!OptionsManager.types.includes(type)) {
        type = Object;
      }

      warn(
        instance,
        '\n  Options must be defined in the `config.options` property.',
        `\n  Consider moving the \`config.${propName}\` option to \`config.options.${propName}\`.`
      );

      if (type === Array || type === Object) {
        schema[propName] = { type, default: () => value };
      } else {
        schema[propName] = { type, default: value };
      }

      return schema;
    },
    {}
  );
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
    const getterConfig = prototype.config;
    // @ts-ignore
    const staticConfig = prototype.constructor.config;
    if (getterConfig || staticConfig) {
      schema = Object.assign(
        (getterConfig || {}).options || {},
        (staticConfig || {}).options || {},
        schema
      );
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
 * @param {OptionsManager}     options The component's options.
 */
function updateOptionsWithLegacyValues(instance, element, options) {
  // Update legacy options with value from the `data-options` attribute
  let legacyOptionsValues = {};
  if (element.dataset.options) {
    warn(
      instance,
      'The `data-options` attribute usage is deprecated, use multiple `data-option-...` attributes instead.'
    );
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
 * @return {OptionsManager & BaseOptions}              The component's merged options.
 */
export function getOptions(instance, element, config) {
  /** @type {OptionsSchema} */
  const schema = {
    name: {
      type: String,
      default: config.name,
    },
    log: {
      type: Boolean,
      default: config.log ?? false,
    },
    debug: {
      type: Boolean,
      default: config.debug ?? false,
    },
    ...getParentOptionsSchema(instance),
    ...getLegacyOptionsSchema(instance, config),
    ...(config.options || {}),
  };

  const options = new OptionsManager(element, schema);

  updateOptionsWithLegacyValues(instance, element, options);

  instance.$emit('get:options', options);

  return /** @type {OptionsManager & BaseOptions} */ (options);
}

export default {
  getOptions,
};
