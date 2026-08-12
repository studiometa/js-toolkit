# Migrating @studiometa/ui to v4 — a feasibility test

Date: 2026-08-11. Against `@studiometa/ui` 1.10.0 and the v4 prototype in `packages/v4/src`.

Four component families were ported onto v4 to find out what a real migration costs. They were picked because each leans on a part of v3 that v4 changed: the `$children` coordinator pattern, service hooks, `config.emits`, mount decorators, and the per-instance store handshake. Everything here runs; `migration/**/*.spec.ts` adds 41 tests to the real-browser suite (Vitest browser mode, Chromium) and the pre-existing 104 still pass.

## What was ported

| Family            | Files                                                                                 | Ported                         | Not ported                                                           |
| ----------------- | ------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| `Accordion`       | `AccordionCore`, `Accordion`, `AccordionItem`                                         | full                           | —                                                                    |
| `Dialog`          | `Dialog`, plus `Transition` / `ViewTransition` (its children)                         | full                           | `Action` triggers, `Transition`'s `group` option                     |
| `ScrollAnimation` | `withScrolledInView`, `AbstractScrollAnimation`, `ScrollAnimationTimeline`, `…Target` | full (the non-deprecated pair) | the five `@deprecated` classes, `withScrollAnimationDebug`           |
| `Slider`          | `Slider`, `SliderItem`, `SliderBtn`, `SliderCount`                                    | full                           | `SliderDrag`, `SliderDots`, `SliderProgress` (mechanical follow-ups) |

Utilities copied into `migration/utils/`, minimum viable only: `math.ts` (`clamp`, `clamp01`, `map`, `lerp`, `damp`), `easings.ts` (`cubicBezier`, replacing the `@motionone/easing` dependency), `keyframes.ts` (the interpolator carved out of `animate`), `transition.ts`, `focus.ts` (`trapFocus`/`untrapFocus`/`saveActiveElement`), `uid.ts` (a `$id` replacement).

## 1. Accordion — `$children` coordinator, option forwarding, ARIA

**Ported unchanged.** The whole `AccordionItem` interaction: `btn`/`content`/`container` refs, `onBtnClick`, the animated container height, the `open`/`close` events, every ARIA attribute. `AccordionCore`'s autoclose logic, verbatim apart from how it reaches the items.

| Change                                                                  | Forced by                                                                                                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `this.$children.AccordionItem[index]` → `this.items` (`$watchChildren`) | `$children` removed. The collection is live and DOM-ordered, so the index is derived (`items.indexOf(target)`) rather than given. |
| `onAccordionItemOpen({ index })` → `onAccordionItemOpen({ target })`    | delegated `on<Child><Event>` hands over the emitting instance.                                                                    |
| `config.emits: ['open','close']` → `$emits` in the props type           | runtime `emits` removed. Zero bytes, and `$emit('open', item, index)` is argument-checked.                                        |
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

**Size:** `Dialog` 82 → 83 lines; transition children 278 → 147 (−47 %). **Verdict: mechanical.**

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
| **`$services.enable('ticked')`/`disable` → a hand-held `useRaf().add()`**                               | **no v4 equivalent — gap 1.**                                            |
| final boundary render moved off `$read`/`$write` onto the global `scheduler`                            | **`$destroy()` cancels pending tasks right after the cleanups — gap 5.** |

**Size:** components 193 → 136 (−30 %); infrastructure 879 → 441 (−50 %). **Verdict: components mechanical, infrastructure a rewrite that halves it.**

## 4. Slider — the handshake that motivated the design

