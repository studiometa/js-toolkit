import Vue from 'vue';

/**
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
 */

/**
 * withVue class.
 * @param {BaseComponent} BaseClass
 */

export default (BaseClass) =>
  class withVue extends BaseClass {
    static config = {
      ...(BaseClass.config || {}),
      name: `${BaseClass?.config?.name ?? ''}WithVue`,
    };

    static vueConfig;

    /**
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      const { vueConfig } = /** @type {typeof withVue} */ (this.constructor);

      if (!vueConfig) {
        throw new Error('[withVue] You must define a `vueConfig` object.');
      }

      if (typeof vueConfig.render !== 'function') {
        throw new Error('[withVue] You must define a `render` function in vueConfig.');
      }

      this.$vue = new Vue(vueConfig);

      this.$on('mounted', () => {
        if (!(this.$refs.vue instanceof HTMLElement)) {
          throw new Error('The `vue` refs must be a single HTMLElement.');
        }

        this.$vue.$mount(this.$refs.vue);
      });

      this.$on('destroyed', () => {
        this.$vue.$destroy();
      });
    }
  };
