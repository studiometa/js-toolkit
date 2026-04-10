import type { StorageProvider } from './types.js';
import { getGlobalStorage } from './getGlobalStorage.js';
import { getStorageKeys } from './getStorageKeys.js';

export function createLocalStorageProvider(): StorageProvider {
  return {
    syncEvent: 'storage',
    get storageArea() {
      return getGlobalStorage('localStorage');
    },
    get(key) {
      return getGlobalStorage('localStorage')?.getItem(key) ?? null;
    },
    set(key, value) {
      getGlobalStorage('localStorage')?.setItem(key, value);
    },
    remove(key) {
      getGlobalStorage('localStorage')?.removeItem(key);
    },
    has(key) {
      return getGlobalStorage('localStorage')?.getItem(key) !== null;
    },
    keys() {
      return getStorageKeys(getGlobalStorage('localStorage'));
    },
    clear() {
      getGlobalStorage('localStorage')?.clear();
    },
  };
}
