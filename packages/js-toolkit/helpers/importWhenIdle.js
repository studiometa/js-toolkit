/**
 * @typedef {import('../abstracts/Base/index.js').default} Base
 */

/**
 * Import a component when user is idle.
 *
 * @param {() => Promise<Base>} fn
 *   The import function.
 * @param {{ timeout?: number }=} options
 *   The time to wait before triggering the callback if never idle.
 * @return {Promise<Base>}
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
