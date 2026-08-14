# Simplify — what is over-engineered, and what only looks it (2026-08-14)

Companion to `SIZE.md`. That document asked what v4 costs; this one asks what v4
could stop doing. They are different questions with different answers, and the
headline here is a negative result: **of everything that reads as excessive
caution, almost none of it is. The work is documentation, not deletion.**

Audited: every runtime module in `packages/v4/src`, plus what `migration/` and
`demo/` actually consume. Method and its limits in §6.

## The rule this audit was run under

`SERVICES-REVIEW.md` records **17 confirmed defects** found by adversarial
review, each fixed with a regression test. Much of what looks defensive here is
the scar of a measured failure — `memo()` uses `has()` rather than an `undefined`
check because the cheap version recomputes a memoised `undefined` forever; the
services fan-out walks a snapshot because iterating the live set delivered props
to subscribers that did not exist yet.

So nothing was called unnecessary without checking three things: **does a test
fail without it, does a comment or design doc explain it, and does `git log -S`
show it arriving with a fix.** A yes to any one makes it justified, and the only
question left is whether the reason is written down.

Two disciplines follow, and they are what makes this list short:

- Where a guard is called untested, that was established by **deleting it,
  rebuilding and running the suite** — not by reading.
- Where something is called unused, "no consumer in this repository" was treated
  as **weak** evidence. v4 is a private prototype at version `0.0.0`; its
  consumers do not exist yet, and `migration/` is ten ported families, not a user
  base. §5 lists three exports a naive unused-symbol sweep flagged that are
  plainly justified.

---

## Summary

| Category                                  | Count |
| ----------------------------------------- | ----: |
| 1 — unjustified, remove                   |    10 |
| 2 — justified but undocumented, document  |    19 |
| 3 — justified and documented, leave alone |  ~115 |

Plus **three latent defects** found while checking guards (§4). They are not
over-engineering and are reported separately.

`Base.ts` carries **79 JSDoc blocks in 1 950 lines** — one every 25 lines — and
most name the naive alternative and why it fails. `context.ts` has 23 in 585
lines, of which roughly 330 are prose; `negotiated-events.ts` 20; `registry.ts` 19. That density is why category 3 dominates, and it is why this audit found so
little to cut.

---

## 1. Unjustified — remove

Ordered by value. Every entry states what it costs to be wrong.

### 1.1 `optionAttributes()` re-walks the prototype chain `resolveConfig()` already caches

`registry.ts:290–306` walks `current.config.options` up the constructor chain by
hand, deduplicating with a `Set`. `Base.ts:879–907` already merges `options`
along that chain and memoises the result per constructor — and `registry.ts:1`
**already imports `resolveConfig`**. The function collapses to
`Object.keys(resolveConfig(ComponentClass).options ?? {})`; the `Set` exists only
because the hand walk visits inherited configs repeatedly.

- **Cost of being wrong:** none behavioural — both derivations produce the same
  set. The risk runs the other way: this is the third config key read off the own
  static instead of the merged one, and the other two both shipped as bugs
  (`d5d61e6e` merge `mountStrategy` along the chain, `da40f232` register the
  merged `config.components`).
- **Amends `SIZE.md`:** §R7 lists this row but gates it on `resolveConfig()`
  moving to `config.ts` as part of R2. That gate does not exist — the import edge
  is already there — so this is a standalone ~8-line deletion available today.
  `SIZE.md` §R7 has been corrected.

### 1.2 `ingest()`'s attribute filter is dead, and it is a hazard rather than a guard

`dom-mutations.ts:211–222` filters every incoming batch on
`type === 'childList' || attributeName === 'data-component' | 'data-mount' |
'data-ref' | startsWith('data-option-')`. The observer feeding it runs with
`attributeFilter: [...observedAttributes]` (line 66), and `observedAttributes`
can only ever hold those exact names: it starts as the three framework
attributes (line 36) and grows only through `registerDOMOptionAttributes()`,
whose two callers pass `data-option-<kebab>` (`registry.ts:295`) and its
breakpoint-scoped spellings (`responsive-options.ts:64`). The separate
`watchElementAttributes` observer feeds `ingestWatchedAttributes`, not this. So
the predicate is true for every record delivered: the filter allocates a copy of
each batch and removes nothing.

_Verified two ways._ By history: `git log -S'const relevant = incoming.filter'`
gives `e0b8ef05 feat(v4): react to live option changes`, whose diff **removes**
`attributeFilter` and adds this filter to compensate. `2cdbc1b6 fix(v4): harden
mutation lifecycle processing` then reintroduces a dynamic `attributeFilter` and
adds `observedAttributes` — but leaves the filter behind. It is a leftover from a
superseded design. By measurement: replacing it with `const relevant = incoming`
leaves the suite green (48 files, 636 passed).

