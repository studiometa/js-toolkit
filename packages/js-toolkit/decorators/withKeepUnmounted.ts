import { BaseInterface, BaseDecorator } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

export interface withKeepUnmountedProps extends BaseProps {
  $options: {
    enabled: boolean;
  };
}

/**
 * Keep unmounted decoration.
 */
export function withKeepUnmounted<S extends Base = Base>(
  BaseClass: typeof Base,
  autoMount = true,
): BaseDecorator<BaseInterface, S, withKeepUnmountedProps> {
  /**
   * Class.
   */
  class WithKeepUnmounted<T extends BaseProps = BaseProps> extends BaseClass<
    T & withKeepUnmountedProps
  > {
    /**
     * Config.
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}withKeepUnmounted`,
      options: {
        ...BaseClass.config?.options,
        enabled: Boolean,
      },
    };

    /**
     * Listen for enabled option changes when the class in instantiated.
     *
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element: HTMLElement) {
      super(element);

      if (!autoMount) {
        return;
      }

      // Watch change on the `data-options-enabled` attribute to trigger $mount.
      const mutationObserver = new MutationObserver(([mutation]) => {
        if (
          mutation.type !== 'attributes' ||
          (mutation.attributeName !== 'data-options' &&
          mutation.attributeName !== 'data-option-enabled')
        ) {
          return;
        }

        this.$mount();
      });

      mutationObserver.observe(this.$el, { attributes: true });

      this.$on('terminated', () => {
        mutationObserver.disconnect();
      });

      this.$on('mounted', () => {
        mutationObserver.disconnect();
      });

      this.$on('destroyed', () => {
        mutationObserver.disconnect();
        mutationObserver.observe(this.$el, { attributes: true });
      });
    }

    /**
     * Override the mounting of the component.
     */
    $mount() {
      if (!this.$options.enabled) {
        return this;
      }

      return super.$mount();
    }
  }

  // @ts-ignore
  return WithKeepUnmounted;
}
