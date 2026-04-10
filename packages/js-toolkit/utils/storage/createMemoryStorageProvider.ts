import type { StorageProvider } from './types.js';

export function createMemoryStorageProvider(): StorageProvider {
  const map = new Map<string, string>();

  return {
    get(key) {
      return map.get(key) ?? null;
    },
    set(key, value) {
      map.set(key, value);
    },
    remove(key) {
      map.delete(key);
    },
    has(key) {
      return map.has(key);
    },
    keys() {
      return [...map.keys()];
    },
    clear() {
      map.clear();
    },
  };
}
