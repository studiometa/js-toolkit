/**
 * @typedef {import('../abstracts/Base').default} Base
 * @typedef {import('../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * @typedef {Object} WithMountWhenInViewOptions
 * @property {Object} intersectionObserver
 */

/**
 * @typedef {Object} WithMountWhenInViewInterface
 * @property {() => void} terminated
 * @property {WithMountWhenInViewOptions & BaseOptions} $options
 */

/**
 * IntersectionObserver decoration.
 *
 * @template {BaseComponent} T
 * @param {T} BaseClass The Base class to extend.
 * @param {Object} [defaultOptions] The options for the IntersectionObserver instance.
 * @return {T}
 */
export default function withMountWhenInView(BaseClass, defaultOptions = { threshold: [0, 1] }) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Class config.
     * @type {Object}
     */
    static config = {
      ...(BaseClass.config || {}),
      name: `${BaseClass?.config?.name ?? ''}WithMountWhenInView`,
      options: {
        ...(BaseClass?.config?.options || {}),
        intersectionObserver: Object,
      },
    };

    /**
     * Is the component visible?
     * @type {Boolean}
     */
    #isVisible = false;

    /**
     * The component's observer.
     * @type {IntersectionObserver}
     */
    #observer;

    /**
     * Create an observer when the class in instantiated.
     *
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      this.#observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.reduce((acc, entry) => acc || entry.isIntersecting, false);
          if (this.#isVisible !== isVisible) {
            this.#isVisible = isVisible;

            const method = isVisible ? '$mount' : '$destroy';
            this[method]();
          }
        },
        { ...defaultOptions, ...this.$options.intersectionObserver }
      );

      this.#observer.observe(this.$el);

      this.$on('terminated', () => {
        this.#observer.disconnect();
      });

      return this;
    }

    /**
     * Override the mounting of the component.
     *
     * @return {this}
     */
    $mount() {
      if (this.#isVisible) {
        super.$mount();
      }

      return this;
    }
  };
}
