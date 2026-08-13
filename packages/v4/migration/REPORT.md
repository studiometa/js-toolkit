# Migrating @studiometa/ui to v4 — a feasibility test

Date: 2026-08-11, extended 2026-08-13 with the three remaining `Slider` controls and with the `Data*` family. Against `@studiometa/ui` 1.10.0 and the v4 prototype in `packages/v4/src`.

Five component families were ported onto v4 to find out what a real migration costs. They were picked because each leans on a part of v3 that v4 changed: the `$children` coordinator pattern, service hooks, `config.emits`, mount decorators, the per-instance store handshake — and, for `Data*`, the group registry and the only signal library in ui. Everything here runs; `migration/**/*.spec.ts` adds 103 tests to the real-browser suite (Vitest browser mode, Chromium), 367 across 36 files in total. **One is red on purpose** and is labelled in place: see §5.

## What was ported

| Family            | Files                                                                                            | Ported                         | Not ported                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------- |
| `Accordion`       | `AccordionCore`, `Accordion`, `AccordionItem`                                                    | full                           | —                                                          |
| `Dialog`          | `Dialog`, plus `Transition` / `ViewTransition` (its children)                                    | full                           | `Action` triggers, `Transition`'s `group` option           |
| `ScrollAnimation` | `withScrolledInView`, `AbstractScrollAnimation`, `ScrollAnimationTimeline`, `…Target`            | full (the non-deprecated pair) | the five `@deprecated` classes, `withScrollAnimationDebug` |
| `Slider`          | `Slider`, `SliderItem`, `SliderBtn`, `SliderCount`, `SliderDrag`, `SliderDots`, `SliderProgress` | full                           | —                                                          |
| `Data*`           | `DataScope`, `DataBind`, `DataModel`, `DataComputed`, `DataEffect`, `DataChannel`, `formControl` | full                           | `Action`/`Fetch` interop, the `MotionView` transitioner    |

Utilities copied into `migration/utils/`, minimum viable only: `math.ts` (`clamp`, `clamp01`, `map`, `lerp`, `damp` — since promoted into `src/utils/maths.ts`), `easings.ts` (`cubicBezier`, replacing the `@motionone/easing` dependency), `keyframes.ts` (the interpolator carved out of `animate`), `transition.ts` (the `transition()` primitive plus the enter/leave pair two components share), `focus.ts` (`trapFocus`/`untrapFocus`/`saveActiveElement`), `uid.ts` (a `$id` replacement).

## 1. Accordion — `$children` coordinator, option forwarding, ARIA

**Ported unchanged.** The whole `AccordionItem` interaction: `btn`/`content`/`container` refs, `onBtnClick`, the animated container height, the `open`/`close` events, every ARIA attribute. `AccordionCore`'s autoclose logic, verbatim apart from how it reaches the items.

