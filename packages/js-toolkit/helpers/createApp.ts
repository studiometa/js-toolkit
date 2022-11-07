import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 */
export default function createApp<S extends BaseConstructor<Base>, T extends BaseProps = BaseProps>(
  App: S,
  rootElement: HTMLElement = document.body,
): () => Promise<S & Base<T>> {
  let app: S & Base<T>;

  const p: Promise<S & Base<T>> = new Promise((resolve) => {
    setTimeout(() => {
      app = (new App(rootElement) as S & Base<T>).$mount();
      resolve(app);
    }, 0);
  });

  return function useApp() {
    return p;
  };
}
