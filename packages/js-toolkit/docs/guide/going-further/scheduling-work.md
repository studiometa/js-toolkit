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
// @twoslash-cache: {"v":1,"hash":"f483577a86d5f7bac022e07837cae129e158302e9ffd481b0456a460a3e75a18","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"1515a4edcd2d1573135ea6e65c112d82ef6160e1b741ebe8530eae79bea86e04","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AzAVzAGM0BLCMAAgFsYAQzjNSMABQBKRLwAKpCP05wYAHgAiAeQCyAJRgdeAH16tYjTmBhQAfJRBw0Q0g0QBGAKxUANjDAA5mj4SADsVM6kATBuIIIiYri+VriIAAxUbPguQhxkSF4AvhTo2KkExPkRdLFsPE68znAA1rIAylk2zH5QACoizZq6Bhz2VE4ubgDM3iB+gcFIACwRLtGxTc0OPikFmdmkuTTkiAAcxaU4eIQk5NX0eBJCOyJSvHVgDRZC3Wgd+F0/KR2p0oN0yAAdMCcfhYCCuXjfX7/QFVEBQCBsBCIEC9AG8HgwXiMQ6CAC0z04AWsUF4cFB4OBjXxbB8mOaBMYzKJJKEggA7vDmgA6BzOALY5DIOZWLZUfBoNBYOCIAD0qoAVnAyWgIBAfM1OGgyUQlsKnMwoNxBM5hbAiKqhFhOKr6QCwUDVUifH8GUDhQr+D4QABdEPjSJuJYAJl8/iCIQ8ADZVlEYnhvb73YztrsPPscnkTkUStQytdKndqDVHjbCFA3iiPWRheIhFAhvpDGhbBJGGBZNJeABeWy8bRdjgyXhN8F9AadkY9hwTVxITwATjjC0TK2oa3TOLbUFz1j2ICyheOSCm0YuZauOJuaJoDxxHwaMB8sgAEr0dAAMgAon4ghgAwEaTGEGRzPGiyILG+5prEX6nqk7gFocRbLFM96YI+FS3GKNY4hIdbQG8IEwGBaDCusABCEDmFYAQAMI7P4aBLtIsgTkuDgYlieB4kSABUokAAZUTRdExIxzGBOxnCcdxUgSeJAgxPWvDiGgYifLwQjjsM3YEgARhqplYIoRCcFagS8FYjDwvwQhcDwhlmUxaDcnSnAAF5EhAXJCHwX7UZxhlgLSRpwLwcJwEa3B8OIPhuZwJCNBAvm2TA/Jwq4wpQlCyA6BoAByvAGIwZD+GwMAhhICpKiq6r2l+EA4KQwr8BA/mcD4aXCvCARepicCqgA6jAZmqgAgnIACSqrSZxqoMUx0UsUpKndlIK6RmEUzbgmSDRhhSHrHgG0KWxHHgfxyRnvmF4HEc+SIEsSZ4eWT6VsRb4XvUPlebQvEmUYpjmDAlg0gdUEeGk4SwTuN6pldOKg2hZ2Ye9JznKW+HlM+VavrUwONAMILZj0/QtIu3ZjI4h0eO4W4o6dn3o4e+4tNjCG49hCFpD9BEkwDsQSNZnVkJgjZ+jYdODHxjPCtLyiqLIChKCo6gq5DZjRTDKR2PDa4eNGe7zJzyORBjIDq7r/OIZeWHXghnii8T/33OTnw+Zs1OovO9P68ukHm+4MwnfBe52zzmz88dr1Xh9d6E79hEviRIBkVpFEzgrIfKxDPbCmwoX1T4PG8EQEB2WbbjuEsMHW/BKaXTzFfsKhT2pMnrt42EXsVkRvt4B+IMQGDxmTj5UNG7DNiNwUoTJ23ibJ/HsRY33yyC+7G6FOGQOwHgIgYOwxKsBwyWaQk4hDsAUK8O8FObCOiIwz8Pqzv6x4SCHKOXgX5ZJoHkltRS90uLdmkFIAA3C/N+/teCg0/kIfkQgjSUxaGrRQGsYCIL4DgkU3cq7SHgbwdUjlYCwggDQcCSDdL6VQdPIhhQHA2iEEgUANR/CJR4HgNACBCiFCAA=="}
import { defaultScheduler } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"019bbbdc1a1ca261edd9f93375256e7d2b38e52c82f5e4434af06b244fbe21af","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpesAGbMArqzQBlfvhhQZZRLwVKVrMgB0w7ALZYIpUROmzNy1eSpQI/BIhAAVJbyExe40s0MwALRs7ADmYMq8cIo2OqTqaB78rI4A1p7ivInevv4wAO6mqQB0lNTMoc7IyCAcYKll+GhoWHCIAPTtAFZwgWgQEKyp7GiBRAAsxSJSUOwQAWjMxbBE7cxY7O3RWrbtFjLyMdpkxU2GrCAAupdUIsxmSACcVDpgoYlIAIwAbFSLpKEYAwXPsrEdbGU6rhEAAGKiKe7Mfg0ciIR4AXwo6Gw0IIxDIZRo9DwgmEoikwikACNoqR2FSYOpGHwALwAPl4RAg7CgZTuD0Q31+tRgbw+iE+nz+90BwJAFLg1Np9NwL3YESQACZ4fhEciCYLMdicHhCCQ7NQ6HKWBwuHxSSIxDBJAdrMd4hpwXF9EYTGYnS6wTs4mUHE48O5vF4fH4AsEOOFIttYmoskkUvx0hBMtkY3lCqQSoSKlUanUGlQmi02p0en0BkMRmNJtNZvMgUsVmsNlsvWQ9s7LIdgyczhdrrd/sCABxwkVi/BfYX/WV4UHDlMWqFanV6lFamFG6g4034i1E60LQhQPhu2zFNDsTOMfhsVhUpGpdSuJ+pADCb4fpm3BMqyHJcjyoaOM4IByEq/B0gyvAMuIpjeLmpAwMwUC8FgupwDAxS8D+mZRPBiFkHAYgQLwkCiKkMAwFgvAAAb5EoYAAJJQDozIsbhoqzG8pTSpUSDVCAmFoFIpDCGUACqlI0ghKqlBOID8sCjwAOwvKK7yLog4zSgCQJ4I+maQuq0LaiACJ+PqqIAMzaUemAmi4ZoEn8VpMFgiILGQfCPgE6hgFIhgMhamlfDCACsekLkgxnlKZcohaqtTWTudm6g5+5GXFbknp5Z6Er5LiMP5sZAkFTqyMwYURVFfJTl8kqJQZSAJalq4gjADVWRqiC2fZSIFXFnzFR5eLmuVxIuEQ9wCEIcCDIyvB/qt62tfcwKfJqunzl1iBHSuZkuA6O1qsNTm7vlBqatNuJeeeFUgIwV7QHwW3COtxQpKEjDFCDUDMIs6jMGAGDIJcIGctyvL2NBEYeAAVGjLFXToAMQED3AsRjUSLBZvBfThEBSC0VNUcwZPwHAFToTRubY4R+j6MgACyAAiAByvAAErOmQor8DAlyMFWrQdAOJApDgpDFIYEAAF7sKwrBLKYoR7NB7QAOowFS7QAIIAAqce0bPtIDAD6dwWdwu0Cp8Tk9a8J13b1F21HjQ3Qt7Y2ObFz2nnNPkLR91V5CiwVGBt4WRd5GltRKTnPMd4oped6UJwHSBB3l40Gp84xh6VEeWlHVUBbVpB8LADVNcn0Vp2XHv6eKPW52uA2LAXiBF3uj2HjcdnQLivqmKIwABkOd5xLw6IxvMvAAOQAAKtnMCzMN0vT9IMwxoOvADcHNgA65JKcqSEsvPrp9krFmpIwjBzxlFD1Ysy9gbwwB9C8BWn9HGgNGBfx/swbgF8wDohgWUPeSBQBWlFHAOYYA8A9BAOidEQA=="}
import { defaultScheduler } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"e3558bb145bc8dee52cca866465c0efe0477c4ba09b842f2ce7ff1d50fcda61a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvMHTQAxUswC2MRt0S8ACqQhL2cGAB4iEdlAB8AHTDslWCKTTTZC5bipQIIhIhABBAHdmdic0fBhnel5mGyVmcUkBRRUAOkpqZgBzH2RkEA4wAGt0/DQ0LDhEAHoqgCs4AFo0CAhWQpCGogAWFLg0QSgJFTRmFNgiKuYsdiq4EXCoQVYyKpl6V1TSpVYQAF1dqj7mRyQATiplsEyws6oR0kyYBl81+WT3fPYZJAAGKnnjswxGQzgBfCjobC4XyEEjkO6yPBCUQJKTMfg0UiaYJgNBqDTaXT6IwmMzmdJHE6IABsAA4LjArjdEABGP4ZB5PPDozHYr4MC5faEAJn++EBwPIrIArODITg8LCQQj6Ew2JweJE3m58VodHoDMZTBZrLZ7I4tRsPp5vHhAsFQuEtdFYvEJFJ+O80ncsjk8gVilRSuVKjV6k0Wm0Ot1ev1BronqNxpNprN5jBFstSKsXF6tjt9od7s9TiyGUz8LcOY9nuBc250gVoQBmMUSzFIWmgg4gETQaEgM0OJzAS3vXigpK6XgAcgAAn0BkNE3VGs1Wu00DOANzWaxcDCiATCMTu6IYsh83FqXjAay8aJBEJjnXcXdgUHpYbMJCgWSMuB3TweoQFBUEgA"}
import { nextFrame } from '@studiometa/js-toolkit';

async function afterPaint() {
  await nextFrame();
}
```

## `afterWrite` is gone

rAF callbacks run before style, layout and paint, so **no phase inside the frame can read post-layout geometry**. Measure in the `read` phase of the next frame, or use a `ResizeObserver`.

## View transitions

`viewTransition(update)` is a standalone export with a progressive-enhancement contract: where the platform has no `startViewTransition`, the update simply runs.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"755f3d9109290b86961f34715788b344abc6d1d5c61b595ee3eac382b94548c4","data":"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"}
import { viewTransition } from '@studiometa/js-toolkit';

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
