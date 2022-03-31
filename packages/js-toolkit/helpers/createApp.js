/**
 * @typedef {import('../Base/index.js').BaseConstructor} BaseConstructor
 */

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 *
 * @template {BaseConstructor} T
 * @param {T} App
 * @param {HTMLElement} [rootElement]
 * @returns {() => Promise<InstanceType<T>>}
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
