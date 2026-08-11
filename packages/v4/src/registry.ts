import { Base, type BaseConstructor } from './Base.js';
import { applyMountStrategy, MOUNT_ATTRIBUTE, type MountStrategy } from './mount-strategies.js';
import { scheduler } from './scheduler.js';
import { selectorFor } from './utils.js';

const registry = new Map<string, BaseConstructor>();
let observer: MutationObserver | null = null;

/**
 * Teardown for the mount strategy watching each element/component pair.
 * Its presence also marks the pair as already scheduled, so re-scanning an
 * element never observes it twice.
 */
const pending = new WeakMap<Element, Map<string, () => void>>();

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

  observe();
  scan(document.documentElement, name);
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
function mountPair(el: HTMLElement, name: string, ComponentClass: BaseConstructor): void {
  if (!el.isConnected) {
    return;
  }
  const instance = el.__base__?.get(name) ?? new ComponentClass(el);
  instance.$mount();
}

function schedule(el: HTMLElement, name: string, ComponentClass: BaseConstructor): void {
  let controllers = pending.get(el);
  if (!controllers) {
    controllers = new Map();
    pending.set(el, controllers);
  }
  if (controllers.has(name)) {
    return;
  }
  const dispose = applyMountStrategy(el, resolveStrategy(el, ComponentClass), {
    mount: () => mountPair(el, name, ComponentClass),
    destroy: () => el.__base__?.get(name)?.$destroy(),
  });
  controllers.set(name, dispose);
}

function scan(root: Node, onlyName: string | null = null): void {
  if (!(root instanceof Element)) {
    return;
  }
  for (const [name, ComponentClass] of registry) {
    if (onlyName && name !== onlyName) {
      continue;
    }
    const selector = selectorFor(name);
    const elements = root.matches(selector)
      ? [root, ...root.querySelectorAll(selector)]
      : [...root.querySelectorAll(selector)];
    for (const el of elements) {
      schedule(el as HTMLElement, name, ComponentClass);
    }
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
  for (const el of [node, ...node.querySelectorAll('*')]) {
    // Stop watching: a strategy must not mount an element that left the
    // document, and a re-inserted one is scheduled afresh by `scan()`.
    const controllers = pending.get(el);
    if (controllers) {
      for (const dispose of controllers.values()) {
        dispose();
      }
      pending.delete(el);
    }
    if (!el.__base__) {
      continue;
    }
    // Snapshot: terminating an instance removes it from the element's map.
    // oxlint-disable-next-line no-useless-spread
    for (const instance of [...el.__base__.values()]) {
      instance.$destroy();
    }
  }

  // A moved element is back in the document by the time this runs — the
  // addition record was scanned while its old strategy was still pending,
  // and skipped. Schedule it again now that the teardown is done, so the
  // move ends as destroy + remount rather than as a removal.
  if (node.isConnected) {
    scan(node);
  }
}

function observe(): void {
  if (observer) {
    return;
  }
  observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        scan(node);
      }
      for (const node of record.removedNodes) {
        scheduler.background(() => destroyWithin(node));
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
