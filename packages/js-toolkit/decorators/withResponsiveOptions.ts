import type { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseTypeParameter, Managers } from '../Base/index.js';
import ResponsiveOptionsManager from '../Base/managers/ResponsiveOptionsManager.js';

/**
 * Extends the configuration of an existing class.
 */
export function withResponsiveOptions<S extends Base>(
  BaseClass: typeof Base,
): BaseDecorator<BaseInterface, S> {
  /**
   * Class.
   */
  class WithResponsiveOptions<
    T extends BaseTypeParameter = BaseTypeParameter,
  > extends BaseClass<T> {
    /**
     * Get managers.
     */
    get __managers(): Managers & { OptionsManager: typeof ResponsiveOptionsManager } {
      return {
        ...super.__managers,
        OptionsManager: ResponsiveOptionsManager,
      };
    }
  }

  // @ts-ignore
  return WithResponsiveOptions;
}
