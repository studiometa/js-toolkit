import { isFunction } from './is.js';

/**
 * Wait for the next microtask.
 */
export default async function nextMicrotask<T extends () => unknown>(
  fn?: T,
): Promise<T extends () => unknown ? ReturnType<T> : void> {
  // @ts-ignore
  return Promise.resolve().then(() => isFunction(fn) && fn());
}
