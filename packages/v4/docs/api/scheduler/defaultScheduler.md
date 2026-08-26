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
// @twoslash-cache: {"v":1,"hash":"efa4dddd9a9535fe6e4472ed3cc692aff95ecdbe66b5776498142f7791ccad9d","data":"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="}
import { defaultScheduler } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"bcb6343beb1437f7cfb334736ad67f7765b1805028f9a0c45a7b4060fc7875b4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpesAGbMArqzQBlfvhhQZZRLwVKVrMgB0w7ALZYIpUROmzNy1eSojmZpAE4qOsAHM0+JAEYAbFRojh4wDIggFjLyijY6diAcYLiIAAxUio7M/DTkiM4AvhTo2CkExGSU1HThIILColLCUgBGcPyk7C0w6ox8ALwAfLxEEOxQVQ5OiP6uiTCe3n6+QSFheE1wre2d3VVJKQBMGfhZOZUzRSU4eIQkCTT0TGycPAJCImIwktHW2moaWL/Uj6IwmMxfH5WIG2SbBaYADgAzG4Fl4fIgAqtSKFalFoVpYW52MkkMc6qdSNlcmTUldqKVbhUHjUmIYwoQoHw/rYAHRodj8ADWjH4bFYLWyQvUABVBUKAMLiyXC7i9AbDUbjKpQCD8BAROTbDpdGC8briUxm7xm0gwZhQXhYU5wGC83hy4W8LZtE3dUhwMQQXiQURCmAwLC8AAGAHclGAAJJQHR9aNOhZQEkeXlVYIeA3IZAgO1oKSkYRVACqzV9uzdIAAuo37PDwr5Uul5osMQAWbG4vAC4X7ElHE5nGmIJEAdnpmBuETulSCrIijCwWXZuT4AvZ6jAUkM/rhjnbqQRqJ7SH71DWtT3uGJpMQ5MyVPOeV7AFZ54yl8yeZriAG5bmEZB8LAsjMAeR4nq2Z7LLe7jokg34DusERQcEo4vm+lLUhc36+H+i7lPcQFPBERCOO8wgQDo6gKh8DFPiAUztkiXYoUsiAzhhtT1HArG4SkKIUpOFyHKRZTLiyVEgdunJ8Mx9E6LyrAQB4jC8rpUDMME6jMGAGDII2aojGMExULq+p4DKSi8AAVE50ZCaxGlaWmLnesEw68Ep0C8BAUhoFgoWBswAXwHAzChLwaDBjadHCep+j6MgACyAAiAByvAAErfGQCz8DAjaMPgaBhXAiAAPR1bAJCaTgpC8oYEAAF7sKwrDMLypgeI1epwHVADqMAtHVACCAAKiZ1e5Oh1ZpHgAPoOMO3CntMvhIpe3aodOAl4KtolIOJ76EXkHYyUyFGrgpoFUtuEEJUYPQhnBK7sW2fi9uSPF9idESPudx0SR+U6+L2d0AQ91RPZuL3gaQkEwNBsHHj9HH/QdQNoSDkQYzhz5iROUNSXSLZ1NAZRgqYojAJClgxIS8S8AUvDiKQECGLwADkAACIhSFmfNhMwdUAFZwAAtIlDFCuwaBy0QvYCwA3OlYBCY0tY7KavD9CzvwwvE/LyowjDM4+FBfNBnMarwwD6LwKUeatjB2w7wTcNrYAFP7VTbswSCgDUCxwOwQh4LLIAFAUQA"}
import { defaultScheduler } from '@studiometa/js-toolkit-v4';

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
