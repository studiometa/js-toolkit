/** Rate limiting and delays, for the callbacks a component hands to the DOM. */

/**
 * Delay a function until it stops being called for the given milliseconds.
 * Only the last call's arguments are used.
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function debounced(...args: Args): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Run a function at most once per given milliseconds, on the leading edge.
 * A call inside the window is dropped, not deferred.
 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 16,
): (...args: Args) => void {
  // Not `0`: `performance.now()` starts there, so a first call at page load
  // would fall inside its own window.
  let lastCall = Number.NEGATIVE_INFINITY;

  return function throttled(...args: Args): void {
    const now = performance.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    fn(...args);
  };
}

/** Resolve after the given milliseconds. */
export function wait(delay = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
