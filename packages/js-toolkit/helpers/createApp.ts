import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';
import type { Features } from '../Base/features.js';
import { getInstances } from '../Base/index.js';
import { features } from '../Base/features.js';
import { useMutation } from '../services/index.js';
import { isBoolean, isObject, isString } from '../utils/index.js';

export type CreateAppOptions = Partial<Features> & {
  root?: HTMLElement;
};

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 */
export function createApp<S extends BaseConstructor<Base>, T extends BaseProps = BaseProps>(
  App: S,
  options: HTMLElement | CreateAppOptions = {},
): () => Promise<S & Base<T>> {
  let app: S & Base<T>;
  const {
    root = document.body,
    breakpoints = null,
    blocking = null,
    prefix = null,
    attributes = null,
  } = options instanceof HTMLElement ? { root: options } : options;

  if (isObject(breakpoints)) {
    features.set('breakpoints', breakpoints);
  }

  if (isBoolean(blocking)) {
    features.set('blocking', blocking);
  }

  if (isString(prefix)) {
    features.set('prefix', prefix);
  }

  if (isObject(attributes)) {
    features.set('attributes', attributes);
  }

  // Terminate components whose root element has been removed from the DOM
  const service = useMutation(document.documentElement, { childList: true, subtree: true });
  const symbol = Symbol('createApp');
  service.add(symbol, (props) => {
    for (const mutation of props.mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.removedNodes) {
          if (!node.isConnected) {
            for (const instance of getInstances()) {
              if (node === instance.$el || node.contains(instance.$el)) {
                instance.$terminate();
              }
            }
          }
        }
      }
    }
  });

  async function init() {
    app = new App(root) as S & Base<T>;
    await app.$mount();
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
