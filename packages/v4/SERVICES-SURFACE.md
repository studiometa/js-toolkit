# Services surface — two proposals, neither implemented (2026-08-13)

The two API-level findings of `SERVICES-REVIEW.md` §4 that change semantics across
all five services. `DESIGN.md` §8 records the current choices deliberately, so
each of these is an **amendment to a decision**, not a gap to fill — which is why
they are written up rather than landed.

Everything below marked _measured_ was measured in Chromium against
`packages/v4/src/services`, on a throwaway probe spec that is not part of the
suite. Everything marked _read_ is what the code does, established by reading it
rather than by trusting the prose around it — including the prose in `DESIGN.md`.

The two proposals turned out to have **one shared answer**, which is the main
finding of this document: the five sources split into _sampled_ and _discrete_,
and both questions are answered by that line rather than by uniformity.

| Source                    | Kind     | Has a current value   | Emits from                      | Phase _(measured)_ |
| ------------------------- | -------- | --------------------- | ------------------------------- | ------------------ |
| `useRaf()`                | sampled  | only during a tick    | `scheduler.tick` → `read`       | `read`             |
| `useScroll()`             | sampled  | yes                   | coalesced into `scheduler.read` | `read`             |
| `useResize()`             | sampled  | yes                   | `ResizeObserver` callback       | `idle`             |
| `useResize()` (viewport)  | sampled  | yes                   | `resize` listener               | `idle`             |
| `useBreakpoint()`         | sampled  | yes                   | `matchMedia` `change`           | `idle`             |
| `useMediaQuery()`         | sampled  | yes                   | `matchMedia` `change`           | `idle`             |
| `usePointer()`            | discrete | after the first event | pointer listeners               | `idle`             |
| `useDrag()` — the gesture | discrete | during a gesture      | pointer listeners               | `idle`             |
| `useDrag()` — the inertia | sampled  | during the coast      | `scheduler.tick`                | `tick`             |

`idle` is the scheduler's word for "not inside the flush": those emissions happen
in the event task or in the observer callback, synchronously.

---

## 4. One frame-aligned emission phase for all sources

Both independent API designers converged on it. The hardening work did not act on
it, and the review did not say what it would cost.

### What the code actually does

_Read, and confirmed by measuring `scheduler.phase` inside a subscriber of each
source:_

- **`useRaf()`** subscribes to `scheduler.tick()` and, from inside that tick,
  opens a `scheduler.read()`. Its subscribers therefore run in **`read`**, not in
  `tick`. It collects the render functions they return and runs them in one
  `scheduler.write()` — the same frame, because a write scheduled from a read is
  in the batch that phase takes. Measured: `["read", "render:write", "read", "render:write"]`.
- **`useScroll()`** coalesces every `scroll`, `scrollend`, `resize` and
  extent-change into **one `scheduler.read()` per frame**. So it emits in the same
  phase as `useRaf()` — and it does **not** collect anything a subscriber returns:
  its type is `Service<ScrollProps>`, `R = void`.
- **`useResize()`** emits **synchronously from the `ResizeObserver` callback**,
  and the viewport service also emits synchronously from a `resize` listener.
  Measured phase for both: `idle`. The observer callback is not arbitrary
  timing — the HTML rendering steps run it after layout, which `DESIGN.md` §7
  names as the only in-frame hook that can observe post-layout geometry.
- **`usePointer()`** emits synchronously from its capture-phase listeners:
  `idle`. It deliberately does not coalesce, and the review's §6 says why —
  coalescing would collapse a `pointerdown` and `pointerup` that share a frame,
  which is every tap.
- **`useDrag()`** emits synchronously for `start`/`drag`/`drop`/`stop` (`idle`)
  and from **`scheduler.tick` itself** for the inertia. Measured:
  `["start:idle", "drag:idle", "drop:idle", "inertia:tick", …]`. So the two
  continuous sources in v4 emit in **different phases**: the drag coast in `tick`,
  the frame service in `read`. A drag subscriber that measures does so before the
  read phase opens.
