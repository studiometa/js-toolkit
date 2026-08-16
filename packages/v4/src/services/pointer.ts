import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, type MutableProps, type Service } from './service.js';

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

const pointerState = /* @__PURE__ */ getSharedRuntimeSlot<{
  service: Service<PointerProps> | undefined;
}>('service:pointer', 1, () => ({ service: undefined }));

/** Use the viewport-relative pointer service. */
export function usePointer(): Service<PointerProps> {
  pointerState.service ??= createPointerService();
  return pointerState.service;
}

/** The method `withPointer()` subscribes for the component. */
export interface PointerHook {
  moved?(props: PointerProps): void;
}

export type PointerMixinOptions = ServiceMixinOptions<void>;

/** Subscribe `moved()` to the viewport pointer for each mount cycle. */
export const withPointer = /* @__PURE__ */ createServiceMixin<
  PointerHook & ServiceHandles<'moved'>,
  void
>({
  hook: 'moved',
  target: () => undefined,
  use: () => usePointer(),
});
