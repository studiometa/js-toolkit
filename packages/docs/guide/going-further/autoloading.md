# Autoloading

This page introduces autoloading: a way to discover the components already present in your markup and load each one on demand, from a manifest you describe once.

For manually wiring dynamic children on a single parent, see the [Lazy imports](/guide/going-further/lazy-imports.html) guide. Autoloading solves a different problem — loading top-level components across the whole page without a hand-written `config.components` map.

## What autoloading is

Normally you mount an application by importing every component up front and passing it to [`createApp`](/api/helpers/createApp.html) or [`registerComponent`](/api/helpers/registerComponent.html). Every component ships in the initial bundle, whether or not the current page uses it.

Autoloading inverts this. You describe your components once in a **manifest**, and the engine reads the DOM to decide what to load. A component's module is fetched only when an element that needs it exists on the page, and only when its load strategy says it is time. The engine knows nothing hard-coded about any component — it works purely from the manifest, so it autoloads your own [`Base`](/api/) components exactly the same way it would autoload packaged ones.

## The mental model

Autoloading is a small pipeline. Each stage has a clear job:

1. **Discovery** — the loader scans the `root` (the document by default) for `[data-component]` elements and reads each token.
2. **Manifest lookup** — each token is matched against the manifest, which maps it to an entry describing how to load that component.
3. **Strategy-gated lazy `import()`** — the entry carries a load strategy. The loader waits for that strategy's signal (immediately, on visibility, on idle, or on interaction) before it runs the entry's dynamic `import()`.
4. **Registration** — once the module resolves, the loader validates that it exported a `Base` constructor and registers it with [`registerComponent`](/api/helpers/registerComponent.html), which mounts it on the matching elements.

Nothing runs at import time. Importing the autoload API never touches the DOM; discovery starts only when you call `registerManifests()` or [`autoload()`](/api/autoload/#autoload).

## Quick start

Say your components live in `./components`, one file per component, each file named after the token you use in the markup.

Describe them with [`defineManifest`](/api/autoload/defineManifest.html), then activate them with [`registerManifests`](/api/autoload/registerManifests.html):

```js
// app.js
import {
  defineManifest,
  fromMetaGlob,
  registerManifests,
} from '@studiometa/js-toolkit';

const manifest = defineManifest({
  packageName: '@my/app',
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
});

registerManifests(manifest);
```

Now write the markup. Each `data-component` token is loaded and mounted on demand:

```html
<header data-component="Header"></header>
<div data-component="Gallery" data-load="visible"></div>

<script type="module" src="./app.js"></script>
```

`Header` loads right away; `Gallery` loads only when it is about to scroll into view. You never imported either component by hand — the manifest and the markup did the wiring.

The token comes from each file's name: `./components/Header/Header.js` and `./components/Header/index.js` both derive the token `Header`. See [Token derivation](/api/autoload/defineManifest.html#token-derivation) for the exact rules.

## Load strategies

Every component has a load strategy that decides _when_ its module is fetched. Set a default for the whole manifest with the `strategy` option, override it per component in `defineManifest`, or override it per element in the markup with the `data-load` attribute.

| Strategy      | Loads the component…                                                        |
| ------------- | --------------------------------------------------------------------------- |
| `eager`       | Immediately (the default).                                                  |
| `visible`     | Shortly before the element enters the viewport, via `IntersectionObserver`. |
| `idle`        | When the main thread is idle, via `requestIdleCallback`.                    |
| `interaction` | On the first `pointerover`, `pointerdown` or `focusin` on the element.      |

A manifest-wide default with per-component and per-element overrides:

```js
const manifest = defineManifest({
  // Every component is lazy by default…
  strategy: 'visible',
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
  components: {
    // …but the header is needed straight away.
    Header: { strategy: 'eager' },
    // …and this heavy widget can wait for idle time.
    Chat: { strategy: 'idle' },
  },
});
```

```html
<!-- Override the manifest strategy for this element only. -->
<div data-component="Gallery" data-load="idle"></div>
```

When a strategy's browser API is unavailable the loader degrades gracefully — it loads eagerly or falls back to a timeout — and logs a warning under the `[@studiometa/js-toolkit/autoload]` prefix.

### Forcing eager loads with `<meta>`

Sometimes you need a component to load immediately regardless of the strategy baked into its manifest entry — for example a component that is critical only on certain pages. Declare those tokens in a `<meta>` tag and the shared runtime force-loads them:

```html
<meta name="js-toolkit:eager" content="Header, Nav" />
```

The list is comma-separated, trimmed and de-duplicated. This is handy when the manifest is shared across pages but a given page wants a couple of components up front.

## Building the manifest

[`defineManifest`](/api/autoload/defineManifest.html) turns a record of lazy importers into a manifest. It is pure: it never touches the DOM and never registers anything, so you can build and compose manifests freely before you start discovery.

You rarely write the `modules` record by hand. Each bundler exposes a glob primitive, and an adapter normalizes its output into the shape `defineManifest` expects:

- [`fromMetaGlob`](/api/autoload/defineManifest.html#frommetaglob) — for Vite's `import.meta.glob('./components/*/*.js')`.
- [`fromWebpackContext`](/api/autoload/defineManifest.html#fromwebpackcontext) — for webpack's `import.meta.webpackContext(...)`.

```js
// Vite
import { defineManifest, fromMetaGlob } from '@studiometa/js-toolkit';

const manifest = defineManifest({
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
});
```

```js
// webpack
import { defineManifest, fromWebpackContext } from '@studiometa/js-toolkit';

const manifest = defineManifest({
  modules: fromWebpackContext(
    import.meta.webpackContext('./components', {
      recursive: true,
      regExp: /\.js$/,
      mode: 'lazy',
    }),
  ),
});
```

Use the `components` option for per-token tweaks: rename a token, point at a different named export, pull in child components, or change one component's strategy. Those overrides are documented in the [`defineManifest` reference](/api/autoload/defineManifest.html#parameters).

## Registering manifests

[`registerManifests`](/api/autoload/registerManifests.html) hands your manifests to a shared runtime and starts a single loader over the composed set. Call it once from your entry point:

```js
import { registerManifests } from '@studiometa/js-toolkit';

registerManifests(manifest);
```

You can register several manifests at once. They compose later-wins, so the **last** argument overrides any token it shares with an earlier one — useful to layer your own components over a base set:

```js
import { registerManifests } from '@studiometa/js-toolkit';
import { manifest as baseManifest } from './base-manifest.js';
import { manifest as appManifest } from './app-manifest.js';

// `appManifest` is last, so it wins on shared tokens.
registerManifests(baseManifest, appManifest);
```

Registrations coalesce: even across several calls or side-effect entry modules, exactly one loader scans the DOM. [`registerManifest`](/api/autoload/registerManifests.html#registermanifest) is the single-manifest form when you want to build your own side-effect entry with injectable options.

## Handling errors

When an import, validation or registration fails for a token, the failure is isolated to that token — the other components keep loading. The loader logs an error under the `[@studiometa/js-toolkit/autoload]` prefix and dispatches a bubbling `js-toolkit:error` event on the document element, so you can report it:

```js
document.addEventListener('js-toolkit:error', (event) => {
  const { token, stage, error } = event.detail; // stage: 'import' | 'registration'
});
```

::: tip API Reference
This guide covers the mental model and the common path. For every option, type and edge case — the `autoload()` handle, `composeManifests`, `ComponentLoader`, per-token overrides and the runtime internals — see the [Autoload API Reference](/api/autoload/).
:::