- **`useBreakpoint()` / `useMediaQuery()`** emit synchronously from the
  `matchMedia` `change` listener: `idle`.

### The cost of the literal proposal

Frame-aligning a **discrete** source forces a choice between two failures:

- **Collapse** — one emission per frame, last-write-wins. This loses a
  `pointerdown` + `pointerup` in one frame (a tap), a `start` + `drop` in one
  frame (a click on a draggable), and the `stop` that follows a `drop`. The review
  already ruled on this once, in the other direction, for the pointer service.
- **Queue** — several emissions per frame, in order. Nothing is lost, but the
  props object can no longer be the single mutable one every sampled source
  reuses: each queued emission needs its own copy, which is the allocation
  `DESIGN.md` §8 explicitly avoids ("a service may hand the same object to every
  subscriber and overwrite it on the next update").

Both also add up to one frame of latency to a press. And for the resize service
specifically, deferring the emission out of the `ResizeObserver` callback gives up
the one in-frame position from which post-layout geometry is observable.

### The problem the proposal was actually reaching for

Not the phase. The **write path**. `useRaf()` is the only source that gives a
subscriber a way to mutate the DOM without thrashing — `return () => { … }`,
collected and run in `write`. `useScroll()` emits in the very same phase and
offers nothing: `R = void`, so a `scrolled()` that measures and mutates does both
in the read phase, invalidating every read queued behind it.

_Measured_ — 60 paragraphs, 20 frames, one scheduler `read` batch per frame that
reads `offsetHeight` on each:

| Read batch                             | ms per frame |
| -------------------------------------- | ------------ |
| 60 reads, batched                      | 0.15 – 0.21  |
| the same 60 reads, one writer inserted | 3.0 – 4.9    |

A **20–32× read phase** for one component that mutates where it measures. A
component _can_ do the right thing today — `this.$write()` from a read lands in
the same frame's write — but nothing in the type says so, and the shape that
teaches it (`return () => { … }`) exists on exactly one of the five services.

### Recommendation

**Reject the literal proposal. Adopt the part that motivated it.**

1. Generalise raf's collector into the shared primitive, so **every** service
   takes `R = void | Render` and runs the returned functions in one `write`.
   Latency differs by source and that is honest: from `read` the write is the
   same frame, from an event task it is the next one.
2. Move the **drag inertia** emission from `tick` into `read`, the way the raf
   service does it. Two continuous sources in two phases is the one asymmetry
   here with no reason behind it, and a drag subscriber measuring in `tick`
   measures before the read phase it belongs in.
3. Leave the discrete emissions synchronous, and write the rule down: **sampled
   sources are frame-aligned, discrete ones are not, and every source collects
   its writes.**

What it costs: one shared collector (raf's, minus the `RafProps` specificity),
plus a `cancel-on-unsubscribe` guard per source — the raf service's render
cancellation is per-subscription state and every service would need it. What it
breaks: nothing at the call site; `R` widens from `void`, which only adds what a
callback _may_ return. Item 2 above changes when a `dragged()` handler runs
within the frame, which the existing inertia specs assert through positions
rather than phases, so they should survive.

How to verify: the phase probe above, promoted into a spec that asserts
`scheduler.phase` per source; the 60-paragraph measurement, as a bench, run
against a `scrolled()` that mutates in the callback versus one that returns a
render — the fix has to show the 20–32× collapse back to ~1×.

---

## 5. `Service<T>` versus the gesture

The review wants `props(): T | null` and argues a gesture is not a sampled value.
`'idle'` was added to `DRAG_MODES` as the mitigation; `usePointer()` invented a
neutral pre-event position and `useRaf()` a pre-first-tick delta for the same
reason.

### What a cold `props()` reports

_Measured:_

- `useRaf().props()`, 300 ms after the last subscriber left:
  `delta: 16.7`, and `time` **301 ms behind `performance.now()`**. Both fields are
  typed exactly as a live frame's, and one of them points at a frame that ended
  300 ms ago. On a page where nothing ever subscribed, `time` is the moment the
  service object was built.
- `useDrag(el).props()` before any gesture: `{ mode: 'idle', x: 0, y: 0, finalX: 0 }`.
  The coordinates are a real viewport position — the top-left corner — so they are
  indistinguishable from a gesture held at the origin.
- `usePointer().props()` with no event: `{ event: null, x: 10, progressX: 0.024 }`
  in a run where an earlier test had moved the pointer. Teardown nulls the
  `event` — it pins a detached subtree otherwise — and leaves `x`/`y` at the last
  position it saw, so the cold props are neither the documented neutral centre nor
  current. `event: null` is the only field that says anything true.

`hasProps()` — landed in this branch for `{ immediate: true }` — is already the
runtime half of the review's argument: **three of the six sources answer "no", and
the type says `T` for all six.** That is the gap, and it is now a gap between two
things in the same file.

### What nullability would cost

_Measured by counting call sites:_ `props()` has **one** consumer in the whole
package outside specs and doc comments — `withScrolledInView.ts:213`,
`const { x, y } = useWindowScroll().props()`, on a **sampled** source, inside a
frame callback where the service is subscribed anyway. Specs call it 41 times,
mostly as a window into service state.

So the ergonomic cost of nullability is close to zero where the framework itself
is concerned, and lands almost entirely on the specs — which is the wrong place to
weigh it, but also the place where a `?.` is free.

### Recommendation

**Split the interface, and keep one name for what every consumer needs.**

```ts
interface Subscribable<T, R = void> {
  subscribe(callback: ServiceCallback<T, R>, options?: SubscribeOptions): Unsubscribe;
}

interface Service<T, R = void> extends Subscribable<T, R> {
  props(): T; // sampled: scroll, resize, breakpoint, media query
}

interface EventSource<T, R = void> extends Subscribable<T, R> {
  props(): T | null; // discrete or momentary: pointer, drag, raf
}
```

- `until()`, `toggle()` and the mixins consume `Subscribable<T>`, which is all
  they ever needed: none of them calls `props()`.
- `hasProps()` in `ServiceDefinition` becomes the single source for both the
  nullable read and `{ immediate: true }`, instead of being consulted by one and
  contradicted by the other.
- The mitigations go with it: `DRAG_MODES.IDLE` (a mode that exists to describe
  the absence of a gesture), the pointer's centred position, and the raf
  service's fabricated `{ time, delta }`.

Note that `useRaf()` lands on the nullable side. It is sampled, not discrete —
but its value is _momentary_: it describes a frame, and between frames there is no
frame. That is exactly what `hasProps: () => false` already says about it.

What it costs: the three services lose their stand-in values, so anything reading
them cold must branch. Three type declarations instead of one, and one more word
of vocabulary for the reader.

What it breaks: `DRAG_MODES.IDLE` is public and documented, and the review's own
§4 ruling introduced it — this reverses that ruling rather than extending it. The
drag service uses `IDLE` internally to mean "no gesture" in `isGrabbing()` and in
its teardown, so that state needs another home (a `null` props object is the
obvious one). Every spec reading a cold `props()` needs a `?.` or an assertion.
The one production call site is on the sampled side and is unaffected.

How to verify: `tsc` finds every call site, which is the point of doing it in the
type rather than in a doc comment. Then a spec per nullable source asserting
`props() === null` before its first update and after its last subscriber leaves;
a spec asserting `until()` and `toggle()` still accept all six sources, which is
what proves `Subscribable` was the right seam; and the existing drag suite, which
has to keep passing without `IDLE` — if it cannot, `IDLE` was load-bearing and
this recommendation is wrong.

---

## What is not recommended

- **Making `props()` nullable on all six.** It would make the scroll and resize
  services lie in the other direction: they always have a current value, and the
  one production consumer would gain a branch that can never be taken.
- **Removing `props()`.** `{ immediate: true }` covers the subscribe-time case,
  but the one real consumer reads the scroll position from inside a frame callback
  it already owns, without wanting a second subscription. That is what it is for.
