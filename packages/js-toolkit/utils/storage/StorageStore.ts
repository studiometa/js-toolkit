import { hasWindow } from '../has.js';
import { jsonSerializer } from './serializers.js';
import { localStorageProvider } from './providers.js';
import type { StorageInstance, StorageOptions } from './types.js';

export class StorageStore<T extends Record<string, any> = Record<string, any>>
  implements StorageInstance<T>
{
  private provider;
  private serializer;
  private prefix;
  private listeners = new Map<keyof T, Set<(value: any) => void>>();

  constructor(options: StorageOptions<T> = {}) {
    const {
      provider = localStorageProvider,
      serializer = jsonSerializer,
      prefix = '',
    } = options;

    this.provider = provider;
    this.serializer = serializer;
    this.prefix = prefix;

    if (hasWindow() && this.provider.syncEvent) {
      window.addEventListener(this.provider.syncEvent, this.syncHandler);
    }
  }

  get<K extends keyof T>(key: K): T[K] | undefined;
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined {
    const storedValue = this.provider.get(this.resolveKey(key as string));
    if (storedValue !== null) {
      const deserialized = this.serializer.deserialize(storedValue);
      if (deserialized !== undefined) {
        return deserialized;
      }
    }
    return defaultValue;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const resolved = this.resolveKey(key as string);
    this.provider.set(resolved, this.serializer.serialize(value));
    this.listeners.get(key)?.forEach((callback) => callback(value));
  }

  delete<K extends keyof T>(key: K): void {
    this.provider.remove(this.resolveKey(key as string));
    this.listeners.get(key)?.forEach((callback) => callback(undefined));
  }

  has<K extends keyof T>(key: K): boolean {
    return this.provider.has(this.resolveKey(key as string));
  }

  keys(): (keyof T)[] {
    const allKeys = this.provider.keys();
    if (!this.prefix) {
      return allKeys as (keyof T)[];
    }

    return allKeys
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.slice(this.prefix.length) as keyof T);
  }

  clear(): void {
    if (this.prefix) {
      const keysToRemove = this.provider.keys().filter((key) => key.startsWith(this.prefix));
      for (const key of keysToRemove) {
        this.provider.remove(key);
      }
    } else {
      this.provider.clear();
    }

    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => callback(undefined));
    });
  }

  subscribe<K extends keyof T>(key: K, callback: (value: T[K] | undefined) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
      if (this.listeners.get(key)?.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  destroy(): void {
    this.listeners.clear();
    if (hasWindow() && this.provider.syncEvent) {
      window.removeEventListener(this.provider.syncEvent, this.syncHandler);
    }
  }

  private resolveKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private syncHandler = (event: Event) => {
    if (event instanceof StorageEvent) {
      if (this.provider.storageArea && event.storageArea !== this.provider.storageArea) {
        return;
      }

      const rawKey = event.key;
      for (const [listenerKey, callbacks] of this.listeners) {
        if (this.resolveKey(listenerKey as string) === rawKey) {
          const newValue = event.newValue
            ? this.serializer.deserialize(event.newValue)
            : undefined;
          callbacks.forEach((callback) => callback(newValue));
          break;
        }
      }
      return;
    }

    this.listeners.forEach((callbacks, key) => {
      const value = this.provider.get(this.resolveKey(key as string));
      const newValue = value !== null ? this.serializer.deserialize(value) : undefined;
      callbacks.forEach((callback) => callback(newValue));
    });
  };
}

export function createStorage<T extends Record<string, any> = Record<string, any>>(
  options: StorageOptions<T> = {},
): StorageInstance<T> {
  return new StorageStore(options);
}
