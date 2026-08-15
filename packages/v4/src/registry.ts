import { resolveConfig, type BaseConstructor, type ComponentImporter } from './Base.js';
import { isBaseConstructor } from './component-brand.js';
import {
  COMPONENT_ATTRIBUTE,
  componentTokens,
  hasComponentAttribute,
  hasResponsiveComponentAttribute,
} from './component-declarations.js';
import { DIAGNOSTICS, reportDiagnostic, warnOnce } from './diagnostics.js';
import {
  registerDOMOptionAttributes,
  setDOMMutationProcessor,
  trackDOMLifecycleWork,
  type DOMMutationRecord,
} from './dom-mutations.js';
import {
  applyMountStrategy,
  MOUNT_ATTRIBUTE,
  type AppliedMountStrategy,
  type MountStrategy,
} from './mount-strategies.js';
import {
  checkResponsiveAttributes,
  observeResponsiveAttribute,
  responsiveAttributeNames,
  watchBreakpoint,
} from './responsive-options.js';
import { defaultScheduler, type ScheduledTask } from './scheduler.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';
import { onBreakpointsReplaced } from './services/breakpoint.js';
import { selectorFor } from './utils/selectors.js';
import { kebabCase } from './utils/strings.js';

// Component declarations use the same finite attribute × breakpoint filter as
// responsive options. This opens no observer and no media-query listener.
observeResponsiveAttribute(COMPONENT_ATTRIBUTE);

interface PairController {
  active: boolean;
  dispose(): void;
  strategy: string;
}

/**
 * Teardown for the mount strategy watching each element/component pair.
 * Its presence also marks the pair as already scheduled, so re-scanning an
 * element never observes it twice.
 */
export type { ComponentImporter };

/**
 * A lazy entry of the same registry: what to import, and — standing in for
 * the `config.mountStrategy` of a class which does not exist yet — when.
 */
export interface ComponentManifestEntry {
  load: ComponentImporter;
  mountStrategy?: MountStrategy;
}

/** `data-component` tokens mapped to the lazy entry which resolves them. */
export type ComponentManifest = Record<string, ComponentImporter | ComponentManifestEntry>;

interface LoadController {
  dispose(): void;
  strategy: string;
}

/**
 * Teardown for the strategy waiting to *import* one element's declared but
 * unloaded component. It is the same object the registry keeps for a loaded
 * pair, one step earlier in the pipeline.
 */
interface RegistryRuntimeState {
  registry: Map<string, BaseConstructor>;
  controllers: WeakMap<Element, Map<string, PairController>>;
  manifest: Map<string, ComponentManifestEntry>;
  imports: Map<string, Promise<void>>;
  loaders: WeakMap<Element, Map<string, LoadController>>;
  responsiveElements: Set<HTMLElement>;
  unwatchBreakpoints: (() => void) | null;
  responsiveTask: ScheduledTask<void> | null;
  pendingResponsiveElements: Set<HTMLElement>;
  isReplacementListenerAttached: boolean;
}

const registryState = /* @__PURE__ */ getSharedRuntimeSlot<RegistryRuntimeState>(
  'registry',
  1,
  () => ({
    registry: new Map(),
    controllers: new WeakMap(),
    manifest: new Map(),
    imports: new Map(),
    loaders: new WeakMap(),
    responsiveElements: new Set(),
    unwatchBreakpoints: null,
    responsiveTask: null,
    pendingResponsiveElements: new Set(),
    isReplacementListenerAttached: false,
  }),
);
const { registry, controllers, manifest, imports, loaders, responsiveElements } = registryState;

/**
 * Whether a function was written with `class`, which only matters for the
 * ones `isBaseConstructor()` rejected: those are constructors, so calling
 * them as an importer throws "cannot be invoked without 'new'" — on an
 * element, at load time, long after the mistake was made.
 *
 * A class has a non-writable `prototype` own property; a function
 * expression's is writable, and an arrow or an `async function` has none at
 * all. Every spelling an importer takes is therefore excluded, and the
 * one shape worth catching early is caught.
 */
