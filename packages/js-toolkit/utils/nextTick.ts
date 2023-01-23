import { isFunction } from './is.js';
import { wait } from './wait.js';

/**
 * Wait for the next tick.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function nextTick<T extends () => any>(
  fn?: T,
): Promise<T extends void ? void : ReturnType<T>> {
  return wait().then(isFunction(fn) && (fn as ReturnType<T>));
}
