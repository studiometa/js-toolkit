import { isDev } from '../utils/index.js';

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 */

/**
 * @typedef {Object} WithVue2Refs
 * @property {HTMLElement} vue
 */

/**
 * withVue decorator.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass
 * @param {import('vue').VueConstructor} Vue
 * @returns {T}
 */
export default (BaseClass, Vue) => {
  // @ts-ignore
  return class WithVue2 extends BaseClass {
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

      // const { vueConfig } = /** @type {typeof WithVue2} */ (this.constructor);
      const vueConfig =
        this.vueConfig ?? /** @type {typeof WithVue2} */ (this.constructor).vueConfig;

      if (!vueConfig) {
        if (isDev) {
          throw new Error('[withVue] You must define a `vueConfig` object.');
        }
        return;
      }

      if (typeof vueConfig.render !== 'function') {
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
};
