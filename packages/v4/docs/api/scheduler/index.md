# Scheduler

One frame-aligned scheduler is the clock of the framework. It replaces `domScheduler`, the `RafService` loop, `SmartQueue` and the view-transition scheduler of `@studiometa/ui`.

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

## The exports

- [`defaultScheduler`](./defaultScheduler.html) — the instance, with `tick`, `read`, `write`, `whenIdle` and `phase`
- [`nextFrame()`](./nextFrame.html) — await one frame
- [`viewTransition(update)`](./viewTransition.html) — a batched native view transition

From a component, `$read()` and `$write()` tie tasks to the instance so unmount cancels them. See [Instance methods](/api/instance-methods.html#read-and-write).

## Read next

[The scheduler](/guide/going-further/scheduling-work.html) explains the lanes, the thrash rule and why `afterWrite` is gone.
