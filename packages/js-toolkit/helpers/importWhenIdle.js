/**
 * @typedef {import('../abstracts/Base/index.js').BaseComponent} BaseComponent
 * @typedef {{ timeout?: number }} ImportWhenIdleOptions
 */

/**
 * Import a component when user is idle.
 *
 * @template {BaseComponent} T
 *
 * @param {() => Promise<T|{default:T}>} fn
 *   The import function.
 * @param {ImportWhenIdleOptions=} [options]
 *   The time to wait before triggering the callback if never idle.
 *
 * @return {Promise<T>}
 */
export default function importWhenIdle(fn, options) {
  let ResolvedClass;

  const resolver = (resolve) => {
    fn().then((module) => {
      ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);
    });
  };

  return new Promise((resolve) => {
    const timeout = options?.timeout ?? 0;

    if (!('requestIdleCallback' in window)) {
      setTimeout(() => {
        resolver(resolve);
      }, timeout);
    } else {
      window.requestIdleCallback(
        () => {
          setTimeout(() => {
            resolver(resolve);
          }, 0);
        },
        { timeout }
      );
    }
  });
}
