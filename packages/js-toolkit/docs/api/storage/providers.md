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
// @twoslash-cache: {"v":1,"hash":"5d349b257bc53d21cab4f32e3c866bd8980b2246486e0527f22783ebfaf6c99b","data":"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"}
import {
  createFallbackProvider,
  createMemoryStorageProvider,
  createStorage,
  localStorageProvider,
  memoryStorageProvider,
} from '@studiometa/js-toolkit';

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

Six synchronous string methods. Namespacing, serialization, signals and sync wiring are [`createStorage()`](./createStorage.html)'s — do none of it here.

## Tested at the seam

`providers.spec.ts` drives each adapter through the six methods for real, including a `setItem` that throws, an area getter that throws, `push` against `history.length`, and the `syncEvents` names of each adapter.
