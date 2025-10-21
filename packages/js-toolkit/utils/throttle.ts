/**
 * Simple throttling helper that limits a function to only run once every {delay}ms.
 *
 * @param {Function} fn The function to throttle
 * @param {number} [delay] The delay in ms
 * @return {Function} The throttled function.
 * @link https://js-toolkit.studiometa.dev/utils/throttle.html
*/
export function throttle(
  fn: (...args: unknown[]) => void,
  delay = 16,
): (...args: unknown[]) => void {
  let lastCall = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    // eslint-disable-next-line consistent-return
    return fn(...args);
  };
}
