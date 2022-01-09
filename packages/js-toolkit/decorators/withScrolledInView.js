import withMountWhenInView from './withMountWhenInView.js';
import { clamp, clamp01 } from '../utils/index.js';

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 * @typedef {import('../Base').BaseConfig} BaseConfig
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
     * Config.
     * @type {BaseConfig}
     */
    static config = {
      name: `${BaseClass.config.name}WithMountWhenInView`,
      emits: ['scrolledInView'],
    };

    /**
     * @private
     */
    __props = {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 0,
      },
      current: {
        x: 0,
        y: 0,
      },
      progress: {
        x: 0,
        y: 0,
      },
    };

    /**
     * Mounted hook.
     * @returns {void}
     */
    mounted() {
      this.__setProps();
    }

    /**
     * Resized hook.
     * @returns {void}
     */
    resized() {
      this.__setProps();
    }

    /**
     * Scrolled hook.
     * @param   {any} props
     * @returns {void}
     */
    scrolled(props) {
      this.$services.toggle('ticked', props.changed.y || props.changed.x);
    }

    /**
     * Raf hook.
     * @returns {void}
     */
    ticked() {
      // X axis
      this.__props.current.x = clamp(window.pageXOffset, this.__props.start.x, this.__props.end.x);
      this.__props.progress.x = clamp01(
        (this.__props.current.x - this.__props.start.x) /
          (this.__props.end.x - this.__props.start.x)
      );

      // Y axis
      this.__props.current.y = clamp(window.pageYOffset, this.__props.start.y, this.__props.end.y);
      this.__props.progress.y = clamp01(
        (this.__props.current.y - this.__props.start.y) /
          (this.__props.end.y - this.__props.start.y)
      );

      // @ts-ignore
      this.__callMethod('scrolledInView', this.__props);
    }

    /**
     * Set the decorator props.
     *
     * @private
     * @return {void}
     */
    __setProps() {
      const sizes = this.$el.getBoundingClientRect();

      // Y axis
      const yEnd = sizes.top + window.pageYOffset + sizes.height;
      const yStart = yEnd - window.innerHeight - sizes.height;
      const yCurrent = clamp(window.pageYOffset, yStart, yEnd);
      const yProgress = clamp01((yCurrent - yStart) / (yEnd - yStart));

      // X axis
      const xEnd = sizes.left + window.pageXOffset + sizes.width;
      const xStart = xEnd - window.innerWidth - sizes.width;
      const xCurrent = clamp(window.pageXOffset, xStart, xEnd);
      const xProgress = clamp01((xCurrent - xStart) / (xEnd - xStart));

      this.__props = {
        start: {
          x: xStart,
          y: yStart,
        },
        end: {
          x: xEnd,
          y: yEnd,
        },
        current: {
          x: xCurrent,
          y: yCurrent,
        },
        progress: {
          x: xProgress,
          y: yProgress,
        },
      };
    }
  };
}
