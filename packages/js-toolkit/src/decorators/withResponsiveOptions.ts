import type { Base, BaseProps, Managers } from '../Base/Base.js';
import {
  ResponsiveOptionObject,
  ResponsiveOptionsManager,
} from '../Base/managers/ResponsiveOptionsManager.js';
import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import { isDefined, isObject } from '../utils/is.js';
import type { OptionObject, OptionType } from '../Base/managers/OptionsManager.js';

/**
 * Extends the configuration of an existing class.
 * @link https://js-toolkit.studiometa.dev/api/decorators/withResponsiveOptions.html
 */
export function withResponsiveOptions<S extends Base>(
  BaseClass: typeof Base,
  { responsiveOptions = [] } = {},
): BaseDecorator<BaseInterface, S> {
  /**
   * Class.
   */
  class WithResponsiveOptions<T extends BaseProps = BaseProps> extends BaseClass<T> {
    /**
     * Configure responsive options.
     */
    get __config() {
      const config = super.__config;
      const options = config.options;

      for (const option of responsiveOptions) {
        if (isDefined(options[option])) {
          const oldOption = options[option];
          options[option] = {
            type: isObject(oldOption)
              ? (oldOption as OptionObject).type
              : (oldOption as OptionType),
            responsive: true,
          } as ResponsiveOptionObject;
        }
      }

      return config;
    }

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
