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
 * Storage instance interface
 */
export interface StorageInstance<T> {
  get value(): T | null;
  set value(newValue: T | null);
  subscribe(callback: (value: T | null) => void): () => void;
  destroy(): void;
}

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
 * Create a storage utility
 */
export function createStorage<T = string>(options: StorageOptions<T>): StorageInstance<T> {
  const {
    key,
    provider = localStorageProvider,
    initialValue = null as T | null,
    serializer = jsonSerializer,
    onChange,
  } = options;

  // Get initial value from storage or use provided initial value
  const storedValue = provider.get(key);
  let currentValue: T | null = storedValue ? serializer.deserialize(storedValue) : initialValue;

  const listeners = new Set<(value: T | null) => void>();

  // Add initial onChange callback if provided
  if (onChange) {
    listeners.add(onChange);
  }

  const notify = (value: T | null) => {
    listeners.forEach((listener) => listener(value));
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key === key) {
      const newValue = event.newValue ? serializer.deserialize(event.newValue) : null;
      currentValue = newValue;
      notify(newValue);
    }
  };

  const popstateHandler = () => {
    const value = provider.get(key);
    const newValue = value ? serializer.deserialize(value) : null;
    currentValue = newValue;
    notify(newValue);
  };

  const hashchangeHandler = () => {
    const value = provider.get(key);
    const newValue = value ? serializer.deserialize(value) : null;
    currentValue = newValue;
    notify(newValue);
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
    get value() {
      return currentValue;
    },
    set value(newValue: T | null) {
      currentValue = newValue;
      if (newValue === null) {
        provider.remove(key);
      } else {
        provider.set(key, serializer.serialize(newValue));
      }
      notify(newValue);
    },
    subscribe(callback: (value: T | null) => void) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    destroy() {
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
export function useLocalStorage<T = string>(
  key: string,
  initialValue?: T,
  options?: {
    serializer?: StorageOptions<T>['serializer'];
    onChange?: (value: T | null) => void;
  },
): StorageInstance<T> {
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
): StorageInstance<T> {
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
): StorageInstance<T> {
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
): StorageInstance<T> {
  return createStorage({
    key,
    provider: urlSearchParamsInHashProvider,
    initialValue,
    serializer: options?.serializer ?? jsonSerializer,
    onChange: options?.onChange,
  });
}
