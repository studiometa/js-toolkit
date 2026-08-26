/**
 * A synchronous string store. Providers hold serialized values only; the
 * storage instance owns serialization, namespacing and notification.
 *
 * Built-in providers report their own failures and never throw. A custom
 * provider is expected to be total in the same way.
 */
export interface StorageProvider {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  has(key: string): boolean;
  keys(): string[];
  clear(): void;
  /**
   * Window events announcing a change made outside this instance, such as
   * `storage` for another tab or `hashchange` for a navigation. A provider
   * composed of several sources names each of their events.
   *
   * Window events only: a provider whose changes arrive on a `BroadcastChannel`
   * or an observer has no way to announce them yet.
   */
  syncEvents?: readonly string[];
}

/** Convert between a stored value and its string form. Both may throw. */
export interface StorageSerializer {
  serialize(value: unknown): string;
  deserialize(value: string): unknown;
}

export interface StorageOptions {
  /** Defaults to {@link localStorageProvider}. */
  provider?: StorageProvider;
  /** Defaults to {@link jsonSerializer}. */
  serializer?: StorageSerializer;
  /** Prepended to every key, so several storages can share one provider. */
  prefix?: string;
}

/** Whether to deliver the current value when subscribing. */
export interface StorageSubscribeOptions {
  immediate?: boolean;
}

export interface StorageInstance<T extends object = Record<string, unknown>> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete<K extends keyof T>(key: K): void;
  has<K extends keyof T>(key: K): boolean;
  keys(): (keyof T)[];
  clear(): void;
  /**
   * Observe one key. Values that serialize the same are delivered once.
   *
   * @returns Unsubscribe.
   */
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K] | undefined) => void,
    options?: StorageSubscribeOptions,
  ): () => void;
  /** Release every subscription and stop observing the provider. */
  destroy(): void;
}

export interface UrlProviderOptions {
  /** Push a history entry per write instead of replacing the current one. */
  push?: boolean;
}
