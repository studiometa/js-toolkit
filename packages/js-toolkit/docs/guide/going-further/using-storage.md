# Storage

`createStorage()` is a typed, observable key-value store over a `StorageProvider`. **One seam, six adapters.**

[[toc]]

## The store

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"56547d7f2329a0258749639f556bc2896d05107f6509f2c16253a524b3f05516","data":"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"}
import { createLocalStorage } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"2f657ba3fff9191e0801a79f68f9daa85b279f60462fbc204bf45ff3005e3c0f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAgFdXOAjORqQCWvGInYAKAJTsAvAD52RCEKiUQbAIakGiAGxUANjDABzNPiQBGK1TTbTMXSG5w+A4aPWGhYXIgAGKkZ8bU1GGnJ9AF8KdGx/AmIydRp6JhY2dixSGAAzOHEAZTQIUk1HAElWezBGGAAeAAVcgvl1LR0kACYgkGMzCyQAVjsHJzwc/IQjX38+kLCIlMRe2PicPEIScjs6ZwkAWydCKBkSsoqYaq06xpbp+QA6N35BEUaAHWp8GGPv+QSADWMAw4m+Fj+MG+FHYjE0hkMvHCQPEEiICM4YnY3x8pnwaG+7AAPjiQFBtECiaTuLA8nMznJFMpVLCIFg0EJMgB+YqlcqOIrud6iADyHK5rCkaJkCiUKjUVCgEEYCEQIFF/DIJHYLBg7BBGCe7AAapj4OwLJoOHAyEIEUIAF76yHsOCaY7sbT62A+HYwKC6u5PVIVNXIZAgXJoTikVjqACqPDenhgIYAuumqJ1dN0DP0TOZLIgAJxjUiOZyvDwfbxzJALULlZZRPPragJLbJXbUfZ4CRYMLHSIyDGGLHg/pCfGEkAkskU0hUuc0sB0hkdexdRDDWwFwbF0bUcbOMdYut+HrBJvhSJIADM7cwm3V2xSe3S6oxpHYysYnGOMA0HEAARFUAJMBglRVNUQAAKjggADAB3XxlWQp4/wgoDEIQ9ho1jVgvXw/IyBMepLQgS1fl/cDAI4ZggM0Bl2F8aj9VQtcIAwz4wF45AAFkQIAOXYAAlUjcjudMJAJNAsEKAB6RTYBIQx2TIJ5DggR0hERTQnjKUwVJgxSAHUYF4RSAEEmkqcy0O4kz/3oqRN20XQ9AAdiMQshkQAAOctKzwLD6Ivfx72vJY70QAAWJ9O1fbtUj7dUB1IDSdAwGQwJcyDMLoyCAFFjHo8QAAkABUBIAGVKqEgPUP9YKqmiEMQsKSrKyDcLgkjNCgABaFhDAwbJMpwbLdTydj2Dy7COF8SI8nCfUCLjOA5oa+jqOtVittdTKIA4GAeqAma5q6i6JDyMp2DoD0sGMWFXQaAlDkMRQzsajg7p/aq6to/KgLgKQnl4/ihNEiS8jI6TZLQeSlJUmA1KyrSdL0wwDKM5y4HMyybLsxSFvo5zFp2yC3OzLddC8/MBiLawjy3EL1WutAqaa2ZL0QKKQEWZtYqsR84g7F8kh2VLPxADKsswGRAdq0VSCKE0AHFubQTDrU0W1gPm0UBJKYQzAEzQsGamC8EEkTxMk8iYBkuSFMQZTVLOjHtN0/TDIrfHCas2z7OV7WVL1g2aY0OmkBLbpfIPJAfOPCsJg5yOJl5yLouFlZuhLRLJbfHs0gONC6Fy43Td8UwLawZA2DN0x03EJva/nWl8g3WmPOsAI+iZ/zWZPPBIWOCKH1z28VnvLyi8SEuZYOQdymHMhR3NSc8QJakF0pPeu/pPxFRjvvECsAIgv3Zmd2C9OQDPXBs6nwWbxbJA4uGBeu2lj8V8mmQRW7ALgChgEKFMHxxSckyE8IQhxjhQHtDQXk7BeAQAgMYTQYBO5rm7ifdy25RZHiHsWMsqd2YgHgYg5Bz8px8yPELGeUQEpZkFtARIjEsiuGFKmOQE1pgvF4R8CQvF2DsAAOTjxgBIigYjJBP1lIoYA8jxGc0KiDLm50dYUnsAbJ40j+FP3YNybkkid5oAkQAbnkbEeRwBWIIIDLQ8QaBSBYnYHYsAUgrHqGHJoJAoB9gmDgJKMeCBojRCAA="}
import { createLocalStorage } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"a152b364f8720a68b6cdc0a6d5984dc326d25373f210953ec88a3cda82456271","data":"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"}
import { createStorage, type StorageProvider } from '@studiometa/js-toolkit';

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
