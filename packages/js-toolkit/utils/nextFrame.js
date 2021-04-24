/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @return {(handler: Function) => number}
 */
export function getRaf() {
  return typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;
}

/**
 * Get a function to cancel the method returned by `getRaf()`.
 *
 * @return {(id:number) => void}
 */
export function getCancelRaf() {
  return typeof window !== 'undefined' && window.cancelAnimationFrame
    ? window.cancelAnimationFrame.bind(window)
    : clearTimeout;
}

/**
 * Wait for the next frame to execute a function.
 *
 * @param  {Function=} [fn=() => {}] The callback function to execute.
 * @return {Promise} A Promise resolving when the next frame is reached.
 *
 * @example
 * ```js
 * nextFrame(() => console.log('hello world'));
 *
 * await nextFrame();
 * console.log('hello world');
 * ```
 */
export default function nextFrame(fn = () => {}) {
  const raf = getRaf();
  return new Promise((resolve) => {
    raf(() => raf(() => resolve(fn())));
  });
}
