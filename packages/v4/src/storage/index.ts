import { createStorage } from './createStorage.js';
import {
  createUrlSearchParamsInHashProvider,
  createUrlSearchParamsProvider,
  localStorageProvider,
  sessionStorageProvider,
  urlSearchParamsInHashProvider,
  urlSearchParamsProvider,
} from './providers.js';
import type { StorageInstance, StorageOptions, UrlProviderOptions } from './types.js';

export { createStorage } from './createStorage.js';
export {
  createFallbackProvider,
  createMemoryStorageProvider,
  createUrlSearchParamsInHashProvider,
  createUrlSearchParamsProvider,
  localStorageProvider,
  memoryStorageProvider,
  sessionStorageProvider,
  urlSearchParamsInHashProvider,
  urlSearchParamsProvider,
} from './providers.js';
export { jsonSerializer } from './serializers.js';
export type {
  StorageInstance,
  StorageOptions,
  StorageProvider,
  StorageSerializer,
  StorageSubscribeOptions,
  UrlProviderOptions,
} from './types.js';

type PresetOptions = Omit<StorageOptions, 'provider'>;

/** A storage over `localStorage`. */
export function createLocalStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions,
): StorageInstance<T> {
  return createStorage<T>({ ...options, provider: localStorageProvider });
}

/** A storage over `sessionStorage`. */
export function createSessionStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions,
): StorageInstance<T> {
  return createStorage<T>({ ...options, provider: sessionStorageProvider });
}

/** A storage over the query string. */
export function createUrlSearchParamsStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage<T>({
    ...storageOptions,
    provider: push ? createUrlSearchParamsProvider({ push }) : urlSearchParamsProvider,
  });
}

/** A storage over search params held in the hash. */
export function createUrlSearchParamsInHashStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage<T>({
    ...storageOptions,
    provider: push ? createUrlSearchParamsInHashProvider({ push }) : urlSearchParamsInHashProvider,
  });
}
