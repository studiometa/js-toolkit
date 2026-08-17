import { reportDiagnostic } from '../diagnostics.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';
import type { StorageProvider, UrlProviderOptions } from './types.js';

/**
 * Run one provider operation, reporting instead of throwing.
 *
 * Web storage fails for reasons the caller cannot prevent: a quota that is
 * full, or an area the browser refuses to hand over. Both are reported once
 * per occurrence rather than swallowed, because a silent write is data loss.
 */
function guard<T>(fallback: T, operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    reportDiagnostic('storage.access-failed', 'A storage operation failed.', error);
    return fallback;
  }
}

/**
 * `localStorage` and `sessionStorage` differ only in which area they name.
 *
 * Internal, and called twice: the adapter holds no state of its own — every
 * method resolves `globalThis[name]` per call — so a second instance would
 * behave exactly like the shared one. The package exports the instances.
 */
function createWebStorageProvider(name: 'localStorage' | 'sessionStorage'): StorageProvider {
  // Resolved per call: the area getter itself throws when storage is denied.
  const area = () => globalThis[name];

  return {
    syncEvents: ['storage'],
    get: (key) => guard(null, () => area().getItem(key)),
    set: (key, value) => guard(undefined, () => area().setItem(key, value)),
    remove: (key) => guard(undefined, () => area().removeItem(key)),
    has: (key) => guard(false, () => area().getItem(key) !== null),
    keys: () =>
      guard([], () => {
        const storage = area();
        return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
          (key): key is string => key !== null,
        );
      }),
    clear: () => guard(undefined, () => area().clear()),
  };
}

/** A provider backed by a `Map`, for tests and for opting out of persistence. */
export function createMemoryStorageProvider(): StorageProvider {
  const map = new Map<string, string>();

  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
    remove: (key) => void map.delete(key),
    has: (key) => map.has(key),
    keys: () => [...map.keys()],
    clear: () => map.clear(),
  };
}

/** Read from the first provider holding the key; write through to all of them. */
export function createFallbackProvider(...providers: StorageProvider[]): StorageProvider {
  const syncEvents = [...new Set(providers.flatMap((provider) => provider.syncEvents ?? []))];

  return {
    syncEvents,
    get(key) {
      for (const provider of providers) {
        const value = provider.get(key);
        if (value !== null) {
          return value;
        }
      }
      return null;
    },
    set(key, value) {
      for (const provider of providers) {
        provider.set(key, value);
      }
    },
    remove(key) {
      for (const provider of providers) {
        provider.remove(key);
      }
    },
    has(key) {
      return providers.some((provider) => provider.has(key));
    },
    keys() {
      return [...new Set(providers.flatMap((provider) => provider.keys()))];
    },
    clear() {
      for (const provider of providers) {
        provider.clear();
      }
    },
  };
}

/** Build the URL a write lands on, keeping the parts the provider does not own. */
function createUrlProvider(
  read: () => URLSearchParams,
  toUrl: (params: URLSearchParams) => string,
  syncEvents: readonly string[],
  { push = false }: UrlProviderOptions,
): StorageProvider {
  const commit = (params: URLSearchParams) => {
    history[push ? 'pushState' : 'replaceState']({}, '', toUrl(params));
  };

  return {
    syncEvents,
    get: (key) => read().get(key),
    set(key, value) {
      const params = read();
      params.set(key, value);
      commit(params);
    },
    remove(key) {
      const params = read();
      params.delete(key);
      commit(params);
    },
    has: (key) => read().has(key),
    keys: () => [...new Set(read().keys())],
    clear: () => commit(new URLSearchParams()),
  };
}

/** Store values in the query string. */
export function createUrlSearchParamsProvider(options: UrlProviderOptions = {}): StorageProvider {
  return createUrlProvider(
    () => new URLSearchParams(location.search),
    (params) => {
      const search = params.toString();
      return `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
    },
    ['popstate'],
    options,
  );
}

/**
 * Store values in the hash, as search params.
 *
 * Back and forward navigation announces itself as `hashchange`, and as
 * `popstate` when the write replaced the entry rather than pushing one.
 */
export function createUrlSearchParamsInHashProvider(
  options: UrlProviderOptions = {},
): StorageProvider {
  return createUrlProvider(
    () => new URLSearchParams(location.hash.slice(1)),
    (params) => {
      const hash = params.toString();
      return `${location.pathname}${location.search}${hash ? `#${hash}` : ''}`;
    },
    ['hashchange', 'popstate'],
    options,
  );
}

/**
 * Shared default providers. The memory provider holds state, so evaluated
 * package copies must resolve the same one.
 */
const defaults = /* @__PURE__ */ getSharedRuntimeSlot('storage:providers', 1, () => ({
  local: createWebStorageProvider('localStorage'),
  session: createWebStorageProvider('sessionStorage'),
  memory: createMemoryStorageProvider(),
  urlSearchParams: createUrlSearchParamsProvider(),
  urlSearchParamsInHash: createUrlSearchParamsInHashProvider(),
}));

export const localStorageProvider = defaults.local;
export const sessionStorageProvider = defaults.session;
export const memoryStorageProvider = defaults.memory;
export const urlSearchParamsProvider = defaults.urlSearchParams;
export const urlSearchParamsInHashProvider = defaults.urlSearchParamsInHash;