| Change                                                               | Forced by                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AbstractSliderChild` deleted entirely (143 lines)**               | its whole job was finding the parent Slider and subscribing to its store, retrying in `mounted()`, `resized()` **and** `updated()` because none was reliable alone. `$inject(SliderContext)` plus the returned unsubscribe replaces all of it. |
| `createStorage(...)` → `$provide(SliderContext, …)`                  | provide/inject in core.                                                                                                                                                                                                                        |
| `connectChildren()` + `__connect()` → nothing                        | the context protocol replays to pending consumers when a late provider mounts. The test `connects a control that mounts before its slider` is the two-sided handshake, gone.                                                                   |
| `keyed(...)` + `hasFocus` + focus/blur handlers → `onWrapperKeydown` | `KeyService` dropped. A delegated ref handler only fires when focus is inside the wrapper.                                                                                                                                                     |
| `goTo()` throwing `Index out of bound.` → clamping                   | with a live children collection the slide count changes by design.                                                                                                                                                                             |

**What v4 is missing here: provide/inject carries a value, not an owner surface.** DESIGN.md §5 promises "optionally exposes a curated owner surface (`expose` pattern)"; `context.ts` ships `Signal<T>` only. So `SliderBtn` gets its _state_ from the injected signal but its _commands_ from `$closest('Slider')` — two ways to reach one parent, and the `$closest` one reintroduces the coupling context was meant to remove. **This is the most concrete missing piece for the ui 2.0 rewrite of the thirteen coordinators**, because most need commands as well as state.

**Size:** 472 → 295 (−38 %), one whole class deleted. **Verdict: coordination is a rewrite, geometry is a copy.**

## Gaps in v4, ordered by cost

1. **No way to suspend a service subscription within a mount cycle.** v3: `$services.enable('ticked')`/`disable`. v4: subscribe in `mounted()`, unsubscribe in `$destroy()`, nothing between. Two of four components needed it and both dropped `withRaf` for a hand-rolled start/stop. Not cosmetic: with `withRaf`, one slider or scroll animation keeps the rAF loop alive forever, contradicting DESIGN.md §7. **Ask:** pause/resume on the subscription handle, or `withRaf(Base, { manual: true })`.
2. **`$options` is read-only, and several ui components write to it.** Any v3 component treating an option as mutable state breaks. **Ask:** setters that write the attribute back, or a migration note plus a lint rule. `grep -rn '\$options\.[a-zA-Z]* *=' packages/ui/src` is the checklist.
3. **`$inject()` has no synchronous, optional or cancellable form.** It always returns a Promise even when a provider exists; it _never settles_ without one, so a standalone `SliderBtn` hangs forever; and `$destroy()` does not cancel a pending request. **Ask:** `$inject(key, { optional: true })`, `$injectSync(key)`, cancellation on destroy.
4. **provide/inject has no `expose`.** Promised in DESIGN.md, absent from `context.ts`. Without it every control keeps a `$closest()` back-channel.
5. **`$destroy()` cancels pending scheduler tasks _after_ the cleanups.** A cleanup that schedules `this.$write(…)` — the natural "reset my styles on the way out" — has its task cancelled immediately. **Ask:** cancel before running cleanups, or give `$destroy()` a surviving lane.
6. **No `$id`.** Any ARIA wiring needs one; two of four families copied a `uid()`.
7. **No per-class instance registry.** `Transition`'s `group` option is unportable.
8. **`Object`/`Array` option defaults are shared between instances.** `buildOptions()` returns the `default` directly, so `default: {}` hands _the same object_ to every instance. v3 required a factory for exactly this reason. A latent, hard-to-debug bug.
9. **Option definitions lost `merge: true`.** Merging is now the component's job.
10. **No `utils`, no `$log`/`$warn`.** Known — but the shape of the need is the finding: ~530 lines of copies for four components, and the biggest v3 utility (`animate`, 719 lines) was **not** what was needed.
11. **No `onWindow<Event>` / `onDocument<Event>`.** v3 resolves both in `EventsManager` (`isWindowRegex`, `isDocumentRegex`); v4's `#bindHandlers()` resolves `on<Child><Event>`, `on<Ref><Event>` and `on<Event>`, and the last binds to `$el` only. **There is no workaround by delegation:** the events these catch are the ones that by definition never reach the component — a click _outside_ it, a `popstate` that only fires on `window`. ui uses them in five components, and one of them, `ClickOutside`, is nothing but an `onDocumentClick`. Small to build, blocking without it — the cheapest item on this list and the only one with no partial substitute.

