import { hasWindow } from './has.js';

/**
 * Storage provider interface.
 *
 * Providers can declare `syncEvent` to indicate which DOM event
 * should be listened to for external changes (cross-tab, navigation, etc.).
 */
export interface StorageProvider<T = string> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): void;
  has(key: string): boolean;
  /** Return all keys managed by this provider. */
  keys(): string[];
  /** Remove all entries managed by this provider. */
  clear(): void;
  /**
   * The DOM event name to listen for external sync.
   * - `'storage'` for localStorage/sessionStorage (cross-tab sync)
   * - `'popstate'` for URL search params (back/forward navigation)
   * - `'hashchange'` for URL hash params (hash navigation)
   */
  syncEvent?: string;
}

/**
 * localStorage provider.
 */
export const localStorageProvider: StorageProvider = {
  syncEvent: 'storage',
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

/**
 * sessionStorage provider.
 */
export const sessionStorageProvider: StorageProvider = {
  syncEvent: 'storage',
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

/**
 * Options for URL-based providers.
 */
export interface UrlProviderOptions {
  /**
   * Whether to use `pushState` instead of `replaceState`.
   * @default false
   */
  push?: boolean;
}

/**
 * Create a URLSearchParams provider.
 *
 * @param   {UrlProviderOptions} [providerOptions] Options for the provider.
 * @returns {StorageProvider}
 */
export function createUrlSearchParamsProvider(
  providerOptions: UrlProviderOptions = {},
): StorageProvider {
  const { push = false } = providerOptions;
  const method = push ? 'pushState' : 'replaceState';

  return {
    syncEvent: 'popstate',
    get(key: string): string | null {
      if (!hasWindow()) return null;
      const params = new URLSearchParams(window.location.search);
      return params.get(key);
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
      const params = new URLSearchParams(window.location.search);
      return params.has(key);
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

/**
 * Default URLSearchParams provider (uses `replaceState`).
 */
export const urlSearchParamsProvider: StorageProvider = createUrlSearchParamsProvider();

function getParamsFromHash(): URLSearchParams | null {
  if (!hasWindow()) return null;
  const hash = window.location.hash.slice(1); // Remove the '#'
  return new URLSearchParams(hash);
}

/**
 * Create a URLSearchParams in hash provider.
 *
 * @param   {UrlProviderOptions} [providerOptions] Options for the provider.
 * @returns {StorageProvider}
 */
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
        window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}#${newHash}`);
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

/**
 * Default URLSearchParams in hash provider.
 */
export const urlSearchParamsInHashProvider: StorageProvider = createUrlSearchParamsInHashProvider();

/**
 * Storage instance interface for multi-key storage.
 */
export interface StorageInstance<T = any> {
  get<K extends keyof T>(key: K): T[K] | null;
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  set<K extends keyof T>(key: K, value: T[K] | null): void;
  has<K extends keyof T>(key: K): boolean;
  keys(): (keyof T)[];
  clear(): void;
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K] | null) => void,
  ): () => void;
  destroy(): void;
}

/**
 * Serializer interface.
 */
export interface StorageSerializer {
  serialize: (value: any) => string;
  deserialize: (value: string) => any;
}

/**
 * Storage options.
 */
export interface StorageOptions<T = any> {
  /**
   * The storage provider to use.
   * @default localStorageProvider
   */
  provider?: StorageProvider;
  /**
   * Custom serializer for values.
   * @default jsonSerializer (JSON.stringify / JSON.parse)
   */
  serializer?: StorageSerializer;
  /**
   * Key prefix for namespacing. All keys will be prefixed with this string.
   * @example 'myapp:' will store key 'theme' as 'myapp:theme'
   */
  prefix?: string;
}

/**
 * Default JSON serializer.
 */
const jsonSerializer: StorageSerializer = {
  serialize: <T>(value: T): string => JSON.stringify(value),
  deserialize: <T>(value: string): T => JSON.parse(value),
};

/**
 * Create a multi-key storage instance.
 *
 * @param   {StorageOptions} [options] Storage options.
 * @returns {StorageInstance}
 */
export function createStorage<T extends Record<string, any> = Record<string, any>>(
  options: StorageOptions<T> = {},
): StorageInstance<T> {
  const {
    provider = localStorageProvider,
    serializer = jsonSerializer,
    prefix = '',
  } = options;

  const listeners = new Map<keyof T, Set<(value: any) => void>>();

  /** Resolve the actual storage key with prefix. */
  const resolveKey = (key: string): string => `${prefix}${key}`;

  const syncHandler = (event: Event) => {
    // For StorageEvent, only react to keys we're listening to
    if (event instanceof StorageEvent) {
      const rawKey = event.key;
      // Find matching listener key (strip prefix)
      for (const [listenerKey, callbacks] of listeners) {
        if (resolveKey(listenerKey as string) === rawKey) {
          const newValue = event.newValue ? serializer.deserialize(event.newValue) : null;
          callbacks.forEach((callback) => callback(newValue));
          break;
        }
      }
      return;
    }

    // For popstate/hashchange, re-read all listened keys from provider
    listeners.forEach((callbacks, key) => {
      const value = provider.get(resolveKey(key as string));
      const newValue = value !== null ? serializer.deserialize(value) : null;
      callbacks.forEach((callback) => callback(newValue));
    });
  };

  // Listen to sync events based on the provider's declared syncEvent
  if (hasWindow() && provider.syncEvent) {
    window.addEventListener(provider.syncEvent, syncHandler);
  }

  return {
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | null {
      const storedValue = provider.get(resolveKey(key as string));
      if (storedValue !== null) {
        return serializer.deserialize(storedValue);
      }
      return defaultValue !== undefined ? defaultValue : null;
    },

    set<K extends keyof T>(key: K, value: T[K] | null): void {
      const resolved = resolveKey(key as string);
      if (value === null) {
        provider.remove(resolved);
      } else {
        provider.set(resolved, serializer.serialize(value));
      }

      // Notify listeners
      listeners.get(key)?.forEach((callback) => callback(value));
    },

    has<K extends keyof T>(key: K): boolean {
      return provider.has(resolveKey(key as string));
    },

    keys(): (keyof T)[] {
      const allKeys = provider.keys();
      if (!prefix) {
        return allKeys as (keyof T)[];
      }
      return allKeys
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length) as keyof T);
    },

    clear(): void {
      if (prefix) {
        // Only clear keys matching our prefix
        const keysToRemove = provider.keys().filter((k) => k.startsWith(prefix));
        for (const key of keysToRemove) {
          provider.remove(key);
        }
      } else {
        provider.clear();
      }

      // Notify all listeners with null
      listeners.forEach((callbacks) => {
        callbacks.forEach((callback) => callback(null));
      });
    },

    subscribe<K extends keyof T>(key: K, callback: (value: T[K] | null) => void): () => void {
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }
      listeners.get(key)!.add(callback);

      return () => {
        listeners.get(key)?.delete(callback);
        if (listeners.get(key)?.size === 0) {
          listeners.delete(key);
        }
      };
    },

    destroy(): void {
      listeners.clear();
      if (hasWindow() && provider.syncEvent) {
        window.removeEventListener(provider.syncEvent, syncHandler);
      }
    },
  };
}

