# getInstances

```ts
getInstances<T extends Base = Base>(name: string, root?: ParentNode): T[]
getInstances<T extends Base = Base>(el: Element): T[]
```

**Every instance that exists** for a component name, mounted or not, in DOM order — or every instance on one element, in mount order.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"17533aa28b62960bc493eaafea03a43bdf66c570112a3069ee90589c87749384","data":"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"}
import { getInstances } from '@studiometa/js-toolkit';

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

An element publishes its instances under `Symbol.for('@studiometa/js-toolkit/instances')`. That map is **not public API**; these four lookups are, and between them they express every read it answers. In a console:

```js
$0[Symbol.for('@studiometa/js-toolkit/instances')];
```

The element overload exists rather than a second export because both forms answer "which instances are there" and the argument picks the scope — and it keeps the map read in one place, which matters more now that the key is a symbol and no longer spellable as `el.__base__`.
