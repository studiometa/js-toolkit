import { debug } from '../abstracts/Base/utils';

/**
 * Create an array of number between 0 and 1 from the given length.
 * @param  {Number} length The length of the array.
 * @return {Array}        An array of number.
 */
function createArrayOfNumber(length = 10) {
  return [...new Array(length)].map((val, index) => index / length);
}

/**
 * IntersectionObserver decoration.
 */
export default (BaseClass, defaultOptions = { threshold: createArrayOfNumber(100) }) =>
  class extends BaseClass {
    /**
     * Create an observer when the class in instantiated.
     *
     * @param  {HTMLElement} element The component's root element.
     * @return {Base}                The class instace.
     */
    constructor(element) {
      super(element);

      if (!this.intersected || typeof this.intersected !== 'function') {
        return this;
      }

      this.observer = new IntersectionObserver(
        entries => {
          if (typeof this.intersected === 'function') {
            debug(this, 'intersected', entries);
            this.intersected(entries);
          }
        },
        { ...defaultOptions, ...(this.$options.intersectionObserver || {}) }
      );

      this.$on('mounted', () => {
        this.observer.observe(this.$el);
      });

      this.$on('destroyed', () => {
        this.observer.unobserve(this.$el);
      });

      return this;
    }
  };
