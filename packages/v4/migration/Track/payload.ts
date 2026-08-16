/**
 * Merge plain objects for analytics payloads. Arrays replace instead of
 * concatenate. Arrays and plain objects are cloned; other values pass through.
 */

/** Whether enumerable keys can safely rebuild the object. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

/** Clone arrays and plain objects; return other values unchanged. */
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
