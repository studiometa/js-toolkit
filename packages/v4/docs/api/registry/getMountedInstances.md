# getMountedInstances

```ts
getMountedInstances<T extends Base = Base>(name: string, root?: ParentNode): T[]
getMountedInstances<T extends Base = Base>(el: Element): T[]
```

**The live instances** of a component name, in DOM order — or the live ones on one element, in mount order.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"db71a1cf2d74f97b364a0f5bdac01168ec7be67348d46b71337106ed3a5b0c3c","data":"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"}
import { getMountedInstances } from '@studiometa/js-toolkit-v4';

// This is the safe list to call a method on.
getMountedInstances('Dialog').forEach((dialog) => dialog.$unmount());
```

**This is the safe list to call a method on**: every instance in it has run `mounted()` and has not yet run `unmounted()`. Prefer it over [`getInstances()`](./getInstances.html) whenever the result is going to be _used_ rather than counted or inspected.

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

## There is no `getMountedInstance`

The singular [`getInstance()`](./getInstance.html) returns one object, so a caller who needs the live one reads `.$isMounted` on it. A second export would only hide that check behind an `undefined` that means two things — no element, no instance, or an instance that is not mounted.
