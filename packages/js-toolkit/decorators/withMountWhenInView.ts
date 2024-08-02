import { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

export interface WithMountWhenInViewProps extends BaseProps {
  $options: {
    intersectionObserver: IntersectionObserverInit;
  };
}

export interface WithMountWhenInViewInterface extends BaseInterface {
  /**
   * @private
   */
  __isVisible: boolean;
  /**
   * @private
   */
  __observer: IntersectionObserver;
  $mount(): this;
}

/**
 * IntersectionObserver decoration.
 */
export function withMountWhenInView<S extends Base = Base>(
  BaseClass: typeof Base,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  defaultOptions: IntersectionObserverInit = { threshold: [0, 1] },
): BaseDecorator<WithMountWhenInViewInterface, S, WithMountWhenInViewProps> {
  /**
   * Class.
   */
  class WithMountWhenInView<T extends BaseProps = BaseProps> extends BaseClass<
    T & WithMountWhenInViewProps
  > {
    /**
     * Config.
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithMountWhenInView`,
      options: {
        ...BaseClass.config?.options,
        intersectionObserver: Object,
      },
    };

    /**
     * Is the component visible?
     *
     * @private
     */
    __isVisible = false;

    /**
     * The component's observer.
     *
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
          ...(this.$options as typeof this.$options & WithMountWhenInViewProps['$options'])
            .intersectionObserver,
        },
      );

      this.__observer.observe(this.$el);

      this.$on('terminated', () => {
        this.__observer.disconnect();
      });
    }

    /**
     * Override the mounting of the component.
     */
    async $mount() {
      if (this.__isVisible) {
        return super.$mount();
      }

      return this;
    }
  }

  // @ts-ignore
  return WithMountWhenInView;
}
