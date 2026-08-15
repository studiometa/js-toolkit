/** Leading-edge throttle with no trailing call or scheduled work. */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 16,
): (...args: A) => void {
  let lastCall = 0;
  return function throttled(...args: A) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    fn(...args);
  };
}
