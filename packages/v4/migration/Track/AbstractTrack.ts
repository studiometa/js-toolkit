import {
  Base,
  defaultScheduler,
  type BaseConfig,
  type BaseProps,
  type MountedReturn,
  type ScheduledTask,
  type Unsubscribe,
} from '../../src/index.js';
import { deepmerge, deepmergeAll } from '../utils/deepmerge.js';
import { TrackContext } from './TrackContext.js';
import { TRACK_PSEUDO_EVENTS, TrackEvent } from './TrackEvent.js';
import { warn } from './utils.js';

/** The attribute prefix one `TrackEvent` is declared by. */
const TRACK_ATTRIBUTE_PREFIX = 'data-track:';

export type AbstractTrackProps = BaseProps & {
  $refs: {
    payload?: HTMLScriptElement;
  };
  $options: {
    threshold: number;
    payload: Record<string, unknown>;
  };
};

/**
 * Parse the value of a `data-track:<event>` attribute. Ported verbatim.
 *
 * - empty carries no data (the payload comes from the context, the `payload`
 *   ref and/or the `payload` option);
 * - a value starting with `{` is JSON, and may throw;
 * - anything else is a bare token used as the event name, so
 *   `data-track:click="add_to_cart"` means `{ "event": "add_to_cart" }`.
 */
function parseEventValue(value: string): Record<string, unknown> {
  const trimmed = value.trim();

  if (!trimmed) {
    return {};
  }

  if (!trimmed.startsWith('{')) {
    return { event: trimmed };
  }

  return (JSON.parse(trimmed) as Record<string, unknown> | null) ?? {};
}

/**
 * AbstractTrack — the core of the declarative analytics components.
 *
 * Port of `@studiometa/ui` 1.10's `AbstractTrack`. It parses the
 * `data-track:*` attributes into {@link TrackEvent}s, resolves the context
 * provided by ancestor {@link TrackContext}s, merges every payload layer and
 * hands the result to the `dispatch()` seam that concrete components override.
 *
 * | change | forced by |
 * | --- | --- |
 * | `interface AbstractTrackProps extends BaseProps` → a type alias | REPORT.md gap 14, hit for the third time — and for the predicted reason, since this option set is named to be shared with three subclasses. |
 * | `class AbstractTrack<T extends BaseProps = BaseProps> extends Base<AbstractTrackProps & T>` | **kept.** REPORT.md gap 22 is closed, and this family is the second consumer of the fix: three of the four classes here are generic in their props exactly the way `Action` was, and the class bodies read their own options. |
 * | `this.$warn(...)` → a local `warn()` | REPORT.md gap 10. Six call sites in this family. |
 * | `memo(() => …)` for the payload and the context → two per-mount-cycle fields | **a v4 move is a destroy plus a mount of the same instance.** v3 memoised for the instance's whole life, so a `Track` moved under a different `TrackContext` — which `swap()` does routinely — kept publishing the old section's context forever. Per cycle is both cheaper to express (no `memo` util, which v4 does not ship) and correct. Same finding as `Action`'s `__actionEvents` memo (§6a). |
 * | `deepmerge` (the npm package) + an `arrayMerge` strategy → `migration/utils/deepmerge.ts` | a runtime dependency for one merge shape. 40 lines, with "arrays replace" as the only behaviour rather than as an option. |
 * | `nextFrame(() => …)` around the `mounted` dispatch → `defaultScheduler.background(…)` | see below. |
 * | `mounted()` + `destroyed()` attaching and detaching → keyed bindings released by the `mounted()` cleanup | the v4 idiom, and the shape `Action` arrived at for the same reason: it is what makes rebinding one attribute possible. |
 *
 * ## The `mounted` pseudo-event, and why the deferral got stronger
 *
 * `data-track:mounted` must dispatch with the *resolved* context, and its
 * ancestor `TrackContext` may mount after it — v4 guarantees no mount
 * ordering, and `$closest()` only answers for a mounted ancestor. v3 deferred
 * with `nextFrame()`, a hope that one frame was enough.
 *
 * `defaultScheduler.background()` is a stronger guarantee, and for the reason
 * §5d recorded for `Data*`: it is the **same lane eager mounts queue on**, so
 * "after everything in this batch has mounted" stops being a hope. The task
 * handle is held and cancelled by the `mounted()` cleanup, so a component
 * destroyed inside the same batch — an SPA route change — never dispatches.
 *
 * ## Live rebinding, inherited from `Action`
 *
 * `data-track:<event>` is a *virtual* option: named by this component, not by
 * the framework, so no page-wide `attributeFilter` can enumerate it. That is
 * exactly what `$watchAttributes()` (REPORT.md gap 21) was built for, and
 * consuming it here costs **nine lines and no restructuring**, because the
 * keyed-bindings shape `Action` had to introduce is the shape this port
 * already needed for its three kinds of source. A `data-track:click` rewritten
 * by a morph, a template or a script now takes effect on the same element in
 * the same mount cycle; v3 keeps the old binding until the element is
 * re-inserted.
 */
