import {
  scheduler,
  useRaf,
  useResize,
  useWindowScroll,
  type Base,
  type BaseConstructor,
  type MixedClass,
  type MountedReturn,
} from '../../src/index.js';
import { clamp, clamp01, damp } from '../../src/utils/maths.js';
import { getEdges, normalizeOffset } from './offset.js';

/**
 * What a `scrolledInView()` hook receives.
 *
 * v3 groups these as `{ start: {x, y}, end: {x, y}, current: {x, y}, … }`.
 * v4's service props are flat, one key per axis (`ScrollProps` is `x`, `y`,
 * `deltaX`, `deltaY`, …), so this follows the same convention — a handler
 * destructures `{ dampedProgressY }` instead of reaching through two levels.
 */
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
  /**
   * Milliseconds since the previous frame, straight from the raf props.
   *
   * On the props because a hook that damps a value of its own needs the same
   * number this layer used — damping per call rather than per elapsed
   * millisecond is what made the speed depend on the display.
   */
  delta: number;
}

/**
 * A hook may return a function, which runs in the same frame's `write`
 * phase — the read/write split the toolkit has always had, made explicit by
 * the return value instead of by nested `domScheduler` calls.
 */
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

/**
 * Add scroll-linked progress to a component.
 *
 * Port of `@studiometa/js-toolkit/decorators/withScrolledInView`. The v3
 * decorator is a `withMountWhenInView` subclass that listens to four `$on`
 * channels (`mounted`, `resized`, `scrolled`, `ticked`) through a hand-built
 * `handleEvent` delegate, and toggles the `ticked` service on and off with
 * `$services.enable` / `$services.disable` so the frame loop only runs while
 * the damped value is catching up.
 *
 * In v4:
 *
 * - `withMountWhenInView` is gone; the component declares
 *   `config.mountStrategy = 'in-view'` instead, and any element overrides it
 *   with `data-mount`.
 * - the four `$on` channels become two service subscriptions returned as
 *   `mounted()` cleanups, so nothing has to be unbound by hand.
 * - `$services.enable('ticked')` / `disable('ticked')` has **no v4
 *   equivalent**: a mixin subscribes for the whole mount cycle. The frame
 *   subscription is therefore taken and released by hand here, which is the
 *   thing this port could not do with `withRaf`.
 */
export function withScrolledInView<T extends BaseConstructor>(
  BaseClass: T,
  options: WithScrolledInViewOptions = {},
): MixedClass<T, ScrolledInViewHook> {
  return apply(BaseClass, options) as unknown as MixedClass<T, ScrolledInViewHook>;
}

/**
 * The class is built against the concrete `BaseConstructor` rather than
 * against the type parameter: TypeScript only allows extending a type
 * parameter when its constructor takes `...args: any[]`, which `Base` does
 * not. This is the shape `createServiceMixin` uses in core for the same
 * reason.
 */
function apply(
  BaseClass: BaseConstructor,
  { target = (instance: Base) => instance.$el }: WithScrolledInViewOptions,
) {
  return class WithScrolledInView extends BaseClass {
    static config = {
      name: 'WithScrolledInView',
      // The reversible strategy: a scroll animation is exactly the case the
      // v4 design names for `in-view` over `visible`.
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
      return target(this as unknown as Base);
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

    /**
     * Take the frame subscription, if it is not already running. This is the
     * `$services.enable('ticked')` of v3 — v4 has no such switch on a mixin,
     * so the subscription itself is the switch.
     */
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
          // This frame is the one that lands on the settled position, so its
          // write is scheduled on the instance and the subscription released
          // after it — a render handed back to a subscription that leaves
          // mid-frame is cancelled, by design.
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
      // Snap the damped values to their target and render once more, so a
      // component leaving the viewport is not frozen mid-animation.
      const props = this.__scrollInViewProps;
      props.dampedCurrentX = props.currentX;
      props.dampedCurrentY = props.currentY;
      props.dampedProgressX = props.progressX;
      props.dampedProgressY = props.progressY;
      // Not `$read`/`$write`: `$destroy()` cancels the instance's pending
      // tasks right after running the `mounted()` cleanups, so a final render
      // has to be scheduled outside the instance's own lane.
      scheduler.read(() => {
        const hook = (this as unknown as ScrolledInViewHook).scrolledInView;
        const render = hook?.call(this, props);
        if (typeof render === 'function') {
          scheduler.write(render);
        }
      });
    }
  };
}
