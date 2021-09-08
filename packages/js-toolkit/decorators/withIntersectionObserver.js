import { debug } from '../abstracts/Base/utils.js';

/**
 * @typedef {import('../abstracts/Base').default} Base
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * @typedef {Object} WithIntersectionObserverOptions
 * @property {Object} intersectionObserver
 */

/**
 * @typedef {Object} WithIntersectionObserverInterface
 * @property {WithIntersectionObserverOptions} $options
 * @property {IntersectionObserver} $observer
 * @property {(entries: IntersectionObserverEntry[]) => void} intersected
 */

/**
 * Create an array of number between 0 and 1 from the given length.
 * @param  {Number} length The length of the array.
 * @return {Array}        An array of number.
 */
function createArrayOfNumber(length) {
  return [...new Array(length + 1)].map((val, index) => index / length);
}

/**
 * IntersectionObserver decoration.
 *
 * @template {BaseComponent} T
 * @param {T} BaseClass The Base class to extend.
 * @param {Object} [defaultOptions] The options for the IntersectionObserver instance.
 * @return {T & { new: (element:HTMLElement) => { $observer: IntersectionObserver }}}
 */
export default function withIntersectionObserver(
  BaseClass,
  defaultOptions = { threshold: createArrayOfNumber(100) }
) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
     */
    get __excludeFromAutoBind() {
      return [...(super.__excludeFromAutoBind || []), 'intersected'];
    }

    static config = {
      ...(BaseClass.config || {}),
      name: `${BaseClass?.config?.name ?? ''}WithIntersectionObserver`,
      options: {
        ...(BaseClass?.config?.options || {}),
        intersectionObserver: Object,
      },
    };

    /**
     * Create an observer when the class in instantiated.
     *
     * @this {Base & WithIntersectionObserverInterface}
     * @param  {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      if (!this.intersected || typeof this.intersected !== 'function') {
        throw new Error('[withIntersectionObserver] The `intersected` method must be defined.');
      }

      this.$observer = new IntersectionObserver(
        (entries) => {
          if (__DEV__) {
            debug(this, 'intersected', entries);
          }
          this.$emit('intersected', entries);
          this.intersected(entries);
        },
        { ...defaultOptions, ...(this.$options.intersectionObserver || {}) }
      );

      if (this.$isMounted) {
        this.$observer.observe(this.$el);
      }

      this.$on('mounted', () => {
        this.$observer.observe(this.$el);
      });

      this.$on('destroyed', () => {
        this.$observer.unobserve(this.$el);
      });

      return this;
    }
  };
}
