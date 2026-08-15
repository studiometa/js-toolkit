import {
  clampDampFactor,
  DEFAULT_DAMP_FACTOR,
  inertiaDecay,
  inertiaFinalValue,
  inertiaStep,
  INERTIA_FRAME,
} from '../utils/maths.js';
import { defaultScheduler, type TickProps } from '../scheduler.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

/** Anything that can be grabbed: an HTML element, or an SVG one. */
export type DragTarget = HTMLElement | SVGElement;

/** Drag lifecycle modes: `idle → start → drag → drop → inertia → stop → idle`. */
export const DRAG_MODES = {
  IDLE: 'idle',
  START: 'start',
  DRAG: 'drag',
  DROP: 'drop',
  INERTIA: 'inertia',
  STOP: 'stop',
} as const;

/** One of {@link DRAG_MODES}. */
export type DragMode = (typeof DRAG_MODES)[keyof typeof DRAG_MODES];

/** Drag state for both viewport axes. */
export interface DragProps {
  readonly mode: DragMode;
  /** Current position in the viewport. */
  readonly x: number;
  readonly y: number;
  /** Movement since the previous update. */
  readonly deltaX: number;
  readonly deltaY: number;
  /** Where the drag started. */
  readonly originX: number;
  readonly originY: number;
  /** Distance from the origin to the current position. */
  readonly distanceX: number;
  readonly distanceY: number;
  /** Position the inertia is heading to. */
  readonly finalX: number;
  readonly finalY: number;
}

/**
 * Bounds on the interval between two velocity samples, in milliseconds, and
 * the weight the newest sample carries in the average.
 *
 * The floor is half a reference frame: anything faster is coalesced moves or a
 * synthetic event sharing a millisecond with the last, and dividing by it
 * reports a speed nothing physical reached. The ceiling is where two samples
 * stop describing one continuous movement.
 */
const MIN_SAMPLE = INERTIA_FRAME / 2;
const MAX_SAMPLE = 100;
const VELOCITY_SMOOTHING = 0.35;

export interface DragOptions {
  /** Which movement the drag owns. Defaults to `both`. */
  axis?: 'x' | 'y' | 'both';
  /** How fast the inertia decays, from `0` (none) to `1` (endless). */
  dampFactor?: number;
  /** Movement past which a drag stops counting as a click, in pixels. */
  dragThreshold?: number;
  /** Whether to coast after `drop`. Defaults to `true`. */
  inertia?: boolean;
}

type OwnedTouchAction = 'none' | 'pan-x' | 'pan-y';

interface TouchActionOwnership {
  readonly previous: string;
  readonly requests: Map<OwnedTouchAction, number>;
}

/**
 * Every option set gets its own service, but several of them can observe one
 * target at once. Their touch-action claims therefore share one owner: one
 * service leaving must not restore the target while another still needs it.
 */
const touchActionOwnership = /* @__PURE__ */ getSharedRuntimeSlot(
  'service:drag:touch-action-ownership',
  1,
  () => new WeakMap<DragTarget, TouchActionOwnership>(),
);

function applyTouchAction(target: DragTarget, ownership: TouchActionOwnership): void {
  if (
    ownership.requests.has('none') ||
    (ownership.requests.has('pan-x') && ownership.requests.has('pan-y'))
  ) {
    target.style.touchAction = 'none';
  } else if (ownership.requests.has('pan-x')) {
    target.style.touchAction = 'pan-x';
  } else {
    target.style.touchAction = 'pan-y';
  }
}

/** Claim the native pan directions left free by one drag axis. */
function claimTouchAction(target: DragTarget, touchAction: OwnedTouchAction): () => void {
  let ownership = touchActionOwnership.get(target);
  if (!ownership) {
    // Do not override consumer touch-action CSS.
    if (getComputedStyle(target).touchAction !== 'auto') {
      return () => {};
    }
    ownership = {
      previous: target.style.touchAction,
      requests: new Map(),
    };
    touchActionOwnership.set(target, ownership);
  }

  ownership.requests.set(touchAction, (ownership.requests.get(touchAction) ?? 0) + 1);
  applyTouchAction(target, ownership);

  let isActive = true;
  return () => {
    if (!isActive) {
      return;
    }
    isActive = false;
    const count = ownership.requests.get(touchAction) ?? 0;
    if (count > 1) {
      ownership.requests.set(touchAction, count - 1);
    } else {
      ownership.requests.delete(touchAction);
    }
    if (ownership.requests.size > 0) {
      applyTouchAction(target, ownership);
      return;
    }
    target.style.touchAction = ownership.previous;
    touchActionOwnership.delete(target);
  };
}

