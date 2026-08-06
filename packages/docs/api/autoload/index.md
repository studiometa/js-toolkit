# Autoload

The autoload engine discovers `data-component` elements in the DOM and loads and registers their component constructors on demand, driven entirely by a **manifest** you give it. It knows nothing hard-coded about any component: it works purely from the manifest, so it autoloads your own [`Base`](/api/) components as well as any packaged ones.

The whole API is exported from the package root and from a per-symbol subpath (`@studiometa/js-toolkit/autoload`, `@studiometa/js-toolkit/registerManifests`, …).

```js
import {
  autoload,
  defineManifest,
  fromMetaGlob,
} from '@studiometa/js-toolkit';
```

Everything here is **pure**: importing a module never touches the DOM. Discovery starts only when you call `autoload()` or `registerManifests()`.

## Mental model

A manifest maps each `data-component` token to an entry describing how to load it. The loader scans the DOM for `[data-component]`, reads each token, and schedules the matching entry according to its **load strategy**. When the strategy's signal fires it imports the constructor, validates that it is a `Base` constructor, and registers it with [`registerComponent`](/api/helpers/registerComponent.html).

```html
<div data-component="MyComponent"></div>
<div data-component="Gallery" data-load="visible"></div>
```

## Loading strategies

Each entry has a default strategy, overridable per element with the `data-load` attribute.

- `eager` — load immediately (the default).
- `visible` — load shortly before the element enters the viewport (via `IntersectionObserver`, root margin `200px 0px`).
- `idle` — load when the main thread is idle (via `requestIdleCallback`, with a `2000ms` timeout fallback).
- `interaction` — load on the first `pointerover`, `pointerdown` or `focusin` on the element.

When a required browser API is unavailable the loader degrades gracefully (it loads eagerly, or falls back to a timeout) and logs a warning under the `[@studiometa/js-toolkit/autoload]` prefix.

## autoload

Start a standalone loader over one or more manifests and get a stoppable handle back.

```ts
function autoload(options: AutoloadOptions): AutoloadHandle;
```

### Parameters

- `manifests` (`readonly ComponentManifest[]`): the manifests to compose into a single lookup table. On a token collision, the manifest later in the array wins.
- `root` (`Document | Element`): the DOM scope to scan and observe. Defaults to `document`.
- `eager` (`readonly string[]`): tokens to force-load eagerly regardless of their strategy or `data-load` attribute.
- `dependencies` (`Partial<LoaderDependencies>`): dependency-injection seams, kept for testability.

### Return value

An `AutoloadHandle` with:

- `loader` (`ComponentLoader`): the underlying loader instance.
- `manifest` (`ComponentManifest`): the composed manifest the loader was started with.
- `stop()`: stop discovery and release every scheduled trigger.

### Example

```js
import {
  autoload,
  defineManifest,
  fromMetaGlob,
} from '@studiometa/js-toolkit';

const manifest = defineManifest({
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
});

const handle = autoload({ manifests: [manifest] });
// later, to tear everything down:
handle.stop();
```

## composeManifests

Merge several manifests into one, later entries winning on token collision.

```ts
function composeManifests(
  manifests: readonly ComponentManifest[],
): ComponentManifest;
```

This is the pure merge `autoload()` uses internally. It never touches the DOM.

## ComponentLoader

The class behind `autoload()`. Instantiate it directly when you need full control over its lifecycle.

```ts
const loader = new ComponentLoader({ manifest, root, dependencies });
loader.start({ eagerComponents: ['Header'] });
loader.stop();
```

Importing the class does nothing; discovery only starts on `start()`.

## Eager `<meta>`

The shared runtime (see [`registerManifests`](/api/autoload/registerManifests.html)) reads a `<meta>` tag to force-load a comma-separated list of tokens, whatever their strategy:

```html
<meta name="js-toolkit:eager" content="Header, Nav" />
```

`readEagerTokens(document)` returns the normalized (split, trimmed, de-duplicated) token list.

## Error diagnostics

When an import, validation or registration fails for a token, the loader logs an error under the `[@studiometa/js-toolkit/autoload]` prefix and dispatches a bubbling `js-toolkit:error` `CustomEvent` on the document element:

```js
document.addEventListener('js-toolkit:error', (event) => {
  const { token, stage, error } = event.detail; // stage: 'import' | 'registration'
});
```

A failure is isolated to its own token; the other components keep loading.

## Types

- `ComponentManifest` — `Record<string, ComponentManifestEntry>`, a map of tokens to entries.
- `ComponentManifestEntry` — one entry: `token`, `strategy`, a `load()` thunk resolving the `Base` constructor, plus optional informational metadata (`packageName`, `group`, `children`, `styles`, `integrations`).
- `ComponentLoadStrategy` — `'eager' | 'visible' | 'idle' | 'interaction'`.
- `AutoloadOptions`, `AutoloadHandle`, `LoaderDependencies`, `AutoloadRuntime`, `RegisterManifestOptions` — the option and handle shapes documented above and on the related pages.

## See also

- [`defineManifest`](/api/autoload/defineManifest.html) — build a manifest from a record of lazy importers.
- [`registerManifests`](/api/autoload/registerManifests.html) — register manifests with the shared cross-copy runtime.
- [`registerComponent`](/api/helpers/registerComponent.html) — the helper the loader registers each constructor with.
