# Storage providers

A provider moves **strings only**.

```ts
interface StorageProvider {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  has(key: string): boolean;
  keys(): string[];
  clear(): void;
  syncEvents?: readonly string[];
}
```

[[toc]]

## The six adapters

| Adapter                                                                           | Backed by                                              | `syncEvents`             |
| --------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| `localStorageProvider`                                                            | `localStorage`                                         | `storage`                |
| `sessionStorageProvider`                                                          | `sessionStorage`                                       | `storage`                |
| `memoryStorageProvider` / `createMemoryStorageProvider()`                         | a `Map`                                                | —                        |
| `createFallbackProvider(...providers)`                                            | reads from the first that holds the key, writes to all | the union                |
| `urlSearchParamsProvider` / `createUrlSearchParamsProvider(options?)`             | `location.search`                                      | `popstate`               |
| `urlSearchParamsInHashProvider` / `createUrlSearchParamsInHashProvider(options?)` | `location.hash`, as params                             | `popstate`, `hashchange` |

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"41419cf9770b6af4b2c7f08f48881e5e9756a9c0edbf2f74c5c00a80c0af3757","data":"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="}
import {
  createFallbackProvider,
  createMemoryStorageProvider,
  createStorage,
  localStorageProvider,
  memoryStorageProvider,
} from '@studiometa/js-toolkit-v4';

// Try localStorage, fall back to memory when it is refused.
createStorage({
  provider: createFallbackProvider(localStorageProvider, memoryStorageProvider),
});

// A private Map, not the shared singleton.
createStorage({ provider: createMemoryStorageProvider() });
```

::: warning The memory singleton is shared
`memoryStorageProvider` is one `Map` for the whole page. Two stores over it see each other's keys unless they use different prefixes. For a store per component, use `createMemoryStorageProvider()`.
:::

## `createFallbackProvider()`

Reads from the **first provider that holds the key** and writes to **all** of them. That is what makes "use localStorage where it works, memory where it does not" one line rather than a branch at every call site.

## A factory exists only where its product has state

| Has state or arguments                          | Does not                   |
| ----------------------------------------------- | -------------------------- |
| `createMemoryStorageProvider()` — a `Map`       | `localStorageProvider`     |
| `createFallbackProvider(...)`                   | `sessionStorageProvider`   |
| `createUrlSearchParamsProvider(options?)`       | `memoryStorageProvider`    |
| `createUrlSearchParamsInHashProvider(options?)` | the two bare URL instances |

`createLocalStorageProvider()` and `createSessionStorageProvider()` are removed; the instances stay.

## A built-in provider never throws

`guard()` turns a full quota or a refused area into a `storage.access-failed` diagnostic and returns the method's fallback:

| Method                   | Fallback    |
| ------------------------ | ----------- |
| `get`                    | `null`      |
| `has`                    | `false`     |
| `keys`                   | `[]`        |
| `set`, `remove`, `clear` | `undefined` |

It reports **once per operation**, not once per area. **The area is resolved per call, inside the guard**, because the getter itself throws when storage is denied — `localStorage` in a blocked third-party frame throws on access, not on use.

`types.ts` states the same contract for a custom provider: report, return the fallback, do not throw.

## The URL adapters

They **rebuild the whole location on each write**, so a search write keeps the hash and a hash write keeps the query string. Their one option is `push`, which chooses `history.pushState` over the default `replaceState`.

## Writing your own

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

Six synchronous string methods. Namespacing, serialization, signals and sync wiring are [`createStorage()`](./createStorage.html)'s — do none of it here.

## Tested at the seam

`providers.spec.ts` drives each adapter through the six methods for real, including a `setItem` that throws, an area getter that throws, `push` against `history.length`, and the `syncEvents` names of each adapter.
