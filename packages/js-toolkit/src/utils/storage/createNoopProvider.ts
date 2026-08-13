import type { StorageProvider } from './types.js';

export function createNoopProvider(): StorageProvider {
  return {
    get() {
      return null;
    },
    set() {},
    remove() {},
    has() {
      return false;
    },
    keys() {
      return [];
    },
    clear() {},
  };
}
