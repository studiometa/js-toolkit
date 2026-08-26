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
// @twoslash-cache: {"v":1,"hash":"f5bf1527302f20e2a42948e95e18d3cffb44ca0500c456b6afdc04c4aa23bdad","data":"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"}
import { createStorage, memoryStorageProvider } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"382219cd7a1dc6a7ff81ebfd705b749f48e155ac061c7791155072931527c9a4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAgFdXOAjORqQCWvGInYAKAJTsAvAD52RCEKiUQbAIakGiAGxUANjDABzNPiQBGK1TTbTMXSG5w+A4aPWGhYXIgAGKkZ8bU1GGnJ9AF8KdGx/AmIydRp6JhY2dixSGAAzOHEAZTQIUk1HAElWezBGGAAeAAVcgvl1LR0kACYgkGMzCyQAVjsHJzwc/IQjX38+kLCIlMRe2PicPEIScjs6ZwkAWydCKBkSsoqYaq06xpbp+QA6N35BEUaAHWp8GGPv+QSADWMAw4m+Fj+MG+FHYjE0hkMvHCQPEEiICM4YnY3x8pnwaG+7AAPjiQFBtECiaTuLA8nMznJFMpVLCIFg0EJMgB+YqlcqOIrud6iADyHK5rCkaJkCiUKjUVCgEEYCEQIFF/DIJHYLBg7BBGCe7AAapj4OwLJoOHAyEIEUIAF76yHsOCaY7sbT62A+HYwKC6u5PVIVNXIZAgXJoTikVjqACqPDenhgIYAuumqJ1dN0DP0TOZLIgAJxjUiOZyvDwfbxzJALULlZZRPPragJLbJXbUfZ4CRYMLHSIyDGGLHg/pCfGEkAkskU0hUuc0sB0hkdexdRDDWwFwbF0bUcbOMdYut+HrBJvhSJIADM7cwm3V2xSe3S6oxpHYysYnGOMA0HEAARFUAJMBglRVNUQAAKjggADAB3XxlWQp4/wgoDEIQ9ho1jVgvXw/IyBMepLQgS1fl/cDAI4ZggM0Bl2F8aj9VQtcIAwz4wF45AAFkQIAOXYAAlUjcjudMJAJNAsEKAB6RTYBIQx2TIJ5DggR0hERTQnjKUwVJgxSAHUYF4RSAEEmkqcy0O4kz/3oqRN20XQ9AAdiMQshkQAAOctKzwLD6Ivfx72vJY70QAAWJ9O1fbtUj7dUB1IDSdAwGQwJcyDMLoyCAFFjHo8QAAkABUBIAGVKqEgPUP9YKqmiEMQsKSrKyDcLgkjNCgABaFhDAwbJMpwbLdTydj2Dy7COF8SI8nCfUCLjOA5oa+jqOtVittdTKIA4GAeqAma5q6i6JDyMp2DoD0sGMWFXQaAlDkMRQzsajg7p/aq6to/KgLgKQnl4/ihNEiS8jI6TZLQeSlJUmA1KyrSdL0wwDKM5y4HMyybLsxSFvo5zFp2yC3OzLddC8/MBiLawjy3EL1WutAqaa2ZL0QKKQEWZtYqsR84g7F8kh2VLPxADKsswGRAdq0VSCKE0AHFubQTDrU0W1gPm0UBJKYQzAEzQsGamC8EEkTxMk8iYBkuSFMQZTVLOjHtN0/TDIrfHCas2z7OV7WVL1g2aY0OmkBLbpfIPJAfOPCsJg5yOJl5yLouFlZuhLRLJbfHs0gONC6Fy43Td8UwLawZA2DN0x03EJva/nWl8g3WmPOsAI+iZ/zWZPPBIWOCKH1z28VnvLyi8SEuZYOQdymHMhR3NSc8QJakF0pPeu/pPxFRjvvECsAIgv3Zmd2C9OQDPXBs6nwWbxbJA4uGBeu2lj8V8mmQRW7ALgChgEKFMHxxSckyE8IQhxjhQHtDQXk7BeAQAgMYTQYBO5rm7ifdy25RZHiHsWMsqd2YgHgYg5Bz8px8yPELGeUQEpZkFtARIjEsiuGFKmOQE1pgvF4R8CQvF2DsAAOTjxgBIigYjJBP1lIoYA8jxGc0KiDLm50dYUnsAbJ40j+FP3YNybkkid5oAkQAbnkbEeRwBWIIIDLQ8QaBSBYnYHYsAUgrHqGHJoJAoB9gmDgJKMeCBojRCAA="}
import { createStorage } from '@studiometa/js-toolkit-v4';

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
