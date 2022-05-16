import withMountWhenInView from './withMountWhenInView.js';
import { damp, clamp, clamp01, getOffsetSizes, isFunction } from '../utils/index.js';

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
 * @param {IntersectionObserverInit & { useOffsetSizes?: boolean }} options
 * @returns {T}
 */
export default function withScrolledInView(BaseClass, options = {}) {
  // @ts-ignore
  return class extends withMountWhenInView(BaseClass, options) {
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
      dampedProgress: {
        x: 0,
        y: 0,
      },
    };

    /**
     * Factor used for the `dampedProgress` props.
     * @type {number}
     */
    dampFactor = 0.1;

    /**
     * Precision for the `dampedProgress` props.
     * @type {number}
     */
    dampPrecision = 0.001;

    /**
     * Bind listeners.
     * @param   {HTMLElement} element
     */
    constructor(element) {
      super(element);

      const delegate = {
        handleEvent(event) {
          delegate[event.type](event.detail[0]);
        },
        resized: () => {
          this.__setProps();
        },
        scrolled: (props) => {
          if ((!this.$services.has('ticked') && props.changed.y) || props.changed.x) {
            this.$services.enable('ticked');
          }
        },
        ticked: () => {
          // X axis
          this.__props.current.x = clamp(
            window.pageXOffset,
            this.__props.start.x,
            this.__props.end.x
          );
          this.__props.progress.x = clamp01(
            (this.__props.current.x - this.__props.start.x) /
              (this.__props.end.x - this.__props.start.x)
          );
          this.__props.dampedProgress.x = damp(
            this.__props.progress.x,
            this.__props.dampedProgress.x,
            this.dampFactor,
            this.dampPrecision
          );

          // Y axis
          this.__props.current.y = clamp(
            window.pageYOffset,
            this.__props.start.y,
            this.__props.end.y
          );
          this.__props.progress.y = clamp01(
            (this.__props.current.y - this.__props.start.y) /
              (this.__props.end.y - this.__props.start.y)
          );
          this.__props.dampedProgress.y = damp(
            this.__props.progress.y,
            this.__props.dampedProgress.y,
            this.dampFactor,
            this.dampPrecision
          );

          if (
            this.__props.dampedProgress.x === this.__props.progress.x &&
            this.__props.dampedProgress.y === this.__props.progress.y
          ) {
            this.$services.disable('ticked');
          }

          // @ts-ignore
          this.__callMethod('scrolledInView', this.__props);
        },
      };

      this.$on('before-mounted', () => {
        this.$on('resized', delegate);
        this.$on('scrolled', delegate);
        this.$on('ticked', delegate);
      });

      this.$on('mounted', () => {
        this.__setProps();
      });

      this.$on('destroyed', () => {
        this.$off('resized', delegate);
        this.$off('scrolled', delegate);
        this.$off('ticked', delegate);
      });
    }

    /**
     * Mounted hook.
     *
     * @deprecated
     * @returns {void}
     */
    mounted() {
      // @ts-ignore
      if (isFunction(super.mounted)) super.mounted();
    }

    /**
     * Resized hook.
     *
     * @deprecated
     * @param   {import('../services/resize').ResizeServiceProps} props
     * @returns {void}
     */
    resized(props) {
      // @ts-ignore
      if (isFunction(super.resized)) super.resized(props);
    }

    /**
     * Scrolled hook.
     *
     * @deprecated
     * @param   {import('../services/scroll').ScrollServiceProps} props
     * @returns {void}
     */
    scrolled(props) {
      // @ts-ignore
      if (isFunction(super.scrolled)) super.scrolled(props);
    }

    /**
     * Ticked hook.
     *
     * @deprecated
     * @param   {import('../services/raf').RafServiceProps} props
     * @returns {void}
     */
    ticked(props) {
      // @ts-ignore
      if (isFunction(super.ticked)) super.ticked(props);
    }

    /**
     * Destroyed hook.
     *
     * @deprecated
     * @returns {void}
     */
    destroyed() {
      // @ts-ignore
      if (isFunction(super.destroyed)) super.destroyed();
    }

    /**
     * Set the decorator props.
     *
     * @private
     * @returns {void}
     */
    __setProps() {
      const sizes = options.useOffsetSizes
        ? getOffsetSizes(this.$el)
        : this.$el.getBoundingClientRect();

      // Y axis
      const yEnd = sizes.y + window.pageYOffset + sizes.height;
      const yStart = yEnd - window.innerHeight - sizes.height;
      const yCurrent = clamp(window.pageYOffset, yStart, yEnd);
      const yProgress = clamp01((yCurrent - yStart) / (yEnd - yStart));

      // X axis
      const xEnd = sizes.x + window.pageXOffset + sizes.width;
      const xStart = xEnd - window.innerWidth - sizes.width;
      const xCurrent = clamp(window.pageXOffset, xStart, xEnd);
      const xProgress = clamp01((xCurrent - xStart) / (xEnd - xStart));

      this.__props.start.x = xStart;
      this.__props.start.y = yStart;
      this.__props.end.x = xEnd;
      this.__props.end.y = yEnd;
      this.__props.current.x = xCurrent;
      this.__props.current.y = yCurrent;
      this.__props.progress.x = xProgress;
      this.__props.progress.y = yProgress;
      this.__props.dampedProgress.x = damp(xProgress, this.__props.dampedProgress.x);
      this.__props.dampedProgress.y = damp(yProgress, this.__props.dampedProgress.y);
    }
  };
}
