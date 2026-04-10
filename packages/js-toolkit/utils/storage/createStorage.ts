import { hasWindow } from '../has.js';
import { localStorageProvider } from './providers.js';
import { jsonSerializer } from './serializers.js';
import type { StorageInstance, StorageOptions } from './types.js';

export function createStorage<T extends Record<string, any> = Record<string, any>>(
  options: StorageOptions<T> = {},
): StorageInstance<T> {
  const {
    provider = localStorageProvider,
    serializer = jsonSerializer,
    prefix = '',
  } = options;

  const listeners = new Map<keyof T, Set<(value: any) => void>>();

  function resolveKey(key: string): string {
    return `${prefix}${key}`;
  }

  function syncHandler(event: Event): void {
    if (event instanceof StorageEvent) {
      if (provider.storageArea && event.storageArea !== provider.storageArea) {
        return;
      }

      const rawKey = event.key;
      for (const [listenerKey, callbacks] of listeners) {
        if (resolveKey(listenerKey as string) === rawKey) {
          const newValue = event.newValue ? serializer.deserialize(event.newValue) : undefined;
          callbacks.forEach((callback) => callback(newValue));
          break;
        }
      }
      return;
    }

    listeners.forEach((callbacks, key) => {
      const value = provider.get(resolveKey(key as string));
      const newValue = value !== null ? serializer.deserialize(value) : undefined;
      callbacks.forEach((callback) => callback(newValue));
    });
  }

  if (hasWindow() && provider.syncEvent) {
    window.addEventListener(provider.syncEvent, syncHandler);
  }

  return {
    get(key, defaultValue?) {
      const storedValue = provider.get(resolveKey(key as string));
      if (storedValue !== null) {
        const deserialized = serializer.deserialize(storedValue);
        if (deserialized !== undefined) {
          return deserialized;
        }
      }
      return defaultValue;
    },
    set(key, value) {
      provider.set(resolveKey(key as string), serializer.serialize(value));
      listeners.get(key)?.forEach((callback) => callback(value));
    },
    delete(key) {
      provider.remove(resolveKey(key as string));
      listeners.get(key)?.forEach((callback) => callback(undefined));
    },
    has(key) {
      return provider.has(resolveKey(key as string));
    },
    keys() {
      const allKeys = provider.keys();
      if (!prefix) {
        return allKeys as (keyof T)[];
      }

      return allKeys
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.slice(prefix.length) as keyof T);
    },
    clear() {
      if (prefix) {
        provider
          .keys()
          .filter((key) => key.startsWith(prefix))
          .forEach((key) => provider.remove(key));
      } else {
        provider.clear();
      }

      listeners.forEach((callbacks) => {
        callbacks.forEach((callback) => callback(undefined));
      });
    },
    subscribe(key, callback) {
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }

      listeners.get(key)?.add(callback);

      return () => {
        listeners.get(key)?.delete(callback);
        if (listeners.get(key)?.size === 0) {
          listeners.delete(key);
        }
      };
    },
    destroy() {
      listeners.clear();
      if (hasWindow() && provider.syncEvent) {
        window.removeEventListener(provider.syncEvent, syncHandler);
      }
    },
  };
}
