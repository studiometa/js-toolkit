import { signal, effect, type Signal } from 'alien-signals';

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
    return getParamsFromHash()?.get(key);
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
 * Storage options
 */
export interface StorageOptions<T> {
  key: string;
  provider?: StorageProvider;
  initialValue?: T;
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  };
  onChange?: (value: T | null) => void;
}

/**
 * Default JSON serializer
 */
const jsonSerializer = {
  serialize: <T>(value: T): string => JSON.stringify(value),
  deserialize: <T>(value: string): T => JSON.parse(value),
};

/**
 * Create a reactive storage utility using alien-signals
 */
export function createStorage<T = string>(options: StorageOptions<T>): Signal<T | null> {
  const {
    key,
    provider = localStorageProvider,
    initialValue = null as T | null,
    serializer = jsonSerializer,
    onChange,
  } = options;

  // Get initial value from storage or use provided initial value
  const storedValue = provider.get(key);
  const parsedValue = storedValue ? serializer.deserialize(storedValue) : initialValue;

  // Create signal with initial value
  const storageSignal = signal<T | null>(parsedValue);

  // Create effect to sync signal changes to storage and trigger callbacks
  effect(() => {
    const value = storageSignal();
    if (value === null) {
      provider.remove(key);
    } else {
      provider.set(key, serializer.serialize(value));
    }
    onChange?.(value);
  });

  // Listen to storage events (for localStorage/sessionStorage cross-tab sync)
  if (
    typeof window !== 'undefined' &&
    (provider === localStorageProvider || provider === sessionStorageProvider)
  ) {
    window.addEventListener('storage', (event) => {
      if (event.key === key) {
        const newValue = event.newValue ? serializer.deserialize(event.newValue) : null;
        storageSignal(newValue);
      }
    });
  }

  // Listen to popstate events (for URLSearchParams back/forward navigation)
  if (typeof window !== 'undefined' && provider === urlSearchParamsProvider) {
    window.addEventListener('popstate', () => {
      const value = provider.get(key);
      const newValue = value ? serializer.deserialize(value) : null;
      storageSignal(newValue);
    });
  }

  // Listen to hashchange events (for URLSearchParams in hash navigation)
  if (typeof window !== 'undefined' && provider === urlSearchParamsInHashProvider) {
    window.addEventListener('hashchange', () => {
      const value = provider.get(key);
      const newValue = value ? serializer.deserialize(value) : null;
      storageSignal(newValue);
    });
  }

  return storageSignal;
}

/**
 * Create localStorage utility
 */
export function useLocalStorage<T = string>(
  key: string,
  initialValue?: T,
  options?: {
    serializer?: StorageOptions<T>['serializer'];
    onChange?: (value: T | null) => void;
  },
): Signal<T | null> {
  return createStorage({
    key,
    provider: localStorageProvider,
    initialValue,
    serializer: options?.serializer ?? jsonSerializer,
    onChange: options?.onChange,
  });
}

/**
 * Create sessionStorage utility
 */
export function useSessionStorage<T = string>(
  key: string,
  initialValue?: T,
  options?: {
    serializer?: StorageOptions<T>['serializer'];
    onChange?: (value: T | null) => void;
  },
): Signal<T | null> {
  return createStorage({
    key,
    provider: sessionStorageProvider,
    initialValue,
    serializer: options?.serializer ?? jsonSerializer,
    onChange: options?.onChange,
  });
}

/**
 * Create URLSearchParams utility
 */
export function useUrlSearchParams<T = string>(
  key: string,
  initialValue?: T,
  options?: {
    serializer?: StorageOptions<T>['serializer'];
    onChange?: (value: T | null) => void;
  },
): Signal<T | null> {
  return createStorage({
    key,
    provider: urlSearchParamsProvider,
    initialValue,
    serializer: options?.serializer ?? jsonSerializer,
    onChange: options?.onChange,
  });
}

/**
 * Create URLSearchParams in hash utility
 */
export function useUrlSearchParamsInHash<T = string>(
  key: string,
  initialValue?: T,
  options?: {
    serializer?: StorageOptions<T>['serializer'];
    onChange?: (value: T | null) => void;
  },
): Signal<T | null> {
  return createStorage({
    key,
    provider: urlSearchParamsInHashProvider,
    initialValue,
    serializer: options?.serializer ?? jsonSerializer,
    onChange: options?.onChange,
  });
}
