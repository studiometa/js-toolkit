/**
 * @typedef {import('../Base').BaseOptions} BaseOptions
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 */

/**
 * Freeze the `$options` property to improve performance.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @returns {T}
 */
export default function withFreezedOptions(BaseClass) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Hold freezed options
     * @private
     */
    __freezedOptions;

    /**
     * Lazyly freeze the `$options` property.
     * @returns {Readonly<{ name: string, debug: boolean, log: boolean, [key:string]: any }>}
     */
    // @ts-ignore
    // eslint-disable-next-line require-jsdoc
    get $options() {
      Object.defineProperty(this, '__freezedOptions', {
        value: Object.freeze({ ...super.$options }),
        enumerable: false,
        configurable: true,
      });

      return this.__freezedOptions;
    }
  };
}
