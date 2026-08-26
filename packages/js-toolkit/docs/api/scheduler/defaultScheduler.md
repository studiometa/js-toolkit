# defaultScheduler

The one scheduler instance. Duplicate copies of the package reuse the canonical one through the shared runtime.

```ts
class Scheduler {
  get phase(): SchedulerPhase;
  tick(callback: TickCallback): () => void;
  read<T>(fn: () => T): ScheduledTask<T>;
  write<T>(fn: () => T): ScheduledTask<T>;
  whenIdle(): Promise<void>;
}
```

[[toc]]

## `read()` and `write()`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"94dbdb16996fcb54a32605e14814f2f904e9bcd7de50f5baf6195b70383f3166","data":"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"}
import { defaultScheduler } from '@studiometa/js-toolkit';

const el = document.body;
// ---cut---
async function resize() {
  const box = await defaultScheduler.read(() => el.getBoundingClientRect()).promise;
  await defaultScheduler.write(() => {
    el.style.height = `${box?.height}px`;
  }).promise;
}
```

Both return a handle:

```ts
interface ScheduledTask<T = unknown> {
  promise: Promise<T | undefined>;
  cancel(): void;
}
```

- The promise resolves with the **return value of the task**, so a read hands its measurement back.
- `cancel()` is idempotent, and a cancelled task's promise never resolves with a value.
- **Queued execution only.** There is no synchronous escape.

### The thrash rule

| Scheduled from | Runs in        |
| -------------- | -------------- |
| a `read`       | the same frame |
| a `write`      | the next frame |

Each queue array is **swapped for an empty one when its phase starts**, so a task scheduled into the running phase lands in the next frame's batch. The `write` batch is taken after the reads run.

## `tick()`

```js twoslash
// @twoslash-cache: {"v":1,"hash":"019bbbdc1a1ca261edd9f93375256e7d2b38e52c82f5e4434af06b244fbe21af","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpesAGbMArqzQBlfvhhQZZRLwVKVrMgB0w7ALZYIpUROmzNy1eSpQI/BIhAAVJbyExe40s0MwALRs7ADmYMq8cIo2OqTqaB78rI4A1p7ivInevv4wAO6mqQB0lNTMoc7IyCAcYKll+GhoWHCIAPTtAFZwgWgQEKyp7GiBRAAsxSJSUOwQAWjMxbBE7cxY7O3RWrbtFjLyMdpkxU2GrCAAupdUIsxmSACcVDpgoYlIAIwAbFSLpKEYAwXPsrEdbGU6rhEAAGKiKe7Mfg0ciIR4AXwo6Gw0IIxDIZRo9DwgmEoikwikACNoqR2FSYOpGHwALwAPl4RAg7CgZTuD0Q31+tRgbw+iE+nz+90BwJAFLg1Np9NwL3YESQACZ4fhEciCYLMdicHhCCQ7NQ6HKWBwuHxSSIxDBJAdrMd4hpwXF9EYTGYnS6wTs4mUHE48O5vF4fH4AsEOOFIttYmoskkUvx0hBMtkY3lCqQSoSKlUanUGlQmi02p0en0BkMRmNJtNZvMgUsVmsNlsvWQ9s7LIdgyczhdrrd/sCABxwkVi/BfYX/WV4UHDlMWqFanV6lFamFG6g4034i1E60LQhQPhu2zFNDsTOMfhsVhUpGpdSuJ+pADCb4fpm3BMqyHJcjyoaOM4IByEq/B0gyvAMuIpjeLmpAwMwUC8FgupwDAxS8D+mZRPBiFkHAYgQLwkCiKkMAwFgvAAAb5EoYAAJJQDozIsbhoqzG8pTSpUSDVCAmFoFIpDCGUACqlI0ghKqlBOID8sCjwAOwvKK7yLog4zSgCQJ4I+maQuq0LaiACJ+PqqIAMzaUemAmi4ZoEn8VpMFgiILGQfCPgE6hgFIhgMhamlfDCACsekLkgxnlKZcohaqtTWTudm6g5+5GXFbknp5Z6Er5LiMP5sZAkFTqyMwYURVFfJTl8kqJQZSAJalq4gjADVWRqiC2fZSIFXFnzFR5eLmuVxIuEQ9wCEIcCDIyvB/qt62tfcwKfJqunzl1iBHSuZkuA6O1qsNTm7vlBqatNuJeeeFUgIwV7QHwW3COtxQpKEjDFCDUDMIs6jMGAGDIJcIGctyvL2NBEYeAAVGjLFXToAMQED3AsRjUSLBZvBfThEBSC0VNUcwZPwHAFToTRubY4R+j6MgACyAAiAByvAAErOmQor8DAlyMFWrQdAOJApDgpDFIYEAAF7sKwrBLKYoR7NB7QAOowFS7QAIIAAqce0bPtIDAD6dwWdwu0Cp8Tk9a8J13b1F21HjQ3Qt7Y2ObFz2nnNPkLR91V5CiwVGBt4WRd5GltRKTnPMd4oped6UJwHSBB3l40Gp84xh6VEeWlHVUBbVpB8LADVNcn0Vp2XHv6eKPW52uA2LAXiBF3uj2HjcdnQLivqmKIwABkOd5xLw6IxvMvAAOQAAKtnMCzMN0vT9IMwxoOvADcHNgA65JKcqSEsvPrp9krFmpIwjBzxlFD1Ysy9gbwwB9C8BWn9HGgNGBfx/swbgF8wDohgWUPeSBQBWlFHAOYYA8A9BAOidEQA=="}
import { defaultScheduler } from '@studiometa/js-toolkit';

