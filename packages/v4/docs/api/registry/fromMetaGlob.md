# fromMetaGlob

```ts
fromMetaGlob(glob: Record<string, unknown>): ModuleRecord
```

Adapts a Vite `import.meta.glob()` result for [`defineManifest()`](./defineManifest.html).

## Usage

```js
import { defineManifest, fromMetaGlob, registerManifest } from '@studiometa/js-toolkit';

registerManifest(
  defineManifest({
    modules: fromMetaGlob(import.meta.glob('./components/*/index.js')),
  }),
);
```

**Parameters**

- `glob` — the object `import.meta.glob()` returns, mapping each path to a lazy importer.

**Return value**

- `ModuleRecord` — a map of path to importer.

::: warning Use the lazy form
`import.meta.glob(pattern)` is lazy and gives one importer per path, which is the point. `import.meta.glob(pattern, { eager: true })` downloads everything up front, so a manifest built from it defers nothing — and the adapter **throws a `TypeError`** naming the first path that is not an importer function, rather than building a manifest that silently does nothing lazily.
:::

The adapter adds **no bundler dependency**. It reads a plain object of functions, and core names Vite nowhere.
