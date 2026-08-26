# nextFrame

```ts
nextFrame(): Promise<void>
```

Resolves on the next animation frame.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"16557f3373b2e90dbcb89ec6a4d588f3c7a3d0fc5e9b4296848aaaa5a3d7c656","data":"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"}
import { nextFrame } from '@studiometa/js-toolkit';

async function afterOneFrame(el: HTMLElement) {
  el.classList.add('is-entering');
  await nextFrame();
  el.classList.add('is-active');
}
```

## What it is for

Letting the browser see a style before the next one is applied — the two-step every CSS transition needs. `transition()`, `enterTransition()` and `leaveTransition()` are built on exactly this.

## What it is not

It does **not** mean "after paint". rAF callbacks run **before** style, layout and paint, so no phase inside a frame can read post-layout geometry. `afterWrite` is removed for that reason.

To measure after a layout has happened, measure in the `read` phase of the next frame — [`defaultScheduler.read()`](./defaultScheduler.html) or `$read()` — or use a `ResizeObserver`.

For a test that needs several frames, [`frames(count?)`](/api/test/) is the same idea with a count.
