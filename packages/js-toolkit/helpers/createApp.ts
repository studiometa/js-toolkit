import type { Base, BaseConstructor, BaseProps } from '../Base/index.js';
import type { Features } from '../Base/features.js';
import { features } from '../Base/features.js';
import { isBoolean, isObject, on } from '../utils/index.js';

export type CreateAppOptions = Partial<Features> & {
  root?: HTMLElement;
};

/**
 * Instantiate and mount the given component on the given root element when the page has been loaded
 * and return a function to use the app instance when it is ready.
 */
export default function createApp<S extends BaseConstructor<Base>, T extends BaseProps = BaseProps>(
  App: S,
  options: HTMLElement | CreateAppOptions = {},
): () => Promise<S & Base<T>> {
  let app: S & Base<T>;
  const {
    root = null,
    breakpoints = null,
    blocking = null,
  } = options instanceof HTMLElement ? { root: options } : options;

  if (isObject(breakpoints)) {
    features.set('breakpoints', breakpoints);
  }

  if (isBoolean(blocking)) {
    features.set('blocking', blocking);
  }

  function init() {
    app = (new App(root ?? document.body) as S & Base<T>).$mount();
    return app;
  }

  const targetStates = features.get('blocking') ? ['interactive', 'complete'] : ['complete'];

  const promise: Promise<S & Base<T>> = new Promise<S & Base<T>>((resolve) => {
    if (targetStates.includes(document.readyState)) {
      resolve(init());
    } else {
      on(document, 'readystatechange', () => {
        if (targetStates.includes(document.readyState)) {
          resolve(init());
        }
      });
    }
  });

  return () => promise;
}
