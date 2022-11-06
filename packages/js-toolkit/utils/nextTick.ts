import { isFunction } from './is.js';

/**
 * Wait for the next tick.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function nextTick<T extends () => any>(
  fn?: T,
): Promise<T extends void ? void : ReturnType<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(isFunction(fn) && (fn() as ReturnType<T>));
    }, 0);
  });
}
