/**
 * Returns a function, that, as long as it continues to be invoked,
 * will not be triggered. The function will be called after it stops
 * being called for N milliseconds.
 *
 * @param   {(...args:any[]) => void} fn The function to call.
 * @param   {number} [delay=300] The delay in ms to wait before calling the function.
 * @returns {(...args:any[]) => void} The debounced function.
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