function isClassLike(value: (...args: never[]) => unknown): boolean {
  return Object.getOwnPropertyDescriptor(value, 'prototype')?.writable === false;
}

/**
 * Register the family a component declares in `config.components`, where a
 * value is the child's class or a thunk importing it.
 *
 * The **merged** config, not `ComponentClass.config` — the same fix `mountStrategy`
 * needed. Every subclass declares a `static config` of its own, if only for
 * `name`, so reading the own static made registering a subclass register
 * nothing its base declared, while `$config` and `on<Child><Event>` resolution
 * read the merged set. A subclass therefore mounted children its own instances
 * announce and query, and since a `() => import(…)` child has no other
 * registration path, a subclass lost its base's lazy children outright.
 *
 * Registering the same family twice — a base and its subclass both declaring
 * it — costs nothing: `registerComponent()` returns on a name already mapped
 * to that very class, and `registerLazyChild()` on a name already known. That
 * guard is also what terminates the recursion, because the name is mapped
 * *before* the family is walked, so a cycle (A declares B, B declares A)
 * closes on the second visit.
 *
 * **A class is a function too**, so the two are told apart the way
 * `resolveComponentClass()` already tells a class from anything else an
 * importer resolved to: `isBaseConstructor()`, the shared component brand. It is the
 * definition of a component class rather than a proxy for it — a `config`
 * static can be forgotten and inherited by a subclass either way, and
 * `fn.toString()` reads source text. Anything else callable is a thunk, and
 * a wrong shape is reported here instead of registering nothing.
 *
 * A thunk is **not called**. It becomes a lazy entry under its map key,
 * which is the whole feature: the key names the component — a thunk cannot,
 * until it resolves — so `scheduleFor()` matches `data-component` tokens
 * against a name nothing had to import. A manifest then declares the parent
 * alone, and the child is its own chunk.
 */
function registerFamily(ComponentClass: BaseConstructor): void {
  const { name, components } = resolveConfig(ComponentClass);
  for (const [childName, Child] of Object.entries(components ?? {})) {
    if (isBaseConstructor(Child)) {
      registerComponent(Child);
    } else if (typeof Child === 'function' && !isClassLike(Child)) {
      registerLazyChild(childName, Child);
    } else {
      warnOnce(
        ComponentClass,
        childName,
        DIAGNOSTICS.component.invalidFamilyDeclaration,
        `"${name}" declares "${childName}" as neither a component class nor an importer; the declaration was ignored.`,
        { component: name },
      );
    }
  }
}

/**
 * Add one `config.components` thunk to the lazy half of the registry, under
 * the key which named it. From there it is an ordinary lazy entry: the
 * element's `data-mount` decides when to import, `importComponent()` imports
 * once per name whichever element triggered it, and `registerComponent()`
 * takes over as soon as the class exists.
 *
 * First wins, and quietly — unlike `registerManifest()`, which warns. A name
 * already known here is the normal case rather than a mistake: several
 * parents declaring the same lazy child is exactly how a shared child gets
 * its own chunk, and two thunks importing one module are two different
 * function objects, so there is nothing to compare a real conflict against.
 * A token genuinely claimed by two components still reports itself one step
 * later, through `importComponent()`'s class-name check.
 */
function registerLazyChild(name: string, load: ComponentImporter): void {
  if (registry.has(name) || manifest.has(name)) {
    return;
  }
  manifest.set(name, { load });
  setDOMMutationProcessor(processMutations);
  scanName(document.documentElement, name);
}

function declaresComponent(el: Element, name: string): boolean {
  return componentTokens(el).has(name);
}

/** Connected elements whose declarations need a breakpoint crossing. */
function syncResponsiveElement(el: HTMLElement): void {
  if (el.isConnected && hasResponsiveComponentAttribute(el)) {
    responsiveElements.add(el);
    registryState.unwatchBreakpoints ??= watchBreakpoint(() => {
      scheduleResponsiveReconciliation(responsiveElements);
    });
    return;
  }

  responsiveElements.delete(el);
  if (responsiveElements.size === 0) {
    registryState.unwatchBreakpoints?.();
    registryState.unwatchBreakpoints = null;
  }
}

