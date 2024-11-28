export interface MemoizeCache<T> {
  has: (key: unknown) => boolean;
  set: (key: unknown, value: { data: T; date: number }) => this;
  get: (key: unknown) => { data: T; date: number };
}

export interface MemoizeOptions<T> {
  maxAge?: number;
  cacheKey?: (args: unknown[]) => string;
  cache?: MemoizeCache<T>;
}

/**
 * Memoize the output of a function.
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  {
    maxAge = Number.POSITIVE_INFINITY,
    cacheKey = JSON.stringify,
    cache = new Map(),
  }: MemoizeOptions<ReturnType<T>> = {},
): (...args: Parameters<T>) => ReturnType<T> {
  return function memoized(...args): ReturnType<T> {
    const key = cacheKey(args);
    const date = Date.now();

    if (cache.has(key)) {
      const cached = cache.get(key);

      if (date - cached.date < maxAge) {
        return cached.data;
      }
    }

    // @ts-ignore
    const data: ReturnType<T> = fn(...args);

    cache.set(key, {
      data,
      date: Date.now(),
    });

    return data;
  };
}
