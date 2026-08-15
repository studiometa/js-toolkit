import { createService, perTarget, type MutableProps, type Service } from './service.js';

export interface InViewProps {
  /** Whether the target intersects its root, as the latest entry reports it. */
  readonly isInView: boolean;
  /** The latest entry, or `null` until the observer first delivers one. */
  readonly entry: IntersectionObserverEntry | null;
}

/**
 * Give an observer root a stable serialisable identity. `perTarget()` can
 * serialise the rest of `IntersectionObserverInit`, but two root elements
 * would otherwise both become `{}` and share an observation they did not ask
 * for.
 */
const rootIds = new WeakMap<object, number>();
let nextRootId = 1;

function rootId(root: object): number {
  let id = rootIds.get(root);
  if (!id) {
    id = nextRootId;
    nextRootId += 1;
    rootIds.set(root, id);
  }
  return id;
}

function keyOf(init: IntersectionObserverInit): string {
  const { root, ...options } = init;
  return JSON.stringify([root ? rootId(root) : null, options]);
}

function createInViewService(
  target: Element,
  requestedInit: IntersectionObserverInit,
): Service<InViewProps> {
  // Keep the values this service was keyed with. The observer starts lazily,
  // so retaining the caller's mutable object would let its observation change
  // after `useInView()` returned without changing the service key.
  const init: IntersectionObserverInit = {
    ...requestedInit,
    threshold: Array.isArray(requestedInit.threshold)
      ? [...requestedInit.threshold]
      : requestedInit.threshold,
  };
  const props: MutableProps<InViewProps> = {
    isInView: false,
    entry: null,
  };
  let hasEntry = false;

  return createService<InViewProps>({
    props: () => props,
    // An observer has no current entry before it delivers one. In particular,
    // `{ immediate: true }` must not turn the resting props above into a
    // reading the platform never made.
    hasProps: () => hasEntry,
    start(emit) {
      const observer = new IntersectionObserver((entries) => {
        // This observer watches one target, but select it explicitly: a
        // callback batch is platform input and must not publish another
        // target's entry if that invariant is ever broken.
        const entry = entries.findLast((candidate) => candidate.target === target);
        if (!entry) {
          return;
        }
        props.isInView = entry.isIntersecting;
        props.entry = entry;
        hasEntry = true;
        emit(props);
      }, init);
      observer.observe(target);

      return () => {
        observer.disconnect();
        // A new run waits for its own first delivery instead of immediately
        // replaying an entry measured by the observer that was just released.
        hasEntry = false;
      };
    },
  });
}

const inViewServices = /* @__PURE__ */ perTarget(createInViewService, keyOf);

/**
 * Observe whether an element is in view.
 *
 * ```js
 * const unsubscribe = useInView(card, { threshold: 0.5 }).subscribe(
 *   ({ isInView }) => card.classList.toggle('is-in-view', isInView),
 * );
 * ```
 *
 * The service is lazy and shared per target and observer init. It disconnects
 * its observer when its final subscriber leaves.
 */
export function useInView(
  target: Element,
  init: IntersectionObserverInit = {},
): Service<InViewProps> {
  return inViewServices(target, init);
}
