import type { Base } from '../../src/index.js';

/** Every mounted instance sharing an element, keyed by component name. */
export function getInstancesOn(el: HTMLElement): Map<string, Base> {
  const instances = new Map<string, Base>();
  for (const [name, instance] of el.__base__ ?? []) {
    if (instance.$isMounted) {
      instances.set(name, instance);
    }
  }
  return instances;
}
