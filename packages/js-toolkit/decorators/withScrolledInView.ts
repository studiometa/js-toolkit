import type { BaseInterface } from 'Base/types.js';
import type { Base, BaseTypeParameter, BaseConstructor, BaseConfig } from '../Base/index.js';
import type { RafServiceProps, ScrollServiceProps, ResizeServiceProps } from '../services/index.js';
import withMountWhenInView from './withMountWhenInView.js';
import { damp, clamp, clamp01, getOffsetSizes, isFunction, useScheduler } from '../utils/index.js';

const scheduler = useScheduler(['update', 'render']);

type ScrollInViewProps = {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  current: {
    x: number;
    y: number;
  };
  dampedCurrent: {
    x: number;
    y: number;
  };
  progress: {
    x: number;
    y: number;
  };
  dampedProgress: {
    x: number;
    y: number;
  };
};

type withScrolledInViewOptions = IntersectionObserverInit & {
  useOffsetSizes?: boolean;
};

/**
 * Update props on tick.
 */
function updateProps(
  props: ScrollInViewProps,
  dampFactor: number,
  dampPrecision: number,
  axis: 'x' | 'y' = 'x'
): void {
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
 */
export default function withScrolledInView<
  S extends BaseConstructor<Base>,
  T extends BaseTypeParameter = BaseTypeParameter
>(BaseClass: S, options: withScrolledInViewOptions = {}) {
  const WithMountWhenInView = withMountWhenInView<S, T>(BaseClass, options);

  class WithScrolledInView extends WithMountWhenInView implements BaseInterface {
    /**
     * Config.
     */
    static config: BaseConfig = {
      name: `${BaseClass.config.name}WithMountWhenInView`,
      emits: ['scrolledInView'],
    };

    __props: ScrollInViewProps = {
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
     */
    dampFactor = 0.1;

    /**
     * Precision for the `dampedProgress` props.
     */
    dampPrecision = 0.001;

    /**
     * Bind listeners.
     */
    constructor(element: HTMLElement) {
      super(element);

      const render = () => {
        scheduler.update(() => {
          // @ts-ignore
          const renderFn = this.__callMethod('scrolledInView', this.__props);
          if (isFunction(renderFn)) {
            scheduler.render(() => {
              renderFn(this.__props);
            });
          }
        });
      };

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

          render();
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

        // Clamp damped values to their final value and trigger one last render on destroy
        this.__props.dampedCurrent.x = this.__props.current.x;
        this.__props.dampedCurrent.y = this.__props.current.y;
        this.__props.dampedProgress.x = this.__props.progress.x;
        this.__props.dampedProgress.y = this.__props.progress.y;
        render();
      });
    }

    /**
     * Mounted hook.
     */
    mounted() {
      // @ts-ignore
      if (isFunction(super.mounted)) {
        // @ts-ignore
        super.mounted();
      }
    }

    /**
     * Resized hook.
     */
    resized(props: ResizeServiceProps) {
      // @ts-ignore
      if (isFunction(super.resized)) {
        // @ts-ignore
        super.resized(props);
      }
    }

    /**
     * Scrolled hook.
     */
    scrolled(props: ScrollServiceProps) {
      // @ts-ignore
      if (isFunction(super.scrolled)) {
        // @ts-ignore
        super.scrolled(props);
      }
    }

    /**
     * Ticked hook.
     */
    ticked(props: RafServiceProps) {
      // @ts-ignore
      if (isFunction(super.ticked)) {
        // @ts-ignore
        super.ticked(props);
      }
    }

    /**
     * Destroyed hook.
     */
    destroyed() {
      // @ts-ignore
      if (isFunction(super.destroyed)) {
        // @ts-ignore
        super.destroyed();
      }
    }

    /**
     * Set the decorator props.
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
  }

  return WithScrolledInView as BaseConstructor<WithScrolledInView> &
    Pick<typeof WithScrolledInView, keyof typeof WithScrolledInView> &
    S &
    BaseConstructor<Base<T>> &
    Pick<typeof Base, keyof typeof Base>;
}
