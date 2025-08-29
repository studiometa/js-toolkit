import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';
import type { Features } from '../Base/features.js';
import { features } from '../Base/features.js';
import { defineFeatures } from './defineFeatures.js';
import { isDev } from '../utils/index.js';
import { logTree } from './logTree.js';

export type CreateAppOptions = Partial<Features> & {
  root?: HTMLElement;
};

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 * @link https://js-toolkit.studiometa.dev/api/helpers/createApp.html
*/
export function createApp<S extends BaseConstructor<Base>, T extends BaseProps = BaseProps>(
  App: S,
  options: HTMLElement | CreateAppOptions = {},
): () => Promise<S & Base<T>> {
  let app: S & Base<T>;
  const {
    root = document.body,
    ...featureOptions
  } = options instanceof HTMLElement ? { root: options } : options;

  defineFeatures(featureOptions);

  async function init() {
    app = new App(root) as S & Base<T>;
    await app.$mount();
    if (isDev) {
      logTree(app);
    }
    return app;
  }

  let p: Promise<S & Base<T>>;

  if (features.get('blocking')) {
    p = init();
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