/**
 * Put a crossing through the same background lifecycle boundary as a DOM
 * mutation. Coalescing matters for `setBreakpoints()`: replacing the set and
 * refreshing the running service can both ask for the same reconciliation.
 */
function scheduleResponsiveReconciliation(elements: Iterable<HTMLElement>): void {
  for (const el of elements) {
    registryState.pendingResponsiveElements.add(el);
  }
  if (registryState.responsiveTask || registryState.pendingResponsiveElements.size === 0) {
    return;
  }

  const task = defaultScheduler.background(() => {
    const batch = registryState.pendingResponsiveElements;
    registryState.pendingResponsiveElements = new Set();
    for (const el of batch) {
      if (el.isConnected) {
        reconcileElement(el);
      } else {
        syncResponsiveElement(el);
      }
    }
  });
  registryState.responsiveTask = task;
  trackDOMLifecycleWork(task.promise);
  const finished = () => {
    registryState.responsiveTask = null;
    scheduleResponsiveReconciliation([]);
  };
  void task.promise.then(finished, finished);
}

if (!registryState.isReplacementListenerAttached) {
  registryState.isReplacementListenerAttached = true;
  onBreakpointsReplaced(() => {
    const candidates = new Set(responsiveElements);
    const selector = responsiveAttributeNames(COMPONENT_ATTRIBUTE)
      .map((attribute) => `[${CSS.escape(attribute)}]`)
      .join(',');
    if (selector) {
      for (const el of document.querySelectorAll<HTMLElement>(selector)) {
        candidates.add(el);
      }
    }
    scheduleResponsiveReconciliation(candidates);
  });
}

/**
 * Register a component class. Existing matching elements are scheduled
 * right away; future ones are scheduled when they enter the DOM. When each
 * instance actually mounts is the strategy's call — see `data-mount`.
 * The family declared in the **merged** `config.components` registers too: a
 * class right away, a `() => import(…)` thunk as a lazy entry — so a subclass
 * registers what its base declared.
 */
export function registerComponent(ComponentClass: BaseConstructor): void {
  const { name } = ComponentClass.config;
  if (registry.has(name)) {
    if (registry.get(name) !== ComponentClass) {
      warnOnce(
        ComponentClass,
        name,
        DIAGNOSTICS.registry.conflict,
        `"${name}" is already registered; the incoming declaration was ignored.`,
        { component: name },
      );
    }
    return;
  }
  registry.set(name, ComponentClass);
  manifest.delete(name);

  registerFamily(ComponentClass);

  registerDOMOptionAttributes(optionAttributes(ComponentClass));
  setDOMMutationProcessor(processMutations);
  scanName(document.documentElement, name);
}

export function registerComponents(...classes: BaseConstructor[]): void {
  for (const ComponentClass of classes) {
    registerComponent(ComponentClass);
  }
}

/**
 * Register lazy entries into the same registry: a `data-component` token
 * whose class has not been downloaded yet.
 *
 * The trigger is the mount strategy, not a second `data-load` knob. An
 * element's `data-mount` wins over the entry's `mountStrategy`, which stands
 * in for the `config.mountStrategy` of a class nobody can read yet, which
 * defaults to `eager` — the same precedence a registered class follows. When
 * the strategy fires the module is imported once and its class registered,
 * and the registry owns every mount and unmount from there.
 *
 * A declaration whose class has not loaded has no instance, so it stays
 * invisible to `$query`, `$closest`, `$watchChildren` and `getInstances()`,
 * exactly like a component still waiting for its mount strategy.
 */
export function registerManifest(entries: ComponentManifest): void {
  const added: string[] = [];

  for (const [name, entry] of Object.entries(entries)) {
    if (registry.has(name) || manifest.has(name)) {
      warnOnce(
        entries,
        name,
        DIAGNOSTICS.registry.conflict,
        `"${name}" is already registered; the incoming declaration was ignored.`,
        { component: name },
      );
      continue;
    }
    manifest.set(name, typeof entry === 'function' ? { load: entry } : entry);
    added.push(name);
  }

  if (added.length === 0) {
    return;
  }

  setDOMMutationProcessor(processMutations);
  for (const name of added) {
    scanName(document.documentElement, name);
  }
}