export class AbstractTrack<T extends BaseProps = BaseProps> extends Base<AbstractTrackProps & T> {
  static config: BaseConfig = {
    name: 'AbstractTrack',
    refs: ['payload'],
    options: {
      threshold: {
        type: Number,
        default: 0,
      },
      payload: {
        type: Object,
        // A factory, not `{}`. REPORT.md gap 8: `buildOptions()` hands the
        // `default` back as it is, so a literal would be *the same object* for
        // every `Track` on the page.
        default: () => ({}),
      },
    },
  };

  /** Live bindings by the attribute that produced them, each holding its release. */
  #bindings = new Map<string, Unsubscribe>();

  /** The deferred `mounted` dispatches, cancelled if the cycle ends first. */
  #deferred = new Set<ScheduledTask<unknown>>();

  /** Resolved once per mount cycle — see the class comment. */
  #payload: Record<string, unknown> | null = null;

  #context: Record<string, unknown> | null = null;

  /**
   * Every `data-track:*` declaration on the element, parsed fresh.
   *
   * Fresh rather than memoised, so this describes the element as it is now.
   */
  get trackEvents(): TrackEvent[] {
    const trackEvents: TrackEvent[] = [];

    for (const { name, value } of Array.from(this.$el.attributes)) {
      const trackEvent = this.#parseAttribute(name, value);
      if (trackEvent) {
        trackEvents.push(trackEvent);
      }
    }

    return trackEvents;
  }

  /**
   * The base payload from the optional `payload` ref, a
   * `<script data-ref="payload" type="application/json">` element.
   */
  get scriptPayload(): Record<string, unknown> {
    const script = this.$refs.payload;

    if (!script) {
      return {};
    }

    try {
      return (JSON.parse(script.textContent || '{}') as Record<string, unknown> | null) ?? {};
    } catch (error) {
      warn('Invalid JSON in the `payload` ref:', error);
      return {};
    }
  }

  /**
   * The base payload from the optional `data-option-payload` attribute.
   */
  get optionPayload(): Record<string, unknown> {
    try {
      // The option is parsed with `JSON.parse` on access and throws uncaught
      // on a malformed value, in v4 as in v3.
      return this.$options.payload ?? {};
    } catch (error) {
      warn('Invalid JSON in the `payload` option:', error);
      return {};
    }
  }

  /**
   * The component's own payload, shared by every event on the element. The
   * option overrides the ref, mirroring `TrackContext`.
   */
  get payload(): Record<string, unknown> {
    this.#payload ??= deepmerge(this.scriptPayload, this.optionPayload);
    return this.#payload;
  }

  /**
   * The merged context of the ancestor chain.
   *
   * The nearest `TrackContext` already exposes the whole chain merged through
   * its own recursive getter, so reading it here is enough.
   */
  get context(): Record<string, unknown> {
    this.#context ??= this.$closest<TrackContext>('TrackContext')?.context ?? {};
    return this.#context;
  }

  /**
   * Merge every layer and hand the result to the dispatch seam.
   *
   * Lowest to highest: the ancestor context chain, this component's payload,
   * then the event's own data.
   */
  send(data: Record<string, unknown>, event?: Event): void {
    this.dispatch(deepmergeAll([this.context, this.payload ?? {}, data ?? {}]), event);
  }

  /**
   * The dispatch seam. A no-op here; concrete components override it.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatch(payload: Record<string, unknown>, event?: Event): void {}

  mounted(): MountedReturn {
    for (const { name, value } of Array.from(this.$el.attributes)) {
      this.#bind(name, this.#parseAttribute(name, value));
    }

    // Destroy-scoped by itself, so the returned unsubscribe is dropped.
    this.$watchAttributes(({ name, value }) => {
      if (name.startsWith(TRACK_ATTRIBUTE_PREFIX)) {
        this.#bind(name, this.#parseAttribute(name, value));
      }
    });

    return () => {
      for (const release of this.#bindings.values()) {
        release();
      }
      this.#bindings.clear();
      for (const task of this.#deferred) {
        task.cancel();
      }
      this.#deferred.clear();
      this.#payload = null;
      this.#context = null;
    };
  }

  /** One `data-track:<event>` attribute, or `null` for anything else. */
  #parseAttribute(name: string, value: string | null): TrackEvent | null {
    if (!name.startsWith(TRACK_ATTRIBUTE_PREFIX) || value === null) {
      return null;
    }

    try {
      return new TrackEvent(
        this,
        name.slice(TRACK_ATTRIBUTE_PREFIX.length),
        parseEventValue(value),
      );
    } catch (error) {
      warn(`Invalid JSON in ${name}:`, error);
      return null;
    }
  }

  /**
   * Make `key` hold exactly `trackEvent` — the one place "removed, changed,
   * added" is decided.
   */
  #bind(key: string, trackEvent: TrackEvent | null): void {
    this.#bindings.get(key)?.();
    this.#bindings.delete(key);

    if (!trackEvent) {
      return;
    }

    this.#bindings.set(key, trackEvent.attach());

    if (trackEvent.event === TRACK_PSEUDO_EVENTS.MOUNTED) {
      // The background lane is where eager mounts queue, so an ancestor
      // `TrackContext` mounting in the same batch has been mounted by the time
      // this runs — and the handle is cancelled if this cycle ends first.
      const task = defaultScheduler.background(() => {
        this.#deferred.delete(task);
        if (this.$isMounted) {
          trackEvent.trigger();
        }
      });
      this.#deferred.add(task);
    }
  }
}
