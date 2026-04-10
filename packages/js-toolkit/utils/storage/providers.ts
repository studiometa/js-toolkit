import type { StorageProvider, UrlProviderOptions } from './types.js';

function getGlobalStorage(name: 'localStorage' | 'sessionStorage'): Storage | undefined {
  return typeof globalThis !== 'undefined' && name in globalThis
    ? globalThis[name]
    : undefined;
}

function getStorageKeys(storage: Storage | undefined): string[] {
  if (!storage) {
    return [];
  }

  return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
    (key): key is string => key !== null,
  );
}

function createNoopProvider(): StorageProvider {
  return {
    get: () => null,
    set: () => {},
    remove: () => {},
    has: () => false,
    keys: () => [],
    clear: () => {},
  };
}

function getBrowserContext(): Pick<Window, 'location' | 'history'> | undefined {
  if (typeof globalThis === 'undefined' || !('window' in globalThis)) {
    return undefined;
  }

  const { window } = globalThis;

  if (!window || !window.location || !window.history) {
    return undefined;
  }

  return {
    location: window.location,
    history: window.history,
  };
}

export const localStorageProvider: StorageProvider = {
  syncEvent: 'storage',
  get storageArea() {
    return getGlobalStorage('localStorage');
  },
  get(key: string): string | null {
    return getGlobalStorage('localStorage')?.getItem(key) ?? null;
  },
  set(key: string, value: string): void {
    getGlobalStorage('localStorage')?.setItem(key, value);
  },
  remove(key: string): void {
    getGlobalStorage('localStorage')?.removeItem(key);
  },
  has(key: string): boolean {
    return getGlobalStorage('localStorage')?.getItem(key) !== null;
  },
  keys(): string[] {
    return getStorageKeys(getGlobalStorage('localStorage'));
  },
  clear(): void {
    getGlobalStorage('localStorage')?.clear();
  },
};

export const sessionStorageProvider: StorageProvider = {
  get storageArea() {
    return getGlobalStorage('sessionStorage');
  },
  get(key: string): string | null {
    return getGlobalStorage('sessionStorage')?.getItem(key) ?? null;
  },
  set(key: string, value: string): void {
    getGlobalStorage('sessionStorage')?.setItem(key, value);
  },
  remove(key: string): void {
    getGlobalStorage('sessionStorage')?.removeItem(key);
  },
  has(key: string): boolean {
    return getGlobalStorage('sessionStorage')?.getItem(key) !== null;
  },
  keys(): string[] {
    return getStorageKeys(getGlobalStorage('sessionStorage'));
  },
  clear(): void {
    getGlobalStorage('sessionStorage')?.clear();
  },
};

export function createUrlSearchParamsProvider(
  providerOptions: UrlProviderOptions = {},
): StorageProvider {
  const browserContext = getBrowserContext();

  if (!browserContext) {
    return createNoopProvider();
  }

  const { push = false } = providerOptions;
  const method = push ? 'pushState' : 'replaceState';
  const { location, history } = browserContext;

  return {
    syncEvent: 'popstate',
    get(key: string): string | null {
      return new URLSearchParams(location.search).get(key);
    },
    set(key: string, value: string): void {
      const params = new URLSearchParams(location.search);
      params.set(key, value);
      const newUrl = `${location.pathname}?${params.toString()}${location.hash}`;
      history[method]({}, '', newUrl);
    },
    remove(key: string): void {
      const params = new URLSearchParams(location.search);
      params.delete(key);
      const search = params.toString();
      const newUrl = `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
      history[method]({}, '', newUrl);
    },
    has(key: string): boolean {
      return new URLSearchParams(location.search).has(key);
    },
    keys(): string[] {
      return [...new URLSearchParams(location.search).keys()];
    },
    clear(): void {
      history[method]({}, '', `${location.pathname}${location.hash}`);
    },
  };
}

export const urlSearchParamsProvider: StorageProvider = createUrlSearchParamsProvider();

export function createUrlSearchParamsInHashProvider(
  providerOptions: UrlProviderOptions = {},
): StorageProvider {
  const browserContext = getBrowserContext();

  if (!browserContext) {
    return createNoopProvider();
  }

  const { push = false } = providerOptions;
  const { location, history } = browserContext;

  function getParamsFromHash(): URLSearchParams {
    return new URLSearchParams(location.hash.slice(1));
  }

  return {
    syncEvent: 'hashchange',
    get(key: string): string | null {
      return getParamsFromHash().get(key);
    },
    set(key: string, value: string): void {
      const params = getParamsFromHash();
      params.set(key, value);
      const newHash = params.toString();

      if (push) {
        location.hash = newHash;
      } else {
        history.replaceState({}, '', `${location.pathname}${location.search}#${newHash}`);
      }
    },
    remove(key: string): void {
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
    has(key: string): boolean {
      return getParamsFromHash().has(key);
    },
    keys(): string[] {
      return [...getParamsFromHash().keys()];
    },
    clear(): void {
      if (push) {
        location.hash = '';
      } else {
        history.replaceState({}, '', `${location.pathname}${location.search}`);
      }
    },
  };
}

export const urlSearchParamsInHashProvider: StorageProvider =
  createUrlSearchParamsInHashProvider();
