/**
 * Simple throttling helper that limits a function to only run once every {delay}ms.
 *
 * @param {Function} fn The function to throttle
 * @param {number} [delay] The delay in ms
 * @returns {Function} The throttled function.
 */
export default function throttle(fn, delay = 16) {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return false;
    }
    lastCall = now;
    return fn(...args);
  };
}