/**
 * Create a localStorage utility.
 *
 * @param   {StorageOptions} [options] Storage options (prefix, serializer).
 * @returns {StorageInstance}
 */
export function useLocalStorage<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions<T>, 'provider'>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: localStorageProvider });
}

/**
 * Create a sessionStorage utility.
 *
 * @param   {StorageOptions} [options] Storage options (prefix, serializer).
 * @returns {StorageInstance}
 */
export function useSessionStorage<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions<T>, 'provider'>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: sessionStorageProvider });
}

/**
 * Create a URLSearchParams utility.
 *
 * @param   {StorageOptions & UrlProviderOptions} [options] Storage and URL provider options.
 * @returns {StorageInstance}
 */
export function useUrlSearchParams<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions<T>, 'provider'> & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage({
    ...storageOptions,
    provider: push ? createUrlSearchParamsProvider({ push }) : urlSearchParamsProvider,
  });
}

/**
 * Create a URLSearchParams in hash utility.
 *
 * @param   {StorageOptions & UrlProviderOptions} [options] Storage and URL provider options.
 * @returns {StorageInstance}
 */
export function useUrlSearchParamsInHash<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions<T>, 'provider'> & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage({
    ...storageOptions,
    provider: push
      ? createUrlSearchParamsInHashProvider({ push })
      : urlSearchParamsInHashProvider,
  });
}
