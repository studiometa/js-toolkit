# Autoloading

A page that declares its components in the markup does not have to import them all up front. Map each `data-component` token to a dynamic import and the registry downloads a chunk when an element needs one.

[[toc]]

## `registerManifest()`

```js
import { registerManifest } from '@studiometa/js-toolkit';

registerManifest({
  Accordion: () => import('./components/Accordion.js'),
  Slider: () => import('./components/Slider.js'),
  Map: { load: () => import('./components/Map.js'), mountStrategy: 'visible' },
});
```

An entry is either the importer itself, or an object with `load` and an optional `mountStrategy`.

- **One name, one entry**, across eager classes and manifests alike. A token an eager class or an earlier manifest owns gives a `manifest.duplicate-token` warning and is ignored.
- **No dependency and no bundler knowledge.** The value is a function that returns a promise. `import.meta.glob`, `import.meta.webpackContext` and a generated manifest all produce that shape.
- **The registry stays the only constructor.** The import ends in `registerComponent(ComponentClass)`.
- **One import per name, one failure report per name.** A failure emits one `component.load-failed` diagnostic and is never retried.
- **A class whose `config.name` differs from its token** gives a `registry.lazy-name-mismatch` warning.
- The class is resolved out of the imported module for you, so a hand-written entry is `Slider: () => import('./Slider.js')` with nothing to unwrap.

## One knob, not two

Deferring the import and deferring the mount are **one decision**:

```
data-mount  >  manifest entry mountStrategy  >  'eager'
```

The manifest entry stands in the middle slot for the `config.mountStrategy` of a class that cannot be read yet. Once the class registers, the chain reads `config.mountStrategy` and the entry is deleted from the map.

There is **no `data-load`** and no compatibility shim for it. A page that used `data-load` renames one attribute.

### What that buys

One scheduling algorithm covers both halves. A name resolves to one source, and one controller holds the current decision of the element/component pair. The arrival of the class is a _change of source_, so the pass that replaces a controller turns a spent import trigger into a mount:

- a **one-shot** trigger (`visible`, `idle`, `interaction`) mounts on the import that proved its condition;
- a **reversible** one (`in-view`, `media:`) is observed again.

An unloaded declaration is invisible to `$query()`, `$closest()`, `$watchChildren()` and `getInstances()`, because nothing is constructed at discovery.

`whenDOMSettled()` covers an **eager** lazy component: the import promise joins the lifecycle-work set only for the eager trigger, so [`swap()`](/api/dom/swap.html) waits for download, registration and mount — and still never waits on a viewport, an idle callback, an interaction or a media query.

## Generating a manifest from a glob

`defineManifest()` turns a bundler glob into a manifest, deriving each token from the path:

```js
import { defineManifest, fromMetaGlob } from '@studiometa/js-toolkit';

registerManifest(
  defineManifest({
    modules: fromMetaGlob(import.meta.glob('./components/*/index.js')),
  }),
);
```

- `index.js` falls back to the parent directory name, so `./components/Slider/index.js` is `Slider`.
- A package-wide `mountStrategy` emits entry wrappers only when it is not `eager`.
- Duplicate tokens give a warning and keep the first path.

For webpack, [`fromWebpackContext()`](/api/registry/fromWebpackContext.html) takes an `import.meta.webpackContext` result. Neither adapter adds a bundler dependency — core names none of them.

## Lazy children

`config.components` takes a dynamic import too, and the key supplies the name:

```js
static config = {
  name: 'Accordion',
  components: {
    AccordionItem: () => import('./AccordionItem.js'),
    Icon: IconClass,
  },
};
```

`registerComponent()` defers a thunk instead of resolving it, and the value becomes a lazy entry of the same registry under its key. Everything after that is identical to a manifest entry.

- **The key supplies the name**, so a lazy child is a name the registry knows with nothing downloaded — and `on<Child><Event>` resolution works on it immediately.
- **A manifest can declare the parent only.** A child behind a thunk is its own chunk, so a family splits where the author splits it.
- **First wins, quietly**, unlike `registerManifest()`. Several parents declaring the same lazy child is the normal case.
- **The entry gets no `mountStrategy` field.** Until the class arrives the chain is `data-mount > eager`; after it, the usual chain reads the merged config, so a lazy child that is a subclass inherits the strategy of its base.
- A value written with `class` that does not extend `Base` is reported as `component.invalid-family-declaration`, where it is declared.

## What v3's autoload did that v4 does not need

v3 shipped 1033 source lines of autoload across seven modules. The registry and the mount strategies absorb almost all of it:

| v3                                                     | v4                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `ComponentLoader.start()` discovery observer           | the one document observer                                     |
| the four load triggers of `__schedule()`               | `mount-strategies.ts`                                         |
| per-element and per-record cleanup bookkeeping         | one controller map holding both halves                        |
| recursive registration of configured children          | one `registerFamily()` loop over `config.components`          |
| the `ComponentRecord` state machine                    | one `Map<string, Promise<void>>` — the promise _is_ the state |
| `readEagerTokens` and `<meta name="js-toolkit:eager">` | `data-mount` on the element                                   |

The `children` arrays of a v3 manifest are dead data.
