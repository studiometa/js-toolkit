import { createNoopProvider } from './createNoopProvider.js';
import { getBrowserContext } from './getBrowserContext.js';
import type { StorageProvider, UrlProviderOptions } from './types.js';

export function createUrlSearchParamsProvider(
  options: UrlProviderOptions = {},
): StorageProvider {
  const browserContext = getBrowserContext();

  if (!browserContext) {
    return createNoopProvider();
  }

  const { push = false } = options;
  const method = push ? 'pushState' : 'replaceState';
  const { location, history } = browserContext;

  return {
    syncEvent: 'popstate',
    get(key) {
      return new URLSearchParams(location.search).get(key);
    },
    set(key, value) {
      const params = new URLSearchParams(location.search);
      params.set(key, value);
      history[method]({}, '', `${location.pathname}?${params.toString()}${location.hash}`);
    },
    remove(key) {
      const params = new URLSearchParams(location.search);
      params.delete(key);
      const search = params.toString();
      history[method]({}, '', `${location.pathname}${search ? `?${search}` : ''}${location.hash}`);
    },
    has(key) {
      return new URLSearchParams(location.search).has(key);
    },
    keys() {
      return [...new URLSearchParams(location.search).keys()];
    },
    clear() {
      history[method]({}, '', `${location.pathname}${location.hash}`);
    },
  };
}
