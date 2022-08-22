import type Vue from 'vue';
import type { ComponentOptions, VueConstructor } from 'vue';
import type { BaseConstructor, BaseTypeParameter } from '../Base/index.js';
import { isDev, isFunction } from '../utils/index.js';

interface WithVue2Interface {
  $refs: {
    vue: HTMLElement;
  };
}

/**
 * withVue decorator.
 */
export default function withVue2<
  T extends BaseTypeParameter = BaseTypeParameter,
  VueTypeParameter extends Vue = Vue
>(BaseClass: BaseConstructor, VueCtor: VueConstructor) {
  type VueConfig = ComponentOptions<VueTypeParameter> & {
    render: ComponentOptions<VueTypeParameter>['render'];
  };

  return class WithVue2<U extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<
    WithVue2Interface & T & U
  > {
    static config = {
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
      const vueConfig:VueConfig = this.vueConfig ?? this.constructor.vueConfig;

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
  };
}
