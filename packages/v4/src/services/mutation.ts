import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

export interface MutationProps {
  /**
   * The batch the observer just delivered, in observation order.
   *
   * It is valid for the duration of the call only: the service drops it
   * afterwards, because a `childList` record holds the nodes it removed and
   * retaining the last batch would keep a detached subtree alive for the life
   * of the page. `[...records]` is how you keep one.
   */
  readonly records: readonly MutationRecord[];
}

/** The resting value: a batch is an event, so there is none between deliveries. */
const NO_RECORDS: readonly MutationRecord[] = /* @__PURE__ */ Object.freeze([]);

/**
 * Watch the target's subtree structure when the caller names no observation.
 * Attributes of one element are `watchAttributes()`'s job, so the default is
 * the case only this service covers.
 */
const DEFAULT_INIT: MutationObserverInit = /* @__PURE__ */ Object.freeze({
  childList: true,
  subtree: true,
});

/**
 * Give observationally identical options one canonical form, so they resolve
 * to one observer whatever order or shorthand the caller wrote them in.
 *
 * The two inferences are the platform's own: `attributeOldValue` and
 * `attributeFilter` imply `attributes`, and `characterDataOldValue` implies
 * `characterData`. Contradictory options — a filter with `attributes: false` —
 * are forwarded untouched so `observe()` still rejects them.
 *
 * Property order is not this function's business: `perTarget()` sorts keys
 * before it keys anything. What is left here is the DOM contract — an omitted
 * option is `false`, a filter is a set, and the platform infers two flags.
 */
function resolveInit(init: MutationObserverInit): MutationObserverInit {
  const attributeFilter = init.attributeFilter && [...new Set(init.attributeFilter)].sort();
  return {
    childList: init.childList ?? false,
    subtree: init.subtree ?? false,
    attributes:
      init.attributes ?? (init.attributeOldValue !== undefined || attributeFilter !== undefined),
    attributeOldValue: init.attributeOldValue ?? false,
    characterData: init.characterData ?? init.characterDataOldValue !== undefined,
    characterDataOldValue: init.characterDataOldValue ?? false,
    ...(attributeFilter !== undefined && { attributeFilter }),
  };
}

function createMutationService(target: Node, init: MutationObserverInit): Service<MutationProps> {
  const props: MutableProps<MutationProps> = { records: NO_RECORDS };
  let isDelivering = false;

  return createService<MutationProps>({
    props: () => props,
    // Between two batches there is nothing current to hand over, so
    // `{ immediate: true }` waits for a real mutation.
    hasProps: () => isDelivering,
    start(emit) {
      let isActive = true;
      const observer = new MutationObserver((records) => {
        // A callback queued before the last subscriber left must not publish
        // into the run that replaced it.
        if (!isActive) {
          return;
        }
        props.records = records;
        isDelivering = true;
        emit(props);
        isDelivering = false;
        props.records = NO_RECORDS;
      });
      observer.observe(target, init);

      return () => {
        isActive = false;
        observer.disconnect();
      };
    },
  });
}

const mutationServices = /* @__PURE__ */ getSharedRuntimeSlot('service:mutation', 1, () =>
  perTarget(createMutationService),
);

/**
 * Observe DOM mutations through one lazy service per target and observation.
 *
 * This is the general-purpose observer: any node, any `MutationObserverInit`,
 * delivered on the platform's own timing. Two narrower tools come first.
 * `watchAttributes(el, callback)` reports one coalesced change per attribute
 * of one element, after component lifecycle has settled — reach for it
 * whenever the question is "what did this attribute become". The registry's
 * internal observer handles component discovery and declared options; nothing
 * here replaces it, and a subscriber that needs the framework's own ordering
 * awaits `whenDOMSettled()` from its callback.
 */
export function useMutation(
  target: Node,
  init: MutationObserverInit = DEFAULT_INIT,
): Service<MutationProps> {
  return mutationServices(target, resolveInit(init));
}

/** The method `withMutation()` subscribes for the component. */
export interface MutationHook {
  mutated?(props: MutationProps): void;
}

export type MutationMixinOptions = MutationObserverInit & ServiceMixinOptions<Node>;

/**
 * Subscribe `mutated()` for each mount cycle, watching the root element's
 * subtree unless the options name another observation.
 */
export const withMutation = /* @__PURE__ */ createServiceMixin<
  MutationHook & ServiceHandles<'mutated'>,
  Node,
  MutationObserverInit
>({
  hook: 'mutated',
  target: (instance) => instance.$el,
  use: (target, options) => {
    const {
      attributeFilter,
      attributeOldValue,
      attributes,
      characterData,
      characterDataOldValue,
      childList,
      subtree,
    } = options;
    const init: MutationObserverInit = {
      ...(attributeFilter !== undefined && { attributeFilter }),
      ...(attributeOldValue !== undefined && { attributeOldValue }),
      ...(attributes !== undefined && { attributes }),
      ...(characterData !== undefined && { characterData }),
      ...(characterDataOldValue !== undefined && { characterDataOldValue }),
      ...(childList !== undefined && { childList }),
      ...(subtree !== undefined && { subtree }),
    };
    // An options object holding only mixin keys names no observation.
    return useMutation(target, Object.keys(init).length > 0 ? init : DEFAULT_INIT);
  },
});
