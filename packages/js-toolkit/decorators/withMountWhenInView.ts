import type { BaseTypeParameter, BaseConfig } from '../Base/index.js';
import Base from '../Base/index.js';

type WithMountWhenInViewInterface = {
  $options: {
    intersectionObserver: IntersectionObserverInit;
  };
};

/**
 * IntersectionObserver decoration.
 */
export default function withMountWhenInView<T extends BaseTypeParameter = BaseTypeParameter>(
  BaseClass: typeof Base,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  defaultOptions: IntersectionObserverInit = { threshold: [0, 1] }
) {
  return class WithMountWhenInView<U extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<
    WithMountWhenInViewInterface & T & U
  > {
    static config:BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithMountWhenInView`,
      options: {
        ...(BaseClass.config?.options || {}),
        intersectionObserver: Object,
      },
    };

    /**
     * Is the component visible?
     */
    __isVisible = false;

    /**
     * The component's observer.
     */
    __observer: IntersectionObserver;

    /**
     * Create an observer when the class in instantiated.
     *
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element: HTMLElement) {
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
     */
    $mount() {
      if (this.__isVisible) {
        super.$mount();
      }

      return this;
    }
  };
}
