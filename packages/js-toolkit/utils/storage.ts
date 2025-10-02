/**
 * Storage provider interface
 */
export interface StorageProvider<T = string> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): void;
  has(key: string): boolean;
}

/**
 * localStorage provider
 */
export const localStorageProvider: StorageProvider = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) !== null;
  },
};

/**
 * sessionStorage provider
 */
export const sessionStorageProvider: StorageProvider = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(key) !== null;
  },
};

/**
 * URLSearchParams provider
 */
export const urlSearchParamsProvider: StorageProvider = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  },
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has(key);
  },
};

function getParamsFromHash(): URLSearchParams | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.slice(1); // Remove the '#'
  return new URLSearchParams(hash);
}

/**
 * URLSearchParams in hash provider
 */
export const urlSearchParamsInHashProvider: StorageProvider = {
  get(key: string): string | null {
    return getParamsFromHash()?.get(key) ?? null;
  },
  set(key: string, value: string): void {
    const params = getParamsFromHash();
    if (!params) return;
    params.set(key, value);
    const newHash = params.toString();
    window.location.hash = newHash;
  },
  remove(key: string): void {
    const params = getParamsFromHash();
    if (!params) return;
    params.delete(key);
    const newHash = params.toString();
    window.location.hash = newHash;
  },
  has(key: string): boolean {
    return getParamsFromHash()?.has(key) ?? false;
  },
};

/**
 * Storage instance interface for multi-key storage
 */
export interface StorageInstance<T = any> {
  get<K extends keyof T>(key: K): T[K] | null;
  set<K extends keyof T>(key: K, value: T[K] | null): void;
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K] | null) => void,
  ): () => void;
  destroy(): void;
}

/**
 * Storage options
 */
export interface StorageOptions<T = any> {
  provider?: StorageProvider;
  serializer?: {
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
  };
}

/**
 * Default JSON serializer
 */
const jsonSerializer = {
  serialize: <T>(value: T): string => JSON.stringify(value),
  deserialize: <T>(value: string): T => JSON.parse(value),
};

/**
 * Create a multi-key storage instance
 */
export function createStorage<T extends Record<string, any> = Record<string, any>>(
  options: StorageOptions<T> = {},
): StorageInstance<T> {
  const { provider = localStorageProvider, serializer = jsonSerializer } = options;

  const listeners = new Map<keyof T, Set<(value: any) => void>>();
  const storageHandler = (event: StorageEvent) => {
    const key = event.key as keyof T;
    if (listeners.has(key)) {
      const newValue = event.newValue ? serializer.deserialize(event.newValue) : null;
      listeners.get(key)?.forEach((callback) => callback(newValue));
    }
  };

  const popstateHandler = () => {
    listeners.forEach((callbacks, key) => {
      const value = provider.get(key as string);
      const newValue = value ? serializer.deserialize(value) : null;
      callbacks.forEach((callback) => callback(newValue));
    });
  };

  const hashchangeHandler = () => {
    listeners.forEach((callbacks, key) => {
      const value = provider.get(key as string);
      const newValue = value ? serializer.deserialize(value) : null;
      callbacks.forEach((callback) => callback(newValue));
    });
  };

  // Listen to storage events (for localStorage/sessionStorage cross-tab sync)
  if (
    typeof window !== 'undefined' &&
    (provider === localStorageProvider || provider === sessionStorageProvider)
  ) {
    window.addEventListener('storage', storageHandler);
  }

  // Listen to popstate events (for URLSearchParams back/forward navigation)
  if (typeof window !== 'undefined' && provider === urlSearchParamsProvider) {
    window.addEventListener('popstate', popstateHandler);
  }

  // Listen to hashchange events (for URLSearchParams in hash navigation)
  if (typeof window !== 'undefined' && provider === urlSearchParamsInHashProvider) {
    window.addEventListener('hashchange', hashchangeHandler);
  }

  return {
    get<K extends keyof T>(key: K): T[K] | null {
      const storedValue = provider.get(key as string);
      return storedValue ? serializer.deserialize(storedValue) : null;
    },

    set<K extends keyof T>(key: K, value: T[K] | null): void {
      if (value === null) {
        provider.remove(key as string);
      } else {
        provider.set(key as string, serializer.serialize(value));
      }

      // Notify listeners
      listeners.get(key)?.forEach((callback) => callback(value));
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
      if (typeof window !== 'undefined') {
        if (provider === localStorageProvider || provider === sessionStorageProvider) {
          window.removeEventListener('storage', storageHandler);
        }
        if (provider === urlSearchParamsProvider) {
          window.removeEventListener('popstate', popstateHandler);
        }
        if (provider === urlSearchParamsInHashProvider) {
          window.removeEventListener('hashchange', hashchangeHandler);
        }
      }
    },
  };
}

/**
 * Create localStorage utility
 */
export function useLocalStorage<T extends Record<string, any> = Record<string, any>>(
  options?: StorageOptions<T>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: localStorageProvider });
}

/**
 * Create sessionStorage utility
 */
export function useSessionStorage<T extends Record<string, any> = Record<string, any>>(
  options?: StorageOptions<T>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: sessionStorageProvider });
}

/**
 * Create URLSearchParams utility
 */
export function useUrlSearchParams<T extends Record<string, any> = Record<string, any>>(
  options?: StorageOptions<T>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: urlSearchParamsProvider });
}

/**
 * Create URLSearchParams in hash utility
 */
export function useUrlSearchParamsInHash<T extends Record<string, any> = Record<string, any>>(
  options?: StorageOptions<T>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: urlSearchParamsInHashProvider });
}
