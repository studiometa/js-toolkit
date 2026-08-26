# The scheduler

One frame-aligned scheduler is the clock of the framework. It replaces `domScheduler`, the `RafService` loop, `SmartQueue` and the view-transition scheduler of `@studiometa/ui`.

[[toc]]

## The lanes

```
frame start (rAF)
  1. tick        — fan out to the subscribers of the clock
  2. read        — measure: layout reads only
  3. write       — mutate: DOM writes only
style / layout / paint

between frames, on its own turns
  background     — time-sliced lane: mount and update lifecycle work,
                   mutation-record processing, manifest loading
```

- **Frame alignment.** One flush per frame, at rAF. Every read runs before every write, once, before paint.
- **No thrashing.** A `read` scheduled from a `write` runs in the **next** frame. A `write` scheduled from a `read` runs in the **same** frame.
- **Bounded phases.** Each queue array is swapped for an empty one when its phase starts, so a task scheduled into the running phase lands in the next frame's batch. The `write` batch is taken after the reads run.
- **Error isolation.** One try/catch per task. A task that throws is reported and dropped; the flush continues and the scheduler never deadlocks.
- **Queued execution only.** There is no synchronous escape.

## Reading and writing from a component

`this.$read(fn)` and `this.$write(fn)` tie tasks to the instance, and unmount cancels the pending ones:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1752f078f8d26d0f328e155b124c54260d174985121039d2ed00e34d1b9d7f06","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Reveal extends Base {
  static config = { name: 'Reveal' };

  async mounted() {
    const box = await this.$read(() => this.$el.getBoundingClientRect()).promise;
    await this.$write(() => {
      this.$el.style.setProperty('--height', `${box?.height}px`);
    }).promise;
  }
}
```

Scheduling returns a cancelable **handle** whose promise resolves with the return value of the task:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"f08509a3c52f762b30dc742d6f44b10d64ea71d5e9876d3bdeb7c73999e9b4ce","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AzAVzAGM0BLCMAAgFsYAQzjNSMABQBKRLwAKpCP05wYAHgAiAeQCyAJRgdeAH16tYjTmBhQAfJRBw0Q0g0QBGAKxUANjDAA5mj4SADsVM6kATBuIIIiYri+VriIAAxUbPguQhxkSF4AvhTo2KkExPkRdLFsPE68znAA1rIAylk2zH5QACoizZq6Bhz2VE4ubgDM3iB+gcFIACwRLtGxTc0OPikFmdmkuTTkiAAcxaU4eIQk5NX0eBJCOyJSvHVgDRZC3Wgd+F0/KR2p0oN0yAAdMCcfhYCCuXjfX7/QFVRyRNxLABMvn8QRCHgAbKsojE8EifH9QeC7nNdh59jk8iciiVqGVrpVaTQHogQBJBMFoG8UWCgQA6cRCKBDfSGNC2CSMMCyaS8AC8tl42jlHBkvFF4L6A1lIwVDgmriQngAnLiFgSVtQ1mS+VKoNt6e5GYdmUgpliLuyrnybmiebV6mheDAfLIABK9HQAGQAon5BGAGOMMWEMnM8YtEDjnaTYrHPdY9iAskzjsspkHMCGKrcHBHHoLCFA3umYJm0OL1gAhCDmKwBADCO38aDN0lkOrNDigEDYCD5vQBvAAVDuAAZ9gdDmKj8eBaecWfzqT7vcCGLd3jiNBiT68ITa4by3gQABGABWP5YIoRCcFAE68FYjDwvwQhcDwH5/mO0bBDAvBwJwABe6EQIwH58LG/azgRUBQWgcC8HCmEIXw4g+PBnAkI0ECNNuYEwAA7nCrjilCULIDoGgAHK8AYjBkP4bAwAAuhI+BoGgWBwIgAD0qmwCQPgQDgpDivwEBYZwPgMeK8IBBpa5wKpADqMB/qpACCcgAJKqUes6qSOY5gBBF4zlmZpSBauaIKEUz2viSBYt6pbrHg3nnlOAVzvKlapLFta+vWiBLISTYcqGXLtjUeAfA0yG0Iu35GKY5gwJY1gejmkwFGk4QFg6/okvFfKVel0U+kc+RnAVLZhtypV8uVqEDCCAJijY/QtKa8pjOirUeO4dqdVFuU9a6zotANxZDX6xZpGN5QTSVvL8iBOlkJgIrUj0y2DEua3ig9yiqLIChKCo6ifbVZi+Q1KR2CFm3uFiTrzHtHWRL1IA/UDJ0lllw0nFinhXZybb3JGnyzS082osaK0g+aLVWh4MyRUWTrI4dmwnRFNYHNj0X40VhPUFN/JdsKBqvUtJrU7Y4psEI7CxguvBEBA4HQ3T7hLPmCNFsScWHTLcs+OzZ05aEvOtuGgszbwlXVbq0Z1eDjU2KrbjuOFjMEhzLOxP1yRVvtnN1iNNqFDJmTQOUIgYOwvAsOwtEPgk4hqsAUK8O8UaNAMGqIg1PyUoaEruhIaqajGPgnmgZ6+ROl7XvK0hSAA3GnGck9bEC0DnQicUInCk8032KL9MAt3wWctNLsvST40hN7w6lQbAsIQDQWaty+b4d7QY+FA4gpCEgoA1P4mE8HgFEgIUhRAA==="}
import { defaultScheduler } from '@studiometa/js-toolkit-v4';

const el = document.body;
// ---cut---
async function measure() {
  const task = defaultScheduler.read(() => el.getBoundingClientRect());
  const box = await task.promise;
  task.cancel(); // idempotent
  return box;
}
```

