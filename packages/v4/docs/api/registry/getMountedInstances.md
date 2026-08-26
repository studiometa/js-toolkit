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
