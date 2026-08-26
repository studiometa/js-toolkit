# whenDOMSettled

```ts
whenDOMSettled(): Promise<void>
```

The completion boundary for morphing, fetch updates and breakpoint crossings.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5a074619e474be6bc350b4c831ae05c65ebc6557f9e5e9d87558215a93ea05cd","data":"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"}
import { whenDOMSettled } from '@studiometa/js-toolkit';

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
