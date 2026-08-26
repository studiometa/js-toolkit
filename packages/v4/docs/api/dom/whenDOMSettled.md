# whenDOMSettled

```ts
whenDOMSettled(): Promise<void>
```

The completion boundary for morphing, fetch updates and breakpoint crossings.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"583673fc21894168c2c5b4563977b2fae9c36ba56a814cc43218b32ff546fe8a","data":"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"}
import { whenDOMSettled } from '@studiometa/js-toolkit-v4';

async function replace(el: Element, html: string) {
  el.innerHTML = html;
  await whenDOMSettled();
  // Every eager component in the new markup has mounted.
}
```

[`swap()`](./swap.html) awaits it for you.

## What it waits for

- it **drains the pending mutation records**;
- it **follows the mutation chains of eager lifecycle work**, so markup a `mounted()` inserts is covered too;
- it resolves after the eager mounts **and the teardown**.

An **eager lazy** component is covered: the import promise joins the lifecycle-work set for the eager trigger only, so an awaited `swap()` waits for download, registration and mount.

Breakpoint work runs through the background lane, so a crossing's teardown, import and mount work is covered as well.

## What it does not wait for

- **visibility, interaction, idle or media conditions.** A component with `data-mount="visible"` has not mounted when this resolves, and that is the point: waiting on a viewport would mean never resolving on a page that is not scrolled.
- **the promises returned by `mounted()`.** An async `mounted()` is the component's own business.

## Where else it appears

- `watchAttributes()` records join the same queue, so a namespaced declaration is covered the way a mount is.
- A [`useMutation()`](/api/services/useMutation.html) subscriber that needs the framework's order rather than the platform's awaits this in its callback.
