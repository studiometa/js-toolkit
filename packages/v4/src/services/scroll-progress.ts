import { defaultScheduler, type ScheduledTask } from '../scheduler.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { clamp, clamp01 } from '../utils/maths.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { getEdges, normalizeOffset, type NormalizedOffset } from './scroll-progress-offset.js';
import { useWindowSize } from './resize.js';
import { useWindowScroll } from './scroll.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

const DEFAULT_OFFSET = 'start end / end start';

export interface ScrollProgressOptions {
  /** Two target/viewport edge pairs: `"start end / end start"` by default. */
  offset?: string;
}

/** The target's element-through-viewport position and progress on both axes. */
export interface ScrollProgressProps {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly currentX: number;
  readonly currentY: number;
  readonly progressX: number;
  readonly progressY: number;
}

/** A DOM mutation returned by `scrolledInView()`, run in the write phase. */
export type ScrollProgressRender = () => void;

/** The method `withScrollProgress()` subscribes for the component. */
export interface ScrollProgressHook {
  scrolledInView?(props: ScrollProgressProps): void | ScrollProgressRender;
}

export type ScrollProgressMixinOptions = ScrollProgressOptions & ServiceMixinOptions<Element>;

function progressBetween(current: number, start: number, end: number): number {
  return start === end ? 0 : clamp01((current - start) / (end - start));
}

function createScrollProgressService(
  target: Element,
  offsetValue: string,
): Service<ScrollProgressProps> {
  const offset: NormalizedOffset = normalizeOffset(offsetValue);
  const props: MutableProps<ScrollProgressProps> = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    currentX: 0,
    currentY: 0,
    progressX: 0,
    progressY: 0,
  };

  function setCurrent(x: number, y: number): boolean {
    const currentX = clamp(x, props.startX, props.endX);
    const currentY = clamp(y, props.startY, props.endY);
    const progressX = progressBetween(currentX, props.startX, props.endX);
    const progressY = progressBetween(currentY, props.startY, props.endY);
    const changed =
      currentX !== props.currentX ||
      currentY !== props.currentY ||
      progressX !== props.progressX ||
      progressY !== props.progressY;

    props.currentX = currentX;
    props.currentY = currentY;
    props.progressX = progressX;
    props.progressY = progressY;
    return changed;
  }

  function measure(): boolean {
    const { x, y } = useWindowScroll().props();
    const rect = target.getBoundingClientRect();
    const [startX, endX] = getEdges(
      { position: rect.left + x, size: rect.width },
      { position: 0, size: window.innerWidth },
      offset,
    );
    const [startY, endY] = getEdges(
      { position: rect.top + y, size: rect.height },
      { position: 0, size: window.innerHeight },
      offset,
    );
    const changed =
      startX !== props.startX ||
      startY !== props.startY ||
      endX !== props.endX ||
      endY !== props.endY;

    props.startX = startX;
    props.startY = startY;
    props.endX = endX;
    props.endY = endY;
    return setCurrent(x, y) || changed;
  }

  return createService({
    props: () => props,
    start(emit) {
      let measureTask: ScheduledTask<void> | null = null;
      const scheduleMeasure = () => {
        measureTask ??= defaultScheduler.read(() => {
          measureTask = null;
          if (measure()) {
            emit(props);
          }
        });
      };

      // Start the shared sampled sources before the first measurement. This
      // makes their props current for this run and gives `{ immediate: true }`
      // one synchronous, measured value after `start()` returns.
      const unsubscribeScroll = useWindowScroll().subscribe(({ x, y }) => {
        if (setCurrent(x, y)) {
          emit(props);
        }
      });
      const unsubscribeSize = useWindowSize().subscribe(scheduleMeasure);
      measure();

      // ResizeObserver covers the target box and content-driven size changes.
      // MutationObserver also catches geometry changes that do not resize its
      // border box, such as a class changing `top` or `transform`.
      const resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(target);
      const mutationObserver = new MutationObserver(scheduleMeasure);
      mutationObserver.observe(target, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });

      return () => {
        measureTask?.cancel();
        measureTask = null;
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        unsubscribeSize();
        unsubscribeScroll();
      };
    },
  });
}

const scrollProgressServices = /* @__PURE__ */ getSharedRuntimeSlot(
  'service:scroll-progress',
  1,
  () => perTarget(createScrollProgressService),
);

/**
 * Observe an element's progress through the viewport on both axes.
 *
 * The service is lazy and shared by target plus resolved offset. It measures
 * geometry in the scheduler's read phase and releases its observers and shared
 * source subscriptions with its last subscriber.
 */
export function useScrollProgress(
  target: Element,
  { offset = DEFAULT_OFFSET }: ScrollProgressOptions = {},
): Service<ScrollProgressProps> {
  return scrollProgressServices(target, offset);
}

/**
 * Subscribe a component's `scrolledInView()` method to its root element's raw
 * viewport progress. The first measured props are delivered on mount by
 * default, and a returned mutation runs through the instance write lane:
 *
 * ```js
 * class Hero extends withScrollProgress(Base, {
 *   offset: 'start end / end start',
 * }) {
 *   scrolledInView({ progressY }) {
 *     return () => {
 *       this.$el.style.setProperty('--progress', `${progressY}`);
 *     };
 *   }
 * }
 * ```
 *
 * Use `target: (instance) => instance.$refs.panel` for another element,
 * `immediate: false` to wait for the first update, or `manual: true` to own the
 * subscription through `this.$services.scrolledInView.start()` and `.stop()`.
 * The stage-3 decorator form is equivalent:
 *
 * ```js
 * @withScrollProgress({ offset: 'start center / end center' })
 * class Hero extends Base {
 *   scrolledInView({ progressY }) { … }
 * }
 * ```
 *
 * This supplies raw progress only. Damping and mount control stay with the
 * component.
 */
export const withScrollProgress = /* @__PURE__ */ createServiceMixin<
  ScrollProgressHook & ServiceHandles<'scrolledInView'>,
  Element,
  ScrollProgressOptions
>({
  hook: 'scrolledInView',
  target: (instance) => instance.$el,
  defaultImmediate: true,
  // Only service options reach the service. Lifecycle fields must not become
  // part of its target-and-offset cache key.
  use: (target, { offset }) => useScrollProgress(target, { offset }),
  handleResult: (instance, result) => {
    if (typeof result === 'function') {
      instance.$write(result as ScrollProgressRender);
    }
  },
});
