---
outline: deep
---

# defineManifest

`defineManifest` builds a [`ComponentManifest`](/api/autoload/#types) from a record of lazy importers, so your own js-toolkit components autoload from `data-component` attributes. It is pure: it never touches the DOM and never registers anything. Pass its result to [`registerManifests`](/api/autoload/registerManifests.html) or [`autoload`](/api/autoload/#autoload) to start discovery.

This page also documents the two adapters that produce the `modules` record it consumes — [`fromMetaGlob`](#frommetaglob) for Vite and [`fromWebpackContext`](#fromwebpackcontext) for webpack.

## Signature

```ts
function defineManifest(options: DefineManifestOptions): ComponentManifest;
```

## Parameters

The single `DefineManifestOptions` argument:

- `modules` (`ModuleRecord`, required): the lazy importers to build entries from, keyed by module path. Feed a bundler glob through an adapter.
- `packageName` (`string`): the npm package the components belong to. Informational only — the loader never reads it.
- `strategy` (`ComponentLoadStrategy`): the default [load strategy](/api/autoload/#loading-strategies) applied to every component. Defaults to `'eager'`.
- `group` (`string`): the default grouping key applied to every component. Informational only. Defaults to each component's token.
- `components` (`Record<string, ComponentOverride>`): per-token overrides, keyed by the **derived** token (see [Token derivation](#token-derivation)).

### ComponentOverride

Every field is optional; an omitted field keeps the derived or option-level default.

- `token` (`string`): replace the token derived from the module key (renames the entry).
- `strategy` (`ComponentLoadStrategy`): override the load strategy for this one component.
- `group` (`string`): override the grouping key for this one component.
- `exportName` (`string`): the named export to resolve from the module. Defaults to the token.
- `children` (`readonly string[]`): tokens of the constructor's configured child components, for recursive registration.
- `styles` (`readonly string[]`): stylesheet paths associated with this component. Informational only.
- `integrations` (`readonly string[]`): integration keys associated with this component. Informational only.

## Return value

Returns a [`ComponentManifest`](/api/autoload/#types). For every `[key, importer]` in `options.modules`, `defineManifest` produces one entry whose `load()` thunk calls the importer and resolves the export named by `exportName` (defaulting to the token), falling back to the module's `default` export.

The factory does **not** validate that the resolved value is a `Base` constructor — the loader does that on load and dispatches a [`js-toolkit:error`](/api/autoload/#error-diagnostics) event when it is not.

## Token derivation

The `data-component` token comes from each module key: the basename without its extension, or the parent directory name when the basename is `index`.

| Module key                      | Derived token |
| ------------------------------- | ------------- |
| `./components/MyComponent.js`   | `MyComponent` |
| `./components/Card/Card.js`     | `Card`        |
| `./components/Gallery/index.js` | `Gallery`     |

Name each file after the token you want in the markup. When a file's exported class name differs from the token, set `exportName`; to expose a different token than the filename, set `token`.

## Duplicate tokens

When two module keys derive the same token, a warning is logged under the `[@studiometa/js-toolkit/autoload]` prefix and the later key wins. Keep component filenames unique across the folders you glob, or disambiguate with a `token` override.

## Examples

### Vite

```js
import { defineManifest, fromMetaGlob } from '@studiometa/js-toolkit';

const manifest = defineManifest({
  packageName: '@my/app',
  strategy: 'visible',
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
});
```

### webpack

```js
import { defineManifest, fromWebpackContext } from '@studiometa/js-toolkit';

const manifest = defineManifest({
  packageName: '@my/app',
  strategy: 'visible',
  modules: fromWebpackContext(
    import.meta.webpackContext('./components', {
      recursive: true,
      regExp: /\.js$/,
      mode: 'lazy',
    }),
  ),
});
```

### Per-token overrides

```js
const manifest = defineManifest({
  strategy: 'eager',
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
  components: {
    // Load this one lazily and pull in a child it configures.
    Gallery: { strategy: 'idle', children: ['GalleryItem'] },
    // The file is Card.js but the exported class is `SpecialCard`.
    Card: { exportName: 'SpecialCard' },
    // Rename the token exposed in the markup.
    Legacy: { token: 'LegacyComponent' },
  },
});
```

### Registering the result

`defineManifest` only builds data. Register it to start discovery:

```js
import { registerManifests } from '@studiometa/js-toolkit';

registerManifests(manifest);
```

## Adapters

`defineManifest` needs a `ModuleRecord` — a map of keys to lazy importers. Vite and webpack each expose a glob primitive, but they return different shapes, so there is one adapter for each.

### fromMetaGlob

```ts
function fromMetaGlob(glob: Record<string, unknown>): ModuleRecord;
```

Normalizes the record returned by Vite's `import.meta.glob('./x/*.js')` into a `ModuleRecord`. The lazy form of `import.meta.glob` already returns `Record<string, () => Promise<Module>>`, so this is an identity pass with a guard.

**Throws** a `TypeError` when any value is not a function — that means an eager glob (`import.meta.glob('...', { eager: true })`) was passed, which resolves the modules synchronously and defeats on-demand loading.

```js
import { fromMetaGlob } from '@studiometa/js-toolkit';

const modules = fromMetaGlob(import.meta.glob('./components/*/*.js'));
```

### fromWebpackContext

```ts
function fromWebpackContext(context: WebpackContextLike): ModuleRecord;
```

Normalizes a webpack context — the value returned by `import.meta.webpackContext(dir, options)` — into a `ModuleRecord`. A webpack context is a callable with a `keys()` method rather than a record of importers, so this wraps each key in `() => Promise.resolve(context(key))`.

`Promise.resolve` tolerates both a synchronous module (`mode: 'sync'`) and a promise (`mode: 'lazy'`). Pass `mode: 'lazy'` for real code-splitting and on-demand loading; the other modes bundle every match eagerly.

```js
import { fromWebpackContext } from '@studiometa/js-toolkit';

const modules = fromWebpackContext(
  import.meta.webpackContext('./components', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'lazy',
  }),
);
```

## Types

- `ModuleRecord` — `Record<string, () => Promise<Record<string, unknown>>>`: a map of module keys to lazy importers, the shape the adapters produce and `defineManifest` consumes.
- `DefineManifestOptions` — the options object above.
- `ComponentOverride` — a per-token override.
- `WebpackContextLike` — the structural shape of a webpack context accepted by [`fromWebpackContext`](#fromwebpackcontext).
- `ComponentManifest`, `ComponentManifestEntry`, `ComponentLoadStrategy` — documented in the [autoload API](/api/autoload/#types).

## See also

- [`registerManifests`](/api/autoload/registerManifests.html) — register the manifest you build here.
- [Autoload API](/api/autoload/) — every export of the autoload engine.
