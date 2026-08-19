import { useInView } from '../../src/index.js';
import type { Unsubscribe } from '../../src/index.js';
import { throttle } from '../../src/utils/timing.js';
import { MODIFIERS, parseEventDefinition, type Modifier } from '../event-modifiers.js';
import type { AbstractTrack } from './AbstractTrack.js';

/** What a bare `debounce` means here. `Action` reads the same modifier at 100. */
const DEFAULT_DEBOUNCE_DELAY = 300;

/** What a bare `throttle` means: about one frame. */
const DEFAULT_THROTTLE_DELAY = 16;

/** Synthetic event names that do not map to DOM events. */
export const TRACK_PSEUDO_EVENTS = {
  /** Fires once the component and its context have settled. */
  MOUNTED: 'mounted',
  /** Fires when the element enters the viewport. */
  VIEW: 'view',
} as const;

export type TrackPseudoEvent = (typeof TRACK_PSEUDO_EVENTS)[keyof typeof TRACK_PSEUDO_EVENTS];

/**
 * Resolve `$detail.*` placeholders in an arbitrary value, descending into both
 * objects and arrays so nested payload placeholders are resolved too.
 */
function resolveDetailValue(value: unknown, detail: Record<string, unknown>): unknown {
  if (typeof value === 'string' && value.startsWith('$detail.')) {
    return getNestedValue(detail, value.slice(8));
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveDetailValue(item, detail));
  }

  if (value && typeof value === 'object') {
    return resolveDetailPlaceholders(value as Record<string, unknown>, detail);
  }

  return value;
}

export function resolveDetailPlaceholders(
  data: Record<string, unknown>,
  detail: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    result[key] = resolveDetailValue(value, detail);
  }

  return result;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/** One bound `data-track:<event>` declaration. */
export class TrackEvent {
  track: AbstractTrack;
  event: string;
  modifiers: ReadonlySet<Modifier>;
  data: Record<string, unknown>;
  debounceDelay: number;
  throttleDelay: number;

  /** The handler with its timing modifiers applied. */
  #handler: (event?: Event) => void;

  /** Cleared by the release, checked before every dispatch. */
  #isAttached = false;

  #debounceTimer?: ReturnType<typeof setTimeout>;

  constructor(track: AbstractTrack, eventDefinition: string, data: Record<string, unknown>) {
    this.track = track;
    this.data = data;

    const { event, modifiers, delay } = parseEventDefinition(eventDefinition);
    this.event = event;
    this.modifiers = modifiers;
    this.debounceDelay = delay(MODIFIERS.DEBOUNCE) ?? DEFAULT_DEBOUNCE_DELAY;
    this.throttleDelay = delay(MODIFIERS.THROTTLE) ?? DEFAULT_THROTTLE_DELAY;

    // Own the debounce timer so release can cancel it.
    const dispatch = (domEvent?: Event) => this.handleEvent(domEvent);

    if (modifiers.has(MODIFIERS.DEBOUNCE)) {
      this.#handler = (domEvent?: Event) => {
        clearTimeout(this.#debounceTimer);
        this.#debounceTimer = setTimeout(() => dispatch(domEvent), this.debounceDelay);
      };
    } else if (modifiers.has(MODIFIERS.THROTTLE)) {
      this.#handler = throttle(dispatch, this.throttleDelay);
    } else {
      this.#handler = dispatch;
    }
  }

  /**
   * Resolve the payload for this event and hand it to the component.
   */
  handleEvent(event?: Event): void {
    const { modifiers, data, track } = this;

    // Ignore work queued before the binding was released.
    if (!this.#isAttached) {
      return;
    }

    if (event && modifiers.has(MODIFIERS.PREVENT)) {
      event.preventDefault();
    }

    if (event && modifiers.has(MODIFIERS.STOP)) {
      event.stopPropagation();
    }

    // A non-object detail (0, false, '', …) is an empty detail, so placeholders
    // resolve to `undefined` instead of leaking the literal `$detail.*` string.
    let finalData = data;
    if (event instanceof CustomEvent) {
      const detail =
        event.detail && typeof event.detail === 'object'
          ? (event.detail as Record<string, unknown>)
          : {};

      finalData = modifiers.has(MODIFIERS.DETAIL)
        ? { ...data, ...detail }
        : resolveDetailPlaceholders(data, detail);
    }

    track.send(finalData, event);
  }

  /**
   * Trigger the handler with no DOM event, for the synthetic `mounted` event,
   * so the timing modifiers and the attached guard apply to it too.
   */
  trigger(): void {
    this.#handler();
  }

  /** Bind this declaration and return its release. */
  attach(): Unsubscribe {
    this.#isAttached = true;
    const release = this.#bind();

    return () => {
      this.#isAttached = false;
      clearTimeout(this.#debounceTimer);
      release();
    };
  }

  #bind(): Unsubscribe {
    const { event, modifiers, track } = this;

    if (event === TRACK_PSEUDO_EVENTS.MOUNTED) {
      // Nothing to bind: `AbstractTrack` triggers it once the DOM has settled.
      return () => {};
    }

    if (event === TRACK_PSEUDO_EVENTS.VIEW) {
      let unsubscribe: Unsubscribe | undefined;
      unsubscribe = useInView(track.$el, { threshold: track.$options.threshold }).subscribe(
        ({ isInView }) => {
          if (!isInView) {
            return;
          }
          // `isInView` and not `ratio >= threshold`: the observer's own
          // threshold already controls sensitivity, and comparing ratios would
          // make an impression unreachable for an element taller than the
          // viewport, whose ratio can never approach a non-zero threshold.
          this.#handler();
          if (modifiers.has(MODIFIERS.ONCE)) {
            // Hoisted because the callback can run during `subscribe()`.
            unsubscribe?.();
            unsubscribe = undefined;
          }
        },
      );
      return () => unsubscribe?.();
    }

    return track.$on(event, this.#handler, {
      capture: modifiers.has(MODIFIERS.CAPTURE),
      once: modifiers.has(MODIFIERS.ONCE),
      passive: modifiers.has(MODIFIERS.PASSIVE),
    });
  }
}
