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
// @twoslash-cache: {"v":1,"hash":"1752f078f8d26d0f328e155b124c54260d174985121039d2ed00e34d1b9d7f06","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ABKgRgbCc80WiAArAB2VbrTZIABsuwWBwYHlBJAhp3OiAATNdbqR7o9UW8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN42f45EEQvwwjZItEuQoEklUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZnM9li4cSskitogdtQMYcPMcnNkvn6bncHvSiQBGKnUT604j03b/DyMLD8siYPg48GseJqsAAM3YKUQvGA5l4jd4YGYlhgtc6pDOKQA3OYXpDvUgABzDxFgDaBtEh/ZhkDlqspSNnL4AZhJcYpzxTmBp3wz5CzjJzea0BYwfBbbY7aC7E8HCyxSxW/onyKD6NnWPArelUaQ67zqS5IJoSFw7mm+6/Ee36MG2mzQEWYJsPElgQF00QwFAjDcLWhiWOwqiSEQEDsFAxhOC4bh4AAMuwFYwPwGCCD4hAQDkFC8G2zBarUvAAEY+AeXZQLAYDxLwACyzAhKQAxdKQYC8MwvjgmAXRYLwFYYQ8fRgOYjC2MpSkLGSIQQBWvCbDAlh8JszD2KQGEiBEVkKpE9C8AABgAJBhaEYWgOFebwgAoBLwcAYGA/C8LY5hcFF/CIOYDZNgl0VcehmHYXw9ZKU2jblp0EXVi2rCCspADuzBNG5hHxD5ZzlIxQUAMr9AAwhEND0Nwfb5QVcndIpJUpGVHRdPxcD8F2gmMIwRBsF0MB8Doxh1rwgBkBLwLx9aljYvClYAAIKhOEmoxNyijdspXHsLQZy8ENClgCIlW3PYtWxIoIhsBEKS8JVTT4LwTRwOYECVWAnGPTxISRJ03bJfpA2ZYFWE4XW+1Ns9I3IHAGlkKhWU0DlnGY2tG3bS8Uz9QVA5eo+SCJoS05rG+gYIjOmJ4AF2XLgSMIbmS8ZPMOEF7gQB4Mt+RX2PxEC0LWAAiADykmgg8vAAD68BhsBVpEUAPtCiatGOr6TgBn48x4Cu0ALXzTrGItbom4HvKmkt0oe1DZiAcEDIQUB8Bywr8iYDVycwUCSGrGstcYjAVmAtYU+t8ea2guG8K1NxYV0axQNIXA5HH6tZxRVBUXKefeFAhc+Cp8dPeCUA9gIPH8DARfKV0tSWA57D8GwrAhO9URuT4ZzzNFPj+STcCJIzpsokLlvvuvey2yAPnR8b+JO8LIFPIScIS18UvQX7x4B6eOB2BeUqSOHRjGA1Pe1gAEtIkk0QAomsNs0QTZYkTMOP07MraIEAtvOcPke6O1RMfUW2xWgX3TNfHqsF4LBz4IAmyUQ0DxExKILKvQJwdQ4EQrOOEVYVxapRWUeAvA+AAFRsK8gQ4BxDSHkO7FQ9gNCWrBQ4VxIO0BW7DVerdTOLVYr8WalrU8RAyI3TOBWWwg80B6WUgrfuU8SoAC8hKWR4nIIBRDjJQFBmgEQNg4BNF0XJIQOiSBWQgIY1RMBKo2DsPEI6yBJLKwAHIghgAxOSc8piMFNMUMowwe5nlIMTIx7BWBCHiLYFIJQa4lAAOowH4iUY6agACSJRuFEJKHw/WAjqHRCztwUBzNhxswDEgQkiYbZzlqddShDS0BZyQYgZ2wFUFBnFp7Xcl8fYyyYPfc8fA64FyLiXOAZc5EPHfqeAiqg8KaD2VILZ9hdb6wiSuciLSkzdI3pzHp35dmET/CuZBQFNwJjhKuDBUFMw3xwRIkOz9X6igapVLsNBiKkXIsnVOvB068BImRHOKyG5rNLlCsiVcZTUQ8Kixusj1aAwhTADuI85692YP3MIQ8R4ZPHt4JS1lQavWSHPPWYA+Z2OXiAKEWJCSrnXlA98044Hfh8uCpoLyCRcxdifZmMIflXz+dghZ+ZH6hwkC/Pkb8P6sG/r/ABliQEr35SiW5wrAywNDOKxBh8RwoLdsmaZkFlW+1VSedVhZeBVOiB1VqrUylgCjK1TAawHQYDWLWf1Aaw0wGVoxIQZIdERCYbikAQTQnhMiVEbuMS4nmgSWCVgyTUnpMydk3JsoClFJKeUkoP8/6+rQCUTokaVrXNZkKjpsIHl4DbWsEZFs5UTMTIql13tpYwSYLgxCvAY2hvbQmwEya9LHA6AMEU55cxeowDeO8KROKLVYMtfdN1dbqQyZxPMfQIUYAAPxnonDnJFB8cVylYbwDhXkF1xuXUmoeEQN1oC3Y/URbDxEIRsWcR4FZ7g+FUHY26kRKqIqWj4TRpBbqLMfrFEy86A0RTjbwWAK7ANKQgIolqASUaZrCaCHN0TYmFHibk4tpa0JpIycwLJ+wq1uBrcU0pFTf1LsTXcFNYBW2bt3c001nS4QWp7YmW5Yr+0yeSZgIdjrQLOupLMqd/yAQRGKvbehCctZnMUBco2nalgW0tdbbmc57bafea7BM5slVzOnZ6zTT8TnxG8NWAotZ1KWEElhqzBtLlpo/Qqb9wWUgFC8mInDmBYqWWZScllsH4OtzzPAIhIhmVJYKJlwxckHg8RSOG3gn7j3LU7kpQSzYYApCHiQGj5g6PZrILmmA+aWOFrYyQEtD8y3cd4zkvJhShP1pOSUMr2drmrguIBRzoy+3fBgCFhg9rEDDvGVuGE3yJ0Gawf7Hd/nln5zRVhdZZdX07MOc8g5YRnmYpsdFmzWFsV8oAgK8c0CuZqY8E8xwB2Xwjq3OfWY85oCXysH4+wwApQ7S0oc3gAByAAAp0HofR4LMEtDUOoDQmgtFaNj/q5hARKmLGwbUPJ0d5UbPMHRMUFzVgqmjq87YceM9YNjnatP8rpRilyjGuVsZywEorCqzBqq1U2PVPebd5qrXWqrpeCDSx9IoSkQRwiHg4W4PECHpLsZK5qvYHXYKSWa8FOtNnBU6q657hG8NiHQOYEYNjqoVRlvY84r5YA9t71Bd28ltALwsC0C8ntVGu0LevdUHTHa/YnDE6QKAb6jjU0eEqCAF4LwgA="}
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
// @twoslash-cache: {"v":1,"hash":"f08509a3c52f762b30dc742d6f44b10d64ea71d5e9876d3bdeb7c73999e9b4ce","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AzAVzAGM0BLCMAAgFsYAQzjNSMABQBKRLwAKpCP05wYAHgAiAeQCyAJRgdeAH16tYjTmBhQAfJRBw0Q0g0QBGAKxUANjDAA5mj4SADsVM6kATBuIIIiYri+VriIAAxUbPguQhxkSF4AvhTo2KkExPkRdLFsPE68znAA1rIAylk2zH5QACoizZq6Bhz2VE4ubgDM3iB+gcFIACwRLtGxTc0OPikFmdmkuTTkiAAcxaU4eIQk5NX0eBJCOyJSvHVgDRZC3Wgd+F0/KR2p0oN0yAAdMCcfhYCCuXjfX7/QFVEBQCBsBCIEC9AG8HgwXiMQ6CAC0z04AWsUF4cFB4OBjXxbB8mOaBMYzKJJKEggA7vDmgA6BzOALY5DIOZWLZUfBoNBYOCIAD0qoAVnAyWgIBAfM1OGgyUQlsKnMwoNxBM5hbAiKqhFhOKr6QCwUDVUifH8GUDhQr+D4QABdEPjSJuJYAJl8/iCIQ8ADZVlEYnhvb73YztrsPPscnkTkUStQytdKndqDVHjbCFA3iiPWRheIhFAhvpDGhbBJGGBZNJeABeWy8bRdjgyXhN8F9AadkY9hwTVxITwATjjC0TK2oa3TOLbUFz1j2ICyheOSCm0YuZauOJuaJoDxxHwaMB8sgAEr0dAAMgAon4ghgAwEaTGEGRzPGiyILG+5prEX6nqk7gFocRbLFM96YI+FS3GKNY4hIdbQG8IEwGBaDCusABCEDmFYAQAMI7P4aBLtIsgTkuDgYlieB4kSABUokAAZUTRdExIxzGBOxnCcdxUgSeJAgxPWvDiGgYifLwQjjsM3YEgARhqplYIoRCcFagS8FYjDwvwQhcDwhlmUxaDcnSnAAF5EhAXJCHwX7UZxhlgLSRpwLwcJwEa3B8OIPhuZwJCNBAvm2TA/Jwq4wpQlCyA6BoAByvAGIwZD+GwMAhhICpKiq6r2l+EA4KQwr8BA/mcD4aXCvCARepicCqgA6jAZmqgAgnIACSqrSZxqoMUx0UsUpKndlIK6RmEUzbgmSDRhhSHrHgG0KWxHHgfxyRnvmF4HEc+SIEsSZ4eWT6VsRb4XvUPlebQvEmUYpjmDAlg0gdUEeGk4SwTuN6pldOKg2hZ2Ye9JznKW+HlM+VavrUwONAMILZj0/QtIu3ZjI4h0eO4W4o6dn3o4e+4tNjCG49hCFpD9BEkwDsQSNZnVkJgjZ+jYdODHxjPCtLyiqLIChKCo6gq5DZjRTDKR2PDa4eNGe7zJzyORBjIDq7r/OIZeWHXghnii8T/33OTnw+Zs1OovO9P68ukHm+4MwnfBe52zzmz88dr1Xh9d6E79hEviRIBkVpFEzgrIfKxDPbCmwoX1T4PG8EQEB2WbbjuEsMHW/BKaXTzFfsKhT2pMnrt42EXsVkRvt4B+IMQGDxmTj5UNG7DNiNwUoTJ23ibJ/HsRY33yyC+7G6FOGQOwHgIgYOwxKsBwyWaQk4hDsAUK8O8FObCOiIwz8Pqzv6x4SCHKOXgX5ZJoHkltRS90uLdmkFIAA3C/N+/teCg0/kIfkQgjSUxaGrRQGsYCIL4DgkU3cq7SHgbwdUjlYCwggDQcCSDdL6VQdPIhhQHA2iEEgUANR/CJR4HgNACBCiFCAA=="}
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
// @twoslash-cache: {"v":1,"hash":"bcb6343beb1437f7cfb334736ad67f7765b1805028f9a0c45a7b4060fc7875b4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpesAGbMArqzQBlfvhhQZZRLwVKVrMgB0w7ALZYIpUROmzNy1eSpQI/BIhAAVJbyExe40s0MwALRs7ADmYMq8cIo2OqTqaB78rI4A1p7ivInevv4wAO6mqQB0lNTMoc7IyCAcYKll+GhoWHCIAPTtAFZwgWgQEKyp7GiBRAAsxSJSUOwQAWjMxbBE7cxY7O3RWrbtFjLyMdpkxU2GrCAAupdUIsxmSACcVDpgoYlIAIwAbFSLpKEYAwXPsrEdbGU6rhEAAGKiKe7Mfg0ciIR4AXwo6Gw0IIxDIZRo9DwgmEoikwikACNoqR2FSYOpGHwALwAPl4RAg7CgZTuD0Q32etRgbw+iE+nz+90BwJAFLg1Np9NwL3YESQACZ4fhEciCYLMdicHhCCQ7NQ6HKWBwuHxSSIxDBJAdrMd4hpwXF9EYTGYnS6wTs4mUHE48O5vF4fH4AsEOOFIttYmoskkUvx0hBMtkY3lCqQSoSKlUanUGlQmi02p0en0BkMRmNJtNZvMgUsVmsNlsvWQ9s7LIdgyczhdrrd/sCABwAZheove+C+v3KAKBeFBw5TFqhWp1epRWphRuoONN+ItROtC0IUD4btsxTQ7EzjH4bFYVKRqXUrlfqQAMKft+mbcEyrIclyPKho4zggHISr8HSDK8Ay4imN4uakDAzBQLwWC6nAMDFLw/6ZlESEoWQcBiBAvCQKIqQwDAWC8AABvkShgAAklAOjMuxBGirMbylNKlRINUIA4WgUikMIZQAKqUjSyEqqUE4gPywKfDCcIimKy6IOM0rrnKL6ZpC6rQtqIAIn4+qorOADsp6YCaLhmgSfxWkwWCIgsZB8C+ATqGAUiGAyFo6V8MLTguRlIKZa6yngoWqrUNn7vZuqOUeJkAKzueeXmXoSfkuIwAWxkCwVOrIzDhZF0V8lOXyfClrxLkghVmWlIIwI11kaogdkOUiBWFZ8JWeXi5oVcSLhEPcAhCHAgyMrwgHrZtbX3Lps4Gd14ouf1G4uA6e1qqN865YeBqarNuLeVelUgIwt7QHwO3CJtxQpKEjDFCDUDMIs6jMGAGDIJc4GctyvL2HBEYeAAVGj7FXToAMQED3DsRjUSLJZvBffhEBSC0VO0cwZPwHAFRYfRubYyR+j6MgACyAAiAByvAAErOmQor8DAlyMFWrQdAOJApDgpDFIYEAAF7sKwrBLKYoR7HB7QAOowFS7QAIIAAo8e0bPtIDAD6dyWdw+0Cp8s4JYZPWIHd/wDbUeMjdCd0TU5cXPReC2+UtH01XkKIhUYW0RVFPnae1ErjHZJ3GSlvsXdQieB0gwd5ZNBqdeHZWR5a0fVYFdWkHwsCNc1KcxennUe9nvXnXKzeLEX3sHvlj0njc9nQLivqmKIwABkOj5xLw6IxvMvAAOQAAKtnMCzMN0vT9IMwyjBM68ANwc2ADrkqpyqoSy8+un2SuWakjCMHPGUUA1izL5BvBgD6F4GtP6ONAaMG/r/Zg3BL5gHRLAsoe8kCgCtKKOAcwwB4B6CAdE6IgA"}
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
// @twoslash-cache: {"v":1,"hash":"2518bda2c1f9b1776e2a6946413ef5896fede86df1e707e8a62075ddee07a6ec","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvMHTQAxUswC2MRt0S8ACqQhL2cGAB4iEdlAB8AHTDslWCKTTTZC5bipQIIhIhABBAHdmdic0fBhnel5mGyVmcUkBRRUAOkpqZgBzH2RkEA4wAGt0/DQ0LDhEAHoqgCs4AFo0CAhWQpCGogAWFLg0QSgJFTRmFNgiKuYsdiq4EXCoQVYyKpl6V1TSpVYQAF1dqj7mRyQATiplsEyws6oR0kyYBl81+WT3fPYZJAAGKnnjswxGQzgBfCjobC4XyEEjkO6yPBCUQJKTMfg0UiaYJgNBqDTaXT6IwmMzmdJHE6IADsAEYLjArjdELS/hkHk88OjMdivgwLl9oQAmf74QHA8gsgCs4MhODwsJBCPoTDYnB4kTebnxWh0egMxlMFmstnsjk1Gw+nm8eECwVC4U10Vi8QkUn47zSdyyOTyBWKVFK5UqNXqTRabQ63V6/UGuieo3Gk2ms3mMEWy1Iqxcnq2O32h3uz1OXQZTPwt3Zj2e4BzbnSBWhAGZReLMUgABygg4gETQaEgU0OJzAC3vXigpK6XgAcgAAn0BkME3VGs1Wu00J0ujOANzWaxcDCiATCMRu6IYsi83FqXjAay8aJBEJj7XcfdgUHpYbMJCgWRGTgN08HqEBQVBIA="}
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
// @twoslash-cache: {"v":1,"hash":"214594c197d2ac137dafbfd64d6531e97b0132ab01457967f8282aa9d2bcc002","data":"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"}
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
