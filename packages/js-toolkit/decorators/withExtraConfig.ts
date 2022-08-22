import merge from 'deepmerge';
import type { Options as DeepmergeOptions } from 'deepmerge';
import type { BaseTypeParameter, BaseConstructor, BaseConfig } from '../Base/index.js';

/**
 * Extends the configuration of an existing class.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @param {Partial<BaseConfig>} config Extra configuration to merge.
 * @param {DeepmergeOptions} options Options for the `deepmerge` function. {@link https://github.com/TehShrike/deepmerge#options}
 */
export default function withExtraConfig<T extends BaseTypeParameter = BaseTypeParameter>(
  BaseClass: BaseConstructor,
  config: Partial<BaseConfig>,
  options: DeepmergeOptions = {}
) {
  const newConfig = merge(BaseClass.config, config, options);

  if (newConfig.name === BaseClass.config.name) {
    newConfig.name = `${BaseClass.config.name}WithExtraConfig`;
  }

  return class WithExtraConfig<U extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<T & U> {
    /**
     * Class config.
     * @type {BaseConfig}
     */
    static config = newConfig;
  };
}
