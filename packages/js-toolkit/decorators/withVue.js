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
      options: {
        ...(BaseClass?.config?.options || {}),
      },
    };

    /**
     * @param {HTMLElement} element The component's root element.
     */
    constructor(element) {
      super(element);

      this.$vueConfig = this.constructor.vueConfig;

      if (!this.$vueConfig) {
        throw new Error('[withVue] You must define a `vueConfig` object.');
      }

      if (!this.$vueConfig.components) {
        throw new Error('[withVue] You must define a `component` key in vueConfig.');
      }

      if (typeof this.$vueConfig.components !== 'object') {
        throw new Error('[withVue] `component` must be an object.');
      }

      if (!this.$vueConfig.render) {
        throw new Error('[withVue] You must define a `render` function in vueConfig.');
      }

      if (typeof this.$vueConfig.render !== 'function') {
        throw new Error('[withVue] `render` must be a function.');
      }

      const vueConfig = this.$vueConfig;
      this.$vue = new Vue(vueConfig);

      this.$on('mounted', () => {
        this.$vue.$mount(this.$refs.vue);
      });

      this.$on('updated', () => {
        this.$vue.$forceUpdate();
      });

      this.$on('destroyed', () => {
        this.$vue.$destroy();
      });
    }
  };
