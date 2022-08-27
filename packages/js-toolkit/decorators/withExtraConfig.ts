import merge from 'deepmerge';
import type { Options as DeepmergeOptions } from 'deepmerge';
import type { Base, BaseTypeParameter, BaseConstructor, BaseConfig } from '../Base/index.js';

/**
 * Extends the configuration of an existing class.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @param {Partial<BaseConfig>} config Extra configuration to merge.
 * @param {DeepmergeOptions} options Options for the `deepmerge` function. {@link https://github.com/TehShrike/deepmerge#options}
 */
export default function withExtraConfig<
  S extends BaseConstructor<Base>,
  T extends BaseTypeParameter = BaseTypeParameter
>(BaseClass: S, config: Partial<BaseConfig>, options: DeepmergeOptions = {}) {
  const newConfig = merge(BaseClass.config, config, options);

  if (newConfig.name === BaseClass.config.name) {
    newConfig.name = `${BaseClass.config.name}WithExtraConfig`;
  }

  class WithExtraConfig extends BaseClass {
    /**
     * Class config.
     * @type {BaseConfig}
     */
    static config = newConfig;
  }

  return WithExtraConfig as BaseConstructor<WithExtraConfig> &
    Pick<typeof WithExtraConfig, keyof typeof WithExtraConfig> &
    S &
    BaseConstructor<Base<T>> &
    Pick<typeof Base, keyof typeof Base>;
}
