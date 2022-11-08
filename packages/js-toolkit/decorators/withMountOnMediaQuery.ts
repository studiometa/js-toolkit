import { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

export interface withMountOnMediaQueryProps extends BaseProps {
  $options: {
    media: string;
  };
}

export interface withMountOnMediaQueryInterface extends BaseInterface {
  /**
   * @private
   */
  __matches: boolean;
  /**
   * @private
   */
  __mediaQueryList: MediaQueryList;
  $mount(): this;
}

/**
 * IntersectionObserver decoration.
 */
export function withMountOnMediaQuery<S extends Base = Base>(
  BaseClass: typeof Base,
  media,
): BaseDecorator<withMountOnMediaQueryInterface, S, withMountOnMediaQueryProps> {
  /**
   * Class.
   */
  class WithMountOnMediaQuery<T extends BaseProps = BaseProps> extends BaseClass<
    T & withMountOnMediaQueryProps
  > {
    /**
     * Config.
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}withMountOnMediaQuery`,
      options: {
        ...(BaseClass.config?.options || {}),
        media: String,
      },
    };

    /**
     * Is the media query matches?
     * @private
     */
     __matches = false;

    /**
     * The component's MediaQueryList object.
     * @private
     */
    __mediaQueryList: MediaQueryList;

    /**
     * Listen for media query changes when the class in instantiated.
     *
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element: HTMLElement) {
      super(element);

      if (!this.$options.media && !media) {
        this.$log('Missing either "$options.media" or "media" argument in withMountOnMediaQuery decorator.');
        return;
      }

      this.__mediaQueryList = window.matchMedia(this.$options.media || media);

      // Set initial value
      this.__matches = this.__mediaQueryList.matches;

      if (this.__matches) {
        this.$mount();
      } else {
        setTimeout(() => this.$destroy());
      }

      const changeHandler = (event: MediaQueryListEvent) => {
        this.__matches = event.matches;

        if (event.matches) {
          this.$mount();
        } else {
          setTimeout(() => this.$destroy());
        }
      };

      // Start listening for changes
      this.__mediaQueryList.addEventListener('change', changeHandler);

      this.$on('terminated', () => {
        this.__mediaQueryList.removeEventListener('change', changeHandler);
      });
    }

    /**
     * Override the mounting of the component.
     */
    $mount() {
      if (this.__matches) {
        super.$mount();
      }

      return this;
    }
  }

  // @ts-ignore
  return WithMountOnMediaQuery;
}
