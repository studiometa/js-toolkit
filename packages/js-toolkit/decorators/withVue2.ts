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
export default function withVue2<T extends BaseTypeParameter = BaseTypeParameter>(
  BaseClass: BaseConstructor,
  Vue
) {
  // @ts-ignore
  return class WithVue2<U extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<
    WithVue2Interface & T & U
  > {
    static config = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithVue`,
      refs: [...(BaseClass.config?.refs ?? []), 'vue'],
    };

    /**
     * @type {Vue}
     */
    $vue;

    /**
     * @typedef {import('vue').ComponentOptions} ComponentOptions
     * @type {ComponentOptions & { render: ComponentOptions['render'] }}
     */
    static vueConfig;

    /**
     * @param {HTMLElement} element The component's root element.
     * @this {WithVue2 & { $refs: WithVue2Refs }}
     */
    constructor(element) {
      super(element);

      // @ts-ignore
      const vueConfig = this.vueConfig ?? this.constructor.vueConfig;

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

      this.$vue = new Vue(vueConfig);

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
