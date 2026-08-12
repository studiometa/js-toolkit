import { createService, type Service } from './service.js';

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
  name: string;
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
 * The widest matching name. The set is ascending, so the last match wins.
 */
function currentBreakpoint(): string {
  let match = '';
  for (const [name, query] of queryList()) {
    if (query.matches) {
      match = name;
    }
  }
  return match;
}

function createBreakpointService(): Service<BreakpointProps> {
  const props: BreakpointProps = { name: '' };

  return createService<BreakpointProps>({
    // Answered honestly without subscribing, unlike the sampled sources: the
    // `MediaQueryList` objects are built once and asking them is a read.
    props: () => {
      props.name = currentBreakpoint();
      return props;
    },
    start(emit) {
      const publishIfCrossed = () => {
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
 * const unsubscribe = useBreakpoint().add(({ name }) => {
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
