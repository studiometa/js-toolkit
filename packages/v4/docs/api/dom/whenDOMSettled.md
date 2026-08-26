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
