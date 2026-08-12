import { Base, type BaseConstructor } from './Base.js';
import { setDOMMutationProcessor, trackDOMLifecycleWork } from './dom-mutations.js';
import { applyMountStrategy, MOUNT_ATTRIBUTE, type MountStrategy } from './mount-strategies.js';
import { selectorFor } from './utils.js';

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

  setDOMMutationProcessor(processMutations);
  scanRegisteredName(document.documentElement, name);
}

export function registerComponents(...classes: BaseConstructor[]): void {
  for (const ComponentClass of classes) {
    registerComponent(ComponentClass);
  }
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
function mountPair(
  el: HTMLElement,
  name: string,
  ComponentClass: BaseConstructor,
  controller: PairController,
): void {
  if (
    !controller.active ||
    controllers.get(el)?.get(name) !== controller ||
    !el.isConnected ||
    !declaresComponent(el, name) ||
    resolveStrategy(el, ComponentClass) !== controller.strategy
  ) {
    return;
  }
  const instance = el.__base__?.get(name) ?? new ComponentClass(el);
  instance.$mount();
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
    destroy: () => el.__base__?.get(name)?.$destroy(),
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
function destroyWithin(node: Node): void {
  if (!(node instanceof Element)) {
    return;
  }
  for (const el of [node, ...node.querySelectorAll<HTMLElement>('*')]) {
    const pairs = controllers.get(el);
    if (pairs) {
      for (const name of [...pairs.keys()]) {
        disposeController(el, name);
      }
    }
    if (!el.__base__) {
      continue;
    }
    for (const instance of [...el.__base__.values()]) {
      instance.$destroy();
    }
  }

  // A moved element is connected again by the time the observer delivers
  // its records. Hand it back after teardown so the move ends as destroy +
  // remount rather than being mistaken for an unchanged connected node.
  if (node.isConnected) {
    scan(node);
  }
}

function processMutations(records: readonly MutationRecord[]): void {
  // Teardown first. A move must announce its old lifecycle end before the
  // same node mounts below its new ancestor.
  for (const record of records) {
    if (record.type === 'childList') {
      for (const node of record.removedNodes) {
        destroyWithin(node);
      }
    }
  }

  const declarations = new Set<HTMLElement>();
  const strategies = new Set<HTMLElement>();
  for (const record of records) {
    if (record.type !== 'attributes' || !(record.target instanceof HTMLElement)) {
      continue;
    }
    if (record.attributeName === 'data-component') {
      declarations.add(record.target);
    } else if (record.attributeName === MOUNT_ATTRIBUTE) {
      strategies.add(record.target);
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

  for (const record of records) {
    if (record.type === 'childList') {
      for (const node of record.addedNodes) {
        if (node.isConnected) {
          scan(node);
        }
      }
    }
  }
}
