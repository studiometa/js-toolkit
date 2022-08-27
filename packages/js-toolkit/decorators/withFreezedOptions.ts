import type { Base, BaseConstructor, BaseTypeParameter } from '../Base/index.js';

/**
 * Freeze the `$options` property to improve performance.
 */
export default function withFreezedOptions<
  S extends BaseConstructor<Base>,
  T extends BaseTypeParameter = BaseTypeParameter
>(BaseClass: S) {
  class WithFreezedOptions extends BaseClass {
    /**
     * Hold freezed options
     * @private
     */
    __freezedOptions;

    /**
     * Lazyly freeze the `$options` property.
     * @returns {Readonly<this['$options']>}
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

  return WithFreezedOptions as BaseConstructor<WithFreezedOptions> &
    Pick<typeof WithFreezedOptions, keyof typeof WithFreezedOptions> &
    S &
    BaseConstructor<Base<T>> &
    Pick<typeof Base, keyof typeof Base>;
}
