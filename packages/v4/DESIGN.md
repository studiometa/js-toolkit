# v4 architecture design — consolidated (2026-08-11)

Status: validated design direction. Supersedes the mounting/CDN parts of the earlier spec draft comment. Written against v3.9.0 and @studiometa/ui 1.10.0.

## Core model

**The registry is the framework, and the DOM is the component tree.**

An instance exists because its element is in the DOM and its class is registered. Nothing else creates or destroys instances. Parent/child is not ownership; it is only DOM ancestry, observed through queries and events.

Five objectives structure the design:

1. Components are independent.
2. One registry.
3. Auto-mount driven by DOM insertion/ejection.
4. Parents listen to child events.
5. Children advertise their existence to parents.

## Decisions

| Fork            | Decision                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mount primitive | **Observer-first**: `data-component` + one record-based MutationObserver. Tag matching (`<tk-foo>`) stays as selector sugar. No custom-element lifecycle, no separate directive system in core. |
| Shared state    | **provide/inject ships in v4 core**, Vue-shaped, with context-protocol mechanics. The `Data*` components in ui rebuild on top of it.                                                            |
| Child events    | **Keep `on<Child><Event>` magic methods**, resolved through delegation against names declared in `config.components`.                                                                           |

## 1. Independent components

- The registry is the only code path that constructs instances. `ChildrenManager` no longer instantiates anything (`__getChild`, `__asyncComponentPromises` removed).
- Lifecycle equals DOM presence: element inserted → mount; element removed → destroy. A parent's `$destroy` does not cascade to children.

### Lifecycle model — destroy ≠ terminate ≠ disconnected

Three distinct notions, kept distinct:

| Notion           | What it is                                 | Effect                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **disconnected** | A DOM fact: the element left the document. | The registry calls `$destroy()`. The instance stays on its element; a re-inserted element **remounts the same instance**. If the element never returns, element + instance are garbage-collected together.      |
| **destroy**      | The reversible inverse of mount.           | Unbinds per-cycle listeners, runs the `mounted()` cleanups, cancels pending scheduler tasks, calls `destroyed()`, announces. The instance can mount again.                                                      |
| **terminate**    | Explicit, irreversible end of life.        | `$destroy()` first if needed, then instance-lifetime teardown (`$provide` disposers, `$watchChildren` subscriptions), the `terminated()` hook, and removal from the element's instance map. Never mounts again. |

**Moves.** A moved element produces a removal record and an addition record: the instance is destroyed, then remounted — same identity, per-cycle state reset. This matches the `disconnectedCallback`/`connectedCallback` pair custom elements receive on moves, and it is required for correctness: both sides announce, so `$watchChildren` on the old ancestor removes the child and on the new ancestor adds it. (Found by the real-browser test suite: skipping destroy for still-connected moved elements silently broke both watchers.) Open question for later: an opt-in state-preserving move path once `Node.moveBefore()` semantics are considered.

### `mounted()` returns its cleanup

`mounted()` may return a function (or an array of functions), sync or async, that runs on the next `$destroy()` — the setup/cleanup pattern (Svelte `onMount`, React effects):

```js
class TodoCount extends Base {
  async mounted() {
    const signal = await this.$inject(CountContext);
    return signal.subscribe((count) => { … });   // unsubscribed on destroy
  }
}
```

