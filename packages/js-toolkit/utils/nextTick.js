/**
 * Wait for the next tick.
 *
 * @template {() => any} T
 * @param    {T=} [fn]
 * @returns  {Promise<T extends Function ? ReturnType<T> : undefined>}
 */
export default async function nextTick(fn) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(typeof fn === 'function' && fn());
    }, 0)
  );
}
