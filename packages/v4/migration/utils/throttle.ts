/**
 * Leading-edge throttle, copied from `@studiometa/js-toolkit/utils/throttle`.
 *
 * Nine lines, and it is the only v3 util the `Track` port needs that v4 has
 * no equivalent for. Kept verbatim in behaviour — leading call, no trailing
 * call — because `data-track:scroll.throttle200` means "at most one impression
 * every 200 ms, starting now", and a trailing call would dispatch an analytics
 * event after the interaction that caused it had ended.
 *
 * Scheduling nothing is also why it needs no cancellation: unlike a debounce,
 * a throttled call either ran already or never will.
 */
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
