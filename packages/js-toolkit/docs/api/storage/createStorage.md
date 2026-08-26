# createStorage

```ts
createStorage<T extends object = Record<string, unknown>>(options?: StorageOptions): StorageInstance<T>
```

A typed, observable key-value store.

```ts
interface StorageOptions {
  provider?: StorageProvider;
  serializer?: StorageSerializer;
  prefix?: string;
}
```

[[toc]]

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"3b52781a9fd9477467122dfbda2de7ef27f9adf8be383feac2c5901ec2013118","data":"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"}
import { createStorage, memoryStorageProvider } from '@studiometa/js-toolkit';

interface Prefs {
  theme: 'light' | 'dark';
  seen: string[];
}

const prefs = createStorage<Prefs>({
  provider: memoryStorageProvider,
  prefix: 'app:',
});

prefs.set('theme', 'dark');
prefs.get('theme'); // 'light' | 'dark' | undefined
prefs.get('theme', 'light'); // 'light' | 'dark'
prefs.has('seen');
prefs.keys();
prefs.delete('seen');
prefs.clear();
prefs.destroy();
```

## The instance

```ts
interface StorageInstance<T extends object = Record<string, unknown>> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete<K extends keyof T>(key: K): void;
  has<K extends keyof T>(key: K): boolean;
  keys(): (keyof T)[];
  clear(): void;
  subscribe<K extends keyof T>(
    key: K,
    callback: (value: T[K] | undefined) => void,
    options?: { immediate?: boolean },
  ): () => void;
  destroy(): void;
}
```

The two `get` overloads are the whole difference between "it may not be there" and "here is what to use if it is not".

## Observing a key

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"d99b7d55d59b11e79868b98b3639cddb90fbbef75d642aea9f19bf6f3f23884e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAgFdXOAjORqQCWvGInYAKAJTsAvAD52RCEKiUQbAIakGiAGxUANjDABzNPiQBGK1TTbTMXSG5w+A4aPWGhYXIgAGKkZ8bU1GGnJ9AF8KdGx/AmIydRp6JhY2dixSGAAzOHEAZTQIUk1HAElWezBGGAAeAAVcgvl1LR0kACYgkGMzCyQAVjsHJzwc/IQjX38+kLCIlMRe2PicPEIScjs6ZwkAWydCKBkSsoqYaq06xpbp+QA6N35BEUaAHWp8GGPv+QSADWMAw4m+Fj+MG+FHYjE0hkMvHCQPEEiICM4YnY3x8pnwaG+7AAPjiQFBtECiaTuLA8nMznJFMpVLCIFg0EJMgB+YqlcqOIrud6iADyHK5rCkaJkCiUKjUVCgEEYCEQIFF/DIJHYLBg7BBGCe7AAapj4OwLJoOHAyEIEUIAF76yHsOCaY7sbT62A+HYwKC6u5PVIVNXIZAgXJoTikVjqACqPDenhgIYAuumqJ1dN0DP0TOZLIgAJxjUiOZyvDwfbxzJALULlZZRPPragJLbJXbUfZ4CRYMLHSIyDGGLHg/pCfGEkAkskU0hUuc0sB0hkdexdRDDWwFwbF0bUcbOMdYut+HrBJvhSJIADM7cwm3V2xSe3S6oxpHYysYnGOMA0HEAARFUAJMBglRVNUQAAKjggADAB3XxlWQp4/wgoDEIQ9ho1jVgvXw/IyBMepLQgS1fl/cDAI4ZggM0Bl2F8aj9VQtcIAwz4wF45AAFkQIAOXYAAlUjcjudMJAJNAsEKAB6RTYBIQx2TIJ5DggR0hERTQnjKUwVJgxSAHUYF4RSAEEmkqcy0O4kz/3oqRN20XQ9AAdiMQshkQAAOctKzwLD6Ivfx72vJY70QAAWJ9O1fbtUj7dUB1IDSdAwGQwJcyDMLoyCAFFjHo8QAAkABUBIAGVKqEgPUP9YKqmiEMQsKSrKyDcLgkjNCgABaFhDAwbJMpwbLdTydj2Dy7COF8SI8nCfUCLjOA5oa+jqOtVittdTKIA4GAeqAma5q6i6JDyMp2DoD0sGMWFXQaAlDkMRQzsajg7p/aq6to/KgLgKQnl4/ihNEiS8jI6TZLQeSlJUmA1KyrSdL0wwDKM5y4HMyybLsxSFvo5zFp2yC3OzLddC8/MBiLawjy3EL1WutAqaa2ZL0QKKQEWZtYqsR84g7F8kh2VLPxADKsswGRAdq0VSCKE0AHFubQTDrU0W1gPm0UBJKYQzAEzQsGamC8EEkTxMk8iYBkuSFMQZTVLOjHtN0/TDIrfHCas2z7OV7WVL1g2aY0OmkBLbpfIPJAfOPCsJg5yOJl5yLouFlZuhLRLJbfHs0gONC6Fy43Td8UwLawZA2DN0x03EJva/nWl8g3WmPOsAI+iZ/zWZPPBIWOCKH1z28VnvLyi8SEuZYOQdymHMhR3NSc8QJakF0pPeu/pPxFRjvvECsAIgv3Zmd2C9OQDPXBs6nwWbxbJA4uGBeu2lj8V8mmQRW7ALgChgEKFMHxxSckyE8IQhxjhQHtDQXk7BeAQAgMYTQYBO5rm7ifdy25RZHiHsWMsqd2YgHgYg5Bz8px8yPELGeUQEpZkFtARIjEsiuGFKmOQE1pgvF4R8CQvF2DsAAOTjxgBIigYjJBP1lIoYA8jxGc0KiDLm50dYUnsAbJ40j+FP3YNybkkid5oAkQAbnkbEeRwBWIIIDLQ8QaBSBYnYHYsAUgrHqGHJoJAoB9gmDgJKMeCBojRCAA="}
import { createStorage } from '@studiometa/js-toolkit';

interface Prefs {
  theme: 'light' | 'dark';
}
const prefs = createStorage<Prefs>();
// ---cut---
const unsubscribe = prefs.subscribe(
  'theme',
  (value) => {
    document.documentElement.dataset.theme = value ?? 'light';
  },
  { immediate: true },
);
```

