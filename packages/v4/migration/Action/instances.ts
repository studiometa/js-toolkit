import type { Base } from '../../src/index.js';

/**
 * What is left of the lookup this port had to write for itself.
 *
 * ## The finding, and its resolution
 *
 * v3's `ActionEvent` imports `getInstances` from
 * `@studiometa/js-toolkit/getInstances`: a module-level `Set` that every
 * `Base` joins **in its constructor**. `Action` walks it on every event to
 * answer "which components on this page are called `Dialog`?". v4 had no
 * equivalent and its registry had none to export — `$query` is descendants,
 * `$closest` is ancestors, `$watchChildren` is descendants and needs a
 * component to watch from, and provide/inject does not apply because a target
 * is named at runtime with no owner to provide from.
 *
 * The port carried a 21-line copy of that lookup. **Core closed it (REPORT.md
 * gap 20)**: `getInstances(name, root = document)` ships from the root barrel
 * and its own subpath, doing what the copy did — one `querySelectorAll` over
 * `selectorFor(name)`, filtered by `$isMounted` — and `ActionEvent` now
 * imports it. No registry was added, which was the recommendation: the
 * measurement is the argument against one, since a narrowed `querySelectorAll`
 * beats walking every instance on the page and cannot go stale.
 *
 * One correction to what this file used to claim: **`selectorFor()` was
 * already public**, exported from `src/utils/index.ts` with its own subpath.
 * Only the `el.__base__` read was ever missing, and that is what core's
 * function encapsulates.
 *
 * ## Why the file survives
 *
 * `getInstancesOn()` below has no core equivalent and does not want one. It
 * asks a different question — not "where on the page", but "what else is on
 * *this* element" — and the answer is a plain read of `el.__base__`, which is
 * declared on `HTMLElement` and needs no lookup at all.
 */

/**
 * Every mounted instance sharing one element, by component name.
 *
 * This is the half of v3's lookup that v4 makes *cheaper*: `ActionEvent`'s
 * `instances` getter scanned the global set for `instance.$el === $el`, and
 * the answer was always sitting on the element. It is what makes
 * `data-component="Action Dialog"` with `data-on:cancel="Dialog.close()"`
 * resolve `Dialog` — the co-located instances become named parameters of the
 * compiled effect.
 */
export function getInstancesOn(el: HTMLElement): Map<string, Base> {
  const instances = new Map<string, Base>();
  for (const [name, instance] of el.__base__ ?? []) {
    if (instance.$isMounted) {
      instances.set(name, instance);
    }
  }
  return instances;
}
