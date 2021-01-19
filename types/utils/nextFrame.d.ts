/**
 * Execute a callback in the next frame.
 * @param  {Function} fn The callback function to execute.
 * @return {Promise}
 */
export default function nextFrame(fn?: Function): Promise<any>;
/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @type {Function}
 */
export const getRaf: Function;
