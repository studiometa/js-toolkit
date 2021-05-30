import merge from 'deepmerge';

/**
 * @typedef {import('deepmerge').Options} DeepmergeOptions
 * @typedef {import('../abstracts/Base').BaseConfig} BaseConfig
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * Extends the configuration of an existing class.
 *
 * @param {BaseComponent} BaseClass The Base class to extend.
 * @param {Partial<BaseConfig>} config Extra configuration to merge.
 * @param {DeepmergeOptions} options Options for the `deepmerge` function. {@link https://github.com/TehShrike/deepmerge#options}
 * @return {BaseComponent}
 */
export default (BaseClass, config, options = {}) => {
  const newConfig = merge(BaseClass.config, config, options);

  if (newConfig.name === BaseClass.config.name) {
    newConfig.name = `${BaseClass.config.name}WithExtraConfig`;
  }

  return class extends BaseClass {
    /**
     * Class config.
     * @type {BaseConfig}
     */
    static config = newConfig;
  };
};
