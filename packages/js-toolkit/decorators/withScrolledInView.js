import withMountWhenInView from './withMountWhenInView.js';
import { clamp, clamp01 } from '../utils/index.js';

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 */

/**
 * Add scrolled in view capabilities to a component.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass
 * @return {T}
 */
export default function withScrolledInView(BaseClass) {
  // @ts-ignore
  return class extends withMountWhenInView(BaseClass) {
    /**
     * @private
     */
    __props = {
      start: 0,
      end: 0,
      current: 0,
      progress: 0,
    };

    /**
     * Class constructor.
     * @param {HTMLElement} element
     */
    constructor(element) {
      super(element);

      this.$on('mounted', () => this.__setProps());
      this.$on('resized', () => this.__setProps());

      this.$on(
        'scrolled',
        /**
         * @typedef {import('../services/scroll').ScrollServiceProps} ScrollServiceProps
         * @param {Event & { detail: [ScrollServiceProps] }} event
         */
        ({ detail: [props] }) => {
          this.$services.toggle('ticked', props.changed.y);
        }
      );

      this.$on('ticked', () => {
        this.__props.current = clamp(window.pageYOffset, this.__props.start, this.__props.end);
        this.__props.progress = clamp01(
          (this.__props.current - this.__props.start) / (this.__props.end - this.__props.start)
        );
        // @ts-ignore
        this.__callMethod('scrolledInView', this.__props);
      });
    }

    /**
     * Set the decorator props.
     *
     * @private
     * @return {void}
     */
    __setProps() {
      const sizes = this.$el.getBoundingClientRect();
      const end = sizes.top + window.pageYOffset + sizes.height;
      const start = end - window.innerHeight - sizes.height;
      const current = clamp(window.pageYOffset, start, end);
      const progress = clamp01((current - start) / (end - start));

      this.__props = {
        start,
        end,
        current,
        progress,
      };
    }
  };
}
