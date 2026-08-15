import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createService, type MutableProps, type Service } from './service.js';

export interface MediaQueryProps {
  /** Whether the query matches now. */
  readonly matches: boolean;
}

/** The reduced-motion media query. */
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** One lazy service per query string. */
const services = /* @__PURE__ */ getSharedRuntimeSlot<Map<string, Service<MediaQueryProps>>>(
  'service:media',
  1,
  () => new Map(),
);

function createMediaQueryService(query: string): Service<MediaQueryProps> {
  // Reuse one `MediaQueryList` per query.
  const list = window.matchMedia(query);
  const props: MutableProps<MediaQueryProps> = { matches: list.matches };

  return createService<MediaQueryProps>({
    // Media-query state can be read without starting the service.
    props: () => {
      props.matches = list.matches;
      return props;
    },
    start(emit) {
      const publish = () => {
        props.matches = list.matches;
        emit(props);
      };
      // The platform emits only when the match changes.
      list.addEventListener('change', publish);
      props.matches = list.matches;
      return () => list.removeEventListener('change', publish);
    },
  });
}

/** Use one shared service per normalized media query. */
export function useMediaQuery(query: string): Service<MediaQueryProps> {
  const key = query.trim();
  let service = services.get(key);
  if (!service) {
    service = createMediaQueryService(key);
    services.set(key, service);
  }
  return service;
}

/** Use the `(prefers-reduced-motion: reduce)` media-query service. */
export function usePrefersReducedMotion(): Service<MediaQueryProps> {
  return useMediaQuery(REDUCED_MOTION);
}
