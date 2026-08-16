import {
  defaultScheduler,
  useRaf,
  useResize,
  useWindowScroll,
  type Base,
  type BaseConstructor,
  type MixedClass,
  type MountedReturn,
} from '../../src/index.js';
import { getEdges, normalizeOffset } from '../../src/services/scroll-progress-offset.js';
import { clamp, clamp01, damp } from '../../src/utils/maths.js';

/** Values passed to a `scrolledInView()` hook. */
export interface ScrollInViewProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  currentX: number;
  currentY: number;
  dampedCurrentX: number;
  dampedCurrentY: number;
  progressX: number;
  progressY: number;
  dampedProgressX: number;
  dampedProgressY: number;
  /** Milliseconds since the previous frame. */
  delta: number;
}

/** A hook return value that runs in the same frame's write phase. */
export type ScrolledInViewRender = () => void;

export interface ScrolledInViewHook {
  scrolledInView?(props: ScrollInViewProps): void | ScrolledInViewRender;
}

export interface WithScrolledInViewOptions {
  /** Resolve the element whose position drives the progress. */
  target?: (instance: Base) => HTMLElement;
}

function progressBetween(current: number, start: number, end: number): number {
  return start === end ? 0 : clamp01((current - start) / (end - start));
}

/** Add damped, scroll-linked progress to a component. */
export function withScrolledInView<T extends BaseConstructor>(
  BaseClass: T,
  options: WithScrolledInViewOptions = {},
): MixedClass<T, ScrolledInViewHook> {
  return apply(BaseClass, options) as unknown as MixedClass<T, ScrolledInViewHook>;
}

/** Use the concrete constructor because TypeScript cannot extend this constrained type parameter. */
function apply(
  BaseClass: BaseConstructor,
  { target = (instance: Base) => instance.$el }: WithScrolledInViewOptions,
) {
  return class WithScrolledInView extends BaseClass {
    static config = {
      name: 'WithScrolledInView',
      mountStrategy: 'in-view' as const,
      options: {
        dampFactor: { type: Number, default: 0.1 },
        dampPrecision: { type: Number, default: 0.001 },
        offset: { type: String, default: 'start end / end start' },
      },
    };

    __scrollInViewProps: ScrollInViewProps = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      currentX: 0,
      currentY: 0,
      dampedCurrentX: 0,
      dampedCurrentY: 0,
      progressX: 0,
      progressY: 0,
      dampedProgressX: 0,
      dampedProgressY: 0,
      delta: 0,
    };

    /** Live while the damped value is still catching up, `null` otherwise. */
    __unsubscribeFrame: (() => void) | null = null;

    __shouldMeasure = true;

    get scrollInViewTarget(): HTMLElement {
      return target(this);
    }

    /**
     * Measure the element against the viewport and seed every prop. The
     * damped values start settled, so a component mounting mid-page renders
     * its real state instead of animating from zero.
     */
    measure(): void {
      this.__shouldMeasure = false;
      const el = this.scrollInViewTarget;
      const rect = el.getBoundingClientRect();
      const offset = normalizeOffset(
        (this.$options as { offset?: string }).offset ?? 'start end / end start',
      );
      const props = this.__scrollInViewProps;

      const [startY, endY] = getEdges(
        { position: rect.y + window.scrollY, size: rect.height },
        { position: 0, size: window.innerHeight },
        offset,
      );
      const [startX, endX] = getEdges(
        { position: rect.x + window.scrollX, size: rect.width },
        { position: 0, size: window.innerWidth },
        offset,
      );

      props.startX = startX;
      props.endX = endX;
      props.startY = startY;
      props.endY = endY;
      props.currentX = clamp(window.scrollX, startX, endX);
      props.currentY = clamp(window.scrollY, startY, endY);
      props.dampedCurrentX = props.currentX;
      props.dampedCurrentY = props.currentY;
      props.progressX = progressBetween(props.currentX, startX, endX);
      props.progressY = progressBetween(props.currentY, startY, endY);
      props.dampedProgressX = props.progressX;
      props.dampedProgressY = props.progressY;
    }

    /**
     * One read pass calling the hook, one write pass running whatever it
     * returned. Scheduled on the instance, so a destroyed component never
     * writes to a detached element.
     */
    renderScrollInView(): void {
      this.$read(() => {
        if (this.__shouldMeasure) {
          this.measure();
        }
        const hook = (this as unknown as ScrolledInViewHook).scrolledInView;
        const render = hook?.call(this, this.__scrollInViewProps);
        if (typeof render === 'function') {
          this.$write(render);
        }
      });
    }

    /** Start the frame subscription if it is not already active. */
    startTicking(): void {
      this.__unsubscribeFrame ??= useRaf().subscribe(({ delta }) => {
        const props = this.__scrollInViewProps;
        props.delta = delta;
        const { dampFactor, dampPrecision } = this.$options as {
          dampFactor: number;
          dampPrecision: number;
        };
        const { x, y } = useWindowScroll().props();

        props.currentX = clamp(x, props.startX, props.endX);
        props.currentY = clamp(y, props.startY, props.endY);
        props.dampedCurrentX = damp(
          props.currentX,
          props.dampedCurrentX,
          dampFactor,
          delta,
          dampPrecision,
        );
        props.dampedCurrentY = damp(
          props.currentY,
          props.dampedCurrentY,
          dampFactor,
          delta,
          dampPrecision,
        );
        props.progressX = progressBetween(props.currentX, props.startX, props.endX);
        props.progressY = progressBetween(props.currentY, props.startY, props.endY);
        props.dampedProgressX = progressBetween(props.dampedCurrentX, props.startX, props.endX);
        props.dampedProgressY = progressBetween(props.dampedCurrentY, props.startY, props.endY);

        const hook = (this as unknown as ScrolledInViewHook).scrolledInView;
        const render = hook?.call(this, props) ?? undefined;

        if (props.dampedCurrentX === props.currentX && props.dampedCurrentY === props.currentY) {
          // Schedule the final write before releasing the subscription.
          if (typeof render === 'function') {
            this.$write(render);
          }
          this.stopTicking();
          return undefined;
        }

        return render;
      });
    }

    stopTicking(): void {
      this.__unsubscribeFrame?.();
      this.__unsubscribeFrame = null;
    }

    mounted(): MountedReturn {
      const inherited = super.mounted();
      this.__shouldMeasure = true;
      this.renderScrollInView();

      return [
        inherited,
        useWindowScroll().subscribe(({ deltaX, deltaY }) => {
          if (deltaX !== 0 || deltaY !== 0) {
            this.startTicking();
          }
        }),
        useResize().subscribe(() => {
          this.__shouldMeasure = true;
          this.renderScrollInView();
        }),
        () => this.stopTicking(),
      ];
    }

    destroyed(): void {
      super.destroyed();
      // Snap to the target before the component leaves the viewport.
      const props = this.__scrollInViewProps;
      props.dampedCurrentX = props.currentX;
      props.dampedCurrentY = props.currentY;
      props.dampedProgressX = props.progressX;
      props.dampedProgressY = props.progressY;
      // Destruction cancels instance-owned tasks, so use the global scheduler.
      defaultScheduler.read(() => {
        const hook = (this as unknown as ScrolledInViewHook).scrolledInView;
        const render = hook?.call(this, props);
        if (typeof render === 'function') {
          defaultScheduler.write(render);
        }
      });
    }
  };
}
