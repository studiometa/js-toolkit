# nextFrame

```ts
nextFrame(): Promise<void>
```

Resolves on the next animation frame.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5bd2ea2df537fbd4d8e30b8937c4d42a0f3e9e731289603f06d930da45cbd2e6","data":"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"}
import { nextFrame } from '@studiometa/js-toolkit-v4';

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
