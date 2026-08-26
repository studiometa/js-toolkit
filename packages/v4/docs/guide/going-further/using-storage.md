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
