import type { Unsubscribe } from '../../src/index.js';
import { throttle } from '../utils/throttle.js';
import { useInView } from '../utils/inView.js';
import type { AbstractTrack } from './AbstractTrack.js';

export type Modifier =
  | 'prevent'
  | 'stop'
  | 'once'
  | 'passive'
  | 'capture'
  | 'debounce'
  | 'throttle'
  | 'detail';

export interface ParsedEvent {
  event: string;
  modifiers: Modifier[];
  debounceDelay: number;
  throttleDelay: number;
}

/**
 * The synthetic event names, which name no DOM event.
 *
 * A frozen object rather than a union, per DESIGN.md §8's rule for closed sets
 * of strings: the audience writes plain JavaScript with no build step, and a
 * literal union gives them no completion and no typo protection.
 */
export const TRACK_PSEUDO_EVENTS = {
  /** Fires once the component and its context have settled. */
  MOUNTED: 'mounted',
  /** Fires when the element enters the viewport. */
  VIEW: 'view',
} as const;

export type TrackPseudoEvent = (typeof TRACK_PSEUDO_EVENTS)[keyof typeof TRACK_PSEUDO_EVENTS];

/**
 * Parse an event definition string into its components.
 *
 * Ported verbatim. `click.prevent.stop`, `input.debounce500`,
 * `scroll.throttle200`.
 */
export function parseEventDefinition(eventDefinition: string): ParsedEvent {
  const [event, ...rawModifiers] = eventDefinition.split('.');

  let debounceDelay = 0;
  let throttleDelay = 0;
  const modifiers: Modifier[] = [];

  for (const mod of rawModifiers) {
    if (mod.startsWith('debounce')) {
      modifiers.push('debounce');
      debounceDelay = Number.parseInt(mod.replace('debounce', '') || '300', 10);
    } else if (mod.startsWith('throttle')) {
      modifiers.push('throttle');
      throttleDelay = Number.parseInt(mod.replace('throttle', '') || '16', 10);
    } else {
      modifiers.push(mod as Modifier);
    }
  }

  return { event, modifiers, debounceDelay, throttleDelay };
}

/**
 * Resolve `$detail.*` placeholders in an arbitrary value, descending into both
 * objects and arrays so placeholders nested inside arrays (GA4's
 * `ecommerce.items`) are resolved too. Ported verbatim.
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

/**
 * One `data-track:<event>` declaration, bound.
 *
 * Port of `@studiometa/ui` 1.10's `TrackEvent`. The parsing half is verbatim;
 * the binding half was restructured around **one `attach()` that returns its
 * own release**, which is the v4 idiom and what lets `AbstractTrack` hold its
 * bindings in a map and replace one of them (see `AbstractTrack`'s live
 * rebinding).
 *
 * | change | forced by |
 * | --- | --- |
 * | `attachEvent()` / `attachViewEvent()` / `detachEvent()` → one `attach()` returning a release | the v4 idiom. It also removes the `detached` flag: v3 needed a guard because a queued dispatch could outlive the detach, and here the release *is* the guard — it clears the closure's own `isAttached`. |
 * | `addEventListener` on `track.$el` → `track.$on(type, listener, options)` | `$on` returns its own removal, and it takes the full `AddEventListenerOptions`. **The delegated `on<Event>` path could not have been used**: the event type is read from an attribute at runtime, and `on<Event>` is a compile-time method name — the same structural limit §6a found for `Action`. `on<Event>` also cannot express `once` or `passive`, and this family uses both. |
 * | `new IntersectionObserver(...)` for `view` → `useInView(el, { threshold })` | see `migration/utils/inView.ts`. v4 ships no intersection service, so the port writes one on `createService()`; two `data-track:view` declarations on one element then share one observer instead of building two. |
 * | `removeEventListener(type, handler, { capture })` matching the registration by hand | gone. `$on`'s release closes over the options it registered with, so the `capture` flag cannot drift — v3's comment warning that it must match is a comment about a bug class v4 removed. |
 *
 * What did **not** change: the `prevent`/`stop`/`once`/`passive`/`capture`
 * modifiers, the debounce/throttle wrapping, `$detail.*` resolution, the
 * `.detail` merge, and the rule that a non-object `CustomEvent` detail is
 * treated as empty rather than leaking a literal `"$detail.x"` into an
 * analytics payload.
 */
export class TrackEvent {
  track: AbstractTrack;
  event: string;
  modifiers: Modifier[];
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

    const { event, modifiers, debounceDelay, throttleDelay } =
      parseEventDefinition(eventDefinition);
    this.event = event;
    this.modifiers = modifiers;
    this.debounceDelay = debounceDelay;
    this.throttleDelay = throttleDelay;

    // The debounce timer is owned here rather than taken from a `debounce`
    // helper, because it has to be cancellable: a pending dispatch that
    // survived a destroy would fire into a later mount cycle. `throttle`
    // schedules nothing, so it needs no cancellation.
    const dispatch = (domEvent?: Event) => this.handleEvent(domEvent);

    if (modifiers.includes('debounce')) {
      this.#handler = (domEvent?: Event) => {
        clearTimeout(this.#debounceTimer);
        this.#debounceTimer = setTimeout(() => dispatch(domEvent), debounceDelay);
      };
    } else if (modifiers.includes('throttle')) {
      this.#handler = throttle(dispatch, throttleDelay);
    } else {
      this.#handler = dispatch;
    }
  }

  /**
   * Resolve the payload for this event and hand it to the component.
   */
  handleEvent(event?: Event): void {
    const { modifiers, data, track } = this;

    // A debounced dispatch, a throttled one, or an intersection notification
    // already queued when the release ran: never dispatch from a detached
    // binding.
    if (!this.#isAttached) {
      return;
    }

    if (event && modifiers.includes('prevent')) {
      event.preventDefault();
    }

    if (event && modifiers.includes('stop')) {
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

      finalData = modifiers.includes('detail')
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

  /**
   * Bind this declaration, returning its release.
   *
   * Three kinds of source, one signature — which is what lets the component
   * treat "removed, changed, added" as one operation.
   */
  attach(): Unsubscribe {
    this.#isAttached = true;
    const release = this.#bind();

    return () => {
      this.#isAttached = false;
      // Cancel a pending debounced dispatch so it cannot resurface in a later
      // mount cycle, where the guard above has been reset.
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
        ({ isIntersecting }) => {
          if (!isIntersecting) {
            return;
          }
          // `isIntersecting` and not `ratio >= threshold`: the observer's own
          // threshold already controls sensitivity, and comparing ratios would
          // make an impression unreachable for an element taller than the
          // viewport, whose ratio can never approach a non-zero threshold.
          this.#handler();
          if (modifiers.includes('once')) {
            // Released from inside its own delivery. Safe here — the service
            // fans out over a snapshot and skips released subscriptions — but
            // the binding has to be hoisted, because the callback can run
            // *during* `subscribe()` and the name is not assigned yet.
            unsubscribe?.();
            unsubscribe = undefined;
          }
        },
      );
      return () => unsubscribe?.();
    }

    return track.$on(event, this.#handler as EventListener, {
      capture: modifiers.includes('capture'),
      once: modifiers.includes('once'),
      passive: modifiers.includes('passive'),
    });
  }
}
