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
 * @return {T}
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

      const { vueConfig } = /** @type {typeof WithVue2} */ (this.constructor);

      if (!vueConfig) {
        throw new Error('[withVue] You must define a `vueConfig` object.');
      }

      if (typeof vueConfig.render !== 'function') {
        throw new Error('[withVue] You must define a `render` function in vueConfig.');
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
