import { isFunction } from './is.js';
import { wait } from './wait.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => any;

/**
 * Wait for the next tick.
 */
export async function nextTick(): Promise<void>;
export async function nextTick<T extends Callback>(callback?: T): Promise<ReturnType<T>>;
export async function nextTick<T extends Callback>(callback?: T): Promise<ReturnType<T>> {
  return wait().then(isFunction(callback) && (callback as ReturnType<T>));
}
