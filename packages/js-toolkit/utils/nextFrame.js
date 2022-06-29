import { isFunction } from './is.js';
import { hasWindow } from './has.js';

/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @returns {(handler: Function) => number}
 */
export function getRaf() {
  return hasWindow() && window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;
}

/**
 * Get a function to cancel the method returned by `getRaf()`.
 *
 * @returns {(id:number) => void}
 */
export function getCancelRaf() {
  return hasWindow() && window.cancelAnimationFrame
    ? window.cancelAnimationFrame.bind(window)
    : clearTimeout;
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
export function nextFrame(fn) {
  return new Promise((resolve) => {
    getRaf()(() => resolve(isFunction(fn) && fn()));
  });
}
