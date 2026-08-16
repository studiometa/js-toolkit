import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { memo, type Memo } from '../utils/memo.js';
import { createService, type MutableProps, type Service } from './service.js';

/**
 * Default named viewport widths, ascending. Media-query `rem` uses the browser's initial font size, not the root element's computed size.
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

interface BreakpointRuntimeState {
  breakpoints: Record<string, string>;
  queries: Array<readonly [string, MediaQueryList]> | null;
  refresh: (() => void) | null;
  names: readonly string[] | null;
  replacementListeners: Set<() => void>;
  widestMatch: Memo<[], string>;
  invalidating: boolean;
  service: Service<BreakpointProps> | undefined;
}

const breakpointState = /* @__PURE__ */ getSharedRuntimeSlot<BreakpointRuntimeState>(
  'service:breakpoint',
  1,
  () => ({
    breakpoints: { ...BREAKPOINTS },
    queries: null,
    refresh: null,
    names: null,
    replacementListeners: new Set(),
    widestMatch: memo((): string => {
      let match = '';
      for (const [name, query] of queryList()) {
        if (query.matches) {
          match = name;
        }
      }
      return match;
    }),
    invalidating: false,
    service: undefined,
  }),
);
const { replacementListeners, widestMatch } = breakpointState;

/** Build media-query lists lazily and keep them until the set changes. */
function queryList(): Array<readonly [string, MediaQueryList]> {
  breakpointState.queries ??= Object.entries(breakpointState.breakpoints).map(
    ([name, value]) => [name, window.matchMedia(`(min-width: ${value})`)] as const,
  );
  return breakpointState.queries;
}

/** Replace the ascending named breakpoint set and refresh active subscribers. */
export function setBreakpoints(next: Record<string, string>): void {
  breakpointState.breakpoints = { ...next };
  breakpointState.queries = null;
  breakpointState.names = null;
  // A set replacement has no `matchMedia` event, so invalidate synchronously.
  widestMatch.clear();
  // Invalidate derived caches before notifying subscribers.
  for (const listener of replacementListeners) {
    listener();
  }
  breakpointState.refresh?.();
}

/** Return a copy of the active breakpoint set. */
export function getBreakpoints(): Record<string, string> {
  return { ...breakpointState.breakpoints };
}

/** Return breakpoint names from narrowest to widest without copying. @internal */
export function breakpointNames(): readonly string[] {
  breakpointState.names ??= Object.keys(breakpointState.breakpoints);
  return breakpointState.names;
}

/** Subscribe to breakpoint-set replacement, not viewport crossings. @internal */
export function onBreakpointsReplaced(callback: () => void): () => void {
  replacementListeners.add(callback);
  return () => {
    replacementListeners.delete(callback);
  };
}

/**
 * Return the widest matching breakpoint, cached for the current task. Set replacement and media-query changes invalidate it immediately.
 */
function currentBreakpoint(): string {
  if (!breakpointState.invalidating) {
    breakpointState.invalidating = true;
    queueMicrotask(() => {
      breakpointState.invalidating = false;
      widestMatch.clear();
    });
  }
  return widestMatch();
}

function createBreakpointService(): Service<BreakpointProps> {
  const props: MutableProps<BreakpointProps> = { name: '' };

  return createService<BreakpointProps>({
    // Media queries provide a current value without a subscription.
    props: () => {
      props.name = currentBreakpoint();
      return props;
    },
    start(emit) {
      const publishIfCrossed = () => {
        // A media-query change invalidates the task cache immediately.
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
      breakpointState.refresh = () => {
        unlisten();
        unlisten = listen();
        publishIfCrossed();
      };

      return () => {
        unlisten();
        breakpointState.refresh = null;
      };
    },
  });
}

/**
 * Use the viewport breakpoint service. It listens to media-query crossings, including changes caused by the browser's initial font size.
 */
export function useBreakpoint(): Service<BreakpointProps> {
  breakpointState.service ??= createBreakpointService();
  return breakpointState.service;
}
