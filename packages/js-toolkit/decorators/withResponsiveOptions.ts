import type { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseConfig, BaseProps, Managers } from '../Base/index.js';
import type { OptionObject, OptionType } from '../Base/managers/OptionsManager.js';
import {
  ResponsiveOptionsManager,
  ResponsiveOptionObject,
} from '../Base/managers/ResponsiveOptionsManager.js';
import { isObject } from '../utils/index.js';

/**
 * Extends the configuration of an existing class.
 */
export function withResponsiveOptions<S extends Base>(
  BaseClass: typeof Base,
  { responsiveOptions = [] } = {},
): BaseDecorator<BaseInterface, S> {
  const options = BaseClass.config.options ?? {};
  for (const option of responsiveOptions) {
    const oldOption = options[option];
    options[option] = {
      type: isObject(oldOption) ? (oldOption as OptionObject).type : (oldOption as OptionType),
      reponsive: true,
    } as ResponsiveOptionObject;
  }

  /**
   * Class.
   */
  class WithResponsiveOptions<T extends BaseProps = BaseProps> extends BaseClass<T> {
    static config: BaseConfig = {
      ...BaseClass.config,
      options,
    };

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
