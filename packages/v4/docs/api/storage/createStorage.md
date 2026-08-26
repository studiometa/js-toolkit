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
// @twoslash-cache: {"v":1,"hash":"f5bf1527302f20e2a42948e95e18d3cffb44ca0500c456b6afdc04c4aa23bdad","data":"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="}
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