const unsubscribe = defaultScheduler.tick(({ time, delta }) => {
  console.log(time, delta);
});
```

```ts
interface TickProps {
  readonly time: DOMHighResTimeStamp;
  readonly delta: number;
}
```

- Tick callbacks run at the **start** of the flush, before `read`, so what they schedule belongs to the same frame.
- **The subscription is the only handle, and it keeps the loop alive.** The scheduler requests the next frame when a queue inside the frame is not empty, or when a tick subscriber stays. **There is no permanent rAF loop.**
- Tick subscribers are **not queued work**, so `whenIdle()` ignores them.
- A tick callback that throws is reported as `callback.scheduler-tick-failed` and skipped, never unsubscribed.
- **`delta` is clamped to `[1, 40]` ms**, and the first tick after the loop wakes reports `1000/60`. `time` stays the raw rAF timestamp.

For a subscription that comes and goes within a cycle, use [`toggle()`](/api/services/toggle.html) rather than subscribing and unsubscribing by hand.

## `whenIdle()`

```js
await defaultScheduler.whenIdle();
```

Resolves at the end of a flush **and** at the end of a background drain, because it counts background tasks too.

It is one half of the timing recipe the [`/test`](/api/test/) helpers encode — the other half is the mutation observer's delivery latency, which is why `whenIdle()` alone is not enough to know a component has mounted.

## `phase`

```ts
type SchedulerPhase = 'idle' | 'tick' | 'read' | 'write' | 'background';
```

Reading it is a diagnostic, not a control. Code that branches on the phase is usually code that should schedule instead.

## The background lane

It posts its own turns through `scheduler.postTask({ priority: 'background' })`, and falls back to a `MessageChannel` message. Each turn runs a **5 ms slice** measured from the start of the drain, then gives the thread back and posts the next turn.

**Background work alone never requests an animation frame.**

A failure to post is reported as `scheduler.background-post-failed`.

## Error isolation

One try/catch per task. A task that throws is reported as `callback.scheduled-task-failed`, **rejects its own promise with the same value**, and is dropped. The flush continues and the scheduler never deadlocks.
