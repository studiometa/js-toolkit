import { resolveConfig, type BaseConstructor, type ComponentImporter } from './Base.js';
import { isBaseConstructor } from './component-brand.js';
import {
  COMPONENT_ATTRIBUTE,
  componentTokens,
  hasComponentAttribute,
  hasResponsiveComponentAttribute,
} from './component-declarations.js';
import { reportDiagnostic, warnOnce } from './diagnostics.js';
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
import { INSTANCES } from './protocol-symbols.js';
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

// Register exact responsive component attribute names with the shared observer filter.
observeResponsiveAttribute(COMPONENT_ATTRIBUTE);

interface PairController {
  active: boolean;
  dispose(): void;
  strategy: string;
}

export type { ComponentImporter };

/** A lazy component importer and its optional pre-load mount strategy. */
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

/** Distinguish an unbranded class from a callable importer. */
function isClassLike(value: (...args: never[]) => unknown): boolean {
  return Object.getOwnPropertyDescriptor(value, 'prototype')?.writable === false;
}

/** Register classes and lazy importers from the merged `config.components`. */
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
        'component.invalid-family-declaration',
        `"${name}" declares "${childName}" as neither a component class nor an importer; the declaration was ignored.`,
        { component: name },
      );
    }
  }
}

/** Register a lazy child without loading it. The first declaration wins. */
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

/** Coalesce responsive reconciliation in the background lifecycle queue. */
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
 * Register a component and its merged family, then scan matching elements.
 *
 * The name comes from the merged config, like the instance's `$id` and the
 * `INSTANCES` map key it publishes itself under: a subclass which extends a
 * component with extra config and forgets to rename would otherwise register
 * under `undefined` instead of colliding with the name it inherited.
 */
export function registerComponent(ComponentClass: BaseConstructor): void {
  const { name } = resolveConfig(ComponentClass);
  if (registry.has(name)) {
    if (registry.get(name) !== ComponentClass) {
      warnOnce(
        ComponentClass,
        name,
        'registry.conflict',
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
 * Register lazy component entries. Element `data-mount` overrides the entry strategy; unloaded components have no instance.
 */
export function registerManifest(entries: ComponentManifest): void {
  const added: string[] = [];

  for (const [name, entry] of Object.entries(entries)) {
    if (registry.has(name) || manifest.has(name)) {
      warnOnce(
        entries,
        name,
        'registry.conflict',
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

/** Import and register a lazy entry once per name. Failed imports are not retried. */
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
      const resolvedName = resolveConfig(ComponentClass).name;
      if (resolvedName !== name) {
        warnOnce(
          entry.load,
          name,
          'registry.lazy-name-mismatch',
          `"${name}" resolved to a component named "${resolvedName}".`,
          { component: name, target },
        );
      }
      manifest.delete(name);
      registerComponent(ComponentClass);
    })
    .catch((error: unknown) => {
      reportDiagnostic('component.load-failed', `Failed to load component "${name}".`, error, {
        component: name,
        target,
      });
    });

  imports.set(name, work);
  return work;
}

/** Resolve a component class from a direct value, named export, or default export. */
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
      // Register each exact breakpoint-scoped spelling with the observer filter.
      observeResponsiveAttribute(attribute);
    }
    current = Object.getPrototypeOf(current) as BaseConstructor | null;
  }
  return [...names];
}

/** Resolve strategy precedence: element, merged component config, then `eager`. */
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
  let instance = el[INSTANCES]?.get(name);
  try {
    if (!instance) {
      instance = new ComponentClass(el);
    }
    instance.$mount();
  } catch (error) {
    // A failed derived constructor can leave the instance published by `Base`.
    if (!instance) {
      el[INSTANCES]?.delete(name);
    }
    reportDiagnostic('component.mount-failed', `Failed to mount component "${name}".`, error, {
      component: name,
      target: el,
    });
  }
}

function destroyPair(
  el: HTMLElement,
  name: string,
  ComponentClass: BaseConstructor,
  controller: PairController,
): void {
  if (isCurrentPair(el, name, ComponentClass, controller)) {
    el[INSTANCES]?.get(name)?.$destroy();
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
      'component.invalid-mount-strategy',
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
      // DOM settlement tracks eager imports only; conditional triggers can remain pending.
      if (applied?.eagerWork) {
        trackDOMLifecycleWork(work);
      }
    },
    destroy() {},
  });
  controller.dispose = applied.dispose;
  if (!applied.valid) {
    reportDiagnostic(
      'component.invalid-mount-strategy',
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
    ...(el[INSTANCES]?.keys() ?? []),
  ]);

  for (const name of names) {
    if (!tokens.has(name) && (registry.has(name) || manifest.has(name))) {
      disposeController(el, name);
      disposeLoader(el, name);
      // Removing a declaration while the element remains is final. Unlike a
      // disconnection, it removes the component identity from this element.
      el[INSTANCES]?.get(name)?.$terminate();
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
    if (hasComponentAttribute(el) || el[INSTANCES] || controllers.has(el) || loaders.has(el)) {
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

// Disconnection destroys an instance reversibly. Re-insertion remounts the same instance.
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
    if (!el[INSTANCES]) {
      continue;
    }
    for (const instance of el[INSTANCES].values()) {
      instance.$destroy();
    }
  }
}

/** The attribute mutations of one batch, sorted by what they affect. */
interface AttributeChanges {
  declarations: Set<HTMLElement>;
  strategies: Set<HTMLElement>;
  options: Map<HTMLElement, Map<string, string | null>>;
}

function destroyRemovedSubtrees(records: readonly DOMMutationRecord[]): void {
  for (const { record, removedSubtrees } of records) {
    if (record.type === 'childList') {
      for (const node of record.removedNodes) {
        destroyWithin(node, removedSubtrees.get(node));
      }
    }
  }
}

function collectAttributeChanges(records: readonly DOMMutationRecord[]): AttributeChanges {
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
      // and reading the final DOM when the batch is applied coalesces
      // same-task writes.
      if (!changes.has(record.attributeName)) {
        changes.set(record.attributeName, record.oldValue);
      }
    }
  }
  return { declarations, strategies, options };
}

function reconcileChangedElements({ declarations, strategies }: AttributeChanges): void {
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
}

function applyOptionChanges({ options }: AttributeChanges): void {
  for (const [el, changes] of options) {
    if (!el.isConnected) {
      continue;
    }
    for (const instance of el[INSTANCES]?.values() ?? []) {
      if (instance.$isMounted) {
        // Pass the full batch so responsive options can resolve previous values.
        instance.$optionsChanged(changes);
      }
    }
  }
}

function scanAddedNodes(records: readonly DOMMutationRecord[]): void {
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

function processMutations(records: readonly DOMMutationRecord[]): void {
  // Teardown must finish before a moved node mounts under its new ancestor.
  destroyRemovedSubtrees(records);
  // Every attribute of the batch is collected before any of them is applied,
  // so an element touched several times reconciles once, from final DOM state.
  const changes = collectAttributeChanges(records);
  reconcileChangedElements(changes);
  // Option effects only run on components which survived declaration
  // reconciliation and are mounted in this cycle. A waiting strategy reads
  // the final values when it eventually mounts.
  applyOptionChanges(changes);
  // Insertions come last: a node moved within this batch was torn down above
  // and mounts here, under the ancestor it ended up in.
  scanAddedNodes(records);
}
