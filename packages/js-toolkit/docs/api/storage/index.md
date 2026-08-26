# Storage

**One seam, six adapters.** `createStorage()` is a typed, observable key-value store over a `StorageProvider`.

## The exports

- [`createStorage(options?)`](./createStorage.html) — the store
- [Presets](./presets.html) — `createLocalStorage()`, `createSessionStorage()`, `createUrlSearchParamsStorage()`, `createUrlSearchParamsInHashStorage()`
- [Providers](./providers.html) — the six adapters, and how to write one

## The division of labour

**`createStorage()` owns everything a consumer thinks of as storage**: key namespacing through `prefix`, serialization in both directions, a `Signal` per key created on the first subscription, and the reference-counted wiring that keeps observed keys in sync.

**A provider moves strings only** — six synchronous methods, plus an optional list of window event names.

```
consumer  →  StorageInstance<T>   typed, observable, prefixed, serialized
                    ↓
             StorageProvider      get/set/remove/has/keys/clear + syncEvents
                    ↓
              localStorage, a Map, location.search, …
```

That is why a custom backend is six small methods, and why one storage instance runs in Node over the memory provider.

## Failures are diagnostics, never throws

A built-in provider turns a full quota or a refused area into a `storage.access-failed` diagnostic and returns the method's fallback: `null`, `false`, `[]` or `undefined`. The store's own failures are `storage.serialize-failed` — after which nothing is written — and `storage.deserialize-failed` — after which the default is returned.

## Read next

[Storage](/guide/going-further/using-storage.html).
