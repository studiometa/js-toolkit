/**
 * @typedef {import('../Base').BaseOptions} BaseOptions
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 */

/**
 * Freeze the `$options` property to improve performance.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @return {T}
 */
export default function withFreezedOptions(BaseClass) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Lazyly freeze the `$options` property.
     * @returns {Readonly<BaseOptions>}
     */
    get $options() {
      Object.defineProperty(this, '$options', {
        value: Object.freeze(super.$options),
        enumerable: true,
      });

      return this.$options;
    }
  };
}
