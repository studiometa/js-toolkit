import merge from 'deepmerge';

/**
 * @typedef {import('../abstracts/Base').BaseConfig} BaseConfig
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * IntersectionObserver decoration.
 * @param {BaseComponent} BaseClass The Base class to extend.
 * @param {Partial<BaseConfig>} config Extra configuration to merge.
 * @return {BaseComponent}
 */
export default (BaseClass, config = {}) => {
  const newConfig = merge(BaseClass.config, config);

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
