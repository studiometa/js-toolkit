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

/**
 * A storage over `localStorage`.
 * @link https://js-toolkit-v4.studiometa.dev/api/storage/presets.html
 */
export function createLocalStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions,
): StorageInstance<T> {
  return createStorage<T>({ ...options, provider: localStorageProvider });
}

/**
 * A storage over `sessionStorage`.
 * @link https://js-toolkit-v4.studiometa.dev/api/storage/presets.html
 */
export function createSessionStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions,
): StorageInstance<T> {
  return createStorage<T>({ ...options, provider: sessionStorageProvider });
}

/**
 * A storage over the query string.
 * @link https://js-toolkit-v4.studiometa.dev/api/storage/presets.html
 */
export function createUrlSearchParamsStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage<T>({
    ...storageOptions,
    provider: push ? createUrlSearchParamsProvider({ push }) : urlSearchParamsProvider,
  });
}

/**
 * A storage over search params held in the hash.
 * @link https://js-toolkit-v4.studiometa.dev/api/storage/presets.html
 */
export function createUrlSearchParamsInHashStorage<T extends object = Record<string, unknown>>(
  options?: PresetOptions & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage<T>({
    ...storageOptions,
    provider: push ? createUrlSearchParamsInHashProvider({ push }) : urlSearchParamsInHashProvider,
  });
}
