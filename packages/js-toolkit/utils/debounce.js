/**
 * Returns a function, that, as long as it continues to be invoked,
 * will not be triggered. The function will be called after it stops
 * being called for N milliseconds.
 *
 * @param {Function} fn The function to call.
 * @param {Number=} [delay=300] The delay in ms to wait before calling the function.
 * @return {Function} The debounced function.
 */
export default function debounce(fn, delay = 300) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
