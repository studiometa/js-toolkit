export interface StorageProvider {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  has(key: string): boolean;
  keys(): string[];
  clear(): void;
  syncEvent?: string;
  storageArea?: Storage;
}

export interface StorageInstance<T = any> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  set<K extends keyof T>(key: K, value: T[K] | null): void;
  has<K extends keyof T>(key: K): boolean;
  keys(): (keyof T)[];
  clear(): void;
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K] | undefined) => void,
  ): () => void;
  destroy(): void;
}

export interface StorageSerializer {
  serialize: (value: any) => string;
  deserialize: (value: string) => any;
}

export interface StorageOptions<T = any> {
  provider?: StorageProvider;
  serializer?: StorageSerializer;
  prefix?: string;
}

export interface UrlProviderOptions {
  push?: boolean;
}
