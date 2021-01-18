import { debug } from '../abstracts/Base/utils';

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
 */
export default (BaseClass, defaultOptions = { threshold: createArrayOfNumber(100) }) =>
  class extends BaseClass {
    /**
     * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
     */
    get _excludeFromAutoBind() {
      return [...(super._excludeFromAutoBind || []), 'intersected'];
    }

    /**
     * Create an observer when the class in instantiated.
     *
     * @param  {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      if (!this.intersected || typeof this.intersected !== 'function') {
        throw new Error('[withIntersectionObserver] The `intersected` method must be defined.');
      }

      this.$observer = new IntersectionObserver(
        (entries) => {
          debug(this, 'intersected', entries);
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
