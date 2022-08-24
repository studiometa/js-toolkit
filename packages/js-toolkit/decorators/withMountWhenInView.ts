import type Base from '../Base/index.js';
import type { BaseTypeParameter, BaseConfig, BaseConstructor } from '../Base/index.js';

type WithMountWhenInViewInterface = {
  $options: {
    intersectionObserver: IntersectionObserverInit;
  };
};

/**
 * IntersectionObserver decoration.
 */
export default function withMountWhenInView<
  S extends BaseConstructor<Base>,
  T extends BaseTypeParameter = BaseTypeParameter
>(
  BaseClass: S,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  defaultOptions: IntersectionObserverInit = { threshold: [0, 1] }
) {
  // @ts-ignore
  class WithMountWhenInView extends BaseClass {
    static config: BaseConfig = {
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
     */
    __isVisible = false;

    /**
     * The component's observer.
     * @private
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
        {
          ...defaultOptions,
          ...(this.$options as typeof this.$options & WithMountWhenInViewInterface['$options'])
            .intersectionObserver,
        }
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
  }

  return WithMountWhenInView as BaseConstructor<WithMountWhenInView> &
    Pick<typeof WithMountWhenInView, keyof typeof WithMountWhenInView> &
    S &
    BaseConstructor<Base<T & WithMountWhenInViewInterface>> &
    Pick<typeof Base, keyof typeof Base>;
}