- The cleanup lives in the same closure as the resource it releases: no instance fields, no paired `destroyed()` boilerplate, symmetry guaranteed per mount cycle — which matters once `data-mount` strategies remount the same instance repeatedly.
- If an async `mounted()` resolves after the instance was destroyed, the cleanup runs immediately instead of leaking.
- Two cleanup scopes follow from the lifecycle model: `mounted()` returns are **destroy-scoped** (per cycle); constructor-time registrations (`$provide`, `$watchChildren`, `$inject`) are **terminate-scoped** (instance lifetime).
- The hook keeps its `mounted` name — "setup" in Vue means "runs before mount", which is not what this is, and `mounted()` stays familiar to v3 authors. `destroyed()`/`terminated()` hooks remain for cases that do not fit the returned-cleanup shape.
- `config.components` loses its ownership meaning. Two jobs remain: register the listed classes when the parent registers, and provide the name set for `on<Child><Event>` resolution.
- `$parent`, `$children`, `$root`, and `createApp` are removed. `$query()` / `$closest()` (shipped in 3.x) are the replacements.
- Sibling composition (#697, `config.use`) fits the model: a sibling is another instance on the same element, created by the registry, resolvable through the element's instance map.

### Refs are live, so there is no `$update()`

v3 resolved `$refs` once per mount and offered `$update()` to redo it when a subtree changed. v4 drops the method instead of porting it: each `$refs` property re-reads the DOM on access, so markup swapped into a component — a `Fetch` replacement, a re-render — is picked up with nothing to refresh and no detached elements left behind. The DOM is the source of truth for refs, exactly as the registry already treats it for components. `on<Ref><Event>` handlers follow the same rule: they are delegated from the root element, so refs appearing later need no rebinding.

Non-bubbling events (`focus`, `blur`, `scroll`, `mouseenter`…) are delegated from the **capture** phase, where they are still observable — the same trick makes the `mouseenter`/`mouseleave` limitation noted in #694 disappear for refs.

Resolving on every access was measurably expensive — the benchmark put a 25-element ref list ~26× behind v3's mount-time snapshot — so lookups are cached against a counter bumped by a MutationObserver. A repeated read is a property read again; any structural change invalidates it. That observer is separate from the registry's on purpose: reading the version drains its pending records with `takeRecords()`, which is what keeps the cache correct _within the same task_, and draining the registry's queue would cost it those mutations. Detached elements are never cached, since no observer can see them change.

## Measurements

Benchmarked against v3 in `packages/tests/__benchmarks__/v3-vs-v4.bench.ts`, both sides working synchronously so the comparison is work per operation rather than scheduling:

| operation                        | result                             |
| -------------------------------- | ---------------------------------- |
| mount a list of 25 children      | v4 ~3.6× faster                    |
| resolve descendants (`$query`)   | v4 ~7× faster                      |
| resolve an ancestor (`$closest`) | v4 ~8.6× faster                    |
| read `config`                    | v4 ~5.9× faster (cached per class) |
| read a ref                       | v4 ~2.5× slower                    |
| `$emit`                          | v4 ~1.8× slower                    |

The two remaining regressions are understood rather than outstanding. `$emit` pays for dispatching a bubbling, cancelable event through the tree — that is the feature. Ref reads pay the version check that keeps them live, having started ~26× behind before the cache.

### `config` merges along the prototype chain

`$config` walks the prototype chain and merges every config it finds, so extending a component keeps what its parents declared — the crash reported in #627. `refs`, `options` and `components` all merge (v3 merged only `options` and `emits`); scalar keys stay overridable by the most derived class. An intermediate class should annotate `static config: BaseConfig`, otherwise TypeScript infers a literal type its subclasses must match.

### The public surface is typed, and free

`Base` takes an optional props type — `class Slider extends Base<{ $refs: …; $options: …; $emits: … }>`. It types `$refs` and `$options` (no more casting on access) and checks `$emit()`'s event names and payloads. `$emits` is the successor to v3's runtime `config.emits`: it keeps the documentation value of declaring what a component dispatches, with nothing left in the bundle.

## 2. One registry

Today three mounting systems coexist: the global registry observer, `ChildrenManager`, and the autoload loader with its own observers. v4 merges them into a single registry where an entry is richer than a constructor:

```
RegistryEntry = {
  name,
  source: constructor | lazy loader (manifest entry),
  loadStrategy,   // when to import the class:    eager | visible | idle | interaction   (data-load)
  mountStrategy,  // when to mount each instance:  eager | visible | in-view | idle | interaction | media:…  (data-mount, #751)
}
```

- `registerComponent(Ctor)` registers an eager entry. `registerManifest(...)` registers lazy entries into the same map. The autoload package layer stays; its loader, observers, and scheduler become the registry's own.
- One name → one entry, like `customElements.define`. Collisions warn and are ignored.

### Mount strategies (#751) — implemented

`mountStrategy` is the answer to #751, and it lives in the registry rather than in a decorator.

| strategy          | mounts when                      | reversible |
| ----------------- | -------------------------------- | ---------- |
| `eager` (default) | the element enters the DOM       | no         |
| `visible`         | it first intersects the viewport | no         |
| `in-view`         | it intersects the viewport       | yes        |
| `idle`            | the main thread goes idle        | no         |
| `interaction`     | the user first aims at it        | no         |
| `media:<query>`   | the query matches                | yes        |

A component declares its default with `config.mountStrategy`; any element overrides it with `data-mount`.

The issue's open questions, answered:

- **One canonical constructor.** Strategies never construct anything — they only decide _when_ to call the mount/destroy hooks the registry passes in. Nothing wraps the class, so the identity conflicts the issue describes cannot arise. The `withMountWhenInView` decorator is deleted rather than kept: with the framework owning this, a constructor-wrapping version would model the anti-pattern.
- **One-shot vs reversible are separate values.** `visible` mounts once and stays; `in-view` mounts and unmounts as the element crosses the viewport. Re-mounting is right for a scroll animation and destructive for a map, a video or a form, so the choice is explicit rather than inferred.
- **`interaction` uses intent**, not replay: `pointerenter`, `pointerdown` and `focusin` all precede the interaction they lead to, so the component is mounted before the click lands.
- **Several components on one element** share the element's `data-mount`; a component needing its own policy states it in its config.
- **A waiting component has no instance yet.** Construction happens on first mount, not on discovery, so it is invisible to `$query`, `$closest` and `$watchChildren` and announces nothing — consistent with "an instance exists because it is mounted".
- **Teardown follows the element.** Strategies are disposed when their element leaves the document. A _moved_ element is handed back to the registry by that teardown: its addition record is scanned while the old strategy is still pending and is therefore skipped, so without the hand-back a move would end as a removal (caught by the browser suite).

## 3. Auto-mount on DOM insertion/ejection

The observer becomes precise instead of brute-force. v3.9 re-queries every registry entry and sweeps every live instance per mutation batch. v4 processes the mutation records:

- For each `addedNode` subtree: match registered selectors inside it, schedule mounts through the entry's `mountStrategy`.
- For each `removedNode` subtree: terminate the instances stored in the `__base__` maps inside it.

Matching surface is unchanged from 3.x: `data-component="Name"` (space-separated lists supported), `<tk-name>` tags as sugar, plain CSS selectors for lowercase registrations. This keeps enhancement of native elements (`<form>`, `<a>`, `<details>`, table markup) and several components per element — both impossible with custom elements as the primitive.

## 4. Parents listen to child events

`$emit` becomes a native bubbling, cancelable event (#630):

```js
$emit(event, ...args) {
  const e = new CustomEvent(event, { bubbles: true, cancelable: true, detail: args });
  e[SOURCE] = this; // symbol — avoids userland collisions
  this.$el.dispatchEvent(e);
  return e; // caller can check e.defaultPrevented
}
```

`EventsManager` switches from per-child binding to delegation on `this.$el`:

- One listener per event type on the parent's root element.
- The handler walks from `event.target` up to `this.$el`, reads each element's instance map, and calls `on<Name><Event>` for the first matching mounted instance.
- Dynamically inserted children need no rebinding.
- `config.components` still provides the name set, because method names alone are ambiguous (`onSliderDragStart` → `SliderDrag`+`start` or `Slider`+`drag-start`).
- `mouseenter`/`mouseleave` do not bubble: these two keep direct binding (accepted limitation).
- `$on`/`$off` and `Action`-style directives keep working unchanged and benefit from bubbling.

## 5. Children advertise their existence

The piece that makes the flat, order-free topology workable. Two layers plus a separate shared-state primitive.

### Layer 1 — bubbling lifecycle announcements

Every instance dispatches a bubbling framework event on mount and on terminate (e.g. `component:mounted` / `component:destroyed`), carrying the instance. Any ancestor can track descendants with no declaration and no handshake. Instances scheduled but not yet mounted (per `mountStrategy`) are not announced.

### Layer 2 — a live-children primitive

Announcements alone miss one ordering: a parent that mounts after its children hears nothing. The order-independent recipe is: initial `$query()` sweep at mount + subscribe to announcements afterward. v4 packages that recipe once:

```js
class Slider extends Base {
  items = this.$watchChildren('SliderItem', {
    added(item) { … },
    removed(item) { … },
  });
  // `items` is a live, DOM-ordered collection, correct regardless of mount order
}
```

This replaces Slider's per-instance store + two-sided `connectChildren`/`__connect` handshake, and it is the honest v4 successor of `$children` — pull plus push, instead of a lazy re-query getter.

The initial sweep is deferred to a microtask: `$watchChildren` is typically called in a field initializer, and already-mounted children would otherwise fire `added` synchronously while the instance is half-constructed (found live: the Slider demo read `this.items` from an `added` callback before the field was assigned, and its provided state signal stayed at `total: 0`). The announcement listeners attach synchronously, so nothing mounting in between is missed — the internal `Set` deduplicates.

### Shared state — provide/inject in core

Advertisement solves "who is there", not "what is the current value". For continuous shared state, v4 ships a provide/inject primitive modeled on Vue:

- Typed injection key (no string collisions).
- Reactive value signal (live reference, never serialized).
- Subtree scope with nearest-provider-wins shadowing.
- Optionally exposes a curated owner surface (`expose` pattern) instead of the raw instance.

Mechanics follow the WICG community context protocol: the consumer dispatches a bubbling `context-request` event with a key and callback; the nearest mounted provider answers, and replays to late requesters / re-announces on late provider mount. This fixes both criticals from the earlier `withStore` design: resolution goes through the DOM event path instead of attribute walking, and replay happens only after the provider is mounted and initialized.

The `Data*` suite in @studiometa/ui (DataScope/DataBind/…) rebuilds on this primitive and drops its bespoke channel plumbing.

The reactive container is called `Signal` — the name the ecosystem settled on (Angular, Solid, Preact, the TC39 proposal), and the one @studiometa/ui already uses to describe its `Data*` suite.

## 6. Decorators — sugar, never a requirement

No engine ships stage-3 decorators yet, so requiring them would break the no-build promise: **every decorator is a thin wrapper over a function API that works without it.** Projects that build their sources opt in; a page loading the package from an ESM CDN keeps `registerComponent`, `$provide`, `$watchChildren`, `$read`/`$write` and the magic `on<Child><Event>` method names.

| Decorator                        | Wraps                                   | Notes                                                                     |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| `@component({ name })`           | `static config` + `registerComponent()` | Registers as soon as the class is defined.                                |
| `@on(child, type)` / `@on(type)` | the magic `on<Child><Event>` names      | See below.                                                                |
| `@provide(key)` / `@inject(key)` | `$provide()` / `$inject()`              | Same shape as Lit's `@provide`/`@consume` over the same context protocol. |
| `@children(name, callbacks)`     | `$watchChildren()`                      | Callbacks are bound to the instance.                                      |
| `@read` / `@write`               | `$read()` / `$write()`                  | Runs the method body in that scheduler phase, cancel-on-destroy included. |

`@on` is the one that is genuinely better than the form it replaces, not just shorter. The explicit `(child, type)` pair means: no name parsing, so `onSliderDragStart`-style ambiguity disappears; no `config.components` entry needed, since the child name is in the decorator; any event name works, including ones no method name could spell (`fetch:after`); the method is free to be named after what it does (`autoclose()`); and several `@on` stack on one method. The magic names stay for the no-build path, and a method bound through a decorator is skipped by the name scan so the two never double-bind.

Each value decorator works on a plain field and on an `accessor` field — the two differ only in how the initializer is handed back to the runtime.

**Build setup.** Vite 8 transforms TypeScript with Oxc, which passes decorators through untouched. The package compiles them with `@rollup/plugin-swc` (`decoratorVersion: '2023-11'`), filtered to files that contain a decorator, as documented in the Vite 8 migration guide.

## 7. One scheduler — a stronger `domScheduler`

v3.9 has four independent scheduling mechanisms: `domScheduler` (microtask flush), `RafService` (its own rAF loop), `SmartQueue` (nextTick waiter, 40 ms budget for lifecycle work), and the registry's MutationObserver callback. @studiometa/ui adds a `viewTransition` scheduler on top. v4 replaces them with **one frame-aligned scheduler that is the framework's clock**.

### Weaknesses of the current implementation

- `domScheduler` flushes on `Promise.resolve().then()`. It batches within one microtask, not within one frame. A `write()` from an event handler flushes mid-turn; a later read→write batch still forces synchronous layout.
- No cancelation: tasks are anonymous closures. Queued work can run against elements already removed from the DOM.
- A throwing task deadlocks the scheduler: `flush()` never resets `isScheduled` on throw, so every later `scheduleFlush()` returns early. Silent and fatal.
- Lifecycle work (`SmartQueue`) and render work (`domScheduler`) compete without coordination.

### v4 design

One scheduler with **three phases inside the frame — `tick` → `read` → `write` — and one off-frame lane, `background`**:

```
frame start (rAF)
  1. tick        — fan-out to the clock's subscribers
  2. read        — measure: layout reads only
  3. write       — mutate: DOM writes only
style / layout / paint

between frames, on its own turns
  background     — time-sliced lane: mount/update lifecycle work,
                   mutation-record processing, manifest loading
                   (absorbs SmartQueue)
```

**Naming.** `read` and `write` are kept exactly as they are — fastdom, framesync and Motion spell them the same way, and they say precisely what they do. `background` becomes _more_ accurate once the lane runs off-frame: it maps literally onto `scheduler.postTask({ priority: 'background' })`. `frame(callback)` is now **`tick(callback)`**, with `TickProps`/`TickCallback`: the component hook is already `ticked()` and GSAP's shared clock is `gsap.ticker`, so `tick` is the word the API and the field already use, while `frame` collided with the `nextFrame()` helper — which keeps its name, since awaiting one frame is exactly what it does.

**`afterWrite` is removed.** It had no consumers — neither in v4 nor in @studiometa/ui — and its name promised something `requestAnimationFrame` cannot deliver: the flush runs in a rAF callback, which the HTML "update the rendering" steps place _before_ style, layout and paint, so nothing scheduled inside the frame can observe post-layout geometry. The only in-frame hook that observes it is a `ResizeObserver` callback, which those same steps run after layout. Anything else that needs post-layout geometry waits a frame and measures in the next `read`, or uses an observer. Renaming a phase nobody called would only have kept the confusion alive under a new spelling.

Properties:

- **Frame alignment.** One flush per frame, at rAF. All reads batch before all writes, once, before paint. `RafService` no longer owns a loop; it subscribes to the scheduler's tick. Its `callback` → returned-render-function pattern maps directly to read → write phases (unchanged for users).
- **Anti-thrashing by construction.** A `read` scheduled from a `write` runs next frame; a `write` scheduled from a `read` runs in the same frame (fastdom semantics).
- **Bounded phases — double-buffered queues.** Each phase runs the batch it was handed and nothing else: the queue array is swapped for an empty one when the phase starts, so a task scheduled into the phase that is _currently running_ lands in the next frame's batch. Draining a phase until it was empty (`while (queue.shift())`) let a `read` scheduling a `read` re-enter without end — 100,000 chained reads in one frame, no paint, no yield. Motion's render steps double-buffer for the same reason; Theatre.js instead caps recursion (warn at 10, throw at 100), which was rejected because it needs a limit to tune, surfaces as warnings and throws in the caller's code, and aborts work instead of letting it progress. Swapping the array costs nothing and preserves the cross-phase rule for free: the `write` batch is taken _after_ the reads ran, so a `write` scheduled from a `read` is still in it.
- **Task handles.** Scheduling returns a cancelable handle whose promise resolves with the task's return value: `const box = await scheduler.read(() => el.getBoundingClientRect())`.
- **Instance ownership.** Base sugar (`this.$read(fn)` / `this.$write(fn)`) ties tasks to the instance; terminate cancels its pending tasks. This is what makes "lifecycle equals DOM presence" safe — no stale writes to detached elements.
- **The background lane runs outside the frame.** It absorbs `SmartQueue`, and it is _not_ a phase of the flush. rAF callbacks run before style, layout and paint, so non-rendering work placed there competes with the frame no matter what budget guards it — and a budget measured from the top of the flush is spent by the tick callbacks and the render phases before the lane is reached. Measured: one tick subscriber busy 10 ms per frame (one running animation) starved the lane completely — zero background tasks in 400 ms, so nothing mounted while the animation ran. The lane now posts its own turns through `scheduler.postTask({ priority: 'background' })`, falling back to a `MessageChannel` message (`setTimeout` clamps nested timeouts; React's scheduler moved to a message channel for exactly this reason, facebook/react#16214). Each turn runs a 5 ms slice measured from the start of _the drain_, then hands the thread back and posts the next turn, so the work drains across as many turns as it needs. `isInputPending` is deliberately not used — that recommendation has been retracted. Prior art: Motion runs a second batcher on `queueMicrotask`, outside rAF, rather than budgeting inside it. Consequences: background work alone never requests an animation frame, and `whenIdle()` — which still counts background tasks as queued work — now resolves at the end of a background drain as well as at the end of a flush.
- **Clamped tick delta.** `TickProps.delta` is clamped to `[1, 40]` ms, and the first tick after the loop wakes reports `1000/60`. Raw wall time includes everything a frame is not — a backgrounded tab, a long task, an iOS scroll pause — and every subscriber integrating it jumps by the whole gap. Motion clamps to `[1, 40]`, framesync to 40, rafz to 64; GSAP's `lagSmoothing` is the same idea. `TickProps.time` stays raw on purpose: it is rAF's own timestamp, the clock the Web Animations API and `requestVideoFrameCallback` are expressed in.
- **Error isolation.** try/catch per task; a throwing task is reported and dropped, the flush continues, the scheduler never deadlocks.
- **Source compatibility.** `domScheduler.read/write` keeps its shape — all current consumers (Slider children, ScrollAnimation, Draggable, `withScrolledInView`, `animate`) keep working; only flush timing changes, and `afterWrite` had no consumers to keep. `useScheduler` custom-steps stays for non-DOM use. A synchronous escape (`flushSync`, and the `blocking` feature for tests) remains available.

### Tick subscriptions — `scheduler.tick(callback)` — implemented

The clock needs one more verb than `read`/`write`/`background`, because a service is not a task: it does not run once, it runs _while somebody is listening_.

```js
const unsubscribe = scheduler.tick(({ time, delta }) => { … });
```

- Tick callbacks run **at the start of the flush, before `read`**, so anything they schedule belongs to the same frame. That is what preserves v3's `RafService` contract without a second loop: the callback measures in `read`, the render function it returns mutates in `write`, once, before paint.
- The subscription is the only handle — no keys, no `remove(key)` — and it is what keeps the loop alive. `#schedule()` is called again at the end of a flush when an in-frame queue is non-empty **or** a tick subscriber remains, so the rAF loop stops on its own once the last one leaves. This answers the "idle-frame behavior" open point below: there is no permanent loop. Pending `background` work is deliberately not part of that condition — it drains on its own turns and never holds a frame open.
- Tick subscribers are **not queued work**, so `whenIdle()` ignores them. A page with a live scroll animation would otherwise never be idle, and the test helper `settle()` would never return.
- A throwing tick callback is reported and skipped, never unsubscribed: the subscription belongs to whoever created it, not to the frame that broke.

### Native View Transitions move into core

The `viewTransition(update)` helper and its batching scheduler currently live in @studiometa/ui (`ViewTransition/scheduler.ts`: microtask-batched updates flushed into a single `document.startViewTransition()`, batches serialized, synchronous fallback when unsupported). In v4 this becomes a lane of the core scheduler, because a view transition is a scheduling concern — `startViewTransition` snapshots the DOM, so its timing must coordinate with pending reads/writes:

- Core exports `viewTransition(update): Promise<void>` (same shape and progressive-enhancement contract as today's ui helper).
- Updates queued in the same flush batch into **one** `startViewTransition()` call, so independent elements (backdrop + panel) animate as one coordinated transition. Batches stay serialized behind the in-flight transition.
- The scheduler flushes pending `write` tasks **before** the snapshot is captured, and writes scheduled from inside the update callback run within the transition. No half-applied frames in the "old" snapshot.
- Base sugar: `this.$viewTransition(fn)`, instance-owned and cancel-aware like `$read`/`$write`.
- @studiometa/ui keeps only the declarative `ViewTransition` component, rebuilt on the core helper; Toaster/Dialog/Frame consume it unchanged.

### A known future slot: measurement between `read` and `write`

Motion has a phase between read and write — `resolveKeyframes` — that owns the unavoidable write/read/write/read pass some animations need to resolve their keyframes, amortised across every animating component so the whole page pays one layout instead of one each. It is where Framer's measured 2.5–6× came from, and it is the right shape for measurement-heavy mounting.

Nothing in v4 needs it today, so nothing implements it: this project does not add speculative abstractions. It is recorded here as the slot to fill if measurement-heavy mounting ever appears — between `read` and `write`, batched, never as a per-component escape hatch.

### Open points

- ~~`afterWrite` timing~~ **Decided:** removed. rAF runs before style and layout, so no in-frame phase can observe post-layout geometry; a `ResizeObserver` callback is the only in-frame hook that can, and everything else measures in the next frame's `read`. An "after paint" phase (double rAF / `requestPostAnimationFrame`-style) can be added later on its own merits, under a name that does not promise same-frame layout.
- ~~Idle-frame behavior~~ **Decided:** no permanent rAF loop. The scheduler wakes on the first scheduled in-frame task or tick subscription and stops when both are gone.
- Whether the frame loop keeps ticking during a running view transition (rendering is frozen while the snapshot is captured; long transitions should not starve `background` work — less pressing now that the lane runs off-frame).

## 8. Services — lazy, reference-counted — implemented

A service is a shared source of props components subscribe to: `ticked`, `scrolled`, `resized`, `moved`, `dragged`. `KeyService` and `LoadService` are not ported — a `keydown` listener and `window.onload` need no service around them.

- **Lazy and reference-counted.** `createService()` starts the definition on the first subscriber and tears it down on the last: no listener, no observer and no frame while nobody listens. This is the property the whole design leans on, since components mount and unmount constantly under `data-mount` strategies.
- **Symmetric subscriptions.** `add(callback)` returns the unsubscribe, like `Signal.subscribe()`, `provideContext()` and the mount strategies. v3 keyed callbacks by instance id and exposed `add`/`remove`/`has`; a closure cannot fall out of sync with the thing it releases. `AbortSignal` was measured as the alternative and rejected: 17× the cost per subscription, and not what the ecosystem uses internally either.
- **Scoped to a target.** `useScroll(target?)` takes an element or the window, `useResize(target?)` an element, `useDrag(el)` its element; `useWindowScroll()` and `useWindowSize()` name the default cases, the split VueUse, solid-primitives, react-use and runed all make. `useRaf()` and `usePointer()` have nothing to scope — the frame is the clock and the pointer is read from the window.
- **One instance per target,** keyed in a `WeakMap` by `perTarget()`. This is lifecycle bookkeeping rather than throughput: reference counting only means something against a target, so the last subscriber of one element must release that element's observer and leave the others running. Sharing one observer across targets was measured indifferent — the widespread claim traces to a single 2017 measurement, and 500 idle observers now cost ~0.02 ms/frame in total — so nothing tries to group them.
- **Bound per mount cycle, by a mixin.** `withRaf`/`withScroll`/`withResize`/`withPointer`/`withDrag` override `mounted()`, subscribe the component's `ticked`/`scrolled`/`resized`/`moved`/`dragged` method, and hand the unsubscribe back as a cleanup — so `$destroy()` releases it and a remount subscribes again, with `Base` knowing nothing about services. A hook is sugar for the default target; any other target is an option of the mixin (`target`, `hook`) or an explicit `useX(target).add(…)` in `mounted()`. The mixin is the primitive because it needs no build step; `@withScroll()` is the decorator sugar over it, and both are tree-shakeable: an unimported service cannot make a hook silently do nothing.
- **No loops of their own.** `RafService` and the drag inertia subscribe to `scheduler.tick()`; `ScrollService` coalesces its events into one `read` per frame instead of debouncing; `ResizeService` is a `ResizeObserver`, which also means a subscriber is told the current size on subscribe rather than on the next resize. `RafService` collects the render functions its callbacks return itself — the shared primitive fans props out and expects nothing back.
- **Props are flat, one per axis.** `ScrollProps` is `x`/`y`, `changedX`/`changedY`, `lastX`/`lastY`, `deltaX`/`deltaY`, `maxX`/`maxY`, `progressX`/`progressY`, `isUp`/`isRight`/`isDown`/`isLeft` — v3's spelling exactly, so a ported handler reads identically. The grouped objects (`last`, `delta`, `max`, `progress`, `direction`, `changed`) are gone, and with them the `ScrollDirection*` unions: v3 shipped both shapes, v4 ships one. `PointerProps` and `DragProps` follow the same `<name>X`/`<name>Y` convention, which flattens `origin`, `distance` and `final` too. `ResizeProps` was already flat. A handler destructures what it uses — `scrolled({ deltaY, isDown })` — instead of reaching through a group.
- **What the simplification dropped.** `PointerService` is pointer-events-only and viewport-relative (v3 branched on `TouchEvent` and took a target element); `ResizeService` keeps `width`/`height`/`ratio`/`orientation`/`breakpoint` and drops `breakpoints`/`activeBreakpoints`; `DragService` drops `props.MODES` (the `DragMode` union types it) and fixes the `dragTreshold` spelling.
- **Breakpoints are configuration, not a constant.** `setBreakpoints()` replaces the named set — the values v3 ships are only the default — and the matching `MediaQueryList` objects are built once instead of once per breakpoint per resize, which measured 5.2× slower. When `defineFeatures` lands it carries the set; this setter is what it will call.

## Kept from the existing #694 plan (unchanged)

- Remove `LoadService`, `KeyService`; simplify `ResizeService`, `PointerService`; `MutationService` internal to the registry. (Done — see section 8.)
- Config merge strategy for refs/components (#627): merge by default.
- Multiple option types (#651).
- `ResponsiveOptionsManager` as default; breakpoints aligned with @studiometa/tailwind-config.
- Meta-components promoted to core where relevant (Action/SafeAction/Fetch/Transition/Data*) — the Data* ones now sit on provide/inject.

## Superseded parts of the spec-draft comment

- Custom elements as the mounting/lifecycle primitive → replaced by the observer-first decision.
- A separate directive registry/lifecycle in core → not needed; behaviors stay components on the one registry.
- The bespoke `cdn.studiometa.dev` delivery → already superseded in ui 1.10.0 by esm.sh + `/autoload` side-effect entries; v4 keeps that path.
- `<ui-lazy>` component → covered by registry `loadStrategy`/`mountStrategy` + manifests (`data-load` / `data-mount`).

## Open questions

1. Naming: `config.components` successor (`uses`?), `$watchChildren` vs `$children(name, callbacks)`, announcement event names, `config.use` vs `config.siblings` for #697.
2. Does `$emit` cancelation gate anything framework-side, or is `defaultPrevented` purely userland?
3. Exact `mountStrategy` vocabulary and its interaction with existing `withMountWhen*` decorators (#751 semantics: one-shot `visible` vs reversible `in-view`).
4. ~~Migration phases~~ **Decided (2026-08-11): no bridge release.** Backporting the new primitives into a v3.x minor could itself destabilize ui components, so nothing v4 ships in 3.x. `@studiometa/js-toolkit` 4.0 and `@studiometa/ui` 2.0 ship as full breaking majors, in lockstep. Migration helpers are tooling, not runtime: lint rules in the existing eslint plugins flagging `$children`/`$parent`/`updated()`/old handler signatures, and codemods only for the mechanical renames. The `$children` coordinator components (13 files in ui) are rewritten on `$watchChildren`/provide-inject — several disappear into the platform instead (Accordion → `<details>`, Modal/Panel → Dialog).