- **Cost of being wrong:** the filter protects nothing and can only lose work — if
  a future caller ever registers an attribute outside `data-option-*`, it
  silently drops those records. Keep the `.some()` immediately after it; that one
  genuinely discriminates (`data-mount` and `data-option-*` must not bump
  `version`). Replace the `.filter()` with an `incoming.length === 0` early
  return.

### 1.3 `perTarget()`'s `keyOf` parameter — the consumer that asked for it rejected the helper

`service.ts:267`. Added by `d7c8f01d` for "arguments that do not serialise, such
as an `IntersectionObserverInit.root`". The consumer it names,
`migration/utils/inView.ts`, **does not use `perTarget()` at all**: it hand-rolls
`WeakMap<root, WeakMap<Element, Map<string, Service>>>` (`inView.ts:69–79`)
precisely because `root` is an object that no `string` key can carry — which is
what `keyOf` returns. All three real callers (`scroll.ts:285`, `resize.ts:123`,
`drag.ts:404`) take the default.

- **Cost of being wrong:** a future service takes a non-serialisable argument and
  re-adds the parameter — three lines, no call site to migrate.

### 1.4 The five `*MixinOptions` type aliases

`raf.ts:126`, `pointer.ts:168`, `scroll.ts:325`, `resize.ts:157`, `drag.ts:430`.
Five exported aliases with zero references anywhere — no `src/`, no `migration/`,
no `demo/`, no spec — and no doc comment on any. Two are the _same type_ under
two names (`RafMixinOptions` and `PointerMixinOptions` are both
`ServiceMixinOptions<void>`). Verified by `rg` over the package: the only
occurrences are the declarations and their five re-exports in `index.ts`.

- **Cost of being wrong:** a consumer naming a mixin's options type writes
  `ServiceMixinOptions<Element>`, which is exported and documented.
  `DragMixinOptions` is the only one with content
  (`DragOptions & ServiceMixinOptions<DragTarget>`); if one survives, that is it.

### 1.5 `destroyWithin`'s optional `snapshot` and its fallback are unreachable

`registry.ts:574` declares `snapshot?: readonly Element[]` and falls back to
`[node, ...node.querySelectorAll('*')]` on line 578. There is one call site
(`registry.ts:607`), and `dom-mutations.ts:241–248` populates `removedSubtrees`
for **every** removed node passing `node instanceof Element` — the exact
predicate `destroyWithin` itself requires before reaching the loop (line 575).
_Verified by reading both sides._ Making the parameter required states the
invariant in the type.

- **Cost of being wrong:** a caller passing no snapshot would iterate the _live_
  subtree instead of the removed one and miss descendants that already moved —
  which is exactly the bug `2cdbc1b6` introduced the snapshot to fix. The
  fallback is not merely dead: it is dead code that would reintroduce a fixed bug
  if it ever ran. Deleting it is safer than keeping it.

### 1.6 `Base.$off()` has no caller, and its only justification is a v3-continuity promise

`Base.ts:1217`. Zero callers in `src/`, `migration/`, `demo/` **and the specs** —
the only other mention in the package is `DESIGN.md:355`, "`$on`/`$off` and
`Action`-style directives keep working unchanged". `$on()` returns its own
teardown, and both ported families that bind listeners by hand use that
(`migration/Action/ActionEvent.ts:274`, `migration/Track/TrackEvent.ts:275`).

- **Cost of being wrong:** a userland caller keeping a listener reference to
  remove later keeps `$on()`'s returned teardown instead — strictly less
  bookkeeping. The real cost is the design one: `$off` is a
  backward-compatibility affordance, and `DESIGN.md` open question 4 already
  decided v4 ships as a full breaking major with no bridge release. Keeping it
  contradicts that decision; removing it is the decision applied.

### 1.7 `test-utils.ts` is built into `dist/` with no export path

`scripts/build.js` globs `**/*.ts` excluding specs and benches, so
`src/test-utils.ts` is emitted as `dist/test-utils.js` (3 309 B) + `.d.ts`
(1 957 B) + `.js.map` (5 787 B). It appears in no `exports` entry, and `rg`
confirms it is imported **only** by `*.spec.ts` files, which resolve from `src/`.

- **Cost of being wrong:** nothing. No consumer can reach it — there is no
  subpath — and the specs do not read `dist/`.
- **Note:** genuinely a one-line change (`'!**/test-utils.ts'` in the build glob),
  but no test covers the build script's glob, so it is reported rather than
  committed.

### 1.8 `lerp` — no consumer and no test

`utils/maths.ts:62`, subpath `./utils/lerp`. Verified by `rg` over the package:
no call site in `src/`, `migration/` or `demo/`, and no case in `maths.spec.ts`
(which does cover `clampDampFactor`, `decayOver`, the whole inertia family,
`damp` and `spring`). It also contradicts its own module header, which says
`maths.ts` is "not a port of `@studiometa/js-toolkit/utils/math`: only what is
actually used".

