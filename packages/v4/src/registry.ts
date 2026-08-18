import {
  declaresBoolean,
  resolveConfig,
  type BaseConstructor,
  type ComponentImporter,
} from './Base.js';
import {
  COMPONENT_ATTRIBUTE,
  isComponentAttribute,
  isOptionAttribute,
  MOUNT_ATTRIBUTE,
  negatedOptionAttributeFor,
  optionAttributeFor,
  rememberPreviousValue,
} from './attributes.js';
import { isBaseConstructor } from './component-brand.js';
import {
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
  mountStrategyBehaviour,
  type MountStrategy,
  type MountStrategyHooks,
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

// Register exact responsive component attribute names with the shared observer filter.
observeResponsiveAttribute(COMPONENT_ATTRIBUTE);

export type { ComponentImporter };

/** A lazy component importer and its optional pre-load mount strategy. */
export interface ComponentManifestEntry {
  load: ComponentImporter;
  mountStrategy?: MountStrategy;
}

/** `data-component` tokens mapped to the lazy entry which resolves them. */
export type ComponentManifest = Record<string, ComponentImporter | ComponentManifestEntry>;

/**
 * The half of the registry which answers for a name. A class mounts on its
 * strategy; an entry imports on the same one, then registers a class.
 */
type ComponentSource = BaseConstructor | ComponentManifestEntry;

/**
 * A controller's lifetime.
 *
 * `live` is the pair's current decision. A spent controller is an import
 * trigger which has fired: it stays in the map as the memory that its
 * condition was satisfied, so the controller replacing it once the class
 * lands does not wait for the very same condition a second time. `disposed`
 * is set before teardown, so a callback a strategy already queued cannot act
 * through a controller which is gone.
 */
type PairState = 'live' | 'spent' | 'disposed';

/**
 * One element/component pair, scheduled once whichever half of the registry
 * owns its name. The hooks handed to the strategy either mount the class or
 * import the module; everything else — precedence, replacement, teardown,
 * settlement — is the same algorithm.
 */
interface PairController {
  dispose(): void;
  /** DOM settlement waits for an eager mount or import, never for a condition. */
  eager: boolean;
  source: ComponentSource;
  state: PairState;
  strategy: string;
}

interface RegistryRuntimeState {
  registry: Map<string, BaseConstructor>;
  controllers: WeakMap<Element, Map<string, PairController>>;
  manifest: Map<string, ComponentManifestEntry>;
  imports: Map<string, Promise<void>>;
  responsiveElements: Set<HTMLElement>;
  unwatchBreakpoints: (() => void) | null;
  responsiveTask: ScheduledTask<void> | null;
  pendingResponsiveElements: Set<HTMLElement>;
  isReplacementListenerAttached: boolean;
}

// Revision 2: both halves share one controller map, so a copy still keeping
// its import triggers in a second one cannot share this layout.
const registryState = /* @__PURE__ */ getSharedRuntimeSlot<RegistryRuntimeState>(
  'registry',
  2,
  () => ({
    registry: new Map(),
    controllers: new WeakMap(),
    manifest: new Map(),
    imports: new Map(),
    responsiveElements: new Set(),
    unwatchBreakpoints: null,
    responsiveTask: null,
    pendingResponsiveElements: new Set(),
    isReplacementListenerAttached: false,
  }),
);
const { registry, controllers, manifest, imports, responsiveElements } = registryState;

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
  const names: string[] = [];
  const options = Object.entries(resolveConfig(ComponentClass).options ?? {});
  const declaredAttributes = new Set(options.map(([name]) => optionAttributeFor(name)));

  for (const [name, definition] of options) {
    const attribute = optionAttributeFor(name);
    names.push(attribute);
    // Register each exact breakpoint-scoped spelling with the observer filter.
    observeResponsiveAttribute(attribute);

    // Only a boolean can be turned off by a bare attribute, so only a boolean
    // costs the observer its negated spellings — and never one another option
    // already declares, which `buildOptions()` reports and refuses.
    const negated = negatedOptionAttributeFor(name);
    if (declaresBoolean(definition) && !declaredAttributes.has(negated)) {
      names.push(negated);
      observeResponsiveAttribute(negated);
    }
  }

  return names;
}

/**
 * Resolve strategy precedence: element, then the default declared by whichever
 * half of the registry owns the name, then `eager`. A manifest entry states one
 * for exactly as long as its class cannot be read.
 */
function resolveStrategy(el: Element, source: ComponentSource): string {
  const declared = isBaseConstructor(source)
    ? resolveConfig(source).mountStrategy
    : source.mountStrategy;
  return el.getAttribute(MOUNT_ATTRIBUTE) ?? declared ?? 'eager';
}

/**
 * The instance is created on first mount, not on discovery: a component
 * waiting for its strategy has no instance yet, so it stays invisible to
 * `$query`, `$closest` and `$watchChildren`, and announces nothing.
 */
