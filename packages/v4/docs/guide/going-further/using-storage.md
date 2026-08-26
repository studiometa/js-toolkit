# Storage

`createStorage()` is a typed, observable key-value store over a `StorageProvider`. **One seam, six adapters.**

[[toc]]

## The store

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"cddfe64c6f7b250b29d3291d4375e12ad7be93497eb05000b0737ada57e5b5da","data":"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"}
import { createLocalStorage } from '@studiometa/js-toolkit-v4';

interface Prefs {
  theme: 'light' | 'dark';
  seen: string[];
}

const prefs = createLocalStorage<Prefs>({ prefix: 'app:' });

prefs.set('theme', 'dark');
prefs.get('theme'); // 'light' | 'dark' | undefined
prefs.get('theme', 'light'); // 'light' | 'dark'
prefs.has('seen');
prefs.keys();
prefs.delete('seen');
prefs.clear();
```

`createStorage()` owns everything a consumer thinks of as storage: key namespacing through `prefix`, serialization in both directions, a `Signal` per key created on the first subscription, and the reference-counted wiring that keeps keys in sync. **A provider moves strings only.**

## Observing a key

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4d0e9e92b16528394259732e55bae484b41c13ccb59665d013bfd11b626add08","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAgFdXOAjORqQCWvGInYAKAJTsAvAD52RCEKiUQbAIakGiAGxUANjDABzNPiQBGK1TTbTMXSG5w+A4aPWGhYXIgAGKkZ8bU1GGnJ9AF8KdGx/AmIydRp6JhY2dixSGAAzOHEAZTQIUk1HAElWezBGGAAeAAVcgvl1LR0kACYgkGMzCyQAVjsHJzwc/IQjX38+kLCIlMRe2PicPEIScjs6ZwkAWydCKBkSsoqYaq06xpbp+QA6N35BEUaAHWp8GGPv+QSADWMAw4m+Fj+MG+FHYjE0hkMvHCQPEEiICM4YnY3x8pnwaG+7AAPjiQFBtECiaTuLA8nMznJFMpVLCIFg0EJMgB+YqlcqOIrud6iADyHK5rCkaJkCiUKjUVCgEEYCEQIFF/DIJHYLBg7BBGCe7AAapj4OwLJoOHAyEIEUIAF76yHsOCaY7sbT62A+HYwKC6u5PVIVNXIZAgXJoTikVjqACqPDenhgIYAuumqJ1dN0DP0TOZLIgAJxjUiOZyvDwfbxzJALULlZZRPPragJLbJXbUfZ4CRYMLHSIyDGGLHg/pCfGEkAkskU0hUuc0sB0hkdexdRDDWwFwbF0bUcbOMdYut+HrBJvhSJIADM7cwm3V2xSe3S6oxpHYysYnGOMA0HEAARFUAJMBglRVNUQAAKjggADAB3XxlWQp4/wgoDEIQ9ho1jVgvXw/IyBMepLQgS1fl/cDAI4ZggM0Bl2F8aj9VQtcIAwz4wF45AAFkQIAOXYAAlUjcjudMJAJNAsEKAB6RTYBIQx2TIJ5DggR0hERTQnjKUwVJgxSAHUYF4RSAEEmkqcy0O4kz/3oqRN20XQ9AAdiMQshkQAAOctKzwLD6Ivfx72vJY70QAAWJ9O1fbtUj7dUB1IDSdAwGQwJcyDMLoyCAFFjHo8QAAkABUBIAGVKqEgPUP9YKqmiEMQsKSrKyDcLgkjNCgABaFhDAwbJMpwbLdTydj2Dy7COF8SI8nCfUCLjOA5oa+jqOtVittdTKIA4GAeqAma5q6i6JDyMp2DoD0sGMWFXQaAlDkMRQzsajg7p/aq6to/KgLgKQnl4/ihNEiS8jI6TZLQeSlJUmA1KyrSdL0wwDKM5y4HMyybLsxSFvo5zFp2yC3OzLddC8/MBiLawjy3EL1WutAqaa2ZL0QKKQEWZtYqsR84g7F8kh2VLPxADKsswGRAdq0VSCKE0AHFubQTDrU0W1gPm0UBJKYQzAEzQsGamC8EEkTxMk8iYBkuSFMQZTVLOjHtN0/TDIrfHCas2z7OV7WVL1g2aY0OmkBLbpfIPJAfOPCsJg5yOJl5yLouFlZuhLRLJbfHs0gONC6Fy43Td8UwLawZA2DN0x03EJva/nWl8g3WmPOsAI+iZ/zWZPPBIWOCKH1z28VnvLyi8SEuZYOQdymHMhR3NSc8QJakF0pPeu/pPxFRjvvECsAIgv3Zmd2C9OQDPXBs6nwWbxbJA4uGBeu2lj8V8mmQRW7ALgChgEKFMHxxSckyE8IQhxjhQHtDQXk7BeAQAgMYTQYBO5rm7ifdy25RZHiHsWMsqd2YgHgYg5Bz8px8yPELGeUQEpZkFtARIjEsiuGFKmOQE1pgvF4R8CQvF2DsAAOTjxgBIigYjJBP1lIoYA8jxGc0KiDLm50dYUnsAbJ40j+FP3YNybkkid5oAkQAbnkbEeRwBWIIIDLQ8QaBSBYnYHYsAUgrHqGHJoJAoB9gmDgJKMeCBojRCAA="}
import { createLocalStorage } from '@studiometa/js-toolkit-v4';

interface Prefs {
  theme: 'light' | 'dark';
}
const prefs = createLocalStorage<Prefs>();
// ---cut---
const unsubscribe = prefs.subscribe(
  'theme',
  (value) => {
    document.documentElement.dataset.theme = value ?? 'light';
  },
  { immediate: true },
);
```