function createDragService(target: DragTarget, options: DragOptions): Service<DragProps> {
  // Normalize values shared by projection and per-tick decay.
  const axis = options.axis === 'x' || options.axis === 'y' ? options.axis : 'both';
  const dampFactor = clampDampFactor(options.dampFactor ?? DEFAULT_DAMP_FACTOR);
  const dragThreshold = options.dragThreshold ?? 10;
  const hasInertia = options.inertia ?? true;
  const movesX = axis !== 'y';
  const movesY = axis !== 'x';
  const touchAction = axis === 'x' ? 'pan-y' : axis === 'y' ? 'pan-x' : 'none';

  const props: MutableProps<DragProps> = {
    mode: DRAG_MODES.IDLE,
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    originX: 0,
    originY: 0,
    distanceX: 0,
    distanceY: 0,
    finalX: 0,
    finalY: 0,
  };

  return createService<DragProps>({
    props: () => props,
    // `idle` is not an observed gesture value.
    hasProps: () => props.mode !== DRAG_MODES.IDLE,
    start(emit) {
      /** Publishing can synchronously release the last subscriber and stop this run. */
      let isRunning = true;
      let unsubscribeTicks: (() => void) | null = null;
      /** Suppress only the trusted click synthesized for the current drag. */
      let isClickSuppressed = false;

      /**
       * The velocity the coast is driven by, in pixels per millisecond.
       *
       * Kept beside the props rather than in them: `deltaX`/`deltaY` are what
       * the last update moved, which is a different quantity and the one a
       * subscriber asked for.
       */
      let velocityX = 0;
      let velocityY = 0;
      /**
       * When the velocity was last measured, on the same clock the events
       * carry. `0` means no sample yet.
       */
      let velocityTime = 0;

      /** Held by the pointer: the two modes a gesture is alive in. */
      const isGrabbing = () => props.mode === DRAG_MODES.START || props.mode === DRAG_MODES.DRAG;

      // Claim required touch axes and restore the previous inline value after the final claim.
      const releaseTouchAction = claimTouchAction(target, touchAction);

      function stopInertia() {
        unsubscribeTicks?.();
        unsubscribeTicks = null;
      }

      function stop() {
        stopInertia();
        // Snap to the invariant projected destination.
        props.x = props.finalX;
        props.y = props.finalY;
        props.deltaX = 0;
        props.deltaY = 0;
        props.distanceX = props.x - props.originX;
        props.distanceY = props.y - props.originY;
        props.mode = DRAG_MODES.STOP;
        emit(props);
        // `stop` is announced once; `idle` is what the props rest on.
        props.mode = DRAG_MODES.IDLE;
      }

      /** Measure smoothed velocity per millisecond with a bounded sample interval. */
      function measureVelocity(timeStamp: number, deltaX: number, deltaY: number) {
        const elapsed = velocityTime === 0 ? INERTIA_FRAME : timeStamp - velocityTime;
        const interval = Math.min(Math.max(elapsed, MIN_SAMPLE), MAX_SAMPLE);
        velocityTime = timeStamp;
        const sampleX = deltaX / interval;
        const sampleY = deltaY / interval;
        velocityX = velocityX * (1 - VELOCITY_SMOOTHING) + sampleX * VELOCITY_SMOOTHING;
        velocityY = velocityY * (1 - VELOCITY_SMOOTHING) + sampleY * VELOCITY_SMOOTHING;
      }

      // Integrate inertia from elapsed frame time, not frame count.
      function tick({ delta }: TickProps) {
        const stepX = inertiaStep(velocityX, dampFactor, delta);
        const stepY = inertiaStep(velocityY, dampFactor, delta);
        const decay = inertiaDecay(dampFactor, delta);

        props.x += stepX;
        props.y += stepY;
        props.deltaX = stepX;
        props.deltaY = stepY;
        props.distanceX = props.x - props.originX;
        props.distanceY = props.y - props.originY;
        velocityX *= decay;
        velocityY *= decay;
        props.mode = DRAG_MODES.INERTIA;
        emit(props);

        // Stop by remaining distance, not the last step size.
        const remaining = Math.max(
          Math.abs(props.finalX - props.x),
          Math.abs(props.finalY - props.y),
        );
        if (isRunning && remaining < 0.1) {
          stop();
        }
      }

      function startDrag(x: number, y: number) {
        if (isGrabbing()) {
          return;
        }
        stopInertia();
        props.x = props.originX = props.finalX = x;
        props.y = props.originY = props.finalY = y;
        props.deltaX = props.deltaY = 0;
        props.distanceX = props.distanceY = 0;
        velocityX = velocityY = 0;
        velocityTime = 0;
        props.mode = DRAG_MODES.START;
        emit(props);
        if (!isRunning) {
          return;
        }
        document.addEventListener('pointermove', onPointerMove, { passive: true });
      }

      function drag(event: PointerEvent) {
        const x = movesX ? event.clientX : props.x;
        const y = movesY ? event.clientY : props.y;
        props.deltaX = x - props.x;
        props.deltaY = y - props.y;
        measureVelocity(event.timeStamp, props.deltaX, props.deltaY);
        props.x = props.finalX = x;
        props.y = props.finalY = y;
        props.distanceX = props.x - props.originX;
        props.distanceY = props.y - props.originY;
        props.mode = DRAG_MODES.DRAG;
        if (
          Math.abs(props.distanceX) > dragThreshold ||
          Math.abs(props.distanceY) > dragThreshold
        ) {
          isClickSuppressed = true;
        }
        emit(props);
      }

      /** Use the ending event timestamp so velocity and idle time use one clock. */
      function drop(timeStamp: number) {
        if (!isGrabbing()) {
          return;
        }
        document.removeEventListener('pointermove', onPointerMove);
        props.mode = DRAG_MODES.DROP;
        // Decay velocity over the idle interval before projection.
        const idle = velocityTime === 0 ? 0 : timeStamp - velocityTime;
        const idleDecay = inertiaDecay(dampFactor, idle);
        velocityX *= idleDecay;
        velocityY *= idleDecay;
        props.finalX = inertiaFinalValue(props.x, velocityX, dampFactor);
        props.finalY = inertiaFinalValue(props.y, velocityY, dampFactor);
        emit(props);
        // `emit()` can release the final subscriber before inertia starts.
        if (!isRunning) {
          return;
        }
        // Without inertia, finish synchronously through the same stop contract.
        if (!hasInertia) {
          stop();
          return;
        }
        unsubscribeTicks = defaultScheduler.tick(tick);
      }

      function onPointerMove(event: Event) {
        const pointerEvent = event as PointerEvent;
        // End when the pointer no longer reports the primary button.
        if (pointerEvent.buttons === 1) {
          drag(pointerEvent);
        } else {
          drop(pointerEvent.timeStamp);
        }
      }

      function onPointerDown(event: Event) {
        const pointerEvent = event as PointerEvent;
        if (pointerEvent.button === 0) {
          isClickSuppressed = false;
          startDrag(pointerEvent.clientX, pointerEvent.clientY);
        }
      }

      function onDragStart(event: Event) {
        // The native drag-and-drop gesture would steal the pointer.
        event.preventDefault();
      }

      function onClick(event: Event) {
        // Keep programmatic clicks and keyboard activation; suppress only a trusted pointer click.
        if (!isClickSuppressed || !event.isTrusted || (event as MouseEvent).detail === 0) {
          return;
        }
        // Stop activation before descendant handlers run.
        event.stopImmediatePropagation();
        event.preventDefault();
      }

      function onPointerUp(event: Event) {
        drop(event.timeStamp);
      }

      target.addEventListener('pointerdown', onPointerDown, { passive: true });
      target.addEventListener('dragstart', onDragStart, { capture: true });
      target.addEventListener('click', onClick, { capture: true });
      // Window listeners end a drag released outside the target.
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });

      return () => {
        isRunning = false;
        isClickSuppressed = false;
        releaseTouchAction();
        stopInertia();
        // Reset the gesture when the final subscriber leaves.
        props.mode = DRAG_MODES.IDLE;
        document.removeEventListener('pointermove', onPointerMove);
        target.removeEventListener('pointerdown', onPointerDown);
        target.removeEventListener('dragstart', onDragStart, { capture: true });
        target.removeEventListener('click', onClick, { capture: true });
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };
    },
  });
}

const dragServices = /* @__PURE__ */ getSharedRuntimeSlot('service:drag', 1, () =>
  perTarget(createDragService),
);

/** Use one shared drag service per target and option set. */
export function useDrag(target: DragTarget, options: DragOptions = {}): Service<DragProps> {
  return dragServices(target, options);
}

/** The method `withDrag()` subscribes for the component. */
export interface DragHook {
  dragged?(props: DragProps): void;
}

export type DragMixinOptions = DragOptions & ServiceMixinOptions<DragTarget>;

/** Subscribe `dragged()` to the drag service for each mount cycle. The root element is the default target. */
export const withDrag = /* @__PURE__ */ createServiceMixin<
  DragHook & ServiceHandles<'dragged'>,
  DragTarget,
  DragOptions
>({
  hook: 'dragged',
  target: (instance) => instance.$el,
  use: (target, options) => useDrag(target, options),
});
