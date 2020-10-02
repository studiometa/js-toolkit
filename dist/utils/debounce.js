/**
 * Returns a function, that, as long as it continues to be invoked,
 * will not be triggered. The function will be called after it stops
 * being called for N milliseconds.
 *
 * @param {Function} fn    The function to call
 * @param {Number}   delay The delay in ms to wait before calling the function
 */
export default function debounce(fn) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var timeout;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(void 0, args);
    }, delay);
  };
}
//# sourceMappingURL=debounce.js.map