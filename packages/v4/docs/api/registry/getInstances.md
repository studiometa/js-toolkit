# getInstances

```ts
getInstances<T extends Base = Base>(name: string, root?: ParentNode): T[]
getInstances<T extends Base = Base>(el: Element): T[]
```

**Every instance that exists** for a component name, mounted or not, in DOM order — or every instance on one element, in mount order.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"29e48b5f5dec0ea5409fdafe0c497a0c46efed5a2494003931a6e2b2ebb18c3a","data":"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"}
import { getInstances } from '@studiometa/js-toolkit-v4';

const section = document.querySelector('section')!;

getInstances('Dialog'); // every Dialog in the document
getInstances('Dialog', section); // every Dialog built in a region
getInstances(section); // everything on one element
```

Reach for it when the result is **counted or inspected**. When it is going to be _used_, prefer [`getMountedInstances()`](./getMountedInstances.html) — every instance in that list has run `mounted()` and has not yet run `unmounted()`.

## The two overloads

```ts
(name: string, root?: ParentNode): T[]
(el: Element): T[]
```

- **The name form** searches the descendants of `root`, which defaults to the document. `root` is a `ParentNode` and the call is `querySelectorAll`, so it never matches `root` itself.
- **The element form** reads the element's instance map directly and never consults the DOM, so it answers for a **detached** element as readily as for a connected one. The name form cannot: `document.querySelectorAll()` does not see a detached element. Pass the detached root as `root` when a name lookup has to reach inside it.

## How the narrowing works

`selectorFor(name)` over-matches on purpose — it lists the responsive spellings of `data-component` too — and **the instance-map read is what removes an inactive declaration**, because a breakpoint-withdrawn component is destroyed _and_ deleted from the map.

A matching element with no instance is skipped, and that is the whole narrowing. There is no mount filter, because it never did that work.

## Where the instances live

An element publishes its instances under `Symbol.for('@studiometa/js-toolkit-v4/instances')`. That map is **not public API**; these four lookups are, and between them they express every read it answers. In a console:

```js
$0[Symbol.for('@studiometa/js-toolkit-v4/instances')];
```

The element overload exists rather than a second export because both forms answer "which instances are there" and the argument picks the scope — and it keeps the map read in one place, which matters more now that the key is a symbol and no longer spellable as `el.__base__`.