- **Cost of being wrong:** near zero — `map(x, 0, 1, min, max)` is the same value,
  and `map()` is used three times in `migration/`.
- **Caveat:** this is a _public utility_, so §5's warning applies here more than
  anywhere else on this list. It is included only because it is the single export
  with neither a consumer nor a test.

### 1.9 `scan()`'s `controllers.has(el) || loaders.has(el)` filter — probably unreachable

`registry.ts:539–544`. `scan()` has one caller, `processMutations`'s `addedNodes`
loop, on connected nodes. Controllers and loaders exist only for connected
elements, and every disconnection disposes them — `processMutations` runs
teardown first (`registry.ts:604–610`) and `destroyWithin` disposes everything in
the snapshotted subtree before any addition record is processed. _Measured:_
removing both conditions leaves the suite green (48 files, 636 passed). The
sibling condition `el.__base__` **is** reachable and is what the comment on
`registry.ts:531–533` describes.

- **Cost of being wrong:** an element that somehow retained a stale controller
  would never be re-reconciled, so it would not remount.
- **Honest caveat:** a green suite is necessary, not sufficient, for an
  unreachability claim about a `MutationObserver`-driven system. This is the one
  entry in §1 where I would want a second opinion before deleting. The gain is
  real but small — two `WeakMap` lookups per element on the `swap()`/morph hot
  path.

### 1.10 Two redundant `export`s

`registry.ts:33` re-exports the `ComponentImporter` type that `Base.ts:96`
already exports, for one consumer (`index.ts:116`) that can import it from
`./Base.js`. `scheduler.ts:140` exports `class Scheduler`, which is constructed
exactly once (line 396), is not in the `index.ts` barrel and has no subpath — so
a second instance is not reachable as public API anyway. Both are one-word
changes; listed for completeness.

---

## 2. Justified but undocumented — document

This is where the value is. Every item below is **correct code**; what is missing
is the reason, and the reason is what stops the next reader from "simplifying" it
into a bug.

### 2.1 Six error-isolation guards in `Base`'s lifecycle have no test, and their rationale is written down only for the scheduler

The top finding of this audit.

`Base.ts` has eleven `try`/`catch` blocks. _Measured_ by deleting all eleven,
rebuilding and running the suite: **exactly two tests fail** —
`Base.spec.ts:330` "isolates option effect errors and reentrant cleanup" and
`Base.spec.ts:389` "keeps primitive defaults and attribute values as they were".
Those cover four sites: the `JSON.parse` guard (`Base.ts:836`) and the three
option-effect guards.

The other **six have no regression test at all**. _Measured separately:_ deleting
just those six leaves the suite fully green (48 files, 636 passed).

| Site           | Guards                                 |
| -------------- | -------------------------------------- |
| `Base.ts:1076` | `mounted()` throwing                   |
| `Base.ts:1121` | a mount cleanup throwing               |
| `Base.ts:1128` | `destroyed()` throwing                 |
| `Base.ts:1154` | a termination cleanup throwing         |
| `Base.ts:1160` | `terminated()` throwing                |
| `Base.ts:1737` | a late (post-destroy) cleanup throwing |

They are **justified**: all six wrap user code, and error isolation is a stated
property of this framework — one component's throw must not stop a mount sweep,
leave the registry half-updated, or abort the other components on the page.

