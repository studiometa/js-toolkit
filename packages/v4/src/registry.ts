import { Base, type BaseConstructor } from './Base.js';
import {
  registerDOMOptionAttributes,
  setDOMMutationProcessor,
  trackDOMLifecycleWork,
  type DOMMutationRecord,
} from './dom-mutations.js';
import { applyMountStrategy, MOUNT_ATTRIBUTE, type MountStrategy } from './mount-strategies.js';
import { selectorFor } from './utils/selectors.js';
import { kebabCase } from './utils/strings.js';

const registry = new Map<string, BaseConstructor>();

interface PairController {
  active: boolean;
  dispose(): void;
  strategy: MountStrategy;
}

/**
 * Teardown for the mount strategy watching each element/component pair.
 * Its presence also marks the pair as already scheduled, so re-scanning an
 * element never observes it twice.
 */
const controllers = new WeakMap<Element, Map<string, PairController>>();

function componentTokens(el: Element): Set<string> {
  return new Set((el.getAttribute('data-component') ?? '').split(/\s+/).filter(Boolean));
}

function declaresComponent(el: Element, name: string): boolean {
  return componentTokens(el).has(name);
}

/**
 * Register a component class. Existing matching elements are scheduled
 * right away; future ones are scheduled when they enter the DOM. When each
 * instance actually mounts is the strategy's call — see `data-mount`.
 * Classes declared in `config.components` register too.
 */
export function registerComponent(ComponentClass: BaseConstructor): void {
  const { name } = ComponentClass.config;
  if (registry.has(name)) {
    if (registry.get(name) !== ComponentClass) {
      console.warn(`[registry] "${name}" is already registered, ignoring.`);
    }
    return;
  }
  registry.set(name, ComponentClass);

  for (const Child of Object.values(ComponentClass.config.components ?? {})) {
    if (Child === Base || Child.prototype instanceof Base) {
      registerComponent(Child);
    }
  }

  registerDOMOptionAttributes(optionAttributes(ComponentClass));
  setDOMMutationProcessor(processMutations);
  scanRegisteredName(document.documentElement, name);
}

export function registerComponents(...classes: BaseConstructor[]): void {
  for (const ComponentClass of classes) {
    registerComponent(ComponentClass);
  }
}

function optionAttributes(ComponentClass: BaseConstructor): string[] {
  const names = new Set<string>();
  let current: BaseConstructor | null = ComponentClass;
  while (current?.config) {
    for (const name of Object.keys(current.config.options ?? {})) {
      names.add(`data-option-${kebabCase(name)}`);
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
 */
function resolveStrategy(el: Element, ComponentClass: BaseConstructor): MountStrategy {
  return (
    (el.getAttribute(MOUNT_ATTRIBUTE) as MountStrategy | null) ??
    ComponentClass.config.mountStrategy ??
    'eager'
  );
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
  try {
    const instance = el.__base__?.get(name) ?? new ComponentClass(el);
    instance.$mount();
  } catch (error) {
    console.error(`[registry] Failed to mount "${name}":`, error);
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
  trackDOMLifecycleWork(applied.eagerWork);
}

/**
 * Make the framework state on one connected element match its final
 * `data-component` token set.
 */
function reconcileElement(el: HTMLElement): void {
  const tokens = componentTokens(el);
  const names = new Set<string>([
    ...(controllers.get(el)?.keys() ?? []),
    ...(el.__base__?.keys() ?? []),
  ]);

  for (const name of names) {
    if (!tokens.has(name) && registry.has(name)) {
      disposeController(el, name);
      // Removing a declaration while the element remains is final. Unlike a
      // disconnection, it removes the component identity from this element.
      el.__base__?.get(name)?.$terminate();
    }
  }

  for (const name of tokens) {
    const ComponentClass = registry.get(name);
    if (ComponentClass) {
      schedule(el, name, ComponentClass);
    }
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
    if (el.hasAttribute('data-component') || el.__base__ || controllers.has(el)) {
      reconcileElement(el as HTMLElement);
    }
  }
}

/**
 * A newly registered class only needs its own token matches. This avoids a
 * full document walk for every registration while inserted subtrees still
 * use the one-pass scanner above.
 */
function scanRegisteredName(root: Element, name: string): void {
  const selector = selectorFor(name);
  const elements = root.matches(selector)
    ? [root, ...root.querySelectorAll<HTMLElement>(selector)]
    : [...root.querySelectorAll<HTMLElement>(selector)];
  const ComponentClass = registry.get(name);
  if (!ComponentClass) {
    return;
  }
  for (const el of elements) {
    schedule(el as HTMLElement, name, ComponentClass);
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
    const pairs = controllers.get(el);
    if (pairs) {
      for (const name of pairs.keys()) {
        disposeController(el, name);
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
    if (record.attributeName === 'data-component') {
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
      if (!instance.$isMounted) {
        continue;
      }
      for (const name of Object.keys(instance.$config.options ?? {})) {
        const attribute = `data-option-${kebabCase(name)}`;
        if (changes.has(attribute)) {
          const previousRawValue = changes.get(attribute) ?? null;
          if (el.getAttribute(attribute) !== previousRawValue) {
            instance.$optionChanged(name, previousRawValue);
          }
        }
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
