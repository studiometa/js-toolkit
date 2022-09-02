import type Vue from 'vue';
import type { ComponentOptions, VueConstructor } from 'vue';
import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseConfig, BaseProps } from '../Base/index.js';
import { isDev, isFunction } from '../utils/index.js';

export interface WithVue2Props extends BaseProps {
  $refs: {
    vue: HTMLElement;
  };
}

export interface WithVue2Interface extends BaseInterface {
  $vue: Vue;
}

/**
 * withVue decorator.
 */
export function withVue2<S extends Base, T extends Vue = Vue>(
  BaseClass: typeof Base,
  VueCtor: VueConstructor,
): BaseDecorator<WithVue2Interface, S, WithVue2Props> {
  type VueConfig = ComponentOptions<T> & {
    render: ComponentOptions<T>['render'];
  };

  /**
   * Class.
   */
  class WithVue2 extends BaseClass {
    static config:BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithVue`,
      refs: [...(BaseClass.config?.refs ?? []), 'vue'],
    };

    $vue: Vue;

    /**
     * Vue app configuration.
     */
    static vueConfig: VueConfig;

    constructor(element: HTMLElement) {
      super(element);

      // @ts-ignore
      const vueConfig: VueConfig = this.vueConfig ?? this.constructor.vueConfig;

      if (!vueConfig) {
        if (isDev) {
          throw new Error('[withVue] You must define a `vueConfig` object.');
        }
        return;
      }

      if (!isFunction(vueConfig.render)) {
        if (isDev) {
          throw new Error('[withVue] You must define a `render` function in vueConfig.');
        }
        return;
      }

      this.$vue = new VueCtor(vueConfig);

      this.$on('mounted', () => {
        if (!(this.$refs.vue instanceof HTMLElement)) {
          throw new Error('[withVue] The `vue` refs must be a single HTMLElement.');
        }

        this.$vue.$mount(this.$refs.vue);
      });

      this.$on('destroyed', () => {
        this.$vue.$destroy();
      });
    }
  }

  // @ts-ignore
  return WithVue2;
}
