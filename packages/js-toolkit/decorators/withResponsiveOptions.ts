import type { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseProps, Managers } from '../Base/index.js';
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
    T extends BaseProps = BaseProps,
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
