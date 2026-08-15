import { memo } from '../utils/memo.js';
import { createService, type MutableProps, type Service } from './service.js';

/**
 * Named viewport widths, ascending. Values are the ones v3 ships. They are
 * the default set, not the only one: `setBreakpoints()` replaces them.
 *
 * They are `rem` values, and in a **media query** `rem` resolves against the
 * *initial* font size rather than the root element's own. So the reader's
 * browser font-size preference moves every breakpoint, and
 * `html { font-size: 62.5% }` moves none of them — verified at a viewport of
 * 414 px, where `xs` (30rem) matched neither at a root of `10px` nor at
 * `32px`.
 */
export const BREAKPOINTS: Readonly<Record<string, string>> = {
  xxs: '0rem',
  xs: '30rem',
  s: '48rem',
  m: '64rem',
  l: '80rem',
  xl: '90rem',
  xxl: '120rem',
  xxxl: '160rem',
};

export interface BreakpointProps {
  /**
   * Name of the widest breakpoint the viewport currently matches, `''` when
   * the set has no breakpoint the viewport reaches.
   */
  readonly name: string;
}

let breakpoints: Record<string, string> = { ...BREAKPOINTS };

/**
 * Built on first use and kept — constructing a `MediaQueryList` per
 * breakpoint on every update measured 5.2× the cost of querying lists made
 * once (`service.bench.ts`). Dropped when the set changes.
 */
let queries: Array<readonly [string, MediaQueryList]> | null = null;

/** Set by the running service, so a replaced set can re-emit immediately. */
let refresh: (() => void) | null = null;

/**
 * The names, narrowest first — the order the set declares.
 *
 * Cached rather than taken from `getBreakpoints()`, which copies: a responsive
 * option walks this list on **every** `$options` access, so the copy would be
 * an allocation per read.
 */
let names: readonly string[] | null = null;

/**
 * Anything that caches something derived from the named set, re-derived when
 * `setBreakpoints()` replaces it.
 */
const replacementListeners = new Set<() => void>();

function queryList(): Array<readonly [string, MediaQueryList]> {
  queries ??= Object.entries(breakpoints).map(
    ([name, value]) => [name, window.matchMedia(`(min-width: ${value})`)] as const,
  );
  return queries;
}

/**
 * Replace the named breakpoints, ascending.
 *
 * ```js
 * setBreakpoints({ mobile: '0rem', tablet: '48rem', desktop: '80rem' });
 * ```
 *
 * A running service re-reads them at once and announces the new name, rather
 * than serving a stale one until something unrelated happens to resize.
 *
 * The design has `defineFeatures` carry these eventually; until it exists,
 * this is the whole configuration surface.
 */
export function setBreakpoints(next: Record<string, string>): void {
  breakpoints = { ...next };
  queries = null;
  names = null;
  // Replacing the set is a crossing that no `matchMedia` event announces, so
  // the resolved name is dropped here rather than at the next boundary — the
  // specs read an option straight after `setBreakpoints()`, in the same task.
  widestMatch.clear();
  // Caches first, then the emission: a subscriber told about the new name must
  // resolve against the new set, not against the one being replaced.
  for (const listener of replacementListeners) {
    listener();
  }
  refresh?.();
}

/**
 * The breakpoints in use, the defaults until `setBreakpoints()` says
 * otherwise.
 */
export function getBreakpoints(): Record<string, string> {
  return { ...breakpoints };
}

/**
 * The breakpoint names in use, narrowest first, without a copy.
 *
 * Not part of the package's surface — `getBreakpoints()` is what a consumer
 * reads. This is the ordering the responsive-option cascade walks, and it is
 * walked often enough that the copy matters.
 *
 * @internal
 */
export function breakpointNames(): readonly string[] {
  names ??= Object.keys(breakpoints);
  return names;
}

/**
 * Be told when `setBreakpoints()` replaces the set.
 *
 * Not part of the package's surface either, and deliberately not the service:
 * this fires for a **replacement of the named set**, which is a configuration
 * change, where the service fires for a **crossing**, which is a viewport
 * change. The responsive-option layer needs both, for different reasons — it
 * caches attribute names derived from the set, and it resolves values against
 * the current name — and a component only ever needs the second.
 *
 * @internal
 */
export function onBreakpointsReplaced(callback: () => void): () => void {
  replacementListeners.add(callback);
  return () => {
    replacementListeners.delete(callback);
  };
}

