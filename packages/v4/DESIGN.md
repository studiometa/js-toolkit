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
- This gives #751 its home: one canonical constructor per name, and the registry interprets `data-mount` per element when it schedules a mount. No constructor wrapping, no identity conflicts. The `withMountWhenInView`-style decorators can later delegate to the same scheduler.
- One name → one entry, like `customElements.define`. Collisions warn and are ignored.

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

## 6. One scheduler — a stronger `domScheduler`

v3.9 has four independent scheduling mechanisms: `domScheduler` (microtask flush), `RafService` (its own rAF loop), `SmartQueue` (nextTick waiter, 40 ms budget for lifecycle work), and the registry's MutationObserver callback. @studiometa/ui adds a `viewTransition` scheduler on top. v4 replaces them with **one frame-aligned scheduler that is the framework's clock**.

### Weaknesses of the current implementation

- `domScheduler` flushes on `Promise.resolve().then()`. It batches within one microtask, not within one frame. A `write()` from an event handler flushes mid-turn; a later read→write batch still forces synchronous layout.
- No cancelation: tasks are anonymous closures. Queued work can run against elements already removed from the DOM.
- A throwing task deadlocks the scheduler: `flush()` never resets `isScheduled` on throw, so every later `scheduleFlush()` returns early. Silent and fatal.
- Lifecycle work (`SmartQueue`) and render work (`domScheduler`) compete without coordination.

### v4 design

One scheduler with four phases per frame:

```
frame start (rAF)
  1. read        — measure: layout reads only
  2. write       — mutate: DOM writes only
  3. afterWrite  — follow-up work after mutations
  4. background  — budgeted lane: mount/update lifecycle work, mutation-record
                   processing, manifest loading (absorbs SmartQueue)
paint
```

Properties:

- **Frame alignment.** One flush per frame, at rAF. All reads batch before all writes, once, before paint. `RafService` no longer owns a loop; it subscribes to the scheduler's frame tick. Its `callback` → returned-render-function pattern maps directly to read → write phases (unchanged for users).
- **Anti-thrashing by construction.** A `read` scheduled from a `write` runs next frame; a `write` scheduled from a `read` runs in the same frame (fastdom semantics).
- **Task handles.** Scheduling returns a cancelable handle whose promise resolves with the task's return value: `const box = await scheduler.read(() => el.getBoundingClientRect())`.
- **Instance ownership.** Base sugar (`this.$read(fn)` / `this.$write(fn)`) ties tasks to the instance; terminate cancels its pending tasks. This is what makes "lifecycle equals DOM presence" safe — no stale writes to detached elements.
- **Budgeted background lane.** The `background` phase absorbs `SmartQueue`: time-sliced with a per-frame budget, yielding through `scheduler.yield()` / `scheduler.postTask()` where available, deadline checks (`performance.now()`) as fallback. Registry mount scheduling, mutation-record processing, and lazy-manifest resolution all run here, so heavy hydration never blocks a frame.
- **Error isolation.** try/catch per task; a throwing task is reported and dropped, the flush continues, the scheduler never deadlocks.
- **Source compatibility.** `domScheduler.read/write/afterWrite` keeps its shape — all current consumers (Slider children, ScrollAnimation, Draggable, `withScrolledInView`, `animate`) keep working; only flush timing changes. `useScheduler` custom-steps stays for non-DOM use. A synchronous escape (`flushSync`, and the `blocking` feature for tests) remains available.

### Native View Transitions move into core

The `viewTransition(update)` helper and its batching scheduler currently live in @studiometa/ui (`ViewTransition/scheduler.ts`: microtask-batched updates flushed into a single `document.startViewTransition()`, batches serialized, synchronous fallback when unsupported). In v4 this becomes a lane of the core scheduler, because a view transition is a scheduling concern — `startViewTransition` snapshots the DOM, so its timing must coordinate with pending reads/writes:

- Core exports `viewTransition(update): Promise<void>` (same shape and progressive-enhancement contract as today's ui helper).
- Updates queued in the same flush batch into **one** `startViewTransition()` call, so independent elements (backdrop + panel) animate as one coordinated transition. Batches stay serialized behind the in-flight transition.
- The scheduler flushes pending `write` tasks **before** the snapshot is captured, and writes scheduled from inside the update callback run within the transition. No half-applied frames in the "old" snapshot.
- Base sugar: `this.$viewTransition(fn)`, instance-owned and cancel-aware like `$read`/`$write`.
- @studiometa/ui keeps only the declarative `ViewTransition` component, rebuilt on the core helper; Toaster/Dialog/Frame consume it unchanged.

### Open points

- `afterWrite` timing: same frame after `write` (current behavior) vs after paint (double rAF / `requestPostAnimationFrame`-style). Same-frame is the compatible default; an explicit `afterPaint` phase could be added instead of changing `afterWrite`.
- Idle-frame behavior: skip rAF scheduling entirely when all queues are empty (no permanent rAF loop), wake on first scheduled task.
- Whether the frame loop keeps ticking during a running view transition (rendering is frozen while the snapshot is captured; long transitions should not starve `background` work).

## Kept from the existing #694 plan (unchanged)

- Remove `LoadService`, `KeyService`; simplify `ResizeService`, `PointerService`; `MutationService` internal to the registry.
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
