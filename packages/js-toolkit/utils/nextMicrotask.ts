import { isFunction } from './is.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => any;

/**
 * Wait for the next microtask.
 */
export async function nextMicrotask(): Promise<void>;
export async function nextMicrotask<T extends Callback>(callback?: T): Promise<ReturnType<T>>;
export async function nextMicrotask<T extends Callback>(callback?: T): Promise<ReturnType<T>> {
  return Promise.resolve().then(() => isFunction(callback) && callback());
}