## The tick

`scheduler.tick(callback)` subscribes to the clock:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"bcb6343beb1437f7cfb334736ad67f7765b1805028f9a0c45a7b4060fc7875b4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpesAGbMArqzQBlfvhhQZZRLwVKVrMgB0w7ALZYIpUROmzNy1eSojmZpAE4qOsAHM0+JAEYAbFRojh4wDIggFjLyijY6diAcYLiIAAxUio7M/DTkiM4AvhTo2CkExGSU1HThIILColLCUgBGcPyk7C0w6ox8ALwAfLxEEOxQVQ5OiP6uiTCe3n6+QSFheE1wre2d3VVJKQBMGfhZOZUzRSU4eIQkCTT0TGycPAJCImIwktHW2moaWL/Uj6IwmMxfH5WIG2SbBaYADgAzG4Fl4fIgAqtSKFalFoVpYW52MkkMc6qdSNlcmTUldqKVbhUHjUmIYwoQoHw/rYAHRodj8ADWjH4bFYLWyQvUABVBUKAMLiyXC7i9AbDUbjKpQCD8BAROTbDpdGC8briUxm7xm0gwZhQXhYU5wGC83hy4W8LZtE3dUhwMQQXiQURCmAwLC8AAGAHclGAAJJQHR9aNOhZQEkeXlVYIeA3IZAgO1oKSkYRVACqzV9uzdIAAuo37PDwr5Uul5osMQAWbG4vAC4X7ElHE5nGmIJEAdnpmBuETulSCrIijCwWXZuT4AvZ6jAUkM/rhjnbqQRqJ7SH71DWtT3uGJpMQ5MyVPOeV7AFZ54yl8yeZriAG5bmEZB8LAsjMAeR4nq2Z7LLe7jokg34DusERQcEo4vm+lLUhc36+H+i7lPcQFPBERCOO8wgQDo6gKh8DFPiAUztkiXYoUsiAzhhtT1HArG4SkKIUpOFyHKRZTLiyVEgdunJ8Mx9E6LyrAQB4jC8rpUDMME6jMGAGDII2aojGMExULq+p4DKSi8AAVE50ZCaxGlaWmLnesEw68Ep0C8BAUhoFgoWBswAXwHAzChLwaDBjadHCep+j6MgACyAAiAByvAAErfGQCz8DAjaMPgaBhXAiAAPR1bAJCaTgpC8oYEAAF7sKwrDMLypgeI1epwHVADqMAtHVACCAAKiZ1e5Oh1ZpHgAPoOMO3CntMvhIpe3aodOAl4KtolIOJ76EXkHYyUyFGrgpoFUtuEEJUYPQhnBK7sW2fi9uSPF9idESPudx0SR+U6+L2d0AQ91RPZuL3gaQkEwNBsHHj9HH/QdQNoSDkQYzhz5iROUNSXSLZ1NAZRgqYojAJClgxIS8S8AUvDiKQECGLwADkAACIhSFmfNhMwdUAFZwAAtIlDFCuwaBy0QvYCwA3OlYBCY0tY7KavD9CzvwwvE/LyowjDM4+FBfNBnMarwwD6LwKUeatjB2w7wTcNrYAFP7VTbswSCgDUCxwOwQh4LLIAFAUQA"}
import { defaultScheduler } from '@studiometa/js-toolkit-v4';

