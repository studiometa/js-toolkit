# The registry

One registry replaces the three mounting systems of v3: the global registry observer, `ChildrenManager` and the autoload loader.

[[toc]]

## The entry

```
RegistryEntry = {
  name,
  source: constructor | lazy loader (manifest entry),
  mountStrategy,  // when to mount each instance
}
```

- `registerComponent(Ctor)` registers an **eager** entry.
- `registerManifest(…)` registers **lazy** entries in the same map.
- A thunk in `config.components` becomes a lazy entry under its key.

**One name gives one entry**, as with `customElements.define()`. A collision gives a `registry.conflict` warning and the entry is ignored — except for a lazy child declared by several parents, which is the normal case and wins quietly.

## The controller

**One element and component pair gives one controller.** The controller holds the strategy of the pair and the source it was scheduled against.

That single object is what makes eager, lazy and conditional mounting one algorithm:

- The arrival of a lazy class is a **change of source**, so the pass that replaces a controller turns a spent import trigger into a mount.
- A trigger stands down without a teardown of its own: a controller marks itself spent, a spent controller is not the current pair, and so a second trigger is inert. The teardown runs from the ordinary controller replacement.
- Controller identity guards a queued callback of a disposed strategy.

There is no `loadStrategy` and no `data-load`. Deferring the import and deferring the mount are one decision:

```
data-mount  >  manifest entry mountStrategy  >  config.mountStrategy  >  'eager'
```

## What the registry constructs, and what it does not

**The registry is the only code that constructs an instance.** `ChildrenManager` is gone and constructs nothing, because it does not exist. Autoload never touches `new`, the instance map, or a mount hook — an import ends in `registerComponent(ComponentClass)` and then the ordinary pipeline runs.

`registerComponent()` walks `config.components` in one `registerFamily()` loop, so one call covers a whole tree. The recursive registration of v3's manifest `children` arrays is dead data.

## Where the instances live

An element publishes its instances under `Symbol.for('@studiometa/js-toolkit/instances')`. It is **not public API** — the four lookups are, and between them they express every read the map answers.

In a console, one line reads it:

```js
$0[Symbol.for('@studiometa/js-toolkit/instances')];
```

### The four lookups

```js
getMountedInstances('Dialog'); // the live ones
getInstances('Dialog', section); // every one built in a region
getUnmountedInstances('Dialog'); // built, then stood down
getInstance(el, 'Dialog'); // the one on this element, mounted or not
getInstances(el); // everything on one element
```

They derive the answer from the DOM and keep **no registry of instances**.

- **The name says which population it answers.** `getInstances()` returns every instance that exists; `getMountedInstances()` is the safe list to call a method on; `getUnmountedInstances()` is what a reversible `in-view` or `media:` strategy has stood down, plus a construct-then-mount-failure.
- **A matching element with no instance is skipped, and that is the whole narrowing.** `selectorFor(name)` over-matches on purpose — it lists the responsive spellings of `data-component` too — and the instance-map read is what removes an inactive declaration, because a breakpoint-withdrawn component is destroyed _and_ deleted from the map.
- **There is no `getMountedInstance`.** The singular returns one object; a caller reads `.$isMounted` on it.
- `root` is a `ParentNode` and the call is `querySelectorAll`, so an element root searches its **descendants** and never matches itself.
- The element overload is the only form that reaches a **detached** element, since `querySelectorAll()` does not see one.

## Responsive declarations

The plain `data-component` token set is always active. One responsive set is added with the spelling of responsive options:

```html
<div
  data-component="Action Analytics"
  data-component:xxs="MobileMenu MobileSearch"
  data-component:m="DesktopMenu DesktopSearch"></div>
```

- At the active breakpoint the registry walks from the widest active suffix **down** and takes the first attribute present.
- That value is the **complete** responsive set. A wider value replaces every lower value; it does not merge. An empty value is a stop: `data-component:s="TabletFeature" data-component:l=""` runs `TabletFeature` at `s` and `m`, and removes it at `l`.
- The effective declaration is the **union** of the unconditional set and the selected responsive set, without duplicates.
- A crossing compares that effective set against the element's current state. A shared name keeps its controller and its instance. A name no longer declared is unmounted and dropped from the element, so a crossing back gives a new identity. A new name enters the normal pipeline, so mount strategies, `data-mount`, lazy entries and lifecycle events keep their meaning. An inactive lazy declaration imports nothing.
- The document observer registers the exact `data-component:<breakpoint>` names and replaces that slice of the filter after `setBreakpoints()`.
- Connected elements with a scoped declaration share **one** reference-counted `useBreakpoint()` subscription. A page with plain declarations opens none.
- Breakpoint work runs through the background lane, so `whenDOMSettled()` includes the teardown, import and mount work of a crossing.
- A suffix naming no configured breakpoint is ignored with one warning. That includes the v3 list syntax `data-component:xxs:xs:s`. There is no range form and no breakpoint-list form.

## The matching surface

It is smaller than v3's, on purpose. Only plain and configured scoped `data-component` declarations are discovered, with whitespace-separated tokens for several components on one element.

Removed: the `<tk-name>` tag sugar, the breakpoint-list suffixes, and the lowercase arbitrary-selector registrations.

`data-component` still improves native elements — `<form>`, `<a>`, `<details>` and table markup all take it.

## Duplicate copies of the package

`shared-runtime.ts` owns `globalThis[Symbol.for('@studiometa/js-toolkit/runtime')]` and gives each subsystem a typed slot with a revision. Independently evaluated copies reuse the canonical `defaultScheduler`, the registry maps and controllers, the DOM mutation observer and queue, the root-context state, the breakpoint state and every built-in service cache.

`Base` carries a separate inherited `Symbol.for` brand on its constructor, so family and imported-module resolution recognise a component from another copy. An incompatible root or slot revision throws. This is same-realm coordination only, and a `createService()` or `perTarget()` call of a consumer stays owned by that consumer.

## What is not built

- **Composing and overriding manifests.** v4 is first-wins-and-warn. An `{ override: true }` option is about five lines; the decision is the expensive part.
- **A scoped `root`.** The registry is document-wide by construction, and no consumer has asked.
- **Informational manifest metadata** (`packageName`, `subpath`, `exportName`, `group`, `styles`, `integrations`). It belongs in the output type of the generator, not in core.
- **A `data-load` compatibility shim.** A page that used `data-load` renames one attribute.