/**
 * The widest matching name. The set is ascending, so the last match wins.
 *
 * Annotated because a top-level call is retained by default, and retaining
 * this one retains `queryList()` and the service graph behind it — which is
 * what `./BREAKPOINTS` and `./getBreakpoints` pay for a name they never
 * compute. Measured: 0.38 → 0.11 kB and 0.38 → 0.13 kB gzip.
 */
const widestMatch = /* @__PURE__ */ memo((): string => {
  let match = '';
  for (const [name, query] of queryList()) {
    if (query.matches) {
      match = name;
    }
  }
  return match;
});

/** Whether a boundary invalidation is already armed for the current task. */
let invalidating = false;

/**
 * The widest matching name, computed at most once per task.
 *
 * Asking eight kept `MediaQueryList` objects for `.matches` measured **~5.1 µs**
 * and it is the whole of an option read now that every option is responsive —
 * 16.8× the plain `getAttribute()` it replaced (`responsive-options.bench.ts`).
 * A component reading three options in a scroll handler paid for 24 media
 * queries to learn one name that cannot have changed between the first and the
 * third.
 *
 * **Cannot have changed** is the whole argument, and it is why the invalidation
 * is a microtask boundary rather than a duration. A media query is re-evaluated
 * when the viewport changes, and that change is delivered as a *task*; script
 * runs to completion before one can be. So the active breakpoint is a constant
 * for the length of a task, and a cache dropped at the microtask checkpoint is
 * not an approximation of the truth — it is exactly as fresh as reading the
 * queries would have been, for the reads it serves.
 *
 * Two events cut it shorter, and both are stronger than the boundary:
 * `setBreakpoints()` replaces the named set synchronously, and a running
 * service's `change` handler knows a crossing happened. Both clear this, so
 * they share one cache with the cold path rather than keeping a second.
 *
 * The listener count is untouched, which is the property that mattered: this
 * opens nothing. `useBreakpoint().props()` stays honest cold, and
 * `responsive-options.spec.ts` still counts registrations on
 * `MediaQueryList.prototype` to prove it.
 */
function currentBreakpoint(): string {
  if (!invalidating) {
    invalidating = true;
    queueMicrotask(() => {
      invalidating = false;
      widestMatch.clear();
    });
  }
  return widestMatch();
}

function createBreakpointService(): Service<BreakpointProps> {
  const props: MutableProps<BreakpointProps> = { name: '' };

  return createService<BreakpointProps>({
    // Answered honestly without subscribing, unlike the sampled sources: the
    // `MediaQueryList` objects are built once and asking them is a read.
    props: () => {
      props.name = currentBreakpoint();
      return props;
    },
    start(emit) {
      const publishIfCrossed = () => {
        // A `change` event is the one signal that says a crossing *has*
        // happened, so it invalidates rather than waiting for the boundary.
        widestMatch.clear();
        const name = currentBreakpoint();
        if (name === props.name) {
          return;
        }
        props.name = name;
        emit(props);
      };

      const listen = () => {
        const listening = queryList();
        for (const [, query] of listening) {
          query.addEventListener('change', publishIfCrossed);
        }
        return () => {
          for (const [, query] of listening) {
            query.removeEventListener('change', publishIfCrossed);
          }
        };
      };

      props.name = currentBreakpoint();
      let unlisten = listen();
      refresh = () => {
        unlisten();
        unlisten = listen();
        publishIfCrossed();
      };

      return () => {
        unlisten();
        refresh = null;
      };
    },
  });
}

let service: Service<BreakpointProps> | undefined;

/**
 * Use the breakpoint service.
 *
 * ```js
 * const unsubscribe = useBreakpoint().subscribe(({ name }) => {
 *   el.hidden = name === 'xxs';
 * });
 * ```
 *
 * `matchMedia` change listeners, not a resize: this emits on **crossings**
 * rather than on every resize frame, and it is the only mechanism that
 * reports a change of the reader's font size — which `rem` breakpoints depend
 * on and no amount of watching boxes can see.
 *
 * A media query answers about the viewport, which is why this is a source of
 * its own rather than a field of `ResizeProps`: it says nothing about the
 * element a resize service happens to be observing.
 */
export function useBreakpoint(): Service<BreakpointProps> {
  service ??= createBreakpointService();
  return service;
}
