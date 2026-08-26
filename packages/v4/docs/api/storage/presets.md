# Storage presets

Four presets that each remove an argument from every call site.

```ts
createLocalStorage<T>(options?): StorageInstance<T>
createSessionStorage<T>(options?): StorageInstance<T>
createUrlSearchParamsStorage<T>(options?): StorageInstance<T>
createUrlSearchParamsInHashStorage<T>(options?): StorageInstance<T>
```

Their options are [`createStorage()`](./createStorage.html)'s **without `provider`** — the preset supplies it. The two URL presets also take `push`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5feda41b741dd6db3f92ac0508015b83b11b6f4d6188a5743dd88e511c6e56bb","data":"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"}
import {
  createLocalStorage,
  createSessionStorage,
  createUrlSearchParamsInHashStorage,
  createUrlSearchParamsStorage,
} from '@studiometa/js-toolkit-v4';

interface Prefs {
  theme: 'light' | 'dark';
}

createLocalStorage<Prefs>({ prefix: 'app:' });
createSessionStorage<Prefs>();
createUrlSearchParamsStorage<Prefs>({ push: true });
createUrlSearchParamsInHashStorage<Prefs>();
```

## `push`

The two URL presets choose `history.pushState` over the default `replaceState`:

| `push`  | Each write                 |
| ------- | -------------------------- |
| `false` | replaces the current entry |
| `true`  | adds a history entry       |

`true` is what makes a filter state navigable with the back button. `false` is what keeps a scroll position or a tab index out of the history.

## Which URL preset

| Preset                                 | Reads and writes           | Survives                                 |
| -------------------------------------- | -------------------------- | ---------------------------------------- |
| `createUrlSearchParamsStorage()`       | `location.search`          | a share, a bookmark, the server          |
| `createUrlSearchParamsInHashStorage()` | `location.hash`, as params | a share and a bookmark, never the server |

Both rebuild the **whole location** on each write, so a search write keeps the hash and a hash write keeps the query string.

## Why only these four

**A factory exists only where its product has state.** These four each replace an argument at every call site, which is worth an export. `createLocalStorageProvider()` and `createSessionStorageProvider()` are **removed** — the instances say the same thing with nothing to call.

See [Providers](./providers.html).