## What came out better

|                                  | v3                                                                            | v4                                                          |
| -------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| a control finds its coordinator  | 143-line `AbstractSliderChild` + two-sided handshake + retries in three hooks | `await this.$inject(SliderContext)`                         |
| a coordinator finds its children | `$children.X`, resolved once, needs `$update()`                               | `$watchChildren('X')`, live, order-independent              |
| a child added after mount        | invisible until `$update()`                                                   | just works (tested in all four families)                    |
| mount when in view               | `withMountWhenInView` wrapping the constructor (109 lines)                    | `config.mountStrategy = 'in-view'`, overridable per element |
| keyboard nav on a focused region | `KeyService` + `hasFocus` + focus/blur handlers                               | `onWrapperKeydown`                                          |
| declaring emitted events         | `config.emits` — bytes, no checking                                           | `$emits` — no bytes, arguments checked                      |
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
| Transition + ViewTransition (+ ui's VT scheduler) |      278 |      147 |     −47 % |
| ScrollAnimation (3 classes)                       |      193 |      136 |     −30 % |
| ScrollAnimation infrastructure                    |      879 |      441 |     −50 % |
| Slider (5 classes → 4)                            |      472 |      295 |     −38 % |
| utilities actually used                           |      206 |      174 |     −16 % |
| **total**                                         | **2326** | **1470** | **−37 %** |

## Verdict

**Migrating @studiometa/ui to v4 is mostly mechanical for component _behaviour_, and a rewrite for component _wiring_.** The split is clean and identical across all four families.

- **Mechanical (~70 % of the code):** everything a component does to its own DOM — `AccordionItem`'s height animation and ARIA, `Dialog`'s open/close ordering, `Slider`'s geometry, `AbstractScrollAnimation`'s play-range maths. A codemod plus a careful eye handles this.
- **A rewrite (~30 %):** everything about how a component reaches another component. Not renaming: the topology changed from parent-owned to DOM-observed, and code that assumed ordering has to be re-thought rather than translated.

The rewrite is worth doing. It deletes 37 % of the code, removes an entire base class, a scheduler and a constructor-wrapping decorator; fixes a real Escape-key bug in `Dialog` for free; and makes "a child appeared after mount" a non-event everywhere. **Nothing in this sample turned out to be unportable.**

### Build these in v4 before starting the real migration

1. **A way to suspend a service subscription within a mount cycle** (gap 1). Without it v4's "no permanent rAF loop" promise is false on any page with a slider or scroll animation.
2. **`useScrollProgress(el, { offset })` in core.** Every ui family that animates on scroll needs element-through-viewport progress; each would otherwise copy ~360 lines of edge maths.
3. **The keyframes interpolator, split from the player.** Not `animate()` — the 719 lines of player behind it are what ui's only consumer never uses.
4. **`$inject` with an optional/synchronous form, and `expose` on provide/inject** (gaps 3–4). Together these make provide/inject _the_ coordinator primitive; today it covers state but not commands.
5. **Writable `$options` or a documented replacement, plus factory defaults for `Object`/`Array`** (gaps 2, 8). The second is a latent cross-instance bug, not just a migration cost.
6. **`$id`** (gap 6). Ten lines, and every accessible component wants it.
7. **`onWindow<Event>` and `onDocument<Event>`** (gap 11). Cheap, and `ClickOutside` cannot be written at all without it.
8. **A `utils` port** informed by the above: `clamp`/`clamp01`/`map`/`lerp`/`damp`, `transition`, `trapFocus`, `cubicBezier`. About 200 lines covered four families.

Items 1–4 change what a component _can_ be written to do. Items 5–7 are cost, not capability.
