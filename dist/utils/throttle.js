/**
 * Simple throttling helper that limits a
 * function to only run once every {delay}ms
 *
 * @param {Function} fn    The function to throttle
 * @param {Number}   delay The delay in ms
 */
export default function throttle(fn) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
  var lastCall = 0;
  return function () {
    var now = new Date().getTime();

    if (now - lastCall < delay) {
      return false;
    }

    lastCall = now;
    return fn.apply(void 0, arguments);
  };
}
//# sourceMappingURL=throttle.js.map