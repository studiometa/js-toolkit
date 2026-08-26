# Registry

The registry is the only code that constructs an instance. It holds one entry per name and one controller per element/component pair.

[[toc]]

## Registering

- [`registerComponent(Ctor)`](./registerComponent.html) — one eager entry, and its declared family
- [`registerComponents(...ctors)`](./registerComponents.html) — several at once
- [`registerManifest(entries)`](./registerManifest.html) — lazy entries in the same map

## Building a manifest

- [`defineManifest(options)`](./defineManifest.html) — derive tokens from module paths
- [`fromMetaGlob(glob)`](./fromMetaGlob.html) — a Vite `import.meta.glob` result
- [`fromWebpackContext(context)`](./fromWebpackContext.html) — a webpack context

## Looking instances up

Four functions answer from the DOM. They keep **no registry of instances**.

| Function                                                  | Population                                 |
| --------------------------------------------------------- | ------------------------------------------ |
| [`getInstances()`](./getInstances.html)                   | every instance that exists, mounted or not |
| [`getMountedInstances()`](./getMountedInstances.html)     | the live ones — safe to call a method on   |
| [`getUnmountedInstances()`](./getUnmountedInstances.html) | built, then stood down                     |
| [`getInstance(el, name)`](./getInstance.html)             | the one on this element                    |

```js
getMountedInstances('Dialog').forEach((dialog) => dialog.close());
getInstances('Dialog', section);
getUnmountedInstances('Dialog');
getInstance(el, 'Dialog');
getInstances(el);
```

The three plural forms take the same two overloads: a **name** with an optional `ParentNode` root, or an **element**.

- **A matching element with no instance is skipped, and that is the whole narrowing.** `selectorFor(name)` over-matches on purpose — it lists the responsive spellings of `data-component` too — and the instance-map read removes an inactive declaration, because a breakpoint-withdrawn component is destroyed _and_ deleted from the map.
- `root` is a `ParentNode` and the call is `querySelectorAll`, so an element root searches its **descendants** and never matches itself.
- **The element overload is the only form that reaches a detached element**, since `querySelectorAll()` does not see one. Pass the detached root as `root` when a name lookup has to reach inside it.
- **There is no `getMountedInstance`.** The singular returns one object, so a caller reads `.$isMounted` on it.

## In tests

`resetRegistry()` is re-exported from [`/test`](/api/test/) and drops every registration. It is not part of a page's vocabulary.

## Read next

[The registry](/guide/concepts/the-registry.html) explains the entry, the controller and the one scheduling algorithm that covers eager, lazy and conditional mounting.
