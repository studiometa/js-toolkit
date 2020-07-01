/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @type {Function}
 */
export const raf =
  typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;
/**
 * Execute a callback in the next frame.
 * @param  {Function} fn The callback function to execute.
 * @return {void}
 */
export default function nextFrame(fn) {
  raf(() => raf(fn));
}