A [`Signal`](/api/context/signal.html) is created **per key, on the first subscription**, so a store nobody observes holds nothing.

In a component, hand the unsubscribe back from `mounted()`:

```js
mounted() {
  return prefs.subscribe('theme', (value) => this.apply(value));
}
```

## `destroy()`

Releases every subscription and the shared sync listeners at once. A store that outlives the page needs no call; a store scoped to a component does.

## `prefix`

Namespaces every key in the underlying provider, so two stores can share one backing area without colliding. The prefix is the store's business — a provider never sees an unprefixed key and never adds one.

## `serializer`

```ts
interface StorageSerializer {
  serialize(value: unknown): string;
  deserialize(value: string): unknown;
}
```

Defaults to `jsonSerializer`. Failures are reported, not thrown:

- `storage.serialize-failed` — **nothing is written**;
- `storage.deserialize-failed` — the default is returned.

## Syncing with the outside

`syncEvents` on the provider is a list of window event names and nothing more. `createStorage()` subscribes **one shared, reference-counted listener per name** while at least one key is observed, and re-reads every observed key when it fires.

The event carries no usable state, so the subscriber re-reads rather than trusting a payload.

::: warning A known gap
A provider whose changes arrive on a `BroadcastChannel` or through an observer has no way to announce them yet.
:::

## In Node

One storage instance runs in Node over the memory provider, which is what `test/package-node-consumer.js` exercises. Nothing in the store touches `window` unless a provider's `syncEvents` asks for it.
