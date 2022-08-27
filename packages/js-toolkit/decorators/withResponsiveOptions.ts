import type { Base, BaseTypeParameter, BaseConstructor, Managers } from '../Base/index.js';
import ResponsiveOptionsManager from '../Base/managers/ResponsiveOptionsManager.js';

/**
 * Extends the configuration of an existing class.
 */
export default function withResponsiveOptions<
  S extends BaseConstructor<Base>,
  T extends BaseTypeParameter = BaseTypeParameter
>(BaseClass: S) {
  // @ts-ignore
  class WithResponsiveOptions extends BaseClass {
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

  return WithResponsiveOptions as BaseConstructor<WithResponsiveOptions> &
    Pick<typeof WithResponsiveOptions, keyof typeof WithResponsiveOptions> &
    S &
    BaseConstructor<Base<T>> &
    Pick<typeof Base, keyof typeof Base>;
}
