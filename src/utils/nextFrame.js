/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @return {Function}
 */
export const getRaf = () =>
  typeof window !== 'undefined' && window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;

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
