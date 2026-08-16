import { createService, type Service } from '../../src/index.js';

/**
 * Reference-counted intersection service. Instances are keyed by root,
 * element, and observer options because each combination has distinct state.
 */
export interface InViewProps {
  /** Whether the element intersects the root, as the observer reports it. */
  readonly isIntersecting: boolean;
  /** The observed ratio, `0` to `1`. */
  readonly ratio: number;
  /** The raw entry, for the fields nothing here promotes (`boundingClientRect`…). */
  readonly entry: IntersectionObserverEntry | null;
}

export type InViewService = Service<InViewProps>;

/** `root` is an object, so it keys a `WeakMap` rather than a string. */
const byRoot = new WeakMap<object, WeakMap<Element, Map<string, InViewService>>>();

/**
 * Everything about `init` that changes what the observer reports, as a string.
 * `root` is deliberately absent — it is the outer key.
 */
function initKey({ rootMargin = '0px', threshold = 0 }: IntersectionObserverInit): string {
  return JSON.stringify([rootMargin, threshold]);
}

function createInViewService(el: Element, init: IntersectionObserverInit): InViewService {
  // The service owns and mutates this props object.
  const props = {
    isIntersecting: false,
    ratio: 0,
    entry: null as IntersectionObserverEntry | null,
  };

  // No current value exists before the observer's first delivery.
  let hasBeenSeen = false;

  return createService<InViewProps>({
    props: () => props,
    hasProps: () => hasBeenSeen,
    start(emit) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          props.isIntersecting = entry.isIntersecting;
          props.ratio = entry.intersectionRatio;
          props.entry = entry;
          hasBeenSeen = true;
          emit(props);
        }
      }, init);
      observer.observe(el);
      return () => {
        observer.disconnect();
        // A restarted run must not announce a crossing measured before it.
        hasBeenSeen = false;
      };
    },
  });
}

/**
 * The intersection service for one element observed with one `init`.
 *
 * Lazy and reference-counted like every core service: no observer exists
 * until the first subscriber, and the last one to leave disconnects it.
 */
export function useInView(el: Element, init: IntersectionObserverInit = {}): InViewService {
  const root = init.root ?? document;
  let byElement = byRoot.get(root);
  if (!byElement) {
    byElement = new WeakMap();
    byRoot.set(root, byElement);
  }
  let byInit = byElement.get(el);
  if (!byInit) {
    byInit = new Map();
    byElement.set(el, byInit);
  }
  const key = initKey(init);
  let service = byInit.get(key);
  if (!service) {
    service = createInViewService(el, init);
    byInit.set(key, service);
  }
  return service;
}
