/** A memoised function with explicit cache invalidation. */
export interface Memo<Args extends unknown[], Value> {
  (...args: Args): Value;
  /** Clear all cached results. */
  clear(): void;
}

/** Whether a value can be a `WeakMap` key. */
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
  // Allocate only the store required by the key type.
  let primitives: Map<unknown, Value> | undefined;
  let objects: WeakMap<WeakKey, Value> | undefined;

  const cached = (...args: Args): Value => {
    const key = args[0] as unknown;
    // `has()` distinguishes a cached `undefined` result from a miss.
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
    // `WeakMap` has no `clear()`.
    objects = undefined;
  };

  return cached;
}
