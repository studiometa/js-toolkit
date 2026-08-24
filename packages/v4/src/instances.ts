import { INSTANCES } from './protocol-symbols.js';
import { selectorFor } from './utils/selectors.js';
import type { Base } from './Base.js';

/**
 * The one traversal behind the three plural lookups.
 *
 * Written once rather than three times, because the traversal is the part
 * with the invariants — DOM order for a name, mount order for an element, the
 * instance-map read in between — and the three exports differ only in which
 * instances they keep. `accept` is that difference and nothing else.
 *
 * The string form narrows twice before `accept` ever runs.
 * {@link selectorFor} over-matches on purpose: it lists the responsive
 * spellings of `data-component` as well as the plain one, so an element that
 * declares a name only above a breakpoint is still a candidate. The
 * `INSTANCES` read is what removes it, because a declaration that is not
 * currently active has no instance — the registry destroys a
 * breakpoint-withdrawn one *and* deletes it from the map. So the map read,
 * not `accept`, is what keeps an inactive declaration out of every result.
 */
function collect<T extends Base>(
  target: string | Element,
  root: ParentNode,
  accept: (instance: Base) => boolean,
): T[] {
  if (typeof target !== 'string') {
    return [...(target[INSTANCES]?.values() ?? [])].filter(accept) as T[];
  }

  const instances: T[] = [];
  for (const el of root.querySelectorAll(selectorFor(target))) {
    const instance = el[INSTANCES]?.get(target);
    if (instance && accept(instance)) {
      instances.push(instance as T);
    }
  }
  return instances;
}

/**
 * Every instance built for a component name, in DOM order, mounted or not.
 *
 * The search covers the descendants of `root` and never `root` itself, since
 * it is a `querySelectorAll`. A **detached** element is therefore unreachable
 * by this form even though it still carries its instance — pass the element
 * to the overload below, or pass its detached root as `root`.
 */
export function getInstances<T extends Base = Base>(name: string, root?: ParentNode): T[];
/**
 * Every instance on one element, in mount order, mounted or not.
 *
 * The element form is the reason this overload exists rather than a second
 * export: both answer "which instances are there", and the argument picks the
 * scope. It also keeps the `INSTANCES` read in one place, which matters more
 * now that the key is a symbol and no longer spellable as `el.__base__`.
 *
 * Unlike the string form it does not consult the DOM, so it answers for a
 * detached element as readily as for a connected one.
 */
export function getInstances<T extends Base = Base>(el: Element): T[];
export function getInstances<T extends Base = Base>(
  target: string | Element,
  root: ParentNode = document,
): T[] {
  return collect<T>(target, root, () => true);
}

/**
 * The live instances of a component name, in DOM order.
 *
 * This is the safe list to call a method on: every instance in it has run
 * `mounted()` and has not yet run `unmounted()`. Prefer it over
 * {@link getInstances} whenever the result is going to be *used* rather than
 * counted or inspected.
 *
 * Scoping and the detached-element blind spot are {@link getInstances}'.
 */
export function getMountedInstances<T extends Base = Base>(name: string, root?: ParentNode): T[];
/** The live instances on one element, in mount order. Works when detached. */
export function getMountedInstances<T extends Base = Base>(el: Element): T[];
export function getMountedInstances<T extends Base = Base>(
  target: string | Element,
  root: ParentNode = document,
): T[] {
  return collect<T>(target, root, (instance) => instance.$isMounted);
}

/**
 * The instances of a component name that were built and are not mounted, in
 * DOM order.
 *
 * This population is small and specific. It is what a **reversible** mount
 * strategy leaves behind: `in-view` and `media:` unmount their instance when
 * the condition stops holding and keep it for the crossing back, so the
 * instance stays in the element's map with `$isMounted === false`. A
 * constructor that succeeded before a failing `mounted()` lands here too.
 *
 * What is *not* here: a declaration whose class never arrived, and a
 * declaration withdrawn by a breakpoint. Neither has an instance at all.
 *
 * Scoping and the detached-element blind spot are {@link getInstances}'.
 */
export function getUnmountedInstances<T extends Base = Base>(name: string, root?: ParentNode): T[];
/** The built-but-unmounted instances on one element, in mount order. */
export function getUnmountedInstances<T extends Base = Base>(el: Element): T[];
export function getUnmountedInstances<T extends Base = Base>(
  target: string | Element,
  root: ParentNode = document,
): T[] {
  return collect<T>(target, root, (instance) => !instance.$isMounted);
}

/**
 * The instance of `name` on `el`, mounted or not.
 *
 * One map read and no scan, which is why it is a function of its own rather
 * than a filter over {@link getInstances}: the caller already holds the
 * element and the name, so there is nothing left to search. It is also the
 * answer to "is this element's instance there yet", which every plural form
 * loses by returning a list.
 *
 * There is deliberately no `getMountedInstance`. The result is one object, so
 * a caller who needs the live one reads `.$isMounted` on it — a second export
 * would only hide that check behind a `undefined` that means two things.
 */
export function getInstance<T extends Base = Base>(el: Element, name: string): T | undefined {
  return el[INSTANCES]?.get(name) as T | undefined;
}
