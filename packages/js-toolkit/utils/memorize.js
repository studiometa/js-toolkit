/**
 * @typedef {Object} MemorizeCache
 * @property {(key:any) => boolean} has
 * @property {(key:any, value:any) => MemorizeCache} set
 * @property {(key:any) => any} get
 */

/**
 * @typedef {Object} MemorizeOptions
 * @property {number} [maxAge]
 * @property {(...args:any) => any} [cacheKey]
 * @property {MemorizeCache} [cache]
 */

/**
 * Memorize the output of a function.
 * @template {(...args:any) => any} T
 * @param  {T} fn
 * @param  {MemorizeOptions} options
 * @return {(...args:Parameters<T>) => ReturnType<T>}
 */
export default function memorize(
  fn,
  { maxAge = Number.POSITIVE_INFINITY, cacheKey = JSON.stringify, cache = new Map() } = {}
) {
  return function memorized(...args) {
    const key = cacheKey(args);
    const date = Date.now();

    if (cache.has(key)) {
      const cached = cache.get(key);

      if (date - cached.date < maxAge) {
        return cached.data;
      }
    }

    // @ts-ignore
    const data = fn(...args);

    cache.set(key, {
      data,
      date: Date.now(),
    });

    return data;
  };
}
