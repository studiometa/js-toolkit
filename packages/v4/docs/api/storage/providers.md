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
// @twoslash-cache: {"v":1,"hash":"41419cf9770b6af4b2c7f08f48881e5e9756a9c0edbf2f74c5c00a80c0af3757","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAMTasARsxEBrAAqli7WKUYA6E1l1F9ZOIl4BlNBFLMA5jB16DyALrcb9xy5u5pakADpg7AC2WI5o0rLyMEqsqurawQaUIFAQIgiIIABKclACupG8aPgwAuykcHFmHmS8hKxQ7GDOldW8GjAYANy8AO6k7DQ9uoLO+JUQvMq8EPw9MJFGWWgu+cjIIBxgGln4aGhY1gD0lwBWcAC0DhCsGhP3RAAsRg2CHRCRMG2RlgREuzCw7EuDQCrkuTQsBjgRlOkVYIC8XioDWYpAYiAAjPiqKwYF0qkgAEwUqjbUiuPEgGRyRTKNSadwIshZQ64AlUET4HHqGjkRAUgC+FHQ2F5BGIXJpdAZLA4XD4QlE4kk8WZMAAsutHBh/E5XByQoxfHYHKags0whForEdYkDZEjSbAubMlQcnk8ABBXjwkK8Nn9UoqDCLXgAAz14NjFAEjkq8DQcEWYFK/FTECw4i6y0EcRWwas7AapJEME2NJ2SD2B06xyop3OV1uDyeLzen2+aF+EgBQJBYIhUJtgThGSsyLQqPRmJA2NxSAAzAB2Ymk5zksXb6g4+l4Jmuw2kY1Ts2z8jEzq86mMwVOMRcsWS6U4PCEEh36hKkwbCcDwAjCGIEhSGeNCeq4AA8AAqvBKqSUCZhAKg3DAYi8AAvLwxQiI4UBwQ04xdMmwgaJAIxgAAfHRjD5lqYBwAA/H414wAA8gWkE8JxMIwAAkqx2yiDAiF0eEUQxLiLowVxWR+vkIAAEKCOw7QxtCtrLH+MYhgYRjhOEABqbCCPAiyyLwYDMACcBYOoMCRtGsZmDA/DsLQSa8HAZCcBwABernLFIVQ1CMzDRp0WalBAJbJsw2bhBhAWkEQzAqCS5akH0Ax1kezi7PshytgQZwXIg1x3I8EDPK8aDvF8Px/COzDAjAoLgpCunTtBMCwbWKJohiWK0niABsAAcO5kvgSD4uu9Z0oCp4JIpQncg+G78i+wrvhKUrUDKP7yv+ND0EBqqgURYm8KwuRsMN3pkIJtpvQ6snOk9IgvVxX3KbkqlBv1rjBre+ktLGf0A0JsZFdsJWNmVLYnFVnZ1T2TUtQOQ7/ICnVjr1k5CTO9pIqNS4TTieIzQArPNe6LWKAAMq0ngUcOsK9t47WAvIfPtQpvqKx1frKv4KgB10FCqIF8PdDS8AC7qXnz9ofV6t4yU68lqx6gP876IN4AhvRwC+YWdPchuXv5XGQ/aSMNigaNHBjHY1V29WNX2rWDu1RNdT1E7gzAFOcvU86LuNK6TUtbMAJzM/uFJEkea0MvbV5CUD96C0gTPPqLIqUp+p3fgU0uXYB8vAWqClDVxcGEcRpFoORziUUcNH0YxzH8Rx1pCbxLECaPtqidiElt9hHdkZ0Pe8FR/cMXrclxINw3A/6BQaVppTMI7QnQ/lJ9GWQJlgOZlnWTiNT2Y5zk1m5caed5vnJhlQXsKFCUIq9GirFKQKUEpJXimlFQGUso5RqDgfK/QMCuxRu7Zsns2yYx9tjBqvZmr9jasOEOJNw5cUuDvLiscxrLlXHiCk64OYHF3PuZanN1oFEodtQuvJU6l1fOXRAbNK6YGrnKP8Wx64gEYE0RBmA+DDXHvxIwV9SAj01tHXgAAfVe2YvIPigHvVSAARLyzBBCsAzPMXg4RgAAAFyo2LADzDRoZwjinCEVOhlIPhzWYQtJAfjaRcxAKogWvJ8RMIFGXI6Iizo1wupIuW0jG53U2kkVkaQvrGFMLeawU8db2m8FaVxBhN7OkGskVI7ITbZDNgUYozAczlDWLUeojQoZtA6EWSKBUhijHGJMKo0xZjWKWGWSKGwthuybOVL21VardjwbjQhQdiGjm6uOPq5DVFUwXDQ2ma4xQMz8SSAJYonzBI4YydJVTwwFwwREqJB0xZLQllXKWiTFTJIVk3ZWcQXHGy1gUm89pynyUBfnWpKlAynz0qo8+cZIW2kRtMtBsz0ZYO9osv2+C8ZEMJhssO2zya7OoTTBOdNKQzUzmclmlImFXIZMiwp0dwlJxFgI9864GZxLEbXJJypUlK0kCrXOpT3ogrtNHcFcRxVArZabfeIALY1Cto/Uottc5wsCM7aOqDSoYIqu2BZvscYB3xsHIlWyya2ijiEPZcdaGJ0QIwla/j6VikzkyvA8qoX2nZQSZ5MTRQM03Hyz5EjvlCtukrdJw155EVICRJeFFdHUQgLRBiTE+KivUVxJRoqSlcRnuJGsibF5d2Xr3DNWbpKOi3s3XeSrVKH20ifCOiLL63hvnfVgVlMyPzsg5eAr8wpRg/rIL+flf7AQAeFVpIDeBxXAcWNAyVUqQBgWQOBuVEF9INajI18ysZLP9gQwOBMOqhxtRHCh8aqHU3jt411m4ppp1ZmwrOISuG2kDfiYW/DDqimESdURkaZZXWVLIsg8ipWFtYio28+b/WaJ0cIWA3lBaGJbXgUx/BzGWMzA4Jx9jHHhBZaCzR7jPFZBfeuZOT46X7iCcea5YSeFLUA9Erlop8RTQjedKNssY2K2bm6I2qGLTFqk2UhtFT0kSY1gqkIRjYUIvDOO6MJ94yJmTLmfKNAGiDuzCmfKQ8iyJVLKsRBcBKw0Akoe9BcysWmtwee/FazCXE02aTO9ZKn3OqpYgD4bMmMsNZhSQ8PrOGKYvHnT6tSeRcc5cBykAnlxEVgHgH68lgDhF4M3O5WTbwUAK+J+LErSBlakE2riNXCuUelSEBrqtKsqYMDV8UZR/i8AAOR2IJR1M1yyA59cGKZMA1xeAIQdk1/TSxwzWO1SMaoUgJjLszFOwQAUoA31/YERg+XauqJsJUzJNT7SMCa19ZMfrEv2m4F17gE3b5TcuLwIMZh2BZUmAmLAyZIBxF6eq2QpQ7NdBJA4MA+2H1CSO3qkIZ24vqwS6y6TvBxQvayB1JAoAUKsUgngDMIBxTiiAA="}
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
