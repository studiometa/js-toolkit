import { hasWindow } from '../has.js';
import type { StorageProvider, UrlProviderOptions } from './types.js';

export const localStorageProvider: StorageProvider = {
  syncEvent: 'storage',
  storageArea: hasWindow() ? localStorage : undefined,
  get(key: string): string | null {
    if (!hasWindow()) return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (!hasWindow()) return;
    localStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (!hasWindow()) return;
    localStorage.removeItem(key);
  },
  has(key: string): boolean {
    if (!hasWindow()) return false;
    return localStorage.getItem(key) !== null;
  },
  keys(): string[] {
    if (!hasWindow()) return [];
    return Object.keys(localStorage);
  },
  clear(): void {
    if (!hasWindow()) return;
    localStorage.clear();
  },
};

export const sessionStorageProvider: StorageProvider = {
  get(key: string): string | null {
    if (!hasWindow()) return null;
    return sessionStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (!hasWindow()) return;
    sessionStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (!hasWindow()) return;
    sessionStorage.removeItem(key);
  },
  has(key: string): boolean {
    if (!hasWindow()) return false;
    return sessionStorage.getItem(key) !== null;
  },
  keys(): string[] {
    if (!hasWindow()) return [];
    return Object.keys(sessionStorage);
  },
  clear(): void {
    if (!hasWindow()) return;
    sessionStorage.clear();
  },
};

export function createUrlSearchParamsProvider(
  providerOptions: UrlProviderOptions = {},
): StorageProvider {
  const { push = false } = providerOptions;
  const method = push ? 'pushState' : 'replaceState';

  return {
    syncEvent: 'popstate',
    get(key: string): string | null {
      if (!hasWindow()) return null;
      return new URLSearchParams(window.location.search).get(key);
    },
    set(key: string, value: string): void {
      if (!hasWindow()) return;
      const params = new URLSearchParams(window.location.search);
      params.set(key, value);
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history[method]({}, '', newUrl);
    },
    remove(key: string): void {
      if (!hasWindow()) return;
      const params = new URLSearchParams(window.location.search);
      params.delete(key);
      const search = params.toString();
      const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      window.history[method]({}, '', newUrl);
    },
    has(key: string): boolean {
      if (!hasWindow()) return false;
      return new URLSearchParams(window.location.search).has(key);
    },
    keys(): string[] {
      if (!hasWindow()) return [];
      return [...new URLSearchParams(window.location.search).keys()];
    },
    clear(): void {
      if (!hasWindow()) return;
      const newUrl = `${window.location.pathname}${window.location.hash}`;
      window.history[method]({}, '', newUrl);
    },
  };
}

export const urlSearchParamsProvider: StorageProvider = createUrlSearchParamsProvider();

function getParamsFromHash(): URLSearchParams | null {
  if (!hasWindow()) return null;
  return new URLSearchParams(window.location.hash.slice(1));
}

export function createUrlSearchParamsInHashProvider(
  providerOptions: UrlProviderOptions = {},
): StorageProvider {
  const { push = false } = providerOptions;

  return {
    syncEvent: 'hashchange',
    get(key: string): string | null {
      return getParamsFromHash()?.get(key) ?? null;
    },
    set(key: string, value: string): void {
      const params = getParamsFromHash();
      if (!params) return;
      params.set(key, value);
      const newHash = params.toString();
      if (push) {
        window.location.hash = newHash;
      } else {
        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}${window.location.search}#${newHash}`,
        );
      }
    },
    remove(key: string): void {
      const params = getParamsFromHash();
      if (!params) return;
      params.delete(key);
      const newHash = params.toString();
      if (push) {
        window.location.hash = newHash;
      } else {
        const url = newHash
          ? `${window.location.pathname}${window.location.search}#${newHash}`
          : `${window.location.pathname}${window.location.search}`;
        window.history.replaceState({}, '', url);
      }
    },
    has(key: string): boolean {
      return getParamsFromHash()?.has(key) ?? false;
    },
    keys(): string[] {
      const params = getParamsFromHash();
      return params ? [...params.keys()] : [];
    },
    clear(): void {
      if (!hasWindow()) return;
      if (push) {
        window.location.hash = '';
      } else {
        window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
      }
    },
  };
}

export const urlSearchParamsInHashProvider: StorageProvider =
  createUrlSearchParamsInHashProvider();
