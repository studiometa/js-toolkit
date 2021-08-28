/**
 * @typedef {import('../abstracts/Base/index.js').BaseComponent} BaseComponent
 */

/**
 * Import a component when user is idle.
 *
 * @template {BaseComponent} T
 *
 * @param {() => Promise<T>} fn
 *   The import function.
 * @param {{ timeout?: number }=} options
 *   The time to wait before triggering the callback if never idle.
 *
 * @return {Promise<T>}
 */
export default function importWhenIdle(fn, options = {}) {
  return new Promise((resolve) => {
    const timeout = options.timeout ?? 0;

    if (!('requestIdleCallback' in window)) {
      setTimeout(() => {
        fn().then(resolve);
      }, timeout);
    } else {
      window.requestIdleCallback(
        () => {
          setTimeout(() => {
            fn().then(resolve);
          }, 0);
        },
        { timeout }
      );
    }
  });
}