const unsubscribe = defaultScheduler.tick(({ time, delta }) => {
  console.log(time, delta);
});
```

- Tick callbacks run at the **start** of the flush, before `read`, so what they schedule belongs to the same frame. A callback measures in `read` and the render function it returns mutates in `write`.
- **The subscription is the only handle, and it keeps the loop alive.** The scheduler requests the next frame when a queue inside the frame is not empty, or when a tick subscriber stays. There is no permanent rAF loop.
- Tick subscribers are not queued work, so `whenIdle()` ignores them.
- A tick callback that throws is reported and skipped, never unsubscribed.
- **`delta` is clamped** to `[1, 40]` ms, and the first tick after the loop wakes reports `1000/60`. `time` stays the raw rAF timestamp.

A component that needs the loop for part of a cycle uses [`toggle()`](/api/services/toggle.html) rather than subscribing and unsubscribing by hand.

## The background lane

It posts its own turns through `scheduler.postTask({ priority: 'background' })`, and falls back to a `MessageChannel` message. Each turn runs a **5 ms slice** measured from the start of the drain, then gives the thread back and posts the next turn.

Background work alone never requests an animation frame. `whenIdle()` counts background tasks and resolves at the end of a background drain as well as at the end of a flush.

## `nextFrame()`

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2518bda2c1f9b1776e2a6946413ef5896fede86df1e707e8a62075ddee07a6ec","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvMHTQAxUswC2MRt0S8ACqQhL2cGAB4iEdlAB8AHTDslWCKTTTZC5bipQIIhIhABBAHdmdic0fBhnel5mGyVmcUkBRRUAOkoQODRmRyQATipWGDAAczC8qizSYpgGXxl6VxV0jhkkAAYqEXxs5jEyPIBfCnRsXF9CEnIK2TwhUQSpZn4aUk1gsDQ1DW1dfSMTM3N0zOzagHYARgKi0vwkC47qbOrakCWVtfYN5q+xgCZOt1FH1yIgLgBWIYjHB4Cb9ab0JhsTg8SLyZKqdRaHR6AzGUwWay2eyONGNdwgTzePCBYKhcJo6KxeISKT8DFpKgnHKIXIAFmuJTKvIqzxqeHq6LcP1aiAAzICeiCkAAOAYAXU60DGIGJDicwDJGN4AySul4AHIAAKZQRQCQqLIAegAVnAALRoCAQVgAaxC7qIfItAG5rNYuBhRAJhGJWdFlmRPhs1LxgNZeNEgiEjW41GGwAN0o7mEhQLIinBWXg3SABgMgA"}
import { nextFrame } from '@studiometa/js-toolkit-v4';

async function afterPaint() {
  await nextFrame();
}
```

## `afterWrite` is gone

rAF callbacks run before style, layout and paint, so **no phase inside the frame can read post-layout geometry**. Measure in the `read` phase of the next frame, or use a `ResizeObserver`.

## View transitions

`viewTransition(update)` is a standalone export with a progressive-enhancement contract: where the platform has no `startViewTransition`, the update simply runs.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"214594c197d2ac137dafbfd64d6531e97b0132ab01457967f8282aa9d2bcc002","data":"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="}
import { viewTransition } from '@studiometa/js-toolkit-v4';

async function swapPanel(el: Element, html: string) {
  await viewTransition(() => {
    el.innerHTML = html;
  });
}
```

- Updates queued in the **same flush** batch into one `startViewTransition()` call, so a backdrop and a panel animate as one transition. Each later batch is appended to one promise tail, so several flushes during one transition stay serialized.
- The scheduler flushes the pending `write` tasks before the snapshot. Writes scheduled inside the update callback run within the transition.
- The helper is standalone. `Base` has no view-transition method and no import of one.

It composes with a negotiated `domUpdate()`, where the ancestor chooses the lane because it knows whether the region animates:

| claim                                         | effect                                                               |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `wrap(viewTransition)`                        | the change plays as one batched native view transition               |
| `wrap((apply) => this.$write(apply).promise)` | the change lands in the `write` phase, batched, cancelled on unmount |
| `wrap(motionView)`                            | any object with `update(mutate)`                                     |

Neither runner is the default.
