/**
 * One memo, replacing v3's three.
 *
 * v3 shipped `memo()` (single argument, `args.join('')` as the key, kept
 * forever), `memoize()` (`maxAge`, an injectable `cacheKey`, an injectable
 * `cache`) and `cache()` (a nested `Map` chain hung off a `globalThis` key).
 * They differ on three axes — how a call becomes a key, how long an entry
 * lives, and where it is stored — and v4 answers each from what it actually
 * caches rather than from what v3 offered:
 *
 * - **Key: the argument itself, by identity. At most one of them.** Every
 *   memoised value in v4 is derived from exactly one thing — an attribute
 *   name, a target element, a class, or nothing at all — so there is no call
 *   shape to serialise. `args.join('')` collides (`['a','bc']` and `['ab','c']`
 *   are one key) and `JSON.stringify` costs more than most of the work it
 *   guards. Identity does neither, and it is the only strategy that can key on
 *   an object without inventing a name for it.
 * - **Lifetime: the caller's, through `clear()`.** No `maxAge`, because
 *   nothing in v4 goes stale on a clock. What does go stale here goes stale on
 *   an **event** — `setBreakpoints()` replaces the named set, a viewport
 *   crossing changes which breakpoint is active — and a wall-clock age can
 *   only approximate that, badly: too long is a wrong answer, too short is the
 *   uncached cost back. So the memo caches until told otherwise, and the module
 *   that owns the value owns when to say so.
 * - **Storage: a `WeakMap` when the key is an object.** v3's `cache()` hung a
 *   `Map` off `globalThis`, so every element it ever keyed on outlived the
 *   page's use of it. An object key here is held weakly and collected with the
 *   thing it names; a primitive key goes in a `Map`, which is what `clear()`
 *   is for.
 *
 * ```js
 * const scopedAttributes = memo((attribute) => breakpointNames().map(…));
 * scopedAttributes('data-option-columns'); // computed
 * scopedAttributes('data-option-columns'); // the same array, not a new one
 * scopedAttributes.clear();                // the set changed underneath it
 * ```
 *
 * A function taking no argument is the degenerate case and works as written:
 * `memo(fn)` called as `fn()` keys on nothing and caches one value.
 */

/**
 * A memoised function, plus the handle that ends its entries' lives.
 */
export interface Memo<Args extends unknown[], Value> {
  (...args: Args): Value;
  /**
   * Forget everything cached, so the next call computes again.
   *
   * Not a per-key `delete()`: every invalidation v4 has is a *replacement* of
   * the thing the whole cache was derived from, and a narrower operation would
   * be a guess about a caller that does not exist yet.
   */
  clear(): void;
}

/**
 * Whether a value can be a `WeakMap` key — an object or a function.
 *
 * Symbols are deliberately not treated as weak keys: a registered symbol
 * cannot be one, the two kinds are indistinguishable without
 * `Symbol.keyFor()`, and nothing in v4 memoises on a symbol.
 */
function isWeakKey(value: unknown): value is WeakKey {
  return (typeof value === 'object' && value !== null) || typeof value === 'function';
}

/**
 * Cache a function's result per argument, until told to forget.
 *
 * @param fn The function to memoise. It takes one argument, or none.
 */
export function memo<Args extends [] | [key: unknown], Value>(
  fn: (...args: Args) => Value,
): Memo<Args, Value> {
  // Both built on demand, so a memo keyed only on objects never allocates a
  // `Map` and a memo keyed on nothing never allocates a `WeakMap`.
  let primitives: Map<unknown, Value> | undefined;
  let objects: WeakMap<WeakKey, Value> | undefined;

  const cached = (...args: Args): Value => {
    const key = args[0] as unknown;
    // `has()` rather than a `get() === undefined` test, so a function that
    // legitimately returns `undefined` is memoised rather than recomputed on
    // every call — which is the bug the cheap version of this always has.
    if (isWeakKey(key)) {
      objects ??= new WeakMap();
      if (!objects.has(key)) {
        objects.set(key, fn(...args));
      }
      return objects.get(key) as Value;
    }
    primitives ??= new Map();
    if (!primitives.has(key)) {
      primitives.set(key, fn(...args));
    }
    return primitives.get(key) as Value;
  };

  cached.clear = (): void => {
    primitives?.clear();
    // A `WeakMap` has no `clear()`; dropping it is the same thing, and the
    // entries go with it.
    objects = undefined;
  };

  return cached;
}