But that property is written down for the _scheduler_ only: `DESIGN.md:622`
("try/catch per task; a throwing task is reported and dropped, the flush
continues") and `index.ts:24`. Nothing states it for `Base`, and nothing pins it.

- **What to write, and where:** a paragraph in `DESIGN.md` §1 saying every user
  hook and every user-returned cleanup runs under isolation, so a throwing
  component degrades alone — plus one back-reference above `$mount()`.
- **What to add:** one test in the shape of `Base.spec.ts:330`, with a component
  whose `mounted()`, `destroyed()` and cleanup all throw, asserting a sibling
  still mounts. Six guards, one test.
- **Why this outranks the rest:** `SIZE.md` §R7 measured that deleting all eleven
  saves 0.12 kB gzip. Someone reading only that number, and finding no test in
  the way, has every incentive to delete them.

### 2.2 `createServiceMixin` forwards its own options into the service cache key

`mixin.ts:188` calls `definition.use(target(this), options)` with the **whole**
mixin options object. `withDrag`'s `use` is
`(target, options) => useDrag(target, options)` (`drag.ts:465`), and `useDrag` is
`perTarget(…)`, keyed by `JSON.stringify` over the arguments. So the mixin's own
`manual` and `immediate` become part of the service identity.

_Measured_ with a throwaway probe (since deleted):

```js
useDrag(el, { manual: true }) !== useDrag(el, {}); // two services, one element
useDrag(el, {}) === useDrag(el, {}); // same options, same service
```

Drag is the only mixin affected — the other four ignore `use()`'s second
argument. §4.1 states what it costs at runtime.

- **What to write, and where:** a line in `perTarget()`'s doc (`service.ts:255`)
  saying the key must contain only what changes _what is observed_, and a line at
  `mixin.ts:188` about what is forwarded.

### 2.3 Two ported components hand-roll `toggle()` because their comments say v4 has no equivalent

`migration/ScrollAnimation/withScrolledInView.ts:82` states that
`$services.enable('ticked')` / `disable('ticked')` has "**no v4 equivalent**",
and line 202 repeats it. Both then write
`this.__unsubscribeFrame ??= useRaf().subscribe(…)` / `?.(); = null` — which is
`toggle()` line for line. `migration/Slider/SliderItem.ts:96–108`
(`#startTicking`/`#stopTicking`) is the same shape.

`migration/REPORT.md:496` records this gap as **resolved** by `toggle()`, and
`REPORT.md:93` maps `$services.enable('ticked')` → `toggle(…)`.
`mixin.spec.ts:322–435` proves `withRaf(Base, { manual: true })` + `$services` is
the second answer. The framework has two; the ported components know neither.

This is also the answer to "is `toggle()` earning its place": yes — the two
components that needed it re-implemented it because a stale comment said it did
not exist.

- **What to write, and where:** fix the comments in `withScrolledInView.ts:82,202`
  and `SliderItem.ts:96` to point at `toggle()` and `{ manual: true }`. If the
  ports are meant to be exemplary, use them.

### 2.4 `CAPTURED_EVENTS` implements a feature two design documents say is not supported

`Base.ts:187` lists nine non-bubbling events delegated from the capture phase,
including `mouseenter`/`mouseleave`/`pointerenter`/`pointerleave`.
`DESIGN.md:374` documents the mechanism and argues it carefully. But
`DESIGN.md:354` says "`mouseenter`/`mouseleave` do not bubble: these two keep
direct binding (**accepted limitation**)", and `index.ts:55–56` says "Not in this
prototype: … non-bubbling child events (mouseenter/mouseleave)".

_Read:_ the mechanism works and is tested for `focus` (`Base.spec.ts:751`) and
`scroll` (`:884`). The four hover events have **no test and no consumer** — `rg`
finds no `onXMouseenter`-shaped handler in `migration/` or `demo/`.

This needs a decision rather than an edit: `mouseenter` fires on _every_ element
the pointer enters, so a capture-phase listener on a component root hears far
more than a delegated `click` does. The two docs may be recording a deliberate
limitation the implementation quietly outgrew, or a real reservation the
implementation ignores.

- **What to write, and where:** decide, then make `DESIGN.md:354`,
  `DESIGN.md:374` and `index.ts:55` agree. If the hover events stay, they need the
  test the other five have.

### 2.5 `DESIGN.md:402` names a consumer for `$emitExtendable()` that the ported code contradicts

`rg 'emitExtendable|waitUntil'` over `migration/` and `demo/` returns nothing.
`DESIGN.md:402` states "`Dialog` becomes `await this.$emitExtendable('close')`",
but `migration/Dialog/Dialog.ts:109–121` uses `$emit('open')`/`$emit('close')`
plus `Promise.all(this.transitions.map((t) => t.enter()))` over two
`$watchChildren` collections, and its header lists three v4 decisions without
mentioning the negotiation.

The mode is **not** a removal candidate: it has 481 lines of spec, and the
intended consumer is ui's `MotionView` (`DESIGN.md:402,424`). Note the contrast
with the take-over mode, which is in the same position but _does_ explain itself
— `migration/Data/dom-update.ts:12–18` says why the ported copy of ui's protocol
stays.

- **What to write, and where:** beside the Dialog claim in `DESIGN.md`, that the
  in-repo port deliberately uses live children collections instead — so the doc
  stops asserting a consumer the code contradicts.

### 2.6 `registry.ts:516` — the registry/manifest guard before `$terminate()`

Every name reaching that point via `controllers` or `loaders` is registry- or
manifest-known by construction, so `(registry.has(name) || manifest.has(name))`
looks redundant. It is not: `Base.ts:1030–1031` puts **every** instance into
`el.__base__` from the constructor, including a hand-built `new Foo(el)` — which
`migration/ScrollAnimation/ScrollAnimation.spec.ts` does. Without the guard, an
element carrying a manually-constructed instance of an unregistered class gets
`$terminate()`d the first time a mutation makes `scan()` visit it — and `scan()`
visits it _because_ `el.__base__` is set (`registry.ts:541`).

- **What to write, and where:** one sentence in the comment above
  `reconcileElement` (`registry.ts:503`): the registry only ends identities it
  owns, because `__base__` also holds hand-built instances.

### 2.7 Three undocumented guards in `context.ts`, each defending against a foreign provider

None has a test or a comment, and all three exist because the WICG
`context-request` protocol is a _page-wide_ event that other libraries also
speak. `context.ts` says so once, in the `subscribe` field comment (lines
166–176), and never connects it to the guards it explains.

| Site             | Guard                                        | What it defends against                                                                                                                      |
| ---------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `context.ts:203` | `provider instanceof Node ? provider : null` | a third-party provider calling `detail.provide()` _after_ dispatch, when `currentTarget` is `null`                                           |
| `context.ts:394` | `detail?.key !== key`                        | a foreign `context-request` on the page — Lit's `ContextEvent` carries its fields on the event, not in `detail`                              |
| `context.ts:334` | `providerNode === mountedEl`                 | a provider element re-announcing itself; a correct fast path, but it also means such an element can never re-answer with a _different_ value |

The third is additionally contradicted by its own doc: lines 298–319 enumerate
"exactly the set of consumers whose answer can have changed" as two `contains()`
calls, and commit `086fe358` says "Cost is bounded by two `contains()` calls" —
the code has three conditions.

- **What to write, and where:** one clause each, plus a back-reference from all
  three to the `subscribe` comment that already states the premise.

### 2.8 `raf.ts:54` — `renders.length = 0` depends on a decision in another file

`renders` is drained every frame that produced any (`raf.ts:57–58`) and pushed
only from inside the wrapper callback (`raf.ts:83`). The one path that could push
outside a frame is `createService`'s `{ immediate: true }` delivery
(`service.ts:190`), which is closed only because `hasProps: () => false`
(`raf.ts:45`). So the leading reset is a safety net whose necessity lives in a
different module. No test targets it, and it arrives with the original feature
commit `f8942dea`, not with a fix.

- **What to write, and where:** a comment at `raf.ts:54` naming the
  `hasProps: false` coupling — otherwise deleting it makes `raf.ts` silently
  depend on that flag never changing.

### 2.9 `scroll.ts:64` — the `typeof window` guard reads as an SSR promise

`supportsScrollEnd`'s `typeof window !== 'undefined'` is the **only** environment
guard in `packages/v4/src`, and it protects _module evaluation_: this is the only
eager top-level `window` access in the package. Nothing in `DESIGN.md` or
`package.json` mentions SSR, and every spec runs in Chromium, so no test
exercises it.

- **What to write, and where:** a comment at `scroll.ts:64` saying the guard is
  for module evaluation and not a claim of SSR support — or make the probe lazy
  (first `start()`) and delete it, which also removes an eager IIFE from a hot
  module.

### 2.10 `scheduler.ts` — a stale doc line and an unexplained `.catch`

Two small ones in the same file.

`scheduler.ts:218` says `whenIdle()` "resolves once every queue is empty **and no
flush is scheduled**". `#isIdle()` checks queues only, and deliberately — the
comment on it and the spec `never keeps whenIdle() waiting`
(`scheduler.spec.ts:281`) both require that a tick subscription, which keeps a
flush permanently scheduled, must not block it. The second clause is simply
stale; drop it.

`scheduler.ts:69` puts `.catch(reportError)` on `scheduler.postTask()`. Without
it, an exception escaping `#drainBackground()` — from a `whenIdle` resolver, say
— becomes an unhandled rejection instead of a reported error, and only on the
native branch, not the `MessageChannel` one. The surrounding comment explains the
choice of transport, not this catch. No test.

### 2.11 `registry.ts:345` — the strategy re-check in `isCurrentPair()`

The other four conditions are covered by the comment at `registry.ts:329–333`;
this one is not, and it reads as redundant with `schedule()`'s own
`current?.strategy === strategy` early return. Its real job is the window between
a synchronous `data-mount` write and the background batch that reconciles it: an
`IntersectionObserver` or `media:` trigger can fire against the old strategy in
that gap. **Where:** one line inside `isCurrentPair`.

### 2.12 `registry.ts:453` — `scheduleLoad()` re-spells `resolveStrategy()`'s precedence chain

It genuinely cannot call `resolveStrategy()` (no class exists yet) and
`DESIGN.md` §11b spells the chain out, but nothing at the site says "same chain,
with the manifest entry standing in for the class config". The rationale lives
250 lines away in `registerManifest`'s doc. **Where:** a one-line back-reference,
so the two copies do not drift.

### 2.13 `getHandlerNames()` has no doc comment at all

`Base.ts:947–962`. The only function of its size in `Base.ts` without one, in a
file averaging one JSDoc block every 25 lines. Two things a reader cannot infer:
why the walk stops at `Base.prototype`, and why the value is re-read from the
_instance_ rather than the prototype (so a handler written as a class field
wins). **Where:** above the function.

### 2.14 `withPointer` is the only one of five service mixins with no test

_Verified by `rg` over the package:_ `withPointer` (`pointer.ts:186`) has zero
references outside its own declaration, its subpath stub and the `index.ts`
re-export — including zero in `mixin.spec.ts`, where its four siblings are
exercised.

It is **justified by symmetry**: `usePointer` alone would make `moved()` the one
service hook with no mixin form, and the family is the documented shape
(`index.ts:28–30`). A design reason, not an accident — so category 2, not 1.

- **What to add:** the test its four siblings have. A mixin nothing exercises is
  a mixin nobody will notice breaking.

### 2.15 `viewTransition.ts` — three branches, one test

`viewTransition.spec.ts` has a single case, the native happy path. Untested: the
`typeof document.startViewTransition !== 'function'` fallback (lines 51–59), both
`reject` fan-outs, and the `vtRunning` serialisation of a batch queued while a
transition is in flight (lines 41–43, 62–69). The behaviour _is_ documented in
the function's doc comment; only the coverage is thin. Worth a regression test
rather than a change — and note the fallback is what every non-Chromium browser
takes today.

### 2.16 `registerComponent`'s duplicate-name warning has no test

`registry.ts:172–175`. The code is right and documented (`DESIGN.md:900`, "like
`customElements.define`"), and the _silent_ half — same name, same class, which
is what terminates `registerFamily`'s recursion — is asserted by
`autoload.spec.ts:570`. The _warning_ half, two different classes claiming one
name, is untested, while `registerManifest`'s equivalent has two tests
(`autoload.spec.ts:281`, `:302`). Three lines to close.

### 2.17 `context.ts:355` — the document mount listener is never removed

`isMountListenerAttached` is set once and never reset, so after the last
subscription is cancelled the listener stays for the life of the page and every
mount pays the `subscriptionIndex.size === 0` early return (line 322). The
comment explains only that nothing is attached at import time. **Where:** say
that detaching is deliberately not done, and why the early return is the cheaper
trade.

### 2.18 `media.ts:75` — `const key = query.trim()`

Justified: `media.spec.ts:37` "shares one service per query, whatever the
spacing" fails without it. Undocumented: the line has no comment, and the
function's doc says only "One service per query string", which `trim()` quietly
contradicts. A reader also cannot tell the normalisation is deliberately shallow
— `'(min-width:30rem)'` and `'(min-width: 30rem)'` still key two services.

### 2.19 Four comments that are now factually wrong

Small, but each actively misleads:

| Where                                 | Says                                                                                   | Actually                                                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `migration/utils/inView.ts:37–56`     | `perTarget()` "keys a `WeakMap` by the target alone and drops the remaining arguments" | pre-`d7c8f01d` behaviour; it now keys by target **and** serialised arguments. The conclusion (it still cannot carry `root`) survives; the stated reason does not |
| `migration/Track/AbstractTrack.ts:64` | v4 "does not ship" `memo`                                                              | `utils/memo.ts` is shipped and has a `./utils/memo` subpath                                                                                                      |
| `SERVICES-SURFACE.md` §5              | "`props()` has one consumer in the whole package"                                      | two since `667c4a04` — `responsive-options.ts:104` is now the hottest `props()` call in the package, one per option read                                         |
| `utils/maths.ts` header               | the file holds "only what is actually used"                                            | `lerp` (§1.8) has no consumer; `spring`/`MAX_SPRING_RATIO`/`smoothTo` are consumed only by each other, and are public API for consumers outside this repo        |

The last row is worth one extra line in `maths.ts`: `smoothTo` and `spring` are
v3-parity **public utilities** with strong specs (`smoothTo.spec.ts` is 167
lines and documents the v3 bug it fixes), not framework internals. Saying so
stops the next audit from flagging them.

---

## 3. Justified and documented — leave alone

**About 115 branches**, counted across the audit: ~40 in `services/`, ~25 in
`registry.ts`/`mount-strategies.ts`/`instances.ts`, ~25 in `Base.ts`, ~25 in
`context.ts`/`scheduler.ts`/`swap.ts`/`dom-mutations.ts`/`decorators.ts`. Every
one has a named regression test, a source comment stating the failure it
prevents, or a fix commit — usually all three.

Representative, one line each so the shape is visible:

- **`services/`** — the snapshot fan-out with `isActive` (`service.ts:143`),
  `Subscription` records instead of a `Set` of callbacks (`service.ts:113`),
  raf's per-subscription render cancellation (`raf.ts:79`), `useScroll`'s
  `documentElement` redirect (`scroll.ts:306`), resize's observer +
  `resize`-listener pair (`resize.ts:59`), pointer's `activePointerId` filter
  (`pointer.ts:93`), drag's four-gate click guard and `touch-action` ownership
  check (`drag.ts:355`), and `MixedClass`'s `Pick<T, keyof T>` — which looks
  gratuitous and is not (`mixin.ts:95` records the TS2510 it avoids;
  `SERVICES-REVIEW.md` §6 records the TS2425 the `Omit` alternative hit).
- **`registry.ts`** — `isClassLike()` (`registry.ts:66`, commit `64d589a7`, test
  `autoload.spec.ts:484` — and note it uses the non-writable `prototype`
  descriptor, naming `fn.toString()` only to explain why _that_ was rejected);
  every branch of `resolveComponentClass()`; the never-retried `imports` map;
  `scheduleLoad`'s `fired` latch; the two `manifest.delete(name)` calls, where the
  second drops an _alias_ token (`autoload.spec.ts:350`).
- **`Base.ts`** — all four dev warnings, each with a test asserting the
  deduplication too (`toHaveBeenCalledOnce` across repeated reads); the eight
  `$emit` type helpers, each with a JSDoc naming the alternative that fails and
  pinned by `props.spec.ts`; both ref spellings and the namespace form, with the
  v3 lineage and the named `@studiometa/ui` consumers; `belongsTo`/`isRefOf`; the
  longest-name-first handler resolution.
- **core** — `memo()`'s `has()`-over-`get()` split (`memo.ts:88`, `memo.spec.ts:20`);
  `signal()`'s abandon-and-restart delivery loop (`context.ts:80`, four specs,
  `REPORT.md` gap 17); the `WeakMap` + `WeakRef` subscription registry
  (`context.ts:229`); `deliver()`'s `Object.is` short-circuit; the scheduler's
  phase double-buffering, `[1, 40]` delta clamp, background time slice and
  `MessageChannel` fallback; all of `swap.ts` — the shallow-clone parsing context,
  the script-identity diff and `childrenOnly` each explained and each with a spec;
  `whenDOMSettled()`'s microtask double-take (`dom-mutations.ts:328`).

Two sit on the boundary and are left in category 3 deliberately:

- **`PairController.active`** (`registry.ts:21`) flips in lockstep with the
  map-identity check `isCurrentPair` already performs, and none of the four
  current strategies has a teardown that re-enters synchronously. It is insurance
  against a strategy that does not exist yet — cheap insurance, not unnecessary
  code, but the weakest member of the category.
- **`@read`** (`decorators.ts:262`) has no consumer in `migration/` or `demo/` —
  only `@write` does, in `demo/components/Accordion.ts`. It is one line over the
  shared `inPhase()` factory and the symmetric half of a pair; removing it costs
  more than it saves.

---

## 4. Not over-engineering — three latent defects found while checking guards

Reported here because the audit found them, not because they belong to it. None
is fixed in this branch: each needs a regression test, and this document is an
audit.

### 4.1 One element can hold two `DragService` instances

The mechanism is §2.2. The consequence: `withDrag(Base, { manual: true })` and
`withDrag(Base)` on the same element produce two services, so that element gets
**two `pointerdown` listeners, two `touch-action` writes, and two teardowns
racing on `previousTouchAction`**. `target` is a function and `JSON.stringify`
drops it, so that key is harmless; `manual` and `immediate` are not.

_Measured_ with the probe in §2.2. No test covers a mixin option changing the
service key — `drag.spec.ts:413` only varies `dampFactor`/`dragThreshold`, which
_should_ change it. Fix: `createServiceMixin` strips `target`/`manual`/`immediate`
before calling `use()`.

### 4.2 An `<svg data-component>` mounts but never reconciles

`scan()` narrows with `instanceof Element` and casts (`registry.ts:535`);
`processMutations` narrows with `instanceof HTMLElement` (`registry.ts:616`).
`SVGElement` extends `Element`, not `HTMLElement`.

_Measured_ with a throwaway probe (since deleted): an `<svg data-component="X">`
mounts on insertion, and a subsequent `data-option-*` write produces no
`option<Name>Changed()` call. The same holds for `data-component` and
`data-mount` rewrites.

Either narrowing is defensible — support SVG roots, or reject them at the door.
The two disagreeing is not.

### 4.3 A one-shot `$inject` silently drops the teardown its own contract promises

`ContextCallback` (`context.ts:141`) documents "**Returning a function registers
the teardown for that answer**", and `InjectContextOptions.onProvide` is typed as
`ContextCallback<T>` (`context.ts:163`). That promise is kept only in the
subscribed path, through `deliver()` (`context.ts:292`). In the unsubscribed path
the return value of `onProvide?.(...)` is discarded (`context.ts:515`), so
`$inject(key, { onProvide: () => cleanup })` without `subscribe: true` leaks the
cleanup with no warning. _Read:_ no test covers it — `context.spec.ts` exercises
teardowns only under `subscribe: true` (line 707).

Fix either way: honour the teardown on `cancel()`, or narrow `onProvide`'s type
in the one-shot case and say so on `ContextCallback`.

---

## 5. What I expected to find and did not

**A pile of dead public API. There isn't one, and the sweep that says otherwise
is measuring the wrong thing.** A naive unused-symbol pass over `packages/v4`
flags `registerManifest`, `until()` and `swap()` as "spec only". All three are
wrong:

- `registerManifest` is the headline lazy-loading feature, with `DESIGN.md` §11
  behind it and 29 tests in `autoload.spec.ts`. That `migration/` declares no
  manifest says something about the ports, not about the feature.
- `until()` is argued for at `DESIGN.md:709` — `isScrolling` is documented as the
  flag "a component waiting for a scroll to finish should read", and there was
  nothing to wait _with_. `DESIGN.md:713` adds the structural reason: `toggle()`
  and `until()` are what the uniform `Service<T>` interface is _for_, and until
  they existed nothing consumed it.
- `swap()` is a `DESIGN.md` §10 core primitive with its own module and four modes.

The lesson for anyone repeating this audit: in a private prototype at version
`0.0.0`, "no consumer in this repository" is not evidence. Only the combination
of no consumer, **no test, and no design-doc paragraph** is — which is why §1 has
ten items and not forty.

**A `ServicesManager`-shaped eager import.** `SIZE.md` §2.3 already established
v4 did not inherit v3's shape. Nothing here changed that.

**Over-engineered type-level machinery.** The opposite. The `$emit` type helpers
are the most heavily justified code in the package: each of `Emits`, `EmitName`,
`EmitDetail`, `PayloadOf`, `EmitArgs`, `ArgsOf`, `PropsOf` carries a JSDoc naming
the naive alternative and the exact failure it causes — deferred conditionals
over a naked type parameter, invariance breaking `$query`'s return type. The one
place I went looking for gratuitous cleverness is the one place every choice is
already defended in writing.

**Duplication worth collapsing.** `SIZE.md` §R7 priced it at under 0.12 kB
gzipped; this audit reaches the same conclusion from the other direction. Of the
seven duplicated shapes listed there, exactly one (§1.1) is worth removing, and
for correctness rather than for size.

**Both `SERVICES-SURFACE.md` findings settled.** They are not. Only two commits
touched `services/` after 2026-08-13 (`d7c8f01d`, `991b1efc`), and neither
touches emission phase or `props()` nullability. §4's three recommendations are
all unadopted — `createService` still carries `R` as a type parameter only, drag
inertia still emits inside `defaultScheduler.tick`, and `DESIGN.md` §8 still
frames the sampled/discrete rule as open. §5 is likewise open, and its evidence
needs the correction in §2.19.

---

## 6. Method, and what it does not cover

- **Untested claims** were established by deleting the guard, rebuilding
  (`npm run build:v4`, ~1.4 s) and running `npm run test:v4` (48 files, 637
  tests, ~20 s), then reverting with `git checkout -- packages/v4/src`. Four such
  sweeps are quoted: two in §2.1, one in §1.2, one in §1.9.
- **Behavioural claims** (§4.1, §4.2) were established with a throwaway
  `src/probe.spec.ts` run against the real suite and deleted afterwards. The
  working tree carries neither.
- **Unused claims** were established with `rg` across `src/`, `migration/`,
  `demo/` and the specs, counting a symbol's own spec as _not_ a consumer, and
  excluding `migration/REPORT.md` — it is prose, not a call site.
- **Justification claims** were checked against the file's own comments,
  `DESIGN.md`, `SERVICES-REVIEW.md`, `SERVICES-SURFACE.md`, `migration/REPORT.md`
  and `git log -S`. Commit hashes are quoted where a guard arrived with a fix.

Four limits worth stating:

1. **A green suite is not a proof of unreachability.** §1.9 is flagged for that
   reason; §1.5 and §1.2 rest on reading both sides of the one call, not on the
   suite.
2. **Coverage was not usable.** `vitest --coverage` reports 0 % under browser mode
   without instrumentation, so "is there a test" was answered by deletion rather
   than by a report. That is slower but stronger — it answers "does a test
   _fail_", which is the question that matters.
3. **`migration/` is ten families, not a user base.** Everything §1 says about
   consumers is bounded by that, and §5 is the warning that follows.
4. **Prose was not audited for accuracy beyond what the code contradicted.**
   §2.19 lists four wrong comments, all found while checking something else.
   There are almost certainly more.
