# defineManifest

```ts
defineManifest({ modules, mountStrategy }: DefineManifestOptions): ComponentManifest
```

Turns a map of module paths into a [manifest](./registerManifest.html), deriving each `data-component` token from its path.

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

- `modules` (`ModuleRecord`) — a map of path to importer, from [`fromMetaGlob()`](./fromMetaGlob.html), [`fromWebpackContext()`](./fromWebpackContext.html), or written by hand.
- `mountStrategy` (`MountStrategy`, optional) — a package-wide default.

**Return value**

- `ComponentManifest`, ready for `registerManifest()`.

## Token derivation

The token is the file's base name, and **`index` falls back to the parent directory**:

| Path                           | Token    |
| ------------------------------ | -------- |
| `./components/Slider.js`       | `Slider` |
| `./components/Slider/index.js` | `Slider` |
| `./components/nav/Menu.js`     | `Menu`   |

Duplicate tokens give a warning and **keep the first path**.

## The package-wide strategy

```js
defineManifest({
  modules: fromMetaGlob(import.meta.glob('./components/*/index.js')),
  mountStrategy: 'visible',
});
```

Entry wrappers are emitted **only when the strategy is not `eager`**, so the default costs nothing in the output.

Any element still overrides it with `data-mount`, and a class's own `config.mountStrategy` takes over once it has loaded.

## What it is not

It carries the importer and the strategy, and nothing else. Informational metadata — `packageName`, `subpath`, `exportName`, `group`, `styles`, `integrations` — belongs in the output type of a generator, not in core.
