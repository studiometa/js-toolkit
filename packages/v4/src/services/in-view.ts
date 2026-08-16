import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

export interface InViewProps {
  /** Whether the target intersects its root, as the latest entry reports it. */
  readonly isInView: boolean;
  /** The latest entry, or `null` until the observer first delivers one. */
  readonly entry: IntersectionObserverEntry | null;
}

interface InViewRootIdentity {
  readonly ids: WeakMap<object, number>;
  nextId: number;
}

interface InViewRuntimeState {
  readonly rootIdentity: InViewRootIdentity;
  readonly services: (target: Element, init: IntersectionObserverInit) => Service<InViewProps>;
}

/** Give each observer root a stable serializable identity. */
function rootId(root: object, identity: InViewRootIdentity): number {
  let id = identity.ids.get(root);
  if (!id) {
    id = identity.nextId;
    identity.nextId += 1;
    identity.ids.set(root, id);
  }
  return id;
}

function keyOf(init: IntersectionObserverInit, identity: InViewRootIdentity): string {
  const { root, ...options } = init;
  return JSON.stringify([root ? rootId(root, identity) : null, options]);
}

function createInViewService(
  target: Element,
  requestedInit: IntersectionObserverInit,
): Service<InViewProps> {
  // Copy values so caller mutation cannot change a lazily started observation.
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
    // No props are current before the observer's first delivery.
    hasProps: () => hasEntry,
    start(emit) {
      let isActive = true;
      const observer = new IntersectionObserver((entries) => {
        // `disconnect()` does not cancel queued callbacks; reject callbacks from older runs.
        if (!isActive) {
          return;
        }
        // Publish only this service's target entry from the platform batch.
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
        isActive = false;
        observer.disconnect();
        // A new run waits for its own first entry.
        hasEntry = false;
      };
    },
  });
}

const inViewState = /* @__PURE__ */ getSharedRuntimeSlot<InViewRuntimeState>(
  'service:in-view',
  2,
  () => {
    const rootIdentity: InViewRootIdentity = {
      ids: new WeakMap(),
      nextId: 1,
    };
    return {
      rootIdentity,
      services: perTarget(createInViewService, (init) => keyOf(init, rootIdentity)),
    };
  },
);

/** Observe intersection through one lazy service per target and observer options. */
export function useInView(
  target: Element,
  init: IntersectionObserverInit = {},
): Service<InViewProps> {
  return inViewState.services(target, init);
}

/** The method `withInView()` subscribes for the component. */
export interface InViewHook {
  intersected?(props: InViewProps): void;
}

export type InViewMixinOptions = IntersectionObserverInit & ServiceMixinOptions<Element>;

/**
 * Subscribe `intersected()` for each mount cycle. The root element is the default target, and immediate delivery waits for a real observer entry.
 */
export const withInView = /* @__PURE__ */ createServiceMixin<
  InViewHook & ServiceHandles<'intersected'>,
  Element,
  IntersectionObserverInit
>({
  hook: 'intersected',
  target: (instance) => instance.$el,
  defaultImmediate: true,
  use: (target, options) => {
    const { root, rootMargin, scrollMargin, threshold } = options;
    const init: IntersectionObserverInit = {
      ...(root !== undefined && { root }),
      ...(rootMargin !== undefined && { rootMargin }),
      ...(scrollMargin !== undefined && { scrollMargin }),
      ...(threshold !== undefined && { threshold }),
    };
    return useInView(target, init);
  },
});