/**
 * Import one lazy entry and register what it resolves to, at most once per
 * name. A failure is reported and never retried: the trigger has already
 * been spent, and a retry loop on a broken chunk is worse than a silent page.
 */
function importComponent(name: string, target?: Element): Promise<void> {
  const pending = imports.get(name);
  if (pending) {
    return pending;
  }
  const entry = manifest.get(name);
  if (!entry) {
    return Promise.resolve();
  }

  const work = Promise.resolve()
    .then(() => entry.load())
    .then((module) => {
      const ComponentClass = resolveComponentClass(module, name);
      if (!ComponentClass) {
        throw new TypeError(`"${name}" did not resolve to a component class.`);
      }
      if (ComponentClass.config.name !== name) {
        warnOnce(
          entry.load,
          name,
          DIAGNOSTICS.registry.lazyNameMismatch,
          `"${name}" resolved to a component named "${ComponentClass.config.name}".`,
          { component: name, target },
        );
      }
      manifest.delete(name);
      registerComponent(ComponentClass);
    })
    .catch((error: unknown) => {
      reportDiagnostic(
        DIAGNOSTICS.component.loadFailed,
        `Failed to load component "${name}".`,
        error,
        { component: name, target },
      );
    });

  imports.set(name, work);
  return work;
}

/**
 * Accept whatever the importer resolved: the class, the module namespace of
 * `import('./Foo.js')` with `Foo` or `default` on it. Writing the `.then()`
 * which unwraps it is the boilerplate every hand-written manifest would
 * otherwise repeat once per line.
 */
