import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
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
      let isActive = true;
      const observer = new IntersectionObserver((entries) => {
        // `disconnect()` does not cancel a callback the browser already
        // queued. A released run must not publish into subscribers belonging
        // to a later run of this shared service.
        if (!isActive) {
          return;
        }
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
        isActive = false;
        observer.disconnect();
        // A new run waits for its own first delivery instead of immediately
        // replaying an entry measured by the observer that was just released.
        hasEntry = false;
      };
    },
  });
}

const inViewServices = /* @__PURE__ */ getSharedRuntimeSlot('service:in-view', 1, () =>
  perTarget(createInViewService, keyOf),
);

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

/** The method `withInView()` subscribes for the component. */
export interface InViewHook {
  intersected?(props: InViewProps): void;
}

export type InViewMixinOptions = IntersectionObserverInit & ServiceMixinOptions<Element>;

/**
 * Subscribe a mounted component's `intersected()` method to the in-view
 * service, for its whole mount cycle:
 *
 * ```js
 * class Reveal extends withInView(Base, {
 *   threshold: 0.5,
 *   rootMargin: '100px',
 * }) {
 *   intersected({ isInView }) {
 *     this.$el.classList.toggle('is-visible', isInView);
 *   }
 * }
 * ```
 *
 * The component root is observed by default. Use `target` to resolve another
 * element per instance. The observer init accepts `root`, `rootMargin`,
 * `scrollMargin` and `threshold`; `manual` and `immediate` configure only the
 * mixin and are not passed to `IntersectionObserver`.
 *
 * This mixin asks for immediate delivery by default. It still waits before the
 * observer's first real entry, but a component that joins an active service
 * receives its current entry. Set `immediate: false` to always wait for the
 * next entry.
 *
 * The decorator form is the same API with a build step:
 *
 * ```js
 * @withInView({ threshold: 0.5 })
 * class Reveal extends Base {
 *   intersected(props) { … }
 * }
 * ```
 *
 * This observes a component that is already mounted. It does not control when
 * a component mounts. Use the `visible` or `in-view` mount strategy for that.
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
