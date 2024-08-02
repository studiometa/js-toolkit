import { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';
import { isDev } from '../utils/is.js';

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
        ...BaseClass.config?.options,
        media: String,
      },
    };

    /**
     * Is the media query matches?
     *
     * @private
     */
    __matches = false;

    /**
     * Listen for media query changes when the class in instantiated.
     *
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element: HTMLElement) {
      super(element);

      if (isDev && !this.$options.media && !media) {
        this.$warn(
          'Missing either "$options.media" or "media" argument in withMountOnMediaQuery decorator.',
        );
        return;
      }

      const mediaQueryList = window.matchMedia(this.$options.media || media);

      // Set initial value
      this.__matches = mediaQueryList.matches;

      const changeHandler = (event: MediaQueryListEvent) => {
        this.__matches = event.matches;

        if (event.matches && !this.$isMounted) {
          this.$mount();
        } else if (this.$isMounted) {
          setTimeout(() => this.$destroy());
        }
      };

      // Start listening for changes
      mediaQueryList.addEventListener('change', changeHandler);

      this.$on('terminated', () => {
        mediaQueryList.removeEventListener('change', changeHandler);
      });
    }

    /**
     * Override the mounting of the component.
     */
    async $mount() {
      if (this.__matches) {
        return super.$mount();
      }

      return this;
    }
  }

  // @ts-ignore
  return WithMountOnMediaQuery;
}
