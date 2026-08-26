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
