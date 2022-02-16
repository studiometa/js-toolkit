/**
 * @typedef {import('../Base/index.js').BaseConstructor} BaseConstructor
 */

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 *
 * @usage
 * ```js
 * // app.js
 * import Base, { createApp } from '@studiometa/js-toolkit';
 *
 * class App extends Base {
 *   static config = {
 *     name: 'App',
 *   }
 * }
 *
 * export default createApp(App, document.body);
 * ```
 * ```js
 * // other.js
 * import useApp from './app.js';
 *
 * const app = await useApp();
 * console.log(app.$options.name); // 'App'
 * ```
 *
 * @template {BaseConstructor} T
 * @param {T} App
 * @param {HTMLElement=} [rootElement]
 *
 * @return {() => Promise<InstanceType<T>>}
 *
 */
export default function createApp(App, rootElement = document.body) {
  let isLoaded = document.readyState === 'complete';
  let app;

  if (!isLoaded) {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        app = new App(rootElement).$mount();
        isLoaded = true;
      }
    });
  } else {
    app = new App(rootElement).$mount();
  }

  const promise = new Promise((resolve) => {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        setTimeout(() => resolve(app), 0);
      }
    });
  });

  return function useApp() {
    if (isLoaded) {
      return Promise.resolve(app);
    }

    return promise;
  };
}
