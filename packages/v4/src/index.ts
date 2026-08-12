/**
 * @studiometa/js-toolkit v4 — prototype (2026-08-11)
 *
 * Smallest runnable version of the v4 design document (see ../DESIGN.md):
 *
 * 1. Components are independent — the registry is the only code that creates
 *    instances; lifecycle equals DOM presence; no parent-owned children.
 * 2. One registry — a single Map, one MutationObserver, record-based.
 * 3. Auto-mount on DOM insertion, destroy on ejection.
 * 4. Parents listen to child events — `$emit` bubbles, `on<Child><Event>`
 *    handlers resolve through event delegation on the parent root element.
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
 *    `withPointer`/`withDrag` mixins and their `ticked`, `scrolled`,
 *    `resized`, `moved` and `dragged` hooks, per mount cycle — or on the
 *    component's own terms with `toggle()`.
 *
 * Lifecycle: destroy !== terminate !== disconnected.
 * - disconnected (DOM fact) → `$destroy()`: reversible, the instance stays
 *   on its element; re-insertion remounts the same instance.
 * - `$destroy()` runs the cleanups returned by `mounted()` (per cycle).
 * - `$terminate()` is explicit and final: destroy + instance-lifetime
 *   teardown ($provide, $watchChildren) + `terminated()` hook.
 *
 * Not in this prototype: autoload manifests, responsive options,
 * non-bubbling child events (mouseenter/mouseleave).
 *
 * Zero dependencies.
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
  Signal,
  createContext,
  injectContext,
  injectContextSync,
  provideContext,
  provideRootContext,
  type ContextKey,
} from './context.js';
export { children, component, inject, on, provide, read, write } from './decorators.js';
export { whenDOMSettled } from './dom-mutations.js';
export { MOUNT_ATTRIBUTE, type MountStrategy } from './mount-strategies.js';
export { registerComponent, registerComponents } from './registry.js';
export {
  nextFrame,
  Scheduler,
  scheduler,
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
  createServiceMixin,
  type MixedClass,
  type ServiceHandles,
  type ServiceMixin,
  type ServiceMixinDefinition,
  type ServiceMixinOptions,
} from './services/mixin.js';
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
  type Unsubscribe,
} from './services/service.js';
export { toggle, type Toggle } from './services/toggle.js';
export { viewTransition, type ViewTransitionUpdate } from './viewTransition.js';
