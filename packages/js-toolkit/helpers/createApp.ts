import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';
import type { Features } from '../Base/features.js';
import { features } from '../Base/features.js';
import { isDefined } from '../utils/index.js';

export type CreateAppOptions = {
  root: HTMLElement;
  features: Partial<Features>;
  breakpoints?: Record<string, string>;
};

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 */
export default function createApp<S extends BaseConstructor<Base>, T extends BaseProps = BaseProps>(
  App: S,
  rootElement: HTMLElement | Partial<CreateAppOptions> = document.body,
): () => Promise<S & Base<T>> {
  let app: S & Base<T>;
  const options =
    rootElement instanceof HTMLElement
      ? { root: rootElement, features: undefined }
      : { root: document.body, ...rootElement };

  if (isDefined(options.features)) {
    for (const [feature, value] of Object.entries(options.features as Features)) {
      features.set(feature as keyof Features, value);
    }
  }

  function init() {
    app = (new App(options.root) as S & Base<T>).$mount();
    return app;
  }

  let p: Promise<S & Base<T>>;

  if (features.get('asyncChildren')) {
    p = Promise.resolve(init());
  } else {
    p = new Promise<S & Base<T>>((resolve) => {
      if (document.readyState === 'complete') {
        resolve(init());
      } else {
        document.addEventListener('readystatechange', () => {
          if (document.readyState === 'complete') {
            resolve(init());
          }
        });
      }
    });
  }

  return () => p;
}
