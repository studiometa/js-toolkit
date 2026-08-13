/**
 * The minimum-viable half of the `deepmerge` npm package, copied here rather
 * than added to core — the rule `migration/utils/` follows.
 *
 * `@studiometa/ui` depends on `deepmerge` (a runtime dependency) for exactly
 * one shape: merging analytics payload layers, with `arrayMerge` set to
 * "replace, do not concatenate". That is the whole of what the `Track` family
 * uses, and it is ~40 lines rather than a package.
 *
 * Two behaviours of the original are load-bearing here and are kept:
 *
 * 1. **Arrays replace.** Concatenation is wrong for GA4-shaped payloads, where
 *    a nearer layer's `ecommerce.items` must fully override a broader one's.
 * 2. **The result never shares a reference with its sources.** Values that
 *    come from only one side are cloned, not aliased, so a consumer mutating
 *    a pushed payload in place cannot corrupt the memoised layer it came from
 *    — which is the guarantee ui's `does not share the array instance across
 *    dispatches` spec asserts.
 *
 * Left out on purpose: custom merge functions, `isMergeableObject`, symbol
 * keys, and the `clone: false` mode. Nothing in `Track` reaches for them.
 */

/**
 * A plain object, as opposed to a `Date`, a `Map`, a DOM node or a class
 * instance — none of which may be recursed into, because rebuilding one from
 * its own enumerable keys destroys it.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

/**
 * A structural copy of anything mergeable; everything else passes through.
 */
function clone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = clone(item);
    }
    return result as T;
  }
  return value;
}

/**
 * Merge `source` over `target`, recursing into plain objects and replacing
 * arrays and scalars.
 */
export function deepmerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = clone(target);

  for (const [key, value] of Object.entries(source)) {
    const existing = result[key];
    result[key] =
      isPlainObject(existing) && isPlainObject(value) ? deepmerge(existing, value) : clone(value);
  }

  return result;
}

/**
 * Merge a list of layers left to right, the rightmost winning.
 */
export function deepmergeAll(layers: Record<string, unknown>[]): Record<string, unknown> {
  return layers.reduce<Record<string, unknown>>((merged, layer) => deepmerge(merged, layer), {});
}
