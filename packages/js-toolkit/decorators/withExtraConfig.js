import merge from 'deepmerge';

/**
 * @typedef {import('deepmerge').Options} DeepmergeOptions
 * @typedef {import('../abstracts/Base').BaseConfig} BaseConfig
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * Extends the configuration of an existing class.
 *
 * @template {BaseComponent} T
 * @param {T} BaseClass The Base class to extend.
 * @param {Partial<BaseConfig>} config Extra configuration to merge.
 * @param {DeepmergeOptions} options Options for the `deepmerge` function. {@link https://github.com/TehShrike/deepmerge#options}
 * @return {T}
 */
export default function withExtraConfig(BaseClass, config, options = {}) {
  const newConfig = merge(BaseClass.config, config, options);

  if (newConfig.name === BaseClass.config.name) {
    newConfig.name = `${BaseClass.config.name}WithExtraConfig`;
  }

  // @ts-ignore
  return class extends BaseClass {
    /**
     * Class config.
     * @type {BaseConfig}
     */
    static config = newConfig;
  };
}
