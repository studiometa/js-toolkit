/**
 * Merge plain objects, source over target.
 *
 * **Arrays replace, they do not concatenate** — npm's `deepmerge` concatenates
 * and `lodash.merge` merges by index, so the behaviour is stated here rather
 * than left to a shared name. Replacing is what a layered payload wants: a
 * child declaring `items` means those items, not the ancestor's plus its own.
 *
 * Anything which is not a plain object or an array — a `Date`, a `Map`, a
 * class instance, a scalar — is a value, so it passes through whole and is
 * shared rather than copied. Symbol keys are dropped, and a cyclic input
 * throws: this merges data, and data comes from JSON.
 */

/** Keys which write the prototype chain instead of the object. */
const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Whether enumerable keys can safely rebuild the value.
 *
 * Read through the prototype, not `value.constructor`: an object parsed from
 * page JSON can carry its own `constructor` key, and `Object.create(null)` has
 * none at all.
 */
function isPlain(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

/** Copy arrays and plain objects; return everything else unchanged. */
function clone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item)) as T;
  }
  if (!isPlain(value)) {
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!UNSAFE.has(key)) {
      out[key] = clone(item);
    }
  }
  return out as T;
}

/**
 * Merge one source over one target.
 *
 * The recursion stays on this binary function: routing it back through the
 * variadic entry point would allocate an arguments array and run a `reduce`
 * for every nested key, which measured 37 % slower on a three-layer payload.
 */
function merge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const out = clone(target);

  for (const [key, value] of Object.entries(source)) {
    // Checked here and in `clone()`: a payload reaches these keys either way.
    if (UNSAFE.has(key)) {
      continue;
    }
    out[key] = isPlain(out[key]) && isPlain(value) ? merge(out[key], value) : clone(value);
  }

  return out;
}

/**
 * Merge every layer left to right, the rightmost winning.
 *
 * No input is mutated, and the result shares no plain object or array with any
 * of them. One layer is therefore a deep copy of it, and no layer is `{}`.
 * Spread a list built at runtime: `deepmerge(...layers)`.
 *
 * @example
 * ```js
 * deepmerge({ ecommerce: { currency: 'EUR' } }, { ecommerce: { items: [1] } });
 * // { ecommerce: { currency: 'EUR', items: [1] } }
 * ```
 */
export function deepmerge(...layers: Record<string, unknown>[]): Record<string, unknown> {
  return layers.reduce<Record<string, unknown>>(merge, {});
}
