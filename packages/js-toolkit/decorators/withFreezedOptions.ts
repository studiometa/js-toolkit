import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseOptions } from '../Base/index.js';

export interface WithFreezedOptionsInterface extends BaseInterface {
  readonly $options: Readonly<BaseOptions>;
}

/**
 * Freeze the `$options` property to improve performance.
 */
export function withFreezedOptions<S extends Base>(
  BaseClass: typeof Base,
): BaseDecorator<WithFreezedOptionsInterface, S> {
  /**
   * Class.
   */
  class WithFreezedOptions<T extends BaseProps = BaseProps> extends BaseClass<T> {
    /**
     * Hold freezed options
     * @private
     */
    __freezedOptions;

    /**
     * Lazyly freeze the `$options` property.
     */
    get $options() {
      if (!this.__freezedOptions) {
        Object.defineProperty(this, '__freezedOptions', {
          value: Object.freeze({ ...super.$options }),
          enumerable: false,
          configurable: true,
        });
      }

      return this.__freezedOptions;
    }
  }

  // @ts-ignore
  return WithFreezedOptions;
}
