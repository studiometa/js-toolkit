import type { StorageProvider } from './types.js';
import { getGlobalStorage } from './getGlobalStorage.js';
import { getStorageKeys } from './getStorageKeys.js';

export function createSessionStorageProvider(): StorageProvider {
  return {
    get storageArea() {
      return getGlobalStorage('sessionStorage');
    },
    get(key) {
      return getGlobalStorage('sessionStorage')?.getItem(key) ?? null;
    },
    set(key, value) {
      getGlobalStorage('sessionStorage')?.setItem(key, value);
    },
    remove(key) {
      getGlobalStorage('sessionStorage')?.removeItem(key);
    },
    has(key) {
      return getGlobalStorage('sessionStorage')?.getItem(key) !== null;
    },
    keys() {
      return getStorageKeys(getGlobalStorage('sessionStorage'));
    },
    clear() {
      getGlobalStorage('sessionStorage')?.clear();
    },
  };
}
