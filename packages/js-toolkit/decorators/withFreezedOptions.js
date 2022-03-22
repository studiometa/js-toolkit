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
     * @returns {Readonly<{ name: string, debug: boolean, log: boolean, [key:string]: any }>}
     */
    // @ts-ignore
    // eslint-disable-next-line require-jsdoc
    get $options() {
      Object.defineProperty(this, '$options', {
        value: Object.freeze({ ...super.$options }),
        enumerable: true,
        configurable: true,
      });

      return this.$options;
    }
  };
}
