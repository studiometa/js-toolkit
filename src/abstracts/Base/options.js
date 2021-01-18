import Options from './classes/Options';
import { warn } from './utils';

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
export function getOptions(instance, element, config) {
  let schema = { ...(config.options || {}) };

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

  // Add legacy options from the config
  const propsToInclude = [
    { name: 'log', type: Boolean },
    { name: 'debug', type: Boolean },
    { name: 'name', type: String },
  ];

  propsToInclude.forEach((prop) => {
    schema[prop.name] = [prop.type, prop.type(config[prop.name])];
  });

  // Add legacy options to the schema
  const propsToExclude = ['name', 'log', 'debug', 'components', 'refs', 'options'];
  Object.keys(config).forEach((propName) => {
    if (propsToExclude.includes(propName)) {
      return;
    }

    const value = config[propName];
    let type = value === null || value === undefined ? Object : value.constructor;

    // Default to object type as it should work for any values.
    if (!Options.types.includes(type)) {
      type = Object;
    }

    if (type === Array || type === Object) {
      schema[propName] = [type, () => value];
    } else {
      schema[propName] = [type, value];
    }
  });

  const options = new Options(element, schema);

  // Update legacy options with value from the `data-options` attribute
  let legacyOptions = {};
  if (element.dataset.options) {
    warn(
      instance,
      'The `data-options` attribute usage is deprecated, use multiple `data-option-...` attributes instead.'
    );
    try {
      legacyOptions = JSON.parse(element.dataset.options);
    } catch (err) {
      throw new Error('Can not parse the `data-options` attribute. Is it a valid JSON string?');
    }
  }

  Object.entries(legacyOptions).forEach(([optionName, optionValue]) => {
    options[optionName] = optionValue;
  });

  instance.$emit('get:options', options);
  return options;
}

export default {
  getOptions,
};
