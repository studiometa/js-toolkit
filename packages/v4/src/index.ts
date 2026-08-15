/**
 * @studiometa/js-toolkit v4 — prototype (2026-08-11)
 *
 * Smallest runnable version of the v4 design document (see ../DESIGN.md):
 *
 * 1. Components are independent — the registry is the only code that creates
 *    instances; lifecycle equals DOM presence; no parent-owned children.
 * 2. One registry — a single Map, one MutationObserver, record-based. A
 *    `registerManifest()` entry is the lazy half of it: the class is imported
 *    when the element's mount strategy first fires, then mounted by the
 *    registry like any other.
 * 3. Auto-mount on DOM insertion, destroy on ejection.
 * 4. Parents listen to child events — `$emit` bubbles, `on<Child><Event>`
 *    handlers resolve through event delegation on the parent root element,
 *    `onWindow<Event>` / `onDocument<Event>` cover what a subtree can never
 *    see, and negotiated events let a listener take part in a step instead of
 *    only hearing about it: `$domUpdate()` hands a DOM change to an ancestor's
 *    transition, `$emitExtendable()` holds a step open until it settles.
 * 5. Children advertise their existence — bubbling `component:mounted` /
 *    `component:destroyed` announcements, packaged as `$watchChildren()`,
 *    plus a provide/inject context primitive for shared reactive state.
 * 6. One frame-aligned scheduler — three in-frame phases (tick → read →
 *    write) plus an off-frame `background` lane — with cancelable handles,
 *    error isolation, and a `viewTransition` lane. It is also the clock:
 *    services subscribe to its tick instead of owning a
 *    `requestAnimationFrame` loop.
 * 7. Lazy, reference-counted services, one instance per observed target —
 *    subscribed by hand, or through the `withRaf`/`withScroll`/`withResize`/
 *    `withPointer`/`withDrag`/`withInView` mixins and their `ticked`,
 *    `scrolled`, `resized`, `moved`, `dragged` and `intersected` hooks, per
 *    mount cycle — or on the
 *    component's own terms with `toggle()`.
 *
 * Lifecycle: destroy !== terminate !== disconnected.
 * - disconnected (DOM fact) → `$destroy()`: reversible, the instance stays
 *   on its element; re-insertion remounts the same instance.
 * - `$destroy()` runs the cleanups returned by `mounted()` (per cycle).
 * - `$terminate()` is explicit and final: destroy + instance-lifetime
 *   teardown ($provide, $watchChildren) + `terminated()` hook.
 *
 * Plus `getInstances(name, root)`, the lookup for the case the three
 * component-scoped ones miss: mounted instances of a name anywhere on the page,
 * resolved from the DOM rather than from a registry.
 *
 * Plus `swap()`, the DOM content-swapping primitive: one mutation in one of
 * four modes, one script-adoption pass, and a promise resolving once the
 * registry has caught up.
 *
 * Plus responsive options, which every option is: a declared option reads
 * `data-option-<name>:<breakpoint>` as well as its plain attribute, cascading
 * upwards from the breakpoint it names, with nothing declared for it. It is
 * derived on read like every other value here, so `$options` stays read-only,
 * and a crossing that changes the resolved value is announced through the same
 * `option<Name>Changed()`.
 *
 * Not in this prototype: manifest generation from a bundler glob, non-bubbling
 * child events (mouseenter/mouseleave).
 *
 * One dependency: `morphdom`, imported by `swap()` alone for its `morph` mode.
 * Every other subpath is dependency-free, so a page which never swaps never
 * downloads it.
 */

export {
  Base,
  DESTROYED_EVENT,
  HANDLER_REGISTRATIONS,
  MOUNTED_EVENT,
  SOURCE,
  type BaseConfig,
  type BaseConstructor,
  type BaseProps,
  type ChildrenCollection,
  type DelegatedEvent,
  type EmitMap,
  type GlobalEvent,
  type HandlerRegistration,
  type LifecycleEventDetail,
  type MountedReturn,
  type OptionChange,
  type OptionChangedReturn,
  type OptionDefinition,
  type OptionType,
  type RefEvent,
  type WatchChildrenCallbacks,
} from './Base.js';
export {
  createContext,
  injectContext,
  injectContextSync,
  provideContext,
  provideRootContext,
  signal,
  type ContextCallback,
  type ContextKey,
  type InjectContextOptions,
  type Signal,
} from './context.js';
export { children, component, inject, on, provide, read, write } from './decorators.js';
export { whenDOMSettled, type AttributeChange, type AttributeWatcher } from './dom-mutations.js';
export { getInstances } from './instances.js';
export { MOUNT_ATTRIBUTE, type MountStrategy } from './mount-strategies.js';
export {
  DOM_UPDATE_EVENT,
  type DomMutation,
  type DomUpdateDetail,
  type DomUpdateRunner,
  type DomUpdateTransitioner,
  type ExtendableDetail,
  type ExtendableTransitioner,
  type Extension,
} from './negotiated-events.js';
export {
  registerComponent,
  registerComponents,
  registerManifest,
  type ComponentImporter,
  type ComponentManifest,
  type ComponentManifestEntry,
} from './registry.js';
export {
  nextFrame,
  defaultScheduler,
  type ScheduledTask,
  type SchedulerPhase,
  type TickCallback,
  type TickProps,
} from './scheduler.js';
export {
  BREAKPOINTS,
  getBreakpoints,
  setBreakpoints,
  useBreakpoint,
  type BreakpointProps,
} from './services/breakpoint.js';
export {
  DRAG_MODES,
  useDrag,
  withDrag,
  type DragHook,
  type DragMixinOptions,
  type DragMode,
  type DragOptions,
  type DragProps,
  type DragTarget,
} from './services/drag.js';
export {
  useInView,
  withInView,
  type InViewHook,
  type InViewMixinOptions,
  type InViewProps,
} from './services/in-view.js';
export {
  createServiceMixin,
  type MixedClass,
  type ServiceHandles,
  type ServiceMixin,
  type ServiceMixinDefinition,
  type ServiceMixinOptions,
} from './services/mixin.js';
export { useMediaQuery, usePrefersReducedMotion, type MediaQueryProps } from './services/media.js';
export {
  usePointer,
  withPointer,
  type PointerHook,
  type PointerMixinOptions,
  type PointerProps,
} from './services/pointer.js';
export {
  useRaf,
  withRaf,
  type RafHook,
  type RafMixinOptions,
  type RafProps,
  type RafRender,
  type RafService,
} from './services/raf.js';
export {
  useResize,
  useWindowSize,
  withResize,
  type ResizeHook,
  type ResizeMixinOptions,
  type ResizeOrientation,
  type ResizeProps,
} from './services/resize.js';
export {
  useScroll,
  useWindowScroll,
  withScroll,
  type ScrollHook,
  type ScrollMixinOptions,
  type ScrollDirection,
  type ScrollProps,
  type ScrollTarget,
} from './services/scroll.js';
export {
  createService,
  perTarget,
  type MutableProps,
  type Service,
  type ServiceCallback,
  type ServiceDefinition,
  type SubscribeOptions,
  type Unsubscribe,
} from './services/service.js';
export { toggle, type Toggle } from './services/toggle.js';
export { until } from './services/until.js';
export {
  SWAP_MODES,
  swap,
  type SwapContent,
  type SwapMode,
  type SwapOptions,
  type SwapWrap,
} from './swap.js';
export { viewTransition, type ViewTransitionUpdate } from './viewTransition.js';
