import { createService, type MutableProps, type Service } from './service.js';

export interface MediaQueryProps {
  /** Whether the query matches now. */
  readonly matches: boolean;
}

/**
 * What the reader asked the platform for when they turned animations down, in
 * their operating system rather than in the page.
 */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * One service per query. A `Map` rather than the `WeakMap` `perTarget()` uses,
 * because a query is a string: the keys are the query literals a codebase
 * contains, which is a bounded set that lives as long as the module does. The
 * services in it hold no listener while nobody subscribes, which is the cost
 * that would have mattered.
 */
const services = new Map<string, Service<MediaQueryProps>>();

function createMediaQueryService(query: string): Service<MediaQueryProps> {
  // Built once and kept, the same reason the breakpoint service keeps its
  // lists: constructing a `MediaQueryList` per update measured 5.2× the cost
  // of asking one that already exists (`service.bench.ts`).
  const list = window.matchMedia(query);
  const props: MutableProps<MediaQueryProps> = { matches: list.matches };

  return createService<MediaQueryProps>({
    // Honest without subscribing, like the breakpoint service and unlike the
    // sampled sources: asking a `MediaQueryList` is a read, not a measurement.
    // This is the whole answer for a caller that only needs to branch once —
    // `usePrefersReducedMotion().props().matches` needs no subscription.
    props: () => {
      props.matches = list.matches;
      return props;
    },
    start(emit) {
      const publish = () => {
        props.matches = list.matches;
        emit(props);
      };
      // `change` fires on a crossing and only on a crossing, so there is
      // nothing to gate and nothing to coalesce: the platform has already
      // decided the answer is different.
      list.addEventListener('change', publish);
      props.matches = list.matches;
      return () => list.removeEventListener('change', publish);
    },
  });
}

/**
 * Use a media query as a service.
 *
 * ```js
 * const unsubscribe = useMediaQuery('(orientation: portrait)').subscribe(
 *   ({ matches }) => el.classList.toggle('is-portrait', matches),
 *   { immediate: true },
 * );
 * ```
 *
 * The breakpoint service is `matchMedia` behind a named set of widths, and this
 * is the same engine with nothing named: any query the platform understands,
 * including the ones that answer about the reader rather than about the
 * viewport — `prefers-reduced-motion`, `prefers-color-scheme`, `pointer:
 * coarse`, `forced-colors`.
 *
 * One service per query string, so two components asking the same question
 * share one listener. Emissions are crossings: `change` fires when the answer
 * becomes different, never once per resize frame.
 */
export function useMediaQuery(query: string): Service<MediaQueryProps> {
  const key = query.trim();
  let service = services.get(key);
  if (!service) {
    service = createMediaQueryService(key);
    services.set(key, service);
  }
  return service;
}

/**
 * Whether the reader asked for less motion — `useMediaQuery()` on
 * `(prefers-reduced-motion: reduce)`, named because it is the query an
 * animation layer has to ask.
 *
 * ```js
 * // Once, at the top of a component:
 * if (usePrefersReducedMotion().props().matches) {
 *   this.$el.scrollIntoView();          // no smooth scroll, no inertia
 * }
 *
 * // Or followed, for something already running:
 * usePrefersReducedMotion().subscribe(({ matches }) => this.setDuration(matches ? 0 : 400));
 * ```
 *
 * A frame loop, a drag with inertia and a damped scroll animation are all
 * motion the reader may have asked not to see, and the toolkit had no way to
 * ask: this is an accessibility answer rather than a convenience. It is a
 * service like any other because the preference **changes while the page is
 * open** — the reader flips it in their system settings, and every consumer of
 * a one-shot boolean read at load time is then wrong for the rest of the
 * session.
 */
export function usePrefersReducedMotion(): Service<MediaQueryProps> {
  return useMediaQuery(REDUCED_MOTION);
}
