import type { BaseInterface, BaseDecorator } from '../../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../../Base/index.js';
import type {
  RafServiceProps,
  ScrollServiceProps,
  ResizeServiceProps,
} from '../../services/index.js';
import { withMountWhenInView } from '../withMountWhenInView.js';
import {
  damp,
  clamp,
  clamp01,
  getOffsetSizes,
  isFunction,
  useScheduler,
} from '../../utils/index.js';
import { normalizeOffset, getEdges } from './utils.js';

const scheduler = useScheduler(['update', 'render']);

export interface WithScrolledInViewProps extends BaseProps {
  $options: {
    dampFactor: number;
    dampPrecision: number;
    offset: string;
  };
}

export type ScrollInViewProps = {
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

export type WithScrolledInViewOptions = IntersectionObserverInit & {
  useOffsetSizes?: boolean;
};

/**
 * Update props on tick.
 */
function updateProps(
  props: ScrollInViewProps,
  dampFactor: number,
  dampPrecision: number,
  axis: 'x' | 'y' = 'x',
): void {
  props.current[axis] = clamp(
    axis === 'x' ? window.pageXOffset : window.pageYOffset,
    props.start[axis],
    props.end[axis],
  );
  props.dampedCurrent[axis] = damp(
    props.current[axis],
    props.dampedCurrent[axis],
    dampFactor,
    dampPrecision,
  );
  props.progress[axis] = clamp01(
    (props.current[axis] - props.start[axis]) / (props.end[axis] - props.start[axis]),
  );
  props.dampedProgress[axis] = clamp01(
    (props.dampedCurrent[axis] - props.start[axis]) / (props.end[axis] - props.start[axis]),
  );
}

export interface WithScrolledInViewInterface extends BaseInterface {
  /**
   * @type {ScrollInViewProps}
   */
  readonly props: ScrollInViewProps;
  dampFactor?: number;
  dampPrecision?: number;
  mounted(): void;
  resized(props: ResizeServiceProps): void;
  scrolled(props: ScrollServiceProps): void;
  ticked(props: RafServiceProps): void;
  destroyed(): void;
}

/**
 * Add scrolled in view capabilities to a component.
 */
export function withScrolledInView<S extends Base = Base>(
  BaseClass: typeof Base,
  options: WithScrolledInViewOptions = {},
): BaseDecorator<WithScrolledInViewInterface, S, WithScrolledInViewProps> {
  /**
   * Class.
   */
  class WithScrolledInView<T extends BaseProps = BaseProps> extends withMountWhenInView(
    BaseClass,
    options,
  )<T & WithScrolledInViewProps> {
    /**
     * Config.
     */
    static config: BaseConfig = {
      name: `${BaseClass.config.name}WithMountWhenInView`,
      emits: ['scrolledInView'],
      options: {
        dampFactor: {
          type: Number,
          default: 0.1,
        },
        dampPrecision: {
          type: Number,
          default: 0.001,
        },
        offset: {
          type: String,
          default: 'start end / end start',
        },
      },
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

    shouldEvaluateProps = true;

    get props() {
      if (this.shouldEvaluateProps) {
        this.shouldEvaluateProps = false;
        const targetSizes = options.useOffsetSizes
          ? getOffsetSizes(this.$el)
          : this.$el.getBoundingClientRect();

        targetSizes.y += window.pageYOffset;
        targetSizes.x += window.pageXOffset;

        const containerSizes = {
          x: 0,
          y: 0,
          height: window.innerHeight,
          width: window.innerWidth,
        };

        const offset = normalizeOffset(this.$options.offset);

        // Y axis
        const [yStart, yEnd] = getEdges('y', targetSizes, containerSizes, offset);
        const yCurrent = clamp(window.pageYOffset, yStart, yEnd);
        const yProgress = clamp01((yCurrent - yStart) / (yEnd - yStart));
        // X axis
        const [xStart, xEnd] = getEdges('x', targetSizes, containerSizes, offset);
        const xCurrent = clamp(window.pageXOffset, xStart, xEnd);
        const xProgress = clamp01((xCurrent - xStart) / (xEnd - xStart));

        this.__props.start.x = xStart;
        this.__props.start.y = yStart;
        this.__props.end.x = xEnd;
        this.__props.end.y = yEnd;
        this.__props.current.x = xCurrent;
        this.__props.current.y = yCurrent;
        this.__props.dampedCurrent.x = xCurrent;
        this.__props.dampedCurrent.y = yCurrent;
        this.__props.progress.x = xProgress;
        this.__props.progress.y = yProgress;
        this.__props.dampedProgress.x = xProgress;
        this.__props.dampedProgress.y = yProgress;
      }

      return this.__props;
    }

    /**
     * Factor used for the `dampedProgress` props.
     * @deprecated
     * @todo v3 delete in favor of option API
     */
    dampFactor?: number = null;

    /**
     * Precision for the `dampedProgress` props.
     * @deprecated
     * @todo v3 delete in favor of option API
     */
    dampPrecision?: number = null;

    /**
     * Bind listeners.
     */
    constructor(element: HTMLElement) {
      super(element);

      const render = () => {
        scheduler.update(() => {
          // @ts-ignore
          const renderFn = this.__callMethod('scrolledInView', this.props);
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
          this.shouldEvaluateProps = true;
          render();
        },
        scrolled: (props) => {
          if ((!this.$services.has('ticked') && props.changed.y) || props.changed.x) {
            this.$services.enable('ticked');
          }
        },
        ticked: () => {
          const dampFactor = this.dampFactor ?? this.$options.dampFactor;
          const dampPrecision = this.dampPrecision ?? this.$options.dampPrecision;
          updateProps(this.__props, dampFactor, dampPrecision, 'x');
          updateProps(this.__props, dampFactor, dampPrecision, 'y');

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
  }

  // @ts-ignore
  return WithScrolledInView;
}
