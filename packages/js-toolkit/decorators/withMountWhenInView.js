/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseOptions} BaseOptions
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 */

/**
 * @typedef {Object} WithMountWhenInViewOptions
 * @property {IntersectionObserverInit} intersectionObserver
 */

/**
 * @typedef {Object} WithMountWhenInViewInterface
 * @property {() => void} terminated
 * @property {WithMountWhenInViewOptions & BaseOptions} $options
 */

/**
 * IntersectionObserver decoration.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass The Base class to extend.
 * @param {IntersectionObserverInit} [defaultOptions] The options for the IntersectionObserver instance.
 * @returns {T}
 */
export default function withMountWhenInView(
  BaseClass,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  defaultOptions = { threshold: [0, 1] }
) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Class config.
     * @type {Object}
     */
    static config = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithMountWhenInView`,
      options: {
        ...(BaseClass.config?.options || {}),
        intersectionObserver: Object,
      },
    };

    /**
     * Is the component visible?
     * @private
     * @type {boolean}
     */
    __isVisible = false;

    /**
     * The component's observer.
     * @private
     * @type {IntersectionObserver}
     */
    __observer;

    /**
     * Create an observer when the class in instantiated.
     *
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      this.__observer = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.reduce((acc, entry) => acc || entry.isIntersecting, false);
          if (this.__isVisible !== isVisible) {
            this.__isVisible = isVisible;

            if (isVisible) {
              this.$mount();
            } else {
              setTimeout(() => this.$destroy());
            }
          }
        },
        { ...defaultOptions, ...this.$options.intersectionObserver }
      );

      this.__observer.observe(this.$el);

      this.$on('terminated', () => {
        this.__observer.disconnect();
      });
    }

    /**
     * Override the mounting of the component.
     *
     * @returns {this}
     */
    $mount() {
      if (this.__isVisible) {
        super.$mount();
      }

      return this;
    }
  };
}
