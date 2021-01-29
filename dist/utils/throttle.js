export default function throttle(fn) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
  var lastCall = 0;
  return function throttled() {
    var now = new Date().getTime();

    if (now - lastCall < delay) {
      return false;
    }

    lastCall = now;
    return fn.apply(void 0, arguments);
  };
}
//# sourceMappingURL=throttle.js.map