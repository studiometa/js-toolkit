import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

/** Pointer state for both viewport axes. */
export interface PointerProps {
  /** The source event, or `null` before observation and after release. */
  readonly event: PointerEvent | null;
  readonly isDown: boolean;
  /** Position in the viewport. */
  readonly x: number;
  readonly y: number;
  /** Movement since the previous update. */
  readonly deltaX: number;
  readonly deltaY: number;
  /** Viewport size. */
  readonly maxX: number;
  readonly maxY: number;
  /** Position over the viewport, from `0` to `1`. */
  readonly progressX: number;
  readonly progressY: number;
}

/** Pointer state placed in a target element's box, beside the viewport one. */
export interface ElementPointerProps extends PointerProps {
  /** Position inside the target's box, from its top-left corner. */
  readonly relativeX: number;
  readonly relativeY: number;
  /** Position over the target's box, from `0` to `1` inside it and past that range outside. */
  readonly relativeProgressX: number;
  readonly relativeProgressY: number;
}

/** Pointer event types observed by the service. */
const EVENTS = ['pointermove', 'pointerdown', 'pointerup', 'pointercancel'] as const;

function createPointerService(): Service<PointerProps> {
  // Use the viewport center until a pointer event is observed.
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  const props: MutableProps<PointerProps> = {
    event: null,
    isDown: false,
    x,
    y,
    deltaX: 0,
    deltaY: 0,
    maxX: window.innerWidth,
    maxY: window.innerHeight,
    progressX: 0.5,
    progressY: 0.5,
  };

  function update(event: PointerEvent): PointerProps {
    const lastX = props.x;
    const lastY = props.y;

    props.event = event;
    props.x = event.clientX;
    props.y = event.clientY;
    props.deltaX = props.x - lastX;
    props.deltaY = props.y - lastY;
    props.maxX = window.innerWidth;
    props.maxY = window.innerHeight;
    props.progressX = props.x / props.maxX;
    props.progressY = props.y / props.maxY;

    return props;
  }

  return createService<PointerProps>({
    props: () => props,
    // The centered initial position is not an observed value.
    hasProps: () => props.event !== null,
    start(emit) {
      /** Track one pointer so other contacts cannot end its gesture. */
      let activePointerId: number | null = null;

      const onPointer = (event: Event) => {
        const pointerEvent = event as PointerEvent;
        const { pointerId, type } = pointerEvent;

        if (type === 'pointerdown') {
          // Ignore additional contacts during an active gesture.
          if (activePointerId !== null) {
            return;
          }
          activePointerId = pointerId;
        } else if (activePointerId !== null && pointerId !== activePointerId) {
          return;
        }

        // Read coordinates from every event because a touch tap can have no move event.
        if (type !== 'pointermove') {
          props.isDown = type === 'pointerdown';
        }
        if (type === 'pointerup' || type === 'pointercancel') {
          activePointerId = null;
        }
        emit(update(pointerEvent));
      };

      // Capture events that descendants stop from propagating.
      for (const type of EVENTS) {
        document.addEventListener(type, onPointer, { passive: true, capture: true });
      }

      return () => {
        for (const type of EVENTS) {
          document.removeEventListener(type, onPointer, { capture: true });
        }
        // Release the event so its target subtree can be collected.
        props.event = null;
      };
    },
  });
}

/**
 * Place the shared pointer in a target element's box.
 *
 * The maths belongs to the service rather than to each consumer, and so does
 * the layout read it needs: `getBoundingClientRect()` on every pointer event
 * would be one forced measurement per event, and a mouse reports up to 1000 of
 * them a second.
 */
function createElementPointerService(target: Element): Service<ElementPointerProps> {
  const pointer = usePointer();
  const props: MutableProps<ElementPointerProps> = {
    ...pointer.props(),
    relativeX: 0,
    relativeY: 0,
    relativeProgressX: 0,
    relativeProgressY: 0,
  };

  /**
   * The target's box, kept between the events that can move it.
   *
   * It is held only while the service runs, because that is when the listeners
   * which drop it are attached. The layout box is deliberately the frame of
   * reference: a transform the consumer applies from `moved()` does not
   * invalidate it, so a hover effect cannot feed its own output back in.
   */
  let box: DOMRect | null = null;
  let isRunning = false;

  function measure(): DOMRect {
    if (box) {
      return box;
    }
    const rect = target.getBoundingClientRect();
    if (isRunning) {
      box = rect;
    }
    return rect;
  }

  function sync(source: PointerProps): ElementPointerProps {
    props.event = source.event;
    props.isDown = source.isDown;
    props.x = source.x;
    props.y = source.y;
    props.deltaX = source.deltaX;
    props.deltaY = source.deltaY;
    props.maxX = source.maxX;
    props.maxY = source.maxY;
    props.progressX = source.progressX;
    props.progressY = source.progressY;

    const rect = measure();
    props.relativeX = source.x - rect.left;
    props.relativeY = source.y - rect.top;
    // A collapsed box has no inside to be at a fraction of.
    props.relativeProgressX = rect.width === 0 ? 0 : props.relativeX / rect.width;
    props.relativeProgressY = rect.height === 0 ? 0 : props.relativeY / rect.height;

    return props;
  }

  return createService<ElementPointerProps>({
    // A cold read is the shared pointer's own answer, placed in the box.
    props: () => sync(pointer.props()),
    hasProps: () => pointer.props().event !== null,
    start(emit) {
      isRunning = true;
      const invalidate = () => {
        box = null;
      };

      // Capture reaches every scroller, the document included.
      document.addEventListener('scroll', invalidate, { passive: true, capture: true });
      window.addEventListener('resize', invalidate, { passive: true });
      const observer = new ResizeObserver(invalidate);
      observer.observe(target);
      const unsubscribe = pointer.subscribe((source) => emit(sync(source)));

      return () => {
        isRunning = false;
        box = null;
        unsubscribe();
        observer.disconnect();
        document.removeEventListener('scroll', invalidate, { capture: true });
        window.removeEventListener('resize', invalidate);
        // Release the event so its target subtree can be collected.
        props.event = null;
      };
    },
  });
}

interface PointerRuntimeState {
  service: Service<PointerProps> | undefined;
  readonly services: (target: Element) => Service<ElementPointerProps>;
}

const pointerState = /* @__PURE__ */ getSharedRuntimeSlot<PointerRuntimeState>(
  'service:pointer',
  2,
  () => ({
    service: undefined,
    services: perTarget(createElementPointerService),
  }),
);

/** Use the viewport-relative pointer service. */
export function usePointer(): Service<PointerProps>;
/** Use one lazy service per target, adding the pointer's position inside its box. */
export function usePointer(target: Element): Service<ElementPointerProps>;
export function usePointer(target?: Element): Service<PointerProps> | Service<ElementPointerProps> {
  if (target) {
    return pointerState.services(target);
  }
  pointerState.service ??= createPointerService();
  return pointerState.service;
}

/** The method `withPointer()` subscribes for the component. */
export interface PointerHook {
  moved?(props: ElementPointerProps): void;
}

export type PointerMixinOptions = ServiceMixinOptions<Element>;

/**
 * Subscribe `moved()` to the pointer for each mount cycle. The root element is the default target, so a component reads the pointer both in the viewport and inside its own box.
 */
export const withPointer = /* @__PURE__ */ createServiceMixin<
  PointerHook & ServiceHandles<'moved'>,
  Element
>({
  hook: 'moved',
  target: (instance) => instance.$el,
  use: (target) => usePointer(target),
});
