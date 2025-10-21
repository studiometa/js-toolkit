/**
 * Returns a function, that, as long as it continues to be invoked,
 * will not be triggered. The function will be called after it stops
 * being called for N milliseconds.
 *
 * @param  {(...args:unknown[]) => void} fn The function to call.
 * @param  {number} [delay=300] The delay in ms to wait before calling the function.
 * @return {(...args:unknown[]) => void} The debounced function.
 * @link https://js-toolkit.studiometa.dev/utils/debounce.html
*/
export function debounce(
  fn: (...args: unknown[]) => void,
  delay = 300,
): (...args: unknown[]) => void {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
