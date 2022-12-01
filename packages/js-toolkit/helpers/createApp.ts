import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';
import type { Features } from '../Base/features.js';
import { features } from '../Base/features.js';
import { isDefined } from '../utils/index.js';

export type CreateAppOptions = {
  root: HTMLElement;
  features: Features;
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
    Object.entries(options.features).forEach(([feature, value]) => {
      features.set(feature, value);
    });
  }

  const p: Promise<S & Base<T>> = new Promise((resolve) => {
    const callback = () => {
      setTimeout(() => {
        app = (new App(options.root) as S & Base<T>).$mount();
        resolve(app);
      }, 0);
    };

    if (features.get('asyncChildren') || document.readyState === 'complete') {
      callback();
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          callback();
        }
      });
    }
  });

  return function useApp() {
    return p;
  };
}
