import { createNoopProvider } from './createNoopProvider.js';
import { getBrowserContext } from './getBrowserContext.js';
import type { StorageProvider, UrlProviderOptions } from './types.js';

export function createUrlSearchParamsInHashProvider(
  options: UrlProviderOptions = {},
): StorageProvider {
  const browserContext = getBrowserContext();

  if (!browserContext) {
    return createNoopProvider();
  }

  const { push = false } = options;
  const { location, history } = browserContext;

  function getParamsFromHash(): URLSearchParams {
    return new URLSearchParams(location.hash.slice(1));
  }

  return {
    syncEvent: 'hashchange',
    get(key) {
      return getParamsFromHash().get(key);
    },
    set(key, value) {
      const params = getParamsFromHash();
      params.set(key, value);
      const newHash = params.toString();

      if (push) {
        location.hash = newHash;
      } else {
        history.replaceState({}, '', `${location.pathname}${location.search}#${newHash}`);
      }
    },
    remove(key) {
      const params = getParamsFromHash();
      params.delete(key);
      const newHash = params.toString();

      if (push) {
        location.hash = newHash;
      } else {
        const url = newHash
          ? `${location.pathname}${location.search}#${newHash}`
          : `${location.pathname}${location.search}`;
        history.replaceState({}, '', url);
      }
    },
    has(key) {
      return getParamsFromHash().has(key);
    },
    keys() {
      return [...getParamsFromHash().keys()];
    },
    clear() {
      if (push) {
        location.hash = '';
      } else {
        history.replaceState({}, '', `${location.pathname}${location.search}`);
      }
    },
  };
}
