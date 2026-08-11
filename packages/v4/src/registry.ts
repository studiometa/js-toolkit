import { Base, type BaseConstructor } from './Base.js';
import { scheduler } from './scheduler.js';
import { selectorFor } from './utils.js';

const registry = new Map<string, BaseConstructor>();
let observer: MutationObserver | null = null;

/**
 * Register a component class. Existing matching elements mount right away
 * (through the scheduler's background lane); future ones mount when they
 * enter the DOM. Classes declared in `config.components` register too.
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
      scheduler.background(() => {
        if (!el.isConnected) {
          return;
        }
        const instance = el.__base__?.get(name) ?? new ComponentClass(el as HTMLElement);
        instance.$mount();
      });
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
    if (!el.__base__) {
      continue;
    }
    // Snapshot: terminating an instance removes it from the element's map.
    // oxlint-disable-next-line no-useless-spread
    for (const instance of [...el.__base__.values()]) {
      instance.$destroy();
    }
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
