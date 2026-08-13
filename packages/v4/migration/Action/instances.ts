import type { Base } from '../../src/index.js';

/**
 * The page-wide instance lookup `Action` needs and v4 does not have.
 *
 * ## The finding
 *
 * v3's `ActionEvent` imports `getInstances` from
 * `@studiometa/js-toolkit/getInstances`: a module-level `Set` that every
 * `Base` adds itself to **in its constructor** and removes itself from on
 * `$destroy()`. `Action` walks the whole set on every event to answer
 * "which components on this page are called `Dialog`?".
 *
 * **v4 exports no equivalent, and its registry has none to export.** The
 * registry's only map is `name → class` (`src/registry.ts`); instances live
 * on `el.__base__`, a `Map<string, Base>` per element, and nothing collects
 * them. That is deliberate — REPORT.md gap 7 recorded it when `Transition`'s
 * `group` option turned out to be unportable — but `Action` is the component
 * the absence actually blocks, because targeting *is* the component.
 *
 * ## Why no v4 idiom covers it
 *
 * - **`$query(name)`** is descendants of `this.$el`. An `Action` is a button;
 *   its targets are its siblings, its ancestors, or the far side of the page.
 *   Every documented example (`Dialog(#modal)->target.open()` on a toolbar
 *   button) is out of scope for it.
 * - **`$closest(name)`** is ancestors only, and one of them.
 * - **`$watchChildren(name)`** is `$query` plus announcements — same scope,
 *   and it needs a component to watch *from*. The page-wide case has no root
 *   `Base`, which is finding (3) of REPORT.md §5b arriving from a second
 *   family.
 * - **provide/inject** does not apply: a target is named at runtime by an
 *   arbitrary `config.name`, and unlike `Data`'s groups there is no owner to
 *   provide from. Every component on the page is a potential target.
 *
 * ## What the port does instead, and why it is not a downgrade
 *
 * A document-scoped `$query`: the registry's own selector, then `__base__`,
 * then a mounted check. Three differences against v3's `Set`, all of them
 * either neutral or favourable:
 *
 * 1. **Cost.** v3 iterated *every instance on the page* once per target part
 *    per event — `for (const instance of getInstances())` with the name test
 *    inside. This runs one native `querySelectorAll` per part, already
 *    narrowed by name. On a page with 400 components and a two-part target,
 *    that is 800 JavaScript comparisons against two selector matches. The
 *    missing registry costs nothing here; it is only *missing*.
 * 2. **Detached instances.** v3's set held instances whose element was never
 *    in the document — ui's own specs `new Target(h('div'))` then call
 *    `mount()`. v4 has no such state: an instance exists because the registry
 *    mounted it from the DOM. So the specs are adapted to real DOM, and
 *    nothing is lost.
 * 3. **Subclasses.** v3 compared `instance.__config.name` to the parsed name,
 *    so a `class Modal extends Dialog` with its own name never answered to
 *    `Dialog`. This matches on the same attribute token, so behaviour is
 *    identical — REPORT.md gap 18 (exact-name matching) is inherited, not
 *    introduced.
 *
 * ## What is actually borrowed
 *
 * `[data-component~="Name"]` is `src/utils/selectors.ts`'s `selectorFor()`,
 * which is internal and has no subpath. Copying it means ui hard-codes the
 * registry's attribute contract — the one thing here that is a real ask on
 * core. Same for `el.__base__`: it is declared on `HTMLElement` so it type-
 * checks, but `src/test-utils.ts` wraps it in a `getInstance()` helper marked
 * "not part of the public API", which is the admission that reading it
 * directly is not the intended path.
 */

/**
 * The registry's selector for a component name. Copy of the internal
 * `selectorFor()`; `~=` is what makes `data-component="Action Dialog"` two
 * declarations on one element.
 */
function selectorFor(name: string): string {
  return `[data-component~="${name}"]`;
}

/**
 * Every mounted instance of `name` in the document, in DOM order.
 *
 * Resolved on each call rather than cached: instances mount and unmount
 * freely, and a stale target list is the failure mode `Action` cannot have —
 * it would call a method on a destroyed component.
 */
export function getInstances<T extends Base = Base>(
  name: string,
  root: ParentNode = document,
): T[] {
  return [...root.querySelectorAll<HTMLElement>(selectorFor(name))]
    .map((el) => el.__base__?.get(name))
    .filter((instance): instance is T => Boolean(instance?.$isMounted));
}

/**
 * Every mounted instance sharing one element, by component name.
 *
 * This is the half of v3's lookup that v4 makes *cheaper*: `ActionEvent`'s
 * `instances` getter scanned the global set for `instance.$el === $el`, and
 * the answer was always sitting on the element.
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
