/**
 * Wait for the next microtask.
 *
 * @template {() => any} T
 * @param    {T=} [fn]
 * @returns  {Promise<T extends Function ? ReturnType<T> : undefined>}
 */
export default async function nextMicrotask(fn) {
  return Promise.resolve().then(() => typeof fn === 'function' && fn());
}
