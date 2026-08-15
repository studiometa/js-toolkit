import { createService, type Service } from '../../src/index.js';

/**
 * `useInView(el, init)` — the intersection service v4 does not ship.
 *
 * ## Why this file exists
 *
 * v4 core has six sources — `useRaf`, `useScroll`, `useResize`, `usePointer`,
 * `useDrag`, `useBreakpoint`/`useMediaQuery` — and **no intersection source at
 * all**. The only `IntersectionObserver` in `src/` is inside
 * `applyMountStrategy()`, which is private, only accepts a root-margin suffix,
 * and answers a different question: *when does this component mount*, not
 * *is this element in view right now*.
 *
 * v3 had both, as two decorators: `withMountWhenInView` (mount/destroy on
 * crossings) and `withIntersectionObserver` (an observer for the mount
 * cycle, with the element staying mounted). `data-mount="in-view"` replaces
 * the first exactly — the `InView` port is three lines because of it. The
 * second has **no replacement**, and `Track`'s `data-track:view` is the case
 * that needs it: the component keeps a `click` listener and a `payload` ref
 * alive while *one of its events* watches the viewport. Mounting the whole
 * component on the crossing would destroy the rest of it.
 *
 * ## Written as a service on purpose
 *
 * This could have been `new IntersectionObserver(...)` in `TrackEvent`, and
 * that is what ui does. It is written against `createService()` instead
 * because the point of the exercise is to find out whether v4's service
 * primitive holds up for a source no core service covers. It does: the whole
 * definition below is 20 lines, and lazy start, reference counting, snapshot
 * fan-out, error isolation and `hasProps()` gating all come from
 * `createService` untouched. Two `data-track:view` events on one element share
 * one observer, and the last of them to leave disconnects it.
 *
 * ## What did *not* come from core: the cache key
 *
 * `perTarget()` — core's helper for "one instance per observed target" — keys
 * a `WeakMap` **by the target alone** and drops the remaining arguments:
 *
 *     const services = new WeakMap<Target, Service<T, R>>();
 *     return (target, ...args) => { … create(target, ...args) … };
 *
 * That is right for `useScroll(el)` and `useResize(el)`, which have nothing
 * else to say. It is wrong for any source whose options change *what is
 * observed*: here, `useInView(el, { threshold: 0.5 })` followed by
 * `useInView(el, { threshold: 0 })` would hand the second caller the first
 * caller's observer, silently, and the second component would never fire.
 * That is not hypothetical for `Track` — `data-option-threshold` is a
 * documented option and two `Track`s on nested elements routinely differ.
 *
 * So the cache here is keyed by **root, then element, then the init that
 * describes the observation**. Three levels rather than one, and the reason
 * for three is that `root` is an object: it cannot go into a string key, so it
 * is the outer `WeakMap`'s own key and only `rootMargin`/`threshold` are
 * serialised. `perTarget()` would need this shape to be reusable; it has it
 * for none of the six.
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
  // The service owns this object and overwrites it in place, which is the v4
  // props convention: `{ ...props }` is how a subscriber keeps one.
  const props = {
    isIntersecting: false,
    ratio: 0,
    entry: null as IntersectionObserverEntry | null,
  };

  // An `IntersectionObserver` has no current value before it has delivered
  // one — asking it is not a read the way `getBoundingClientRect()` is — so
  // `{ immediate: true }` is honestly a no-op until the first crossing.
  // The observer delivers the initial state on `observe()` anyway, one task
  // later, which is why nothing here tries to synthesise it.
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
