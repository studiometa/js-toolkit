import withMountWhenInView from './withMountWhenInView.js';
import { damp, clamp, clamp01, getOffsetSizes, isFunction, useScheduler } from '../utils/index.js';

const scheduler = useScheduler(['update', 'render']);

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 * @typedef {import('../Base').BaseConfig} BaseConfig
 * @typedef {{
 *   start: {
 *     x: number,
 *     y: number,
 *   },
 *   end: {
 *     x: number,
 *     y: number,
 *   },
 *   current: {
 *     x: number,
 *     y: number,
 *   },
 *   dampedCurrent: {
 *     x: number,
 *     y: number,
 *   },
 *   progress: {
 *     x: number,
 *     y: number,
 *   },
 *   dampedProgress: {
 *     x: number,
 *     y: number,
 *   },
 * }} ScrollInViewProps
 */

/**
 * Update props on tick.
 *
 * @param   {ScrollInViewProps} props
 * @param   {number} dampFactor
 * @param   {number} dampPrecision
 * @param   {'x'|'y'} axis
 * @returns {void}
 */
function updateProps(props, dampFactor, dampPrecision, axis = 'x') {
  props.current[axis] = clamp(
    axis === 'x' ? window.pageXOffset : window.pageYOffset,
    props.start[axis],
    props.end[axis]
  );
  props.dampedCurrent[axis] = damp(
    props.current[axis],
    props.dampedCurrent[axis],
    dampFactor,
    dampPrecision
  );
  props.progress[axis] = clamp01(
    (props.current[axis] - props.start[axis]) / (props.end[axis] - props.start[axis])
  );
  props.dampedProgress[axis] = clamp01(
    (props.dampedCurrent[axis] - props.start[axis]) / (props.end[axis] - props.start[axis])
  );
}

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
     * @type {ScrollInViewProps}
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
      dampedCurrent: {
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
          updateProps(this.__props, this.dampFactor, this.dampPrecision, 'x');
          updateProps(this.__props, this.dampFactor, this.dampPrecision, 'y');

          if (
            this.__props.dampedCurrent.x === this.__props.current.x &&
            this.__props.dampedCurrent.y === this.__props.current.y
          ) {
            this.$services.disable('ticked');
          }

          scheduler.update(() => {
            // @ts-ignore
            const renderFn = this.__callMethod('scrolledInView', this.__props);
            if (isFunction(renderFn)) {
              scheduler.render(() => {
                renderFn(this.__props);
              });
            }
          });
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
      this.__props.dampedCurrent.x = damp(
        xCurrent,
        this.__props.dampedCurrent.x,
        this.dampFactor,
        this.dampPrecision
      );
      this.__props.dampedCurrent.y = damp(
        yCurrent,
        this.__props.dampedCurrent.y,
        this.dampFactor,
        this.dampPrecision
      );
      this.__props.progress.x = xProgress;
      this.__props.progress.y = yProgress;
      this.__props.dampedProgress.x = clamp01(
        (this.__props.dampedCurrent.x - xStart) / (xEnd - xStart)
      );
      this.__props.dampedProgress.y = clamp01(
        (this.__props.dampedCurrent.y - yStart) / (yEnd - yStart)
      );
    }
  };
}