function isCurrentPair(el: HTMLElement, name: string, controller: PairController): boolean {
  return (
    controller.state === 'live' &&
    controllers.get(el)?.get(name) === controller &&
    el.isConnected &&
    declaresComponent(el, name) &&
    resolveStrategy(el, controller.source) === controller.strategy
  );
}

function mountPair(
  el: HTMLElement,
  name: string,
  ComponentClass: BaseConstructor,
  controller: PairController,
): void {
  if (!isCurrentPair(el, name, controller)) {
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

function destroyPair(el: HTMLElement, name: string, controller: PairController): void {
  if (isCurrentPair(el, name, controller)) {
    el[INSTANCES]?.get(name)?.$destroy();
  }
}

/**
 * Import the class a lazy declaration names, once.
 *
 * Importing is one-shot even on a reversible strategy, so the controller
 * stands down here instead of tearing its own trigger down: `media:` fires
 * while `applyMountStrategy()` is still running, when no teardown exists yet.
 * A spent controller fails `isCurrentPair()`, which is what makes a second
 * trigger inert, and the controller replacing it disposes the strategy.
 */
function importPair(el: HTMLElement, name: string, controller: PairController): void {
  if (!isCurrentPair(el, name, controller)) {
    return;
  }
  controller.state = 'spent';
  const work = importComponent(name, el);
  if (controller.eager) {
    // DOM settlement tracks eager imports only; conditional triggers can remain pending.
    trackDOMLifecycleWork(work);
  }
}

/** The hooks a strategy drives: mount a class, or import the module naming one. */
function hooksFor(el: HTMLElement, name: string, controller: PairController): MountStrategyHooks {
  const { source } = controller;
  if (isBaseConstructor(source)) {
    return {
      mount: () => mountPair(el, name, source, controller),
      destroy: () => destroyPair(el, name, controller),
    };
  }
  return { mount: () => importPair(el, name, controller), destroy() {} };
}

function disposeController(el: Element, name: string): void {
  const pairs = controllers.get(el);
  const controller = pairs?.get(name);
  if (!controller) {
    return;
  }
  controller.state = 'disposed';
  controller.dispose();
  pairs?.delete(name);
  if (pairs?.size === 0) {
    controllers.delete(el);
  }
}

/**
 * Schedule one element/component pair on the strategy that element resolves
 * to, whichever half of the registry answers for the name.
 *
 * A controller is replaced when the strategy changes and when the source
 * does — which is how an import lands: `registerComponent()` swaps the entry
 * for the class, and this pass turns the spent import trigger into a mount
 * controller for the same pair.
 */
function schedule(el: HTMLElement, name: string): void {
  const source = registry.get(name) ?? manifest.get(name);
  if (!source) {
    return;
  }

  const strategy = resolveStrategy(el, source);
  let pairs = controllers.get(el);
  const previous = pairs?.get(name);
  if (previous?.strategy === strategy && previous.source === source) {
    return;
  }
  // Read before teardown, which marks the controller disposed: a spent
  // trigger on this very strategy is a condition already satisfied.
  const wasSatisfied = previous?.state === 'spent' && previous.strategy === strategy;
  if (previous) {
    disposeController(el, name);
  }

  pairs = controllers.get(el);
  if (!pairs) {
    pairs = new Map();
    controllers.set(el, pairs);
  }

  const { eager, reversible } = mountStrategyBehaviour(strategy);
  const controller: PairController = {
    dispose() {},
    eager,
    source,
    state: 'live',
    strategy,
  };
  pairs.set(name, controller);
  const applied = applyMountStrategy(el, strategy, hooksFor(el, name, controller));
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

  // The class this pair just received is here because its own trigger fired.
  // A one-shot condition cannot fire twice, so waiting for it again would
  // leave the component unmounted forever; the import is the proof it was
  // satisfied. A reversible condition is simply observed again.
  if (wasSatisfied && !reversible && isBaseConstructor(source)) {
    controller.dispose();
    mountPair(el, name, source, controller);
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
    ...(el[INSTANCES]?.keys() ?? []),
  ]);

  for (const name of names) {
    if (!tokens.has(name) && (registry.has(name) || manifest.has(name))) {
      disposeController(el, name);
      // Removing a declaration while the element remains is final. Unlike a
      // disconnection, it removes the component identity from this element.
      el[INSTANCES]?.get(name)?.$terminate();
    }
  }

  for (const name of tokens) {
    schedule(el, name);
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
    if (hasComponentAttribute(el) || el[INSTANCES] || controllers.has(el)) {
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
    if (isComponentAttribute(record.attributeName)) {
      declarations.add(record.target);
    } else if (record.attributeName === MOUNT_ATTRIBUTE) {
      strategies.add(record.target);
    } else if (isOptionAttribute(record.attributeName)) {
      let changes = options.get(record.target);
      if (!changes) {
        changes = new Map();
        options.set(record.target, changes);
      }
      // Mutation records carry each preceding value; the batch is applied
      // against the final DOM, so only the first one is kept.
      rememberPreviousValue(changes, record.attributeName, record.oldValue);
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
