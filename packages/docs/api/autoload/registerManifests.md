---
outline: deep
---

# registerManifests

`registerManifests` registers several component manifests with the shared autoload runtime in one call, then lets a single coalesced start flush over the composed set. Use it from an application entry point to activate your components (built with [`defineManifest`](/api/autoload/defineManifest.html)).

It is the variadic convenience wrapper over [`registerManifest`](#registermanifest): it calls `registerManifest` on each argument in order and returns the runtime from the final call.

## Signature

```ts
function registerManifests(
  ...manifests: ComponentManifest[]
): AutoloadRuntime | undefined;
```

## Parameters

- `...manifests` (`ComponentManifest[]`): one or more manifests, registered in argument order. Passing none is allowed and is a no-op.

Each manifest is a `Record<string, ComponentManifestEntry>` — usually one built with [`defineManifest`](/api/autoload/defineManifest.html).

## Return value

Returns the shared [`AutoloadRuntime`](/api/autoload/#types) from the final registration, or `undefined` when a conflicting runtime version already owns `globalThis` (the version guard warns and no-ops) or when no manifest was passed.

## Behaviour

- **One coalesced start.** The first registration schedules a single start through a microtask. Because every ES module import in a graph evaluates before microtasks flush, registering several manifests in one call — or across side-effect entries imported at the top of a module — results in exactly one [`autoload`](/api/autoload/#autoload) call over the composed set. Only one loader ever scans the DOM.
- **Last manifest wins.** The runtime composes the accumulated manifests later-wins, and `registerManifests` registers its arguments in order, so the **last** manifest wins on token collisions. Pass your custom manifest last to override a component that shares a token.
- **Shared runtime.** Registration goes through a cross-copy runtime keyed by `Symbol.for('@studiometa/js-toolkit/autoload/runtime')`, so several bundle copies coordinate through a single runtime object and still coalesce into one loader.
- **Version guard.** A manifest registered by a conflicting runtime version is ignored with a console warning, and the call returns `undefined`.

## Examples

### Register your components

```js
import {
  registerManifests,
  defineManifest,
  fromMetaGlob,
} from '@studiometa/js-toolkit';

const app = defineManifest({
  packageName: '@my/app',
  modules: fromMetaGlob(import.meta.glob('./components/*/*.js')),
});

registerManifests(app);
```

### Layer a custom manifest over a base one

```js
import { registerManifests } from '@studiometa/js-toolkit';
import { manifest as baseManifest } from './base-manifest.js';
import { manifest as appManifest } from './app-manifest.js';

// `appManifest` is last, so it wins on any token it shares with the base manifest.
registerManifests(baseManifest, appManifest);
```

## registerManifest

Register a single manifest with the shared runtime, with injectable options — use it to build your own side-effect entry module.

```ts
function registerManifest(
  manifest: ComponentManifest,
  options?: RegisterManifestOptions,
): AutoloadRuntime | undefined;
```

### Options

Every seam is optional and testability-oriented:

- `document` (`Document`): the document to scan and to read the eager `<meta>` from. Defaults to the global `document`.
- `globalObject` (`object`): the object the shared runtime is stored on. Defaults to `globalThis`.
- `version` (`string`): the identity used by the duplicate/conflict guard. Defaults to this package's version.
- `root` (`Document | Element`): the DOM scope handed to the loader. Defaults to the resolved document.
- `dependencies` (`Partial<LoaderDependencies>`): loader dependency-injection seams, forwarded to `autoload`.
- `console` (`Pick<Console, 'warn'>`): the logger used by the conflict guard. Defaults to the global `console`.
- `scheduleMicrotask` (`(callback: () => void) => void`): schedules the single coalesced start. Defaults to `queueMicrotask`.

## readEagerTokens

Read the eager tokens declared by `<meta name="js-toolkit:eager" content="A, B, C">`.

```ts
function readEagerTokens(documentObject: Document): string[];
```

The `content` values of every matching meta (in document order) are concatenated, split on commas, trimmed, stripped of empties and de-duplicated. When no such meta exists the list is empty.

## Types

- `ComponentManifest` — a `Record<string, ComponentManifestEntry>`; see the [autoload API](/api/autoload/#types).
- `AutoloadRuntime` — the shared, cross-copy runtime object stored on `globalThis`.
- `RegisterManifestOptions` — the [options](#options) object.

## See also

- [`defineManifest`](/api/autoload/defineManifest.html) — build the manifest you pass here from your component files.
- [`autoload`](/api/autoload/#autoload) — start a standalone loader without the shared runtime, e.g. to scope discovery to a `root` element or keep a `stop()` handle.
- [Autoload API](/api/autoload/) — every export of the autoload engine.
