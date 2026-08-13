/**
 * Resolving components by name from outside a component.
 *
 * `$query` walks descendants, `$closest` walks ancestors, `$watchChildren`
 * needs a component to watch from — and the page-wide case has no root `Base`
 * to start from. This is that case, and nothing more.
 *
 * It is deliberately **not** an instance registry. The core model says the DOM
 * is the component tree, so the answer is re-derived from the DOM on each call:
 * a `querySelectorAll` narrowed by name is measurably faster than walking every
 * instance on the page, and it cannot go stale. A registry would be a second
 * source of truth for something the document already knows.
 *
 * It is also not a selector-strategy seam. v4 resolves components through
 * `data-component` alone — no tag matching, no arbitrary selectors, no custom
 * elements — so name → selector is the only lookup shape there will ever be,
 * and `selectorFor()` is the one place that contract is spelled.
 */
import { selectorFor } from './utils/selectors.js';
import type { Base } from './Base.js';

/**
 * Mounted instances of a component name, in DOM order.
 *
 * The page-wide sibling of `$query()`, and it agrees with it on all three
 * judgement calls a lookup has to make:
 *
 * - **An element with no instance is skipped.** A declaration is an intent, not
 *   an instance: an unregistered name never gets one, and a `data-mount`
 *   strategy still waiting has none yet. Returning a hole for either would make
 *   every caller filter, and `Element | Base` is not a useful return type.
 * - **A destroyed or terminated instance is not returned.** The predicate is
 *   `$isMounted`, the same one `$query()`, `$closest()` and `$watchChildren()`
 *   use, and it covers both: `$terminate()` destroys first (clearing the flag)
 *   and then removes the instance from its element. Testing for termination
 *   alone would hand back the instances of a detached-but-retained subtree,
 *   which are exactly the ones a caller must not run effects on.
 * - **`root` is a `ParentNode`.** `Document`, `DocumentFragment` and `Element`
 *   all answer `querySelectorAll`, and an element root is the common case —
 *   "every `Dialog` inside this region". This *is* `querySelectorAll`, so an
 *   element root searches its descendants and never matches itself, the same
 *   scope `$query()` gives.
 *
 * ```js
 * getInstances('Dialog').forEach((dialog) => dialog.close());
 * getInstances('Dialog', section); // the ones inside `section`
 * ```
 */
export function getInstances<T extends Base = Base>(
  name: string,
  root: ParentNode = document,
): T[] {
  const instances: T[] = [];
  for (const el of root.querySelectorAll(selectorFor(name))) {
    const instance = el.__base__?.get(name);
    if (instance?.$isMounted) {
      instances.push(instance as T);
    }
  }
  return instances;
}
