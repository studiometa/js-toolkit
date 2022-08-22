import type { BaseConstructor, BaseTypeParameter } from '../Base/index.js';

/**
 * Freeze the `$options` property to improve performance.
 */
export default function withFreezedOptions<T extends BaseTypeParameter = BaseTypeParameter>(BaseClass: BaseConstructor) {
  return class WithFreezedOptions<U extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<T & U> {
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
  };
}