| Change                                                                  | Forced by                                                                                                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `this.$children.AccordionItem[index]` → `this.items` (`$watchChildren`) | `$children` removed. The collection is live and DOM-ordered, so the index is derived (`items.indexOf(target)`) rather than given. |
| `onAccordionItemOpen({ index })` → `onAccordionItemOpen({ target })`    | delegated `on<Child><Event>` hands over the emitting instance.                                                                    |
| `config.emits: ['open','close']` → `$emits` in the props type           | runtime `emits` removed. Zero bytes, and `$emit('open', { item, index })` is payload-checked.                                     |
| `destroyed()` style reset → the `mounted()` returned cleanup            | v4 idiom; setup and teardown in one closure.                                                                                      |
| `Accordion extends AccordionCore` no longer spreads the parent config   | config merges along the prototype chain (#627).                                                                                   |
| **`$options.isOpen` as mutable state → a private `#isOpen` field**      | **`$options` is a read-only view over attributes in v4.**                                                                         |
| **Parent → child option forwarding rewritten**                          | see below.                                                                                                                        |

**The option-forwarding problem.** v3's `AccordionItem.mounted()` reaches its parent and writes into its own options:

```js
const accordion = this.$closest('Accordion');
Object.entries(accordion.$options.item).forEach(([key, value]) => {
  this.$options[key] = deepmerge(this.$options[key], value); // both halves illegal in v4
});
```

Two v4 decisions break it independently: `$options` is built from getters with no setters, and `$closest('Accordion')` only answers for a _mounted_ ancestor while v4 guarantees no mount ordering — an item can and does mount before its accordion. The port reads the ancestor's `data-option-item` attribute off the DOM instead. That fits v4's model better than v3's version, since DOM ancestry is a fact that exists before anything mounts and is live for free — the test `forwards the parent 'item' option to items that mount before it` covers exactly the ordering v3 could not survive. But **every component that forwards options will reinvent this**, and there is no framework support for it.

**Better in v4.** The item is no longer constructed by the accordion, so an `AccordionItem` outside any `Accordion` is a fully working disclosure. Adding or removing an item updates the collection with no `$update()`.

**Size:** 216 → 194 code lines (−10 %). **Verdict: mostly mechanical, one rewritten path** — about 30 of ~200 lines are genuinely new.

## 2. Dialog — refs, lifecycle, focus trap, `$children`

**Ported unchanged.** `open()`, `close()`, `toggle()`, the modal/non-modal split, scroll locking, and the ordering guarantee that leave transitions finish _before_ the native hide — line-for-line v3.

| Change                                                                        | Forced by                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `$children.Transition` / `.ViewTransition` → two `$watchChildren` collections | `$children` removed. A transition inserted after mount is now picked up (tested).                |
| `keyed({ event, isDown })` → a `keydown` listener in `mounted()`              | **`KeyService` was deliberately dropped.** The replacement is smaller than the hook it replaces. |
| `get dialog() { return this.$el }` → deleted                                  | `$el: HTMLDialogElement` in the props type.                                                      |

**Missing in v4:** nothing blocking. `Transition` lost v3's `group` option, which collects sibling instances via `getInstances(Transition)` — **v4 has no per-class instance registry**. Recorded, not worked around.

**Better in v4.** A v3 bug disappears: pressing Escape closes a native `<dialog>` behind the component's back, so v3's leave transitions never ran and the scroll lock stayed on. In v4 the bubbling `cancel` event makes this a two-line `onCancel()` handler, with a test. The transition children shrank because v4 core absorbed the `viewTransition()` batching scheduler ui ships as `ViewTransition/scheduler.ts` (108 lines, deleted).

**Size:** `Dialog` 82 → 83 lines; transition children 278 → 116 (−58 %), once the enter/leave sequence moved into `utils/transition.ts` for `SliderDots` to share (§4b) — 116 + those 47 lines against v3's 278. **Verdict: mechanical.**

## 3. ScrollAnimation — the `animate` data point

`ScrollAnimation` is the only real consumer of `animate()` in ui, and it uses exactly one method:

```js
get animation() {
  return animate(this.target, keyframes, { easing });
}
render(progress) {
  this.animation.progress(progress);
}
```

It never calls `start()`, `play()`, `pause()` or `finish()`. It has no duration. It is not an animation player — it is a keyframes → styles interpolator sampled by scroll position. What it drags in to get that: `utils/css/animate.ts` (473 lines: keyframe compilation, a `running` WeakMap of concurrent animations per element, staggering, per-target durations, and `domScheduler.read`/`write` calls **inside** the render path), `utils/tween.ts` (246 lines), and `@motionone/easing` for `cubicBezier` alone.

**What a v4 port needs from `animate`:** a pure `compile(keyframes, { easing }) => (progress, size) => styles`, and nothing else. That is `migration/utils/keyframes.ts` — ~120 lines of logic — plus 30 lines of `cubicBezier` replacing the dependency. No tween, no loop, no per-element registry, no stagger, and critically **no DOM writes and no scheduling of its own**: it returns a style patch and the component hands the write to the scheduler. That is what makes the timeline cheap — in v3, N targets cost N × (`read` + `write`) with another nested pair inside `animate`; in v4 every target computes in the `read` phase and returns its write, and the timeline runs them all in one `write`.

_Recommendation:_ ship the interpolator, keep the player separate. They are two utilities v3 fused.

**Does the scroll service cover its needs? Partly.** `useWindowScroll()`, `useRaf()` and `useResize()` supply the damping loop. What they do not supply is what `withScrolledInView` exists for: **an element's progress through the viewport**, with the `"start end / end start"` offset syntax. `ScrollProps.progressY` is the _page's_ progress, not an element's. _Recommendation:_ `useScrollProgress(el, { offset })` in core — it is the most reused decorator in ui (`ScrollAnimation`, `ScrollReveal`, `Track`, `LargeText`, `CircularMarquee`…).

| Change                                                                                                  | Forced by                                                                |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `withMountWhenInView(BaseClass, options)` → `config.mountStrategy = 'in-view'`                          | mount strategies moved into the registry (#751). **Clean win.**          |
| four `$on(…)` channels with a hand-built `handleEvent` → two service subscriptions returned as cleanups | services are subscribe/unsubscribe closures. ~40 lines deleted.          |
| grouped `ScrollInViewProps` → flat (`startX`, `dampedProgressY`…)                                       | v4's service prop convention.                                            |
| **`$services.enable('ticked')`/`disable` → `toggle(() => useRaf().subscribe(…))`**                      | **resolved — `toggle()` is the v4 equivalent.**                          |
| final boundary render moved off `$read`/`$write` onto the global `scheduler`                            | **`$destroy()` cancels pending tasks right after the cleanups — gap 5.** |

**Size:** components 193 → 136 (−30 %); infrastructure 879 → 441 (−50 %). **Verdict: components mechanical, infrastructure a rewrite that halves it.**

## 4. Slider — the handshake that motivated the design

All seven classes are ported. The coordination changes are in the first table; the three controls added on 2026-08-13 follow.

| Change                                                                         | Forced by                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AbstractSliderChild` deleted entirely (143 lines)**                         | its whole job was finding the parent Slider and subscribing to its store, retrying in `mounted()`, `resized()` **and** `updated()` because none was reliable alone. `$inject(SliderContext)` plus the returned unsubscribe replaces all of it.      |
| `createStorage(...)` → `$provide(SliderContext, …)`                            | provide/inject in core.                                                                                                                                                                                                                             |
| `connectChildren()` + `__connect()` → nothing                                  | the context protocol replays to pending consumers when a late provider mounts. The test `connects a control that mounts before its slider` is the two-sided handshake, gone.                                                                        |
| `keyed(...)` + `hasFocus` + focus/blur handlers → `onWrapperKeydown`           | `KeyService` dropped. A delegated ref handler only fires when focus is inside the wrapper.                                                                                                                                                          |
| `goTo()` throwing `Index out of bound.` → clamping                             | with a live children collection the slide count changes by design.                                                                                                                                                                                  |
| **the context carries `{ state, goTo, goNext, goPrev }`, not a bare `Signal`** | three of the four controls need a _command_ and only `SliderProgress` does not. A context carrying state alone left them on `$closest('Slider')`, which is the coupling the context exists to remove. See below — this was gap 4, and it is closed. |

### 4a. SliderDrag — the drag service was rewritten under it

| Change                                                                                                             | Forced by                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$emit(props.mode, props)` guarded against `idle`                                                                  | `DragMode` gained `idle` for what `props()` reports outside a gesture. Emitting it would be an event announcing that nothing happened, and `$emits` does not declare it — so the guard is type-checked rather than a convention.                                                                                                                                |
| `props.distance.x` → `props.distanceX`                                                                             | props are flat, one field per axis.                                                                                                                                                                                                                                                                                                                             |
| `$services.get('dragged')` + `isGrabbing`/`hasInertia` → `mode`                                                    | every flag was a reading of `mode`, and the props are no longer fetched imperatively.                                                                                                                                                                                                                                                                           |
| **`inertiaFinalValue(distanceX, props.delta.x * dropSensitivity)` → `(props.finalX - props.x) * dropSensitivity`** | the service now announces its exact settle position at `drop`, computed from a velocity in px/ms. v3 projected the throw itself from the **last event's delta**, which is a per-device quantity: the same flick threw differently on a 1000 Hz mouse and a 125 Hz trackpad. The component's job shrinks to scaling a distance the service already knows.        |
| **`scrollLockThreshold` option + `onTouchmove` `preventDefault()` deleted**                                        | that heuristic — block the native gesture once the drag is more horizontal than vertical — is `touch-action: pan-y`. The component sets it in `mounted()` **before** `super.mounted()`, because `useDrag` reads the computed value on its first subscriber and only writes `none` over an `auto`. 13 lines and a hand-rolled axis test for one CSS declaration. |
| `config.emits: [...]` → `$emits` in the props type                                                                 | runtime `emits` removed.                                                                                                                                                                                                                                                                                                                                        |

**Better in v4.** Two v3 defects disappear without being touched: a pause before releasing no longer flings the slider (the velocity is decayed by the idle time at the drop), and the throw is frame-rate independent. Both are tested here rather than in the service spec, because both are what a user of the slider feels.

**The one real regression, and it is CSS-shaped.** `useDrag` owns the whole gesture: it writes `touch-action: none` unless the consumer says otherwise, and there is no `axis` option to say "the x axis is mine, leave y to the browser". A slider must say that or a page cannot be scrolled by swiping over it. It is expressible — the component writes `pan-y` itself, which is what the port does — but the timing is subtle (before the mixin subscribes) and every draggable-on-one-axis component will rediscover it. _Ask:_ `useDrag(el, { axis: 'x' })`, which writes `pan-y` for you.

**The inertia runs for nothing here.** After `drop` the service coasts a virtual pointer to `finalX` over ~40 frames, emitting `inertia` each time. The Slider ignores all of it: it takes `finalX` at drop and drives its own damped motion. The coast is right for a component that follows the pointer 1:1 (a bottom sheet, a map), and pure overhead for one that only wants the destination — which the service already computes exactly. _Ask:_ `useDrag(el, { inertia: false })`, or a note in the docs that reading `finalX` at `drop` is the cheap path.

### 4b. SliderDots — the transition mixin has no v4 equivalent

| Change                                                            | Forced by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `withTransition(AbstractSliderChild)` → `Base` + two functions    | v3 shipped the behaviour twice — a `withTransition` decorator and a `Transition` component wrapping it — and the earlier port collapsed both into the component, which left `SliderDots` nothing to mix in. A v4 mixin was possible (`withDrag` is one) and was not what this wanted: the decorator's whole body is `(element, options) => Promise`, with `this` used for nothing but reading those two. So the shared half is `enterTransition(el, options)` / `leaveTransition(el, options)` in `utils/transition.ts`, and both consumers call them. Net cost 16 lines, one implementation instead of two, and no class in the middle.                                                      |
| `data-ref="dots[]"` → `data-ref="dots"` **in the markup**         | v4 declares an array ref as `dots[]` in `config.refs` and selects `[data-ref="dots"]`; v3 kept the suffix in both places. **This is a template change, not a JavaScript one, and it fails silently** — the refs resolve to an empty array and the component does nothing. Counted in ui: **36 occurrences, none of them in `packages/ui/src`** — they are in ui's own `packages/tests/` fixtures (4 files) and `packages/docs/` examples (~13). So the shipped components and their Twig templates are unaffected and no consumer's markup breaks; what needs editing is ui's tests and documentation. v4 also drops v3's namespaced `data-ref="Component.name"` form, which ui uses 3 times. |
| `this.slider.goTo(index)` → `$injectSync(SliderContext)?.goTo(…)` | the command surface. A click needs an answer now, so it is the sync form, and "no provider" is a no-op.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `update(index)` called through `AbstractSliderChild.__updateWith` | the signal subscription calls it directly; the base class's `domScheduler.read`/`write` wrapper and its `isFunction(callback)` return protocol are gone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### 4c. SliderProgress — the control that ends up with no coupling at all

| Change                                                   | Forced by                                                                                                                                                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slider.indexMax` → `total` from the provided state      | the range is part of what the coordinator publishes, so this control needs **no reference to the Slider at all** — no `$closest`, no class import, one context key. It is the shape every control should have. |
| `domScheduler.read`/`write` → `this.$read`/`this.$write` | the instance's lanes, cancelled on destroy.                                                                                                                                                                    |
| `transform(el, { x })` → one `style.transform` write     | v4 ships no `transform` util. Nothing else transforms this element, so the util's read-merge-write was buying nothing.                                                                                         |
| `map(index, 0, indexMax, …)` guarded                     | not forced — a v3 bug. With one slide `indexMax` is `0`, the map divides by zero and writes `translate3d(NaNpx, …)`, which the browser drops.                                                                  |

**Gap 4 is closed, and closing it was the point.** `context.ts` and `Base.$provide()` now both document the expose pattern — provide an object of methods, since the value travels verbatim — and the demo Slider already used it. The ported one was the holdout, so it was moved over: `SliderBtn` and `SliderDots` resolve commands with `$injectSync` at click time and state with `$inject` at mount, and no control imports the `Slider` class. That split is worth keeping as the rule: **`$inject` for what must survive a control mounting first, `$injectSync` for what must be answered now.**

**Size:** 570 → 456 (−20 %) over eight classes becoming seven. The three controls added here are 98 v3 lines against 99 v4 ones — flat, because they were already thin and their base class had been counted as saved. **Verdict unchanged: coordination is a rewrite, geometry is a copy** — and the drag drop handler is the one place where the rewrite made the geometry _smaller_, since the service now does the physics the component used to.

## 5. Data\* — the group registry, and the only signal library in ui

Ported 2026-08-13. `DataScope`, `DataBind`, `DataModel`, `DataComputed`, `DataEffect`, plus the `DataChannel` that disappeared into core's `Signal` and the two utilities that stayed out of core. This family was chosen because it is the one v3 built on primitives v4 **does not have at all**: `withGroup`, `getScopedGroups`, a `globalThis` channel registry, and `alien-signals`. DESIGN.md §5 already promised it would "rebuild on provide/inject"; this is the test of that promise.

### 5a. The mapping that worked

| v3                                                                 | v4                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| `DataChannel` (87 lines, `signal` + `effect` from `alien-signals`) | one core `Signal` per group, held in the registry record        |
| `withGroup(Base, 'data:', { getScope, getGroup })` + `$group`      | `registry.members(name)` — a `Set` beside the value cell        |
| `getScopedGroups(scope)`                                           | gone; the registry is already per-scope                         |
| `getDataScope(el)` — a `__base__` walk up the DOM                  | `injectContextSync(el, DataRegistryContext)`                    |
| `globalThis.__STUDIOMETA_UI_DATA_CHANNELS__` (a `WeakMap`)         | `provideRootContext(DataRegistryContext, …)`                    |
| `nextTick()` for hydration batching                                | `defaultScheduler.background()`                                 |
| `DataScope.__groups` + its reconciliation                          | `DataRegistry`, one class, two instances (scoped and page-wide) |

**The named/dynamic problem, and where the keyed map belongs.** `createContext()` yields one static symbol; Data groups are named at runtime from an option. A `Map<string, ContextKey>` is the obvious bridge and is the wrong one: to be shared it would have to live in a module-level cache, which is the `globalThis` registry v4 just removed. The map belongs **inside the provided value** — one key, one provider, `registry.group(name)` within it. That also carries what the scoped half needs beyond a channel (values, sources, hydration bookkeeping), which a bare `ContextKey<Signal>` cannot. DESIGN.md's own sketch says the same thing with a `Map<string, Signal>`; the port only widens the value.

**`injectContextSync`, not `injectContext`, and not the `@inject` decorator — but the reason is not the one it looks like.** `get()` and `set()` are specified to work before mount (ui's own specs construct a `DataBind` and call `set()` on the next line), so the port resolves **lazily on first use and memoises for the mount cycle** — v3's `__dataScopeResolved`, kept. The async form buys nothing here because there is always an answer: `provideRootContext` creates the page-wide registry on demand. The `@inject` field decorator is the worst of the three, since it requests at construction.

**Per-cycle memoisation is strictly better than v3's.** v3 memoised the resolved scope for the instance's whole life. In v4 a DOM move is a destroy plus a mount, so wrapping existing content in a `DataScope` re-resolves for free — `rebinds descendants when a scope is wrapped around existing content` covers exactly the case v3 got permanently wrong.

### 5b. What has no framework support

**A nearer provider cannot reclaim a consumer that already resolved.** This is the finding. `provideContext()` replays to _pending_ requests when a late provider appears, but `requestContext`'s `provide()` deletes the request from `pendingRequests` the moment anything answers. Add `provideRootContext`, which provides on `document.documentElement` and therefore answers a request from anywhere, and the consequence is: **once the page-wide registry exists, every unscoped request is answered immediately and permanently.** Neither `$inject` nor `$injectSync` changes it — they differ in _when the consumer asks_, not in who may answer afterwards.

For `Slider` that was correct behaviour. Here it is not, because falling back is not a degradation: it silently binds a member to the page-wide channel where it exchanges values with unrelated components that happen to share a group name. The cases that reach it are all real — `registerComponent(DataBind)` before `registerComponent(DataScope)`; a scope with `data-mount="idle"`; a scope inserted by a `data-bind:if` template around content already there.

The port works around it with eight lines in `DataScope.mounted()`: a `RESCOPE` broadcast telling every `Data` member below to resolve again. It is load-bearing — removing it turns exactly one spec red (`reclaims descendants when the scope mounts around content that already resolved`) and nothing else. **Ask:** the WICG context protocol's `subscribe: true` flag, which v4 implements the protocol without, or a `context-provided` announcement dispatched down a new provider's subtree.

**`$watchChildren` is not the answer to group membership,** for three independent reasons, so the port registers members instead:

1. **A group is not a subtree.** Membership is _nearest scope + group name_: a member inside a nested `DataScope` belongs to the nested one, while `$watchChildren` on the outer scope collects it too. Filtering it back out means re-deriving each member's nearest scope — the resolution `$watchChildren` was meant to replace.
2. **It matches on exact `config.name`.** `DataModel`, `DataComputed` and `DataEffect` are `DataBind` subclasses with their own names, so a scope needs one collection per class and a user subclass gets none. **Ask:** an `instanceof`-shaped predicate.
3. **The page-wide group has no component to watch from.** There is no root `Base`, and `provideRootContext` deliberately creates none.

Only (2) is a gap. (1) and (3) say the registry `Set` is the right shape here, and it costs two lines.

**`$emit` cannot carry an object payload.** `$emit(name, ...args)` packs its arguments into `detail` as an array; the `dom-update` protocol needs `detail` to be an object with a `wrap` method on it. So the port dispatches a raw `CustomEvent`, exactly as ui does — ui's stated reason (a `Fetch` override) no longer applies but the shape problem does. **Ask:** either a payload-object form, or a documented statement that protocol events are raw `CustomEvent`s and `$emit` is for component events only. **Closed:** `$emit(name, payload?)` now takes one payload object and `detail` **is** that object, so a protocol payload and a component's own payload are the same shape.

### 5c. What the signal has to do — and what it does not

`DataChannel` always publishes a **fresh frame** (`{ ...update }`), so a value-equality bail-out never fires on this channel and repeating a value stays an observable event (`notifies subscribers again when the same value is written twice`). What it relies on instead is **deduped delivery of the latest frame**: a subscriber that publishes from inside its own delivery — `DataComputed` recomputing, an `Action` writing back — supersedes the outer frame, and no subscriber still to be reached may receive it.

The eager `Signal` on `main` does not do that, and `preserves the latest value during reentrant group updates` is **red on purpose** and labelled at the assertion. It asserts the final agreed value, not how many times anything ran — ui takes a major version bump, so call counts are negotiable and correctness is not.

Nothing else in this family needs anything else from the signal. **No batching** (the hydration batch is the registry's, on the scheduler's background lane, not the signal's). **No untracked read** (`.value` is a plain read here). **No derived values** — `DataComputed` is the one place a signal library would offer `computed()` and it does not use one: its recomputation is driven by the channel and its dependency (`$data`) is an immutable snapshot the registry rebuilds on every write. **No disposal hook** beyond the unsubscribe the port already returns from `mounted()`.

### 5d. Gaps already on this list, re-hit

- **Gap 14 (`$options` must be a type alias, not an interface)** bit within the first `tsc` run, and for exactly the predicted reason: the option set is named to be shared with three subclasses. Four files had to change one keyword.
- **Gap 10 (no `$warn`)** — four call sites became a local `warn()`.
- **No `nextTick`** — not a real gap here. `defaultScheduler.background()` is a _stronger_ guarantee than v3's microtask, because it is the same lane eager mounts queue on, so "after everything mounted" stops being a hope.

### 5e. Size

Code lines, comments and blanks excluded, barrel files excluded on both sides.

|                                                       |       v3 |       v4 |    delta |
| ----------------------------------------------------- | -------: | -------: | -------: |
| `DataBind`                                            |      378 |      395 |     +4 % |
| `DataScope` (component)                               |      269 |       55 |    −80 % |
| `DataChannel` + `withGroup` (v3) → `registry.ts` (v4) |  52 + 81 |      300 |   +126 % |
| `DataModel` / `DataComputed` / `DataEffect`           |       89 |       84 |     −6 % |
| `formControl` + expression evaluator                  |  139 + 8 | 145 + 11 |     +6 % |
| `dom-update`                                          |       51 |       46 |    −10 % |
| **total**                                             | **1067** | **1036** | **−3 %** |

**This is the flat one, and that is the finding.** The other four families lost 32 % because their wiring was hand-rolled and v4 absorbed it. `Data*` had already been built carefully on primitives, so what v4 removes is a _dependency_ (`alien-signals`) and a _decorator_ (`withGroup`, 81 lines), not accidental complexity — and the registry that replaces both is bigger than either, because it now holds the value cell `withGroup` never had. The one dramatic row is `DataScope`, 269 → 55: four fifths of it was never about being a component, and it lived there only because the group primitive had no value cell to hang it on.

### 5f. Specs

44 tests across three files. Ported adapted rather than verbatim: ui's construct-and-call style became real registered components in real DOM, since that is what a v4 consumer writes.

**Deliberately not ported:** four of the six `dom-update` wrap-protocol specs (the runner-rejects, late-`wrap`, duck-typed-transitioner and rapid-toggle cases — they exercise the protocol, not the framework); the `Action` interop specs (`Action` is not ported); the mirrored-model and duplicated-radio teardown edge cases; `should not hydrate values from immediate keyed subscribers`. Added instead, because they are what v4 changes: three mount-ordering specs (`wrapped around existing content`, `mounts around content that already resolved`, `nested member keeps its nearest scope`) and one for the page-wide channel.

**Verdict for this family: feasible, and the port is a wash on size.** Nothing turned out unportable. One core gap is real and worked around in eight lines; one core semantic (reentrant delivery) is missing and is being fixed in parallel.

## Gaps in v4, ordered by cost

1. **No way to suspend a service subscription within a mount cycle.** v3: `$services.enable('ticked')`/`disable`. v4: subscribe in `mounted()`, unsubscribe in `$destroy()`, nothing between. Two of four components needed it and both dropped `withRaf` for a hand-rolled start/stop. Not cosmetic: with `withRaf`, one slider or scroll animation keeps the rAF loop alive forever, contradicting DESIGN.md §7. **Ask:** pause/resume on the subscription handle, or `withRaf(Base, { manual: true })`. **Resolved:** `toggle(subscribe)` — `{ isActive, start, stop }` over any subscription, in or out of a component.
2. **`$options` is read-only, and several ui components write to it.** Any v3 component treating an option as mutable state breaks. **Ask:** setters that write the attribute back, or a migration note plus a lint rule. `grep -rn '\$options\.[a-zA-Z]* *=' packages/ui/src` is the checklist.
3. **`$inject()` has no synchronous, optional or cancellable form.** It always returns a Promise even when a provider exists; it _never settles_ without one, so a standalone `SliderBtn` hangs forever; and `$destroy()` does not cancel a pending request. **Ask:** `$inject(key, { optional: true })`, `$injectSync(key)`, cancellation on destroy. **Resolved:** `$injectSync()` answers now or not at all, and the pending request is destroy-scoped. A control that needs both uses both — state through `$inject`, commands through `$injectSync`.
4. **provide/inject has no `expose`.** Promised in DESIGN.md, absent from `context.ts`. Without it every control keeps a `$closest()` back-channel. **Resolved:** the value is provided verbatim, so an owner surface is `$provide(key, { state: signal, goNext: () => … })`; `context.ts` and `Base.$provide()` both document it, and the ported Slider uses it. No control imports its coordinator's class any more.
5. **`$destroy()` cancels pending scheduler tasks _after_ the cleanups.** A cleanup that schedules `this.$write(…)` — the natural "reset my styles on the way out" — has its task cancelled immediately. **Ask:** cancel before running cleanups, or give `$destroy()` a surviving lane.
6. **No `$id`.** Any ARIA wiring needs one; two of four families copied a `uid()`.
7. **No per-class instance registry.** `Transition`'s `group` option is unportable.
8. **`Object`/`Array` option defaults are shared between instances.** `buildOptions()` returns the `default` directly, so `default: {}` hands _the same object_ to every instance. v3 required a factory for exactly this reason. A latent, hard-to-debug bug.
9. **Option definitions lost `merge: true`.** Merging is now the component's job.
10. **No `utils`, no `$log`/`$warn`.** Known — but the shape of the need is the finding: ~530 lines of copies for four components, and the biggest v3 utility (`animate`, 719 lines) was **not** what was needed.
11. **An array ref lost its `[]` in the markup.** `config.refs: ['dots[]']` now selects `[data-ref="dots"]`; v3 selected `[data-ref="dots[]"]`. It is a template change rather than a code one, and it fails silently: the ref resolves to `[]` and the component does nothing. Scale, counted rather than estimated: **36 occurrences in ui, none in `packages/ui/src`** — ui's own test fixtures (4 files) and docs examples (~13). The shipped components and their Twig templates never use the suffix, so no consumer markup breaks. v4 also drops the namespaced `data-ref="Component.name"` selector v3 supported, which ui uses 3 times. **Ask:** accept both spellings during the migration, or a codemod for the templates plus a dev warning when an element declares `data-ref="x[]"`.
12. **`useDrag` has no axis.** It takes the whole gesture — `touch-action: none` unless the consumer's CSS says otherwise — so a horizontal slider blocks the page's vertical scroll until the component writes `pan-y` itself, and it has to do it before the mixin subscribes. **Ask:** `useDrag(el, { axis: 'x' })`.
13. **The drag inertia cannot be turned off.** The settle position is exact at `drop`, which is all a component driving its own animation needs; the coast that follows emits ~40 frames it will ignore. **Ask:** `useDrag(el, { inertia: false })`.
14. **A `$options` type must be a type alias, not an interface.** `BaseProps.$options` is `Record<string, unknown>`, and an interface has no implicit index signature, so `$options: MyOptionsInterface` fails the constraint with a message that points at the props type rather than at the interface. Only bites when the option set is named to be shared between two components, which is exactly when it is worth naming. **Ask:** a note in the docs; the fix is one keyword.
15. **No `onWindow<Event>` / `onDocument<Event>`.** v3 resolves both in `EventsManager` (`isWindowRegex`, `isDocumentRegex`); v4's `#bindHandlers()` resolves `on<Child><Event>`, `on<Ref><Event>` and `on<Event>`, and the last binds to `$el` only. **There is no workaround by delegation:** the events these catch are the ones that by definition never reach the component — a click _outside_ it, a `popstate` that only fires on `window`. ui uses them in five components, and one of them, `ClickOutside`, is nothing but an `onDocumentClick`. Small to build, blocking without it — the cheapest item on this list and the only one with no partial substitute.
16. **A nearer provider cannot reclaim a consumer that already resolved.** `requestContext`'s `provide()` deletes the request from `pendingRequests`, so late-provider replay only ever helps a request nobody answered — and `provideRootContext` answers every unscoped request from `document.documentElement`. A `DataScope` mounting after its members can therefore never take them back, and the failure is silent: the member keeps exchanging values on the page-wide channel with anything sharing its group name. Worked around in `DataScope.mounted()` with an eight-line `RESCOPE` broadcast, which is load-bearing for one spec. **Ask:** the WICG protocol's `subscribe: true` flag (v4 implements the protocol without it), or a `context-provided` announcement down a new provider's subtree. **This is the highest-value item this family found.**
17. **The `Signal` delivers a superseded frame to subscribers not yet reached.** A subscriber that publishes from inside its own delivery moves the value forward, and the rest of the current round still gets the old one. Every keyed channel with a component that writes back — `DataComputed`, `Action` — hits it. **Ask:** a nested write abandons and restarts the delivery round; drain synchronously at the end of the outermost write. **In progress on `feature/v4-signal-functional`.**
18. **`$watchChildren` matches on exact `config.name`, so it never sees a subclass.** A family with a base class and three named subclasses needs one collection per class, and a consumer's own subclass gets none. **Ask:** an `instanceof`-shaped predicate alongside the name.
19. **`$emit` cannot carry an object payload.** `detail` is always the argument array, so a protocol event with a callback on its detail (`dom-update`'s `wrap`) must be a raw `CustomEvent`. **Ask:** a payload-object form, or a documented rule that `$emit` is for component events and protocols use raw events. **Closed:** `$emit(name, payload?)` takes one payload object, and `detail` is that object verbatim. The protocol events keep their own dispatch path, for the one reason that survives — see DESIGN.md — but no longer for their shape.

## What came out better

|                                  | v3                                                                            | v4                                                          |
| -------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| a control finds its coordinator  | 143-line `AbstractSliderChild` + two-sided handshake + retries in three hooks | `await this.$inject(SliderContext)`                         |
| a coordinator finds its children | `$children.X`, resolved once, needs `$update()`                               | `$watchChildren('X')`, live, order-independent              |
| a control drives its coordinator | `this.slider.goTo(i)` — the whole instance, resolved by class                 | `$injectSync(SliderContext)?.goTo(i)` — a curated surface   |
| the settle position of a throw   | the component projects it from the last event's delta, per device             | the service announces it exactly at `drop`                  |
| a child added after mount        | invisible until `$update()`                                                   | just works (tested in all four families)                    |
| mount when in view               | `withMountWhenInView` wrapping the constructor (109 lines)                    | `config.mountStrategy = 'in-view'`, overridable per element |
| keyboard nav on a focused region | `KeyService` + `hasFocus` + focus/blur handlers                               | `onWrapperKeydown`                                          |
| declaring emitted events         | `config.emits` — bytes, no checking                                           | `$emits` — no bytes, payload checked                        |
| Escape on a `<dialog>`           | closes behind the component's back; transitions skipped, scroll lock stuck    | `onCancel()`, two lines                                     |
| a view transition                | ui ships a 108-line batching scheduler                                        | `this.$viewTransition(update)` from core                    |
| extending a component            | spread the parent's config by hand or lose it (#627)                          | configs merge along the prototype chain                     |
| N scroll targets on one timeline | 2N+ scheduler round trips, plus a nested pair inside `animate`                | one `read`, one `write`, for the whole timeline             |

## Size of change

Code lines, comments and blanks excluded. The v4 numbers _include_ the heavy explanatory comments this exercise required, so they understate the reduction.

|                                                   |       v3 |       v4 |     delta |
| ------------------------------------------------- | -------: | -------: | --------: |
| Accordion (3 classes)                             |      216 |      194 |     −10 % |
| Dialog                                            |       82 |       83 |        ±0 |
| Transition + ViewTransition (+ ui's VT scheduler) |      278 |      116 |     −58 % |
| ScrollAnimation (3 classes)                       |      193 |      136 |     −30 % |
| ScrollAnimation infrastructure                    |      879 |      441 |     −50 % |
| Slider (8 classes → 7)                            |      570 |      456 |     −20 % |
| utilities actually used                           |      206 |      221 |      +7 % |
| Data\* (5 classes + channel + registry + utils)   |     1067 |     1036 |      −3 % |
| **total**                                         | **3491** | **2683** | **−23 %** |

The `Data*` row is the flat one, and §5e says why: that family had already been built carefully on primitives, so v4 removes a dependency (`alien-signals`) and a decorator (`withGroup`) rather than accidental complexity, and the registry that replaces both is bigger than either because it now carries the value cell `withGroup` never had. Within the row one number is dramatic — `DataScope` 269 → 55 — and it is the same finding from the other side: four fifths of that component was a data structure that only lived in a component because there was nowhere else to put it.

Two rows moved when the three controls landed. The `Slider` row was `472 → 295` (−38 %) over five classes, and −20 % is the truer number: the three controls added are thin in both versions (98 → 99 lines), their deleted base class had already been counted as saved, and `Slider` itself took on ~60 lines of drag handling that v3 also had. Wiring is where the saving is, and the wiring was already counted. And the enter/leave sequence moved out of `Transition` into the utilities — 31 lines off one row, 47 onto the other — which is what buys `SliderDots` its transitions with no second implementation. The utilities row is now larger than v3's, and that is the honest number: v3's equivalent 137-line `withTransition` decorator sat in the row above.

## Verdict

**Migrating @studiometa/ui to v4 is mostly mechanical for component _behaviour_, and a rewrite for component _wiring_.** The split is clean and identical across all five families.

- **Mechanical (~70 % of the code):** everything a component does to its own DOM — `AccordionItem`'s height animation and ARIA, `Dialog`'s open/close ordering, `Slider`'s geometry, `AbstractScrollAnimation`'s play-range maths. A codemod plus a careful eye handles this.
- **A rewrite (~30 %):** everything about how a component reaches another component. Not renaming: the topology changed from parent-owned to DOM-observed, and code that assumed ordering has to be re-thought rather than translated.

The rewrite is worth doing. It deletes 23 % of the code, removes an entire base class, a scheduler, a constructor-wrapping decorator, a group decorator and a runtime dependency; fixes a real Escape-key bug in `Dialog` and a stale-scope bug in `DataBind` for free; and makes "a child appeared after mount" a non-event everywhere. **Nothing in this sample turned out to be unportable.**

`Data*` is the family that qualifies the "worth doing" and is worth reading as the counter-example: it is a wash on size, and the case for moving it is entirely about what it stops carrying — its own signal library, its own `globalThis` registry, and two spellings of one channel — rather than about lines saved.

### Build these in v4 before starting the real migration

1. **A way to suspend a service subscription within a mount cycle** (gap 1). Without it v4's "no permanent rAF loop" promise is false on any page with a slider or scroll animation.
2. **`useScrollProgress(el, { offset })` in core.** Every ui family that animates on scroll needs element-through-viewport progress; each would otherwise copy ~360 lines of edge maths.
3. **The keyframes interpolator, split from the player.** Not `animate()` — the 719 lines of player behind it are what ui's only consumer never uses.
4. ~~**`$inject` with an optional/synchronous form, and `expose` on provide/inject** (gaps 3–4).~~ **Done.** `$injectSync()` landed and the owner surface is a provided object of methods. Together they make provide/inject _the_ coordinator primitive: state and commands over one key, and thirteen ui coordinators with no `$closest` back-channel left to write.
5. **Writable `$options` or a documented replacement, plus factory defaults for `Object`/`Array`** (gaps 2, 8). The second is a latent cross-instance bug, not just a migration cost.
6. **`$id`** (gap 6). Ten lines, and every accessible component wants it.
7. **`onWindow<Event>` and `onDocument<Event>`** (gap 15). Cheap, and `ClickOutside` cannot be written at all without it.
8. **A `utils` port** informed by the above: `clamp`/`clamp01`/`map`/`lerp`/`damp`, `transition`, `trapFocus`, `cubicBezier`. About 200 lines covered four families.
9. **A codemod for `data-ref="x[]"`** (gap 11), and `{ axis }` on `useDrag` (gap 12). The first is 36 silent breakages in ui's tests and docs — not in its shipped templates, so it is ui's own housekeeping rather than a consumer migration; the second is one CSS declaration every draggable component would otherwise get subtly wrong.
10. **Reentrancy-safe signal delivery** (gap 17). A nested write must abandon and restart the round, so no subscriber is handed a superseded frame. `Data*` has one spec red on this today, and any keyed channel with a write-back consumer inherits it.
11. **A way for a nearer provider to reclaim an already-resolved consumer** (gap 16). Every name-resolved channel needs it; without it a `DataScope` that mounts late silently loses its members to the page-wide registry, and the eight-line broadcast that works around it is a pattern each such family would reinvent.

Items 1–4 and 10–11 change what a component _can_ be written to do. Items 5–9 are cost, not capability.
