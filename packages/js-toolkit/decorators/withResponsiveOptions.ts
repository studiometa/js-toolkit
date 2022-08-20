import type { BaseTypeParameter, BaseConstructor, Managers } from '../Base/index.js';
import ResponsiveOptionsManager from '../Base/managers/ResponsiveOptionsManager.js';

/**
 * Extends the configuration of an existing class.
 */
export default function withResponsiveOptions<T extends BaseTypeParameter = BaseTypeParameter>(BaseClass: BaseConstructor) {
  // @ts-ignore
  return class<U extends BaseTypeParameters = BaseTypeParameter> extends BaseClass<U & T> {
    /**
     * Get managers.
     */
    get __managers():Managers & { OptionsManager: typeof ResponsiveOptionsManager } {
      return {
        ...super.__managers,
        OptionsManager: ResponsiveOptionsManager,
      };
    }
  }
}
