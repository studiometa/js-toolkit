import merge from 'deepmerge';
import type { Options as DeepmergeOptions } from 'deepmerge';
import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseTypeParameter, BaseConfig } from '../Base/index.js';

/**
 * Extends the configuration of an existing class.
 */
export function withExtraConfig<S extends Base>(
  BaseClass: typeof Base,
  config: Partial<BaseConfig>,
  options: DeepmergeOptions = {},
): BaseDecorator<BaseInterface, S> {
  const newConfig = merge(BaseClass.config, config, options);

  if (newConfig.name === BaseClass.config.name) {
    newConfig.name = `${BaseClass.config.name}WithExtraConfig`;
  }

  /**
   * Class.
   */
  class WithExtraConfig<T extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<T> {
    /**
     * Config.
     */
    static config: BaseConfig = newConfig;
  }

  // @ts-ignore
  return WithExtraConfig;
}