`destroy()` releases every subscription and the shared listeners at once.

In a component, hand the unsubscribe back from `mounted()`:

```js
mounted() {
  return prefs.subscribe('theme', (value) => this.apply(value));
}
```

## The six adapters

| Adapter                                                   | Backed by                                              |
| --------------------------------------------------------- | ------------------------------------------------------ |
| `localStorageProvider`                                    | `localStorage`                                         |
| `sessionStorageProvider`                                  | `sessionStorage`                                       |
| `memoryStorageProvider` / `createMemoryStorageProvider()` | a `Map`                                                |
| `createFallbackProvider(...providers)`                    | reads from the first that holds the key, writes to all |
| `urlSearchParamsProvider`                                 | `location.search`                                      |
| `urlSearchParamsInHashProvider`                           | `location.hash`, read as search params                 |

The two URL adapters rebuild the whole location on each write, so a search write keeps the hash and a hash write keeps the query string. They take one option, `push`, which chooses `history.pushState` over the default `replaceState`.

Four presets remove an argument from every call site: `createLocalStorage()`, `createSessionStorage()`, `createUrlSearchParamsStorage()` and `createUrlSearchParamsInHashStorage()`.

::: tip A factory exists only where its product has state
`createMemoryStorageProvider()` holds a `Map`. `createFallbackProvider()` and the two URL factories take arguments. There is no `createLocalStorageProvider()` — the instance is enough.
:::

## Failures are diagnostics, never throws

**A built-in provider reports its own failures and never throws.** A full quota or a refused storage area becomes a `storage.access-failed` diagnostic and the method returns its fallback: `null`, `false`, `[]` or `undefined`. It reports once per operation, not once per area.

The store's own failures have their own codes:

- `storage.serialize-failed` — nothing is written.
- `storage.deserialize-failed` — the default is returned.

`types.ts` states the same contract for a custom provider.

## Syncing with the outside

`syncEvents` is a list of window event names and nothing more. A provider declares how a change made outside this instance announces itself:

| Provider          | `syncEvents`             |
| ----------------- | ------------------------ |
| web storage       | `storage` (another tab)  |
| URL search params | `popstate`               |
| URL hash          | `popstate`, `hashchange` |

`createStorage()` subscribes **one shared, reference-counted listener per name** while at least one key is observed, and re-reads every observed key when it fires. The event carries no usable state, so the subscriber re-reads.

::: warning A known gap
A provider whose changes arrive on a `BroadcastChannel` or through an observer has no way to announce them yet.
:::

## A custom backend

Six synchronous string methods, plus an optional `syncEvents`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ec5558045d0d33a4e56ec9ab1c9a275b6b6433015bee584d18ee5e34eb5701cc","data":"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"}
import { createStorage, type StorageProvider } from '@studiometa/js-toolkit-v4';

const cookieProvider: StorageProvider = {
  get: (key) => new URLSearchParams(document.cookie.replaceAll('; ', '&')).get(key),
  set: (key, value) => {
    document.cookie = `${key}=${value};path=/`;
  },
  remove: (key) => {
    document.cookie = `${key}=;path=/;max-age=0`;
  },
  has: (key) => document.cookie.includes(`${key}=`),
  keys: () => [...new URLSearchParams(document.cookie.replaceAll('; ', '&')).keys()],
  clear: () => {},
};

const store = createStorage({ provider: cookieProvider });
```

One storage instance runs in Node over the memory provider, which is what `test/package-node-consumer.js` exercises.
