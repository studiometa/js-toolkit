"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = nextFrame;

/* eslint-disable no-nested-ternary */

/**
 * Execute a callback in the next frame.
 * @param  {Function} fn The callback function to execute.
 * @return {void}
 */
function nextFrame(fn) {
  /**
   * RequestAnimation frame polyfill.
   * @see  https://github.com/vuejs/vue/blob/ec78fc8b6d03e59da669be1adf4b4b5abf670a34/dist/vue.runtime.esm.js#L7355
   * @type {Function}
   */
  var raf = typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
  raf(function () {
    return raf(fn);
  });
}
//# sourceMappingURL=nextFrame.js.map