/**
 * Simple throttling helper that limits a function to only run once every {delay}ms.
 *
 * @param {Function} fn The function to throttle
 * @param {Number=} [delay=16] The delay in ms
 * @return {Function} The throttled function.
 */
export default function throttle(fn, delay = 16) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return false;
    }
    lastCall = now;
    return fn(...args);
  };
}
