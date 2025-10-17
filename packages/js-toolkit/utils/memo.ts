/**
 * Memoize the result of a function with a single argument indefinitely.
 * This is a simpler implementation of the `memoize` function.
 * @link https://js-toolkit.studiometa.dev/utils/memo.html
*/
export function memo<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  // @ts-ignore
  return function cached(...args) {
    const key = args.join('');
    if (!cache.has(key)) {
      cache.set(key, fn(...args) as ReturnType<T>);
    }
    return cache.get(key);
  };
}
