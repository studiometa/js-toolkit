import { isFunction } from './is.js';
import { hasWindow } from './has.js';

/**
 * Alias for the `requestAnimationFrame` function with a polyfill
 * with `setTimeout` if the function is not available.
 */
export function raf(callback: FrameRequestCallback) {
  return hasWindow() && window.requestAnimationFrame
    ? window.requestAnimationFrame(callback)
    : Number(setTimeout(callback, 16));
}

/**
 * Cancel a request for the animation frame.
 */
export function cancelRaf(id: number) {
  return hasWindow() && window.cancelAnimationFrame
    ? window.cancelAnimationFrame(id)
    : clearTimeout(id);
}

/**
 * Wait for the next frame to execute a function.
 *
 * @template {() => any} T
 * @param    {T} [fn] The callback function to execute.
 * @returns  {Promise<T extends Function ? ReturnType<T> : undefined>} A Promise resolving when the next frame is reached.
 * @example
 * ```js
 * nextFrame(() => console.log('hello world'));
 *
 * await nextFrame();
 * console.log('hello world');
 * ```
 */
export function nextFrame<T extends () => unknown>(
  fn?: T,
): Promise<T extends () => unknown ? ReturnType<T> : void> {
  return new Promise((resolve) => {
    // @ts-ignore
    raf(() => resolve(isFunction(fn) && fn()));
  });
}
