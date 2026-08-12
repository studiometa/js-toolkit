import { createServiceMixin, type ServiceMixinOptions } from './mixin.js';
import { createService, type Service } from './service.js';

/**
 * Props are flat, one per axis, the same `<name>X`/`<name>Y` spelling the
 * scroll service uses: a handler destructures what it needs (`{ progressX }`)
 * instead of reaching through a group.
 */
export interface PointerProps {
  /**
   * The event that produced these props — `null` before the first one, and
   * again once the service stops, because an event keeps its `target`
   * reachable and with it every ancestor of a subtree that may since have
   * left the document.
   */
  event: PointerEvent | null;
  isDown: boolean;
  /** Position in the viewport. */
  x: number;
  y: number;
  /** Whether the axis moved in this update. */
  changedX: boolean;
  changedY: boolean;
  lastX: number;
  lastY: number;
  deltaX: number;
  deltaY: number;
  /** Viewport size. */
  maxX: number;
  maxY: number;
  /** Position over the viewport, from `0` to `1`. */
  progressX: number;
  progressY: number;
}

/**
 * Pointer events unify mouse, touch and pen, so one set of listeners
 * replaces the six v3 needed — and `pointermove` carries the coordinates a
 * `TouchEvent` hid inside `touches[0]`.
 */
const EVENTS = ['pointermove', 'pointerdown', 'pointerup', 'pointercancel'] as const;

function createPointerService(): Service<PointerProps> {
  // Centered until the pointer says otherwise: a component reading
  // `progressX` before the first move gets the middle of the viewport rather
  // than its top-left corner.
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  const props: PointerProps = {
    event: null,
    isDown: false,
    x,
    y,
    changedX: false,
    changedY: false,
    lastX: x,
    lastY: y,
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
    props.changedX = props.x !== lastX;
    props.changedY = props.y !== lastY;
    props.lastX = lastX;
    props.lastY = lastY;
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
    start(emit) {
      /**
       * Which pointer the props describe. Every active pointer arrives on the
       * same listener, so merging them made a second finger's `pointerup`
       * report `isDown: false` while the first finger was still down — in the
       * middle of a pinch, with the gesture very much alive.
       */
      let activePointerId: number | null = null;

      const onPointer = (event: Event) => {
        const pointerEvent = event as PointerEvent;
        const { pointerId, type } = pointerEvent;

        if (type === 'pointerdown') {
          // One gesture is already being followed; the extra fingers of a
          // pinch are not it.
          if (activePointerId !== null) {
            return;
          }
          activePointerId = pointerId;
        } else if (activePointerId !== null && pointerId !== activePointerId) {
          return;
        }

        // Every pointer event carries coordinates, and a press is the one
        // that carries the *new* ones: a touch tap has no `pointermove`
        // before it, so reading the position only on move reported wherever
        // the pointer had last been seen — the middle of the viewport on the
        // first tap of a page.
        if (type !== 'pointermove') {
          props.isDown = type === 'pointerdown';
        }
        if (type === 'pointerup' || type === 'pointercancel') {
          activePointerId = null;
        }
        emit(update(pointerEvent));
      };

      // Capture, so a component reads the pointer even when something down
      // the tree stops the event from propagating.
      for (const type of EVENTS) {
        document.addEventListener(type, onPointer, { passive: true, capture: true });
      }

      return () => {
        for (const type of EVENTS) {
          document.removeEventListener(type, onPointer, { capture: true });
        }
        // The service outlives every subscriber — it is a module-level
        // singleton — so holding the last event pinned its `target` and the
        // detached subtree above it for the life of the page.
        props.event = null;
      };
    },
  });
}

let service: Service<PointerProps> | undefined;

/**
 * Use the pointer service.
 *
 * ```js
 * const unsubscribe = usePointer().subscribe(({ progressX, isDown }) => {
 *   el.style.setProperty('--x', String(progressX));
 * });
 * ```
 *
 * Coordinates are always relative to the viewport. v3 accepted a target
 * element to translate them against; a component that needs element-relative
 * values subtracts its own box, which it has to measure anyway.
 */
export function usePointer(): Service<PointerProps> {
  service ??= createPointerService();
  return service;
}

/** The method `withPointer()` subscribes for the component. */
export interface PointerHook {
  moved?(props: PointerProps): void;
}

export type PointerMixinOptions = ServiceMixinOptions<void>;

/**
 * Subscribe a component's `moved()` method to the pointer service, for its
 * whole mount cycle:
 *
 * ```js
 * class Cursor extends withPointer(Base) {
 *   moved({ progressX }) {
 *     this.$el.style.setProperty('--x', String(progressX));
 *   }
 * }
 * ```
 *
 * The pointer is read from the window, like VueUse's `usePointer()` and
 * solid-primitives' `createMousePosition()`, so there is nothing to target.
 * The decorator form `@withPointer()` is the same thing with a build step.
 */
export const withPointer = /* @__PURE__ */ createServiceMixin<PointerHook, void>({
  hook: 'moved',
  target: () => undefined,
  use: () => usePointer(),
});
