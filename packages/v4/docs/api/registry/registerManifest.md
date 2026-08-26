# registerManifest

```ts
registerManifest(entries: ComponentManifest): void
```

Registers lazy component entries in the same registry the eager classes use.

## Usage

```js
import { registerManifest } from '@studiometa/js-toolkit';

registerManifest({
  Accordion: () => import('./components/Accordion.js'),
  Slider: () => import('./components/Slider.js'),
  Map: { load: () => import('./components/Map.js'), mountStrategy: 'visible' },
});
```

## Types

```ts
type ComponentManifest = Record<string, ComponentImporter | ComponentManifestEntry>;

type ComponentImporter = () => Promise<unknown>;

interface ComponentManifestEntry {
  load: ComponentImporter;
  mountStrategy?: MountStrategy;
}
```

An entry is either the importer itself, or an object with `load` and an optional `mountStrategy`.

## The contract

- **One name, one entry**, across eager classes and manifests alike. A token an eager class or an earlier manifest owns gives a `manifest.duplicate-token` warning and is ignored.
- **No dependency and no bundler knowledge.** The value is a function that returns a promise. `import.meta.glob`, `import.meta.webpackContext` and a generated manifest all produce that shape, and core names none of them.
- **The class is resolved out of the imported module for you**, so a hand-written entry is `Slider: () => import('./Slider.js')` with nothing to unwrap.
- **The registry stays the only constructor.** The import ends in [`registerComponent()`](./registerComponent.html); autoload never touches `new`, the instance map or a mount hook.
- **One import per name, one failure report per name.** A failure emits one `component.load-failed` diagnostic and is never retried.
- **A class whose `config.name` differs from its token** gives a `registry.lazy-name-mismatch` warning.
- **An unloaded declaration is invisible** to `$query()`, `$closest()`, `$watchChildren()` and `getInstances()`, because nothing is constructed at discovery.

## The mount strategy chain

```
data-mount  >  manifest entry mountStrategy  >  'eager'
```

The entry's strategy stands in the middle slot for the `config.mountStrategy` of a class that cannot be read yet. Once the class registers, the chain reads `config.mountStrategy` and the entry is deleted from the map.

There is **no `data-load`**: deferring the import and deferring the mount are one decision. See [Autoloading](/guide/going-further/autoloading.html).

## `whenDOMSettled()` covers an eager lazy component

The import promise joins the lifecycle-work set for the **eager** trigger only, so [`swap()`](/api/dom/swap.html) waits for download, registration and mount — and still never waits on a viewport, an idle callback, an interaction or a media query.

## From a glob

```js
import { defineManifest, fromMetaGlob, registerManifest } from '@studiometa/js-toolkit';

registerManifest(
  defineManifest({
    modules: fromMetaGlob(import.meta.glob('./components/*/index.js')),
  }),
);
```

See [`defineManifest()`](./defineManifest.html).