function resolveComponentClass(module: unknown, name: string): BaseConstructor | undefined {
  if (isBaseConstructor(module)) {
    return module;
  }
  if (typeof module !== 'object' || module === null) {
    return undefined;
  }
  const exports = module as Record<string, unknown>;
  for (const candidate of [exports[name], exports.default]) {
    if (isBaseConstructor(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function optionAttributes(ComponentClass: BaseConstructor): string[] {
  const names = new Set<string>();
  let current: BaseConstructor | null = ComponentClass;
  while (current?.config) {
    for (const name of Object.keys(current.config.options ?? {})) {
      const attribute = `data-option-${kebabCase(name)}`;
      names.add(attribute);
      // Every option may be written across several attributes, one per
      // breakpoint. The observer filters on exact names, so the breakpoint-
      // scoped spellings are registered too — and re-registered if the named
      // set is later replaced, which the responsive layer owns.
      observeResponsiveAttribute(attribute);
    }
    current = Object.getPrototypeOf(current) as BaseConstructor | null;
  }
  return [...names];
}

/**
 * The strategy for one element/component pair: the element's `data-mount`
 * wins over the class's `config.mountStrategy`, which wins over `eager`.
 *
 * An element declaring several components (`data-component="A B"`) applies
 * its `data-mount` to all of them; a component needing its own policy
 * declares it in its config instead.
 *
 * The **merged** config, not `ComponentClass.config`: every subclass declares
 * a `static config` of its own, if only for `name`, so reading the own static
 * made every subclass of a strategy-declaring component fall back to `eager`
 * — silently, since it still worked, it just mounted everywhere.
 */
function resolveStrategy(el: Element, ComponentClass: BaseConstructor): string {
  return el.getAttribute(MOUNT_ATTRIBUTE) ?? resolveConfig(ComponentClass).mountStrategy ?? 'eager';
}

/**
 * The instance is created on first mount, not on discovery: a component
 * waiting for its strategy has no instance yet, so it stays invisible to
 * `$query`, `$closest` and `$watchChildren`, and announces nothing.
 */
function isCurrentPair(
  el: HTMLElement,
  name: string,
  ComponentClass: BaseConstructor,
  controller: PairController,
): boolean {
  return (
    controller.active &&
    controllers.get(el)?.get(name) === controller &&
    el.isConnected &&
    declaresComponent(el, name) &&
    resolveStrategy(el, ComponentClass) === controller.strategy
  );
}

function mountPair(
  el: HTMLElement,
  name: string,
  ComponentClass: BaseConstructor,
  controller: PairController,
): void {
  if (!isCurrentPair(el, name, ComponentClass, controller)) {
    return;
  }
  let instance = el.__base__?.get(name);
  try {
    if (!instance) {
      instance = new ComponentClass(el);
    }
    instance.$mount();
  } catch (error) {
    // A derived constructor can throw after Base published `this`. Assignment
    // above only completes for a fully constructed object, so an empty local
    // identifies construction failure without disturbing an existing instance
    // or a valid instance whose mount failed.
    if (!instance) {
      el.__base__?.delete(name);
    }
    reportDiagnostic(
      DIAGNOSTICS.component.mountFailed,
      `Failed to mount component "${name}".`,
      error,
      { component: name, target: el },
    );
  }
}

function destroyPair(
  el: HTMLElement,
  name: string,
  ComponentClass: BaseConstructor,
  controller: PairController,
): void {
  if (isCurrentPair(el, name, ComponentClass, controller)) {
    el.__base__?.get(name)?.$destroy();
  }
}

function disposeController(el: Element, name: string): void {
  const pairs = controllers.get(el);
  const controller = pairs?.get(name);
  if (!controller) {
    return;
  }
  controller.active = false;
  controller.dispose();
  pairs?.delete(name);
  if (pairs?.size === 0) {
    controllers.delete(el);
  }
}

function schedule(el: HTMLElement, name: string, ComponentClass: BaseConstructor): void {
  const strategy = resolveStrategy(el, ComponentClass);
  let pairs = controllers.get(el);
  const current = pairs?.get(name);
  if (current?.strategy === strategy) {
    return;
  }
  if (current) {
    disposeController(el, name);
  }

  pairs = controllers.get(el);
  if (!pairs) {
    pairs = new Map();
    controllers.set(el, pairs);
  }

  const controller: PairController = {
    active: true,
    dispose() {},
    strategy,
  };
  pairs.set(name, controller);
  const applied = applyMountStrategy(el, strategy, {
    mount: () => mountPair(el, name, ComponentClass, controller),
    destroy: () => destroyPair(el, name, ComponentClass, controller),
  });
  controller.dispose = applied.dispose;
  if (!applied.valid) {
    reportDiagnostic(
      DIAGNOSTICS.component.invalidMountStrategy,
      `Failed to apply mount strategy "${strategy}" to component "${name}".`,
      applied.error,
      { component: name, target: el },
    );
  }
  trackDOMLifecycleWork(applied.eagerWork);
}

function disposeLoader(el: Element, name: string): void {
  const pending = loaders.get(el);
  const controller = pending?.get(name);
  if (!controller) {
    return;
  }
  controller.dispose();
  pending?.delete(name);
  if (pending?.size === 0) {
    loaders.delete(el);
  }
}

/**
 * Complete a conditional one-shot strategy after its import. Registration
 * applies the loaded class's strategy to the pair. When it resolves to the
 * same one-shot strategy, the condition which started the import already
 * satisfied it, so the new controller mounts without waiting for a second
 * visibility, idle or interaction trigger.
 */
function completeOneShotLoad(el: HTMLElement, name: string, strategy: string): void {
  if (
    strategy !== 'visible' &&
    !strategy.startsWith('visible:') &&
    strategy !== 'idle' &&
    strategy !== 'interaction'
  ) {
    return;
  }
  const ComponentClass = registry.get(name);
  const controller = controllers.get(el)?.get(name);
  if (
    !ComponentClass ||
    !controller ||
    controller.strategy !== strategy ||
    resolveStrategy(el, ComponentClass) !== strategy
  ) {
    return;
  }
  controller.dispose();
  mountPair(el, name, ComponentClass, controller);
}

/**
 * Wait for one element's declared-but-unloaded component, on the strategy
 * that element resolves to. Importing is one-shot even for a reversible
 * strategy. Once the class is registered, the registry applies its resolved
 * strategy to the pair. A reversible condition is observed again; a matching
 * one-shot condition has already fired and completes immediately.
 */
function scheduleLoad(el: HTMLElement, name: string): void {
  const entry = manifest.get(name);
  if (!entry) {
    return;
  }

  const strategy = el.getAttribute(MOUNT_ATTRIBUTE) ?? entry.mountStrategy ?? 'eager';
  let pending = loaders.get(el);
  const current = pending?.get(name);
  if (current?.strategy === strategy) {
    return;
  }
  if (current) {
    disposeLoader(el, name);
    pending = loaders.get(el);
  }
  if (!pending) {
    pending = new Map();
    loaders.set(el, pending);
  }

  const controller: LoadController = { dispose() {}, strategy };
  pending.set(name, controller);

  let fired = false;
  let applied: AppliedMountStrategy | undefined;
  applied = applyMountStrategy(el, strategy, {
    mount: () => {
      if (fired) {
        return;
      }
      fired = true;
      disposeLoader(el, name);
      const work = importComponent(name, el);
      void work.then(() => completeOneShotLoad(el, name, strategy));
      // Only an eager trigger belongs to the settlement boundary, matching
      // the rule the registry already follows: `whenDOMSettled()` — and so
      // `swap()` — waits for an eager lazy component to be downloaded,
      // registered and mounted, and never waits on a viewport, an idle
      // callback, an interaction or a media query.
      if (applied?.eagerWork) {
        trackDOMLifecycleWork(work);
      }
    },
    destroy() {},
  });
  controller.dispose = applied.dispose;
  if (!applied.valid) {
    reportDiagnostic(
      DIAGNOSTICS.component.invalidMountStrategy,
      `Failed to apply mount strategy "${strategy}" to component "${name}".`,
      applied.error,
      { component: name, target: el },
    );
  }
  // `media:` evaluates synchronously, so the trigger may already have fired
  // against the no-op teardown installed above.
  if (fired) {
    applied.dispose();
  }
  trackDOMLifecycleWork(applied.eagerWork);
}

/**
 * Schedule one element/component pair down whichever half of the registry
 * holds the name: a class mounts, a lazy entry loads first.
 */
function scheduleFor(el: HTMLElement, name: string): void {
  const ComponentClass = registry.get(name);
  if (ComponentClass) {
    // The class arrived; this element no longer needs its import trigger.
    disposeLoader(el, name);
    schedule(el, name, ComponentClass);
  } else if (manifest.has(name)) {
    scheduleLoad(el, name);
  }
}

/**
 * Make the framework state on one connected element match its final
 * `data-component` token set.
 */
function reconcileElement(el: HTMLElement): void {
  checkResponsiveAttributes(el, [COMPONENT_ATTRIBUTE]);
  syncResponsiveElement(el);
  const tokens = componentTokens(el);
  const names = new Set<string>([
    ...(controllers.get(el)?.keys() ?? []),
    ...(loaders.get(el)?.keys() ?? []),
    ...(el.__base__?.keys() ?? []),
  ]);

  for (const name of names) {
    if (!tokens.has(name) && (registry.has(name) || manifest.has(name))) {
      disposeController(el, name);
      disposeLoader(el, name);
      // Removing a declaration while the element remains is final. Unlike a
      // disconnection, it removes the component identity from this element.
      el.__base__?.get(name)?.$terminate();
    }
  }

  for (const name of tokens) {
    scheduleFor(el, name);
  }
}

/**
 * Scan an inserted subtree once. Elements carrying retained instances are
 * included even when their declaration changed while detached.
 */
function scan(root: Node): void {
  if (!(root instanceof Element)) {
    return;
  }
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    if (hasComponentAttribute(el) || el.__base__ || controllers.has(el) || loaders.has(el)) {
      reconcileElement(el as HTMLElement);
    }
  }
}

/**
 * A newly registered name — a class or a lazy entry — only needs its own
 * token matches. This avoids a full document walk for every registration
 * while inserted subtrees still use the one-pass scanner above.
 */
function scanName(root: Element, name: string): void {
  const selector = selectorFor(name);
  const elements = root.matches(selector)
    ? [root, ...root.querySelectorAll<HTMLElement>(selector)]
    : [...root.querySelectorAll<HTMLElement>(selector)];
  for (const el of elements) {
    reconcileElement(el as HTMLElement);
  }
}

// Disconnection is a DOM fact, not an end of life: destroy (reversible)
// and keep the instance on its element — a re-inserted element remounts the
// same instance. A *move* produces a removal record and an addition record:
// the instance is destroyed then remounted (same identity, per-cycle state
// reset), matching the disconnectedCallback/connectedCallback pair custom
// elements get on moves — and both sides announce, so `$watchChildren` on
// the old and the new ancestor stay correct. When the element never comes
// back, element and instance are garbage-collected together. `$terminate()`
// stays an explicit, final call.
function destroyWithin(node: Node, snapshot?: readonly Element[]): void {
  if (!(node instanceof Element)) {
    return;
  }
  for (const el of snapshot ?? [node, ...node.querySelectorAll<HTMLElement>('*')]) {
    syncResponsiveElement(el as HTMLElement);
    const pairs = controllers.get(el);
    if (pairs) {
      for (const name of pairs.keys()) {
        disposeController(el, name);
      }
    }
    const pending = loaders.get(el);
    if (pending) {
      for (const name of pending.keys()) {
        disposeLoader(el, name);
      }
    }
    if (!el.__base__) {
      continue;
    }
    for (const instance of el.__base__.values()) {
      instance.$destroy();
    }
  }
}

function processMutations(records: readonly DOMMutationRecord[]): void {
  // Teardown first. A move must announce its old lifecycle end before the
  // same node mounts below its new ancestor. Removed subtree membership was
  // snapshotted at observer delivery, before this background task.
  for (const { record, removedSubtrees } of records) {
    if (record.type === 'childList') {
      for (const node of record.removedNodes) {
        destroyWithin(node, removedSubtrees.get(node));
      }
    }
  }

  const declarations = new Set<HTMLElement>();
  const strategies = new Set<HTMLElement>();
  const options = new Map<HTMLElement, Map<string, string | null>>();
  for (const { record } of records) {
    if (record.type !== 'attributes' || !(record.target instanceof HTMLElement)) {
      continue;
    }
    if (
      record.attributeName === COMPONENT_ATTRIBUTE ||
      record.attributeName?.startsWith(`${COMPONENT_ATTRIBUTE}:`)
    ) {
      declarations.add(record.target);
    } else if (record.attributeName === MOUNT_ATTRIBUTE) {
      strategies.add(record.target);
    } else if (record.attributeName?.startsWith('data-option-')) {
      let changes = options.get(record.target);
      if (!changes) {
        changes = new Map();
        options.set(record.target, changes);
      }
      // Mutation records carry each preceding value. Keeping the first one
      // and reading the final DOM below coalesces same-task writes.
      if (!changes.has(record.attributeName)) {
        changes.set(record.attributeName, record.oldValue);
      }
    }
  }

  // Reconcile once from final DOM state even when a morph changed the same
  // attribute several times in this observer batch.
  for (const el of declarations) {
    if (el.isConnected) {
      reconcileElement(el);
    }
  }
  for (const el of strategies) {
    if (el.isConnected && !declarations.has(el)) {
      reconcileElement(el);
    }
  }

  // Option effects only run on components which survived declaration
  // reconciliation and are mounted in this cycle. A waiting strategy reads
  // the final values when it eventually mounts.
  for (const [el, changes] of options) {
    if (!el.isConnected) {
      continue;
    }
    for (const instance of el.__base__?.values() ?? []) {
      if (instance.$isMounted) {
        // The batch goes over whole: which attribute belongs to which option,
        // and what an option's value was before the batch, are the reader's
        // questions — a responsive option answers from whichever
        // breakpoint-scoped spelling its cascade selects.
        instance.$optionsChanged(changes);
      }
    }
  }

  for (const { record } of records) {
    if (record.type === 'childList') {
      for (const node of record.addedNodes) {
        if (node.isConnected) {
          scan(node);
        }
      }
    }
  }
}
