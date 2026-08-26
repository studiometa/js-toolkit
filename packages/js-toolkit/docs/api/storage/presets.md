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
// @twoslash-cache: {"v":1,"hash":"d58eada2fe0c9c2ca9ad38566a2281c88656c081b6a190cc3c43c320a6557999","data":"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"}
import {
  createLocalStorage,
  createSessionStorage,
  createUrlSearchParamsInHashStorage,
  createUrlSearchParamsStorage,
} from '@studiometa/js-toolkit';

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
