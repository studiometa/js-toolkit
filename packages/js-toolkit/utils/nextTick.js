import { isFunction } from './is.js';

/**
 * Wait for the next tick.
 *
 * @template {() => any} T
 * @param    {T} [fn]
 * @returns  {Promise<T extends Function ? ReturnType<T> : undefined>}
 */
export default async function nextTick(fn) {
  return new Promise((resolve) =>
    // eslint-disable-next-line no-promise-executor-return
    setTimeout(() => {
      resolve(isFunction(fn) && fn());
    }, 0),
  );
}
