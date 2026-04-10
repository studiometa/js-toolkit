export type {
  StorageInstance,
  StorageOptions,
  StorageProvider,
  StorageSerializer,
  UrlProviderOptions,
} from './types.js';

export {
  createLocalStorageProvider,
  createNoopProvider,
  createSessionStorageProvider,
  createUrlSearchParamsInHashProvider,
  createUrlSearchParamsProvider,
  localStorageProvider,
  sessionStorageProvider,
  urlSearchParamsInHashProvider,
  urlSearchParamsProvider,
} from './providers.js';
export { createStorage } from './createStorage.js';

import type { StorageInstance, StorageOptions, UrlProviderOptions } from './types.js';
import { createStorage } from './createStorage.js';
import {
  createUrlSearchParamsInHashProvider,
  createUrlSearchParamsProvider,
  localStorageProvider,
  sessionStorageProvider,
  urlSearchParamsInHashProvider,
  urlSearchParamsProvider,
} from './providers.js';

export function createLocalStorage<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions, 'provider'>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: localStorageProvider });
}

export function createSessionStorage<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions, 'provider'>,
): StorageInstance<T> {
  return createStorage({ ...options, provider: sessionStorageProvider });
}

export function createUrlSearchParamsStorage<T extends Record<string, any> = Record<string, any>>(
  options?: Omit<StorageOptions, 'provider'> & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage({
    ...storageOptions,
    provider: push ? createUrlSearchParamsProvider({ push }) : urlSearchParamsProvider,
  });
}

export function createUrlSearchParamsInHashStorage<
  T extends Record<string, any> = Record<string, any>,
>(
  options?: Omit<StorageOptions, 'provider'> & UrlProviderOptions,
): StorageInstance<T> {
  const { push, ...storageOptions } = options ?? {};
  return createStorage({
    ...storageOptions,
    provider: push
      ? createUrlSearchParamsInHashProvider({ push })
      : urlSearchParamsInHashProvider,
  });
}
