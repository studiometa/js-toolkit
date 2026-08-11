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
 * 6. One frame-aligned scheduler (read → write → afterWrite → background)
 *    with cancelable handles, error isolation, and a `viewTransition` lane.
 *
 * Lifecycle: destroy !== terminate !== disconnected.
 * - disconnected (DOM fact) → `$destroy()`: reversible, the instance stays
 *   on its element; re-insertion remounts the same instance.
 * - `$destroy()` runs the cleanups returned by `mounted()` (per cycle).
 * - `$terminate()` is explicit and final: destroy + instance-lifetime
 *   teardown ($provide, $watchChildren) + `terminated()` hook.
 *
 * Not in this prototype: services, decorators, autoload manifests,
 * responsive options, `data-mount` strategies, non-bubbling child events
 * (mouseenter/mouseleave), refs/config merge strategies.
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
  type OptionDefinition,
  type OptionType,
  type RefEvent,
  type WatchChildrenCallbacks,
} from './Base.js';
export {
  Signal,
  createContext,
  injectContext,
  provideContext,
  type ContextKey,
} from './context.js';
export { children, component, inject, on, provide, read, write } from './decorators.js';
export { registerComponent, registerComponents } from './registry.js';
export {
  nextFrame,
  Scheduler,
  scheduler,
  type ScheduledTask,
  type SchedulerPhase,
} from './scheduler.js';
export { kebabCase, pascalCase } from './utils.js';
export { viewTransition, type ViewTransitionUpdate } from './viewTransition.js';
