import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 */
export default function createApp<S extends BaseConstructor<Base>, T extends BaseProps = BaseProps>(
  App: S,
  rootElement: HTMLElement = document.body,
): () => Promise<S & Base<T>> {
  let isLoaded = document.readyState === 'complete';
  let app: S & Base<T>;

  if (!isLoaded) {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        app = (new App(rootElement) as S & Base<T>).$mount();
        isLoaded = true;
      }
    });
  } else {
    app = (new App(rootElement) as S & Base<T>).$mount();
  }

  const promise: Promise<S & Base<T>> = new Promise((resolve) => {
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
