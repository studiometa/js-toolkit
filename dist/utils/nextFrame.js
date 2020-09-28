/**
 * RequestAnimation frame polyfill.
 * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
 * @type {Function}
 */
export var getRaf = function getRaf() {
  return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
};
/**
 * Execute a callback in the next frame.
 * @param  {Function} fn The callback function to execute.
 * @return {Promise}
 */

export default function nextFrame() {
  var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
  var raf = getRaf();
  return new Promise(function (resolve) {
    raf(function () {
      return raf(function () {
        return resolve(fn());
      });
    });
  });
}
//# sourceMappingURL=nextFrame.js.map