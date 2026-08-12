# Services review — clean-room experiment (2026-08-12)

Adversarial review of `packages/v4/src/services`, carried out as a clean-room
experiment: **17 confirmed defects**, plus API-level findings for `DESIGN.md`
section 8.

Six independent agents, two axes. Three implemented a written specification of
the frozen public API without ever seeing this repository; two designed a public
API from a brief that stated the problem and gave no API; one reviewed the API
surface adversarially. Convergence between agents that could not see each other
is the signal this document is built on.

Everything marked **confirmed** was reproduced in Chromium against
`packages/v4/src/services` with `vitest --browser`, or type-checked with
`tsc --strict`. Claims that did not survive verification are in §5.

> **Status: implemented.** Every defect below is fixed on
> `feature/v4-services-hardening`, each with a regression test that fails
> before its commit and passes after. The three open decisions of §3 were ruled
> on: (1) a raf render whose subscriber left mid-frame is **cancelled**; (2) the
> scroll settle keeps the `scrollend`-or-fallback probe, **no watchdog**;
> (3) `touch-action` is **set on a drag target when the computed value is
> `auto`**, and restored on teardown. The direction booleans became
> `directionX`/`directionY` as `-1 | 0 | 1`. `DESIGN.md` §8 records the outcome,
> including the three claims of its own that §1 and §5 falsified.

> The six agent outputs (three implementations with their `NOTES.md`, two API
> designs, one 871-line API review) and the two input documents live outside the
> repository, in `~/.claude/cleanroom/js-toolkit-services/`. They are reference
> material, not deliverables — every finding below is restated here in full. Ask
> if you want a specific one copied in.

---

## 1. Confirmed runtime defects (13)

| #   | Defect                                                                                                                                                                                                                                                                                                                                                                                                                                 | Evidence                                                                          | Found by |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- |
| 1   | `createService` keys subscribers in a `Set` **by the callback**, so the same function cannot subscribe twice: it is called once, and the first unsubscribe tears the service down under the second holder.                                                                                                                                                                                                                             | 1 call instead of 2, then `stop`                                                  | me, B, C |
| 2   | A `useRaf` render collected in the read phase still runs in `write` after its subscriber unsubscribed.                                                                                                                                                                                                                                                                                                                                 | render ran after unsubscribe                                                      | me, B, C |
| 3   | `DragService`'s click guard reads persistent `distance*`, so after any real drag it suppresses **every** later click — including keyboard activation of a link inside the target.                                                                                                                                                                                                                                                      | `link.click()` cancelled                                                          | me, B, C |
| 4   | `inertiaFinalValue` is an unbounded loop; `dampFactor` is clamped to `0.99999`, giving ~690 k iterations twice per drop.                                                                                                                                                                                                                                                                                                               | **2.3–4.4 ms blocking** in one `pointerup`                                        | me, B, C |
| 5   | `PointerService` only updates position on `pointermove`, so a `pointerdown` with no preceding move — every touch tap — reports a stale position, and `changed*`/`delta*`/`last*` are stale on down/up.                                                                                                                                                                                                                                 | `x: 207` for a `pointerdown` at `clientX: 42`                                     | me, B, C |
| 6   | `ResizeService`'s `ResizeObserver` on `document.documentElement` watches that element's content box, not the viewport, so a viewport-only height change never fires it.                                                                                                                                                                                                                                                                | observed height **3000** vs `clientHeight` **896**                                | me, B, C |
| 7   | Two mixin layers with the same hook name silently collapse to one subscription.                                                                                                                                                                                                                                                                                                                                                        | 0 emits, no warning                                                               | me, B, C |
| 8   | `ScrollService` never re-measures extents when content grows; only a `window` `resize` or a scroll event refreshes them.                                                                                                                                                                                                                                                                                                               | content 500→5000 px, `maxY` stayed **400**                                        | me, B, C |
| 9   | `PointerService` merges every pointer — no `isPrimary`/`pointerId` filter. A second finger's `pointerup` sets `isDown: false` while the first is still down.                                                                                                                                                                                                                                                                           | `isDown` false mid-gesture                                                        | me, B, C |
| 10  | `PointerService` retains its last `PointerEvent` after teardown, pinning the event's `target` and the detached subtree above it for the life of the page.                                                                                                                                                                                                                                                                              | event reachable, `isConnected: false`                                             | B, C     |
| 11  | RTL scroll containers report negative progress: `scrollLeft` is negative while `maxX` stays positive.                                                                                                                                                                                                                                                                                                                                  | `scrollLeft -500`, `maxX 900`, **`progressX -0.56`**                              | B        |
| 16  | **`DragService.drop()` emits before subscribing its inertia tick.** A subscriber that unsubscribes during the `drop` update (a component that unmounts on drop) triggers the service teardown while `unsubscribeTicks` is still `null`; `drop()` then subscribes a tick that nothing can ever release. The frame loop runs for the life of the page, computing inertia and emitting into a dead service. Silent — no emits, no errors. | **12 extra frames requested in 6**, still climbing; `emits after teardown: 0`     | A        |
| 17  | `BREAKPOINTS` is documented as being "in `rem` so they follow the root font size". In a **media query**, `rem` resolves against the _initial_ font size, not `html`'s — so `html { font-size: 62.5% }` does not move any breakpoint.                                                                                                                                                                                                   | at viewport 414 px, `xs` (30rem) failed to match at root `10px` **and** at `32px` | A        |

### Type-level defects (4)

| #   | Defect                                                                                                                                                                                                                           | Evidence                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 12  | `ServiceCallback<T>` returns `unknown`, so `RafRender` constrains nothing. `useRaf().add(() => 42)` compiles. A stray function return — e.g. from an assignment expression — is silently executed as a DOM mutation every frame. | compiles clean under `--strict` |
| 13  | No prop is `readonly`, and scroll/resize/pointer/drag hand the **same** object to every subscriber. `useScroll().add((p) => { p.y = 999 })` compiles and corrupts every other subscriber on the page.                            | compiles clean                  |
| 14  | A custom `hook:` name loses its props typing entirely: `ScrollHook` declares only `scrolled`, so `panelScrolled(props: RafProps)` is unchecked.                                                                                  | see §3                          |
| 15  | Props-object identity is inconsistent between services: `useRaf` allocates per frame, `useScroll` reuses one object. Both are typed `Service<T>`.                                                                                | measured                        |

### Smaller, agreed

`ratio` is `Infinity`/`NaN` on a zero-height element; `progress === 1` for an axis
that cannot scroll ("you are at the end" for an empty carousel); `setBreakpoints()`
never re-emits, so a stale `breakpoint` survives until an unrelated resize;
`useScroll(document.documentElement)` silently forks the document scroller into a
second service; `useDrag` excludes `SVGElement`, and our own documented
`target: (i) => i.$el.querySelector('.handle')` example would not type-check;
`console.error` in the fan-out reaches no error reporter — `reportError()` does.

---

## 2. Where the fix is sharper than what I first proposed

- **Defect 6 needs both mechanisms, not a swap.** C's reasoning: the `ResizeObserver`
  on `documentElement` is what catches a **scrollbar appearing or disappearing**,
  which changes the layout viewport width with _no_ `resize` event; and
  `documentElement`'s box does _not_ change when a long page's viewport height
  changes, which is what the `resize` event catches. Keep both.
- **Defect 3 wants four gates, not one.** C: threshold, disarm on the next
  `pointerdown`, `event.isTrusted`, and `event.detail !== 0`. The last two are
  what exclude synthetic and keyboard-driven activation.
- **Defect 8 is the most expensive fix anyone proposed.** B and C independently
  converged on a `ResizeObserver` over the scroller _and its children_ plus a
  `childList` `MutationObserver`, because "a scroll container's own box never
  grows with its content". Decide whether that cost is warranted or whether
  staleness is acceptable.
- **Breakpoints belong on `matchMedia` change listeners.** Four agents
  independently. Two reasons beyond tidiness: `matchMedia` fires on **crossings**
  rather than every resize frame, and it is the only mechanism that reports a
  **root font-size change** — which `rem` breakpoints depend on and our
  resize-triggered rescan misses entirely.
- **Damping must be time-based.** All three closed forms are exact; C's
  `1 / -ln(damp)` stays finite at `damp = 0` and isolates the `damp = 1`
  singularity, and A's `k = 16.67/ln(1/damp)` with `finalX = x + v·k` makes the
  settle position an **invariant along the coast** rather than an accumulation,
  then snaps the position onto it at `stop` so the drop's promise holds to the
  pixel. Velocity should be px/ms from `event.timeStamp` through an EMA, so a
  1000 Hz mouse and a 125 Hz trackpad throw the same flick.
- **Publishing is re-entrant, so guard after every emit.** Defect 16 is the
  general case: any code that emits and _then_ mutates its own state can be
  torn down inside the emit. A ran into it via its test suite; the fix is an
  `isRunning` check after every publish, not just in `drop()`.
- **The scroll settle needs a failsafe, not just `scrollend`.** A keeps a
  tick-based watchdog _alongside_ `scrollend` so `isScrolling` can never stick —
  the opposite of C's conclusion that the two are mutually exclusive. Both are
  reasoned; the difference is whether a missing `scrollend` (programmatic
  scrolls on some engines) is worth defending against.

## 3. Genuine open decisions

Cases where independent agents reasoned to **opposite** conclusions. These need a
ruling, not a fix.

1. **A render whose subscriber left mid-frame (defect 2).** B and C cancel it; designer
   D deliberately keeps it — _"it is that gesture's or that loop's last paint."_
   The resolution is conditional: a self-terminating animation wants its last
   paint, a destroyed component must not get one. Only the mixin layer can tell
   the difference; the service cannot.
2. **Whether the scroll settle needs a failsafe.** C: `scrollend` and a
   quiet-period watchdog are mutually exclusive, because a finger held still
   produces no events while the gesture is alive. A: keep a tick-based watchdog
   _alongside_ `scrollend` so `isScrolling` can never stick. The question is
   whether a missing `scrollend` — programmatic scrolls on some engines — is
   worth defending against. Ours currently picks one on a feature probe, which is
   C's position.
3. **`touch-action` on a drag target.** Nobody disputes that the gesture is
   mouse-only on touch without it (a native pan wins, `pointercancel` fires, and
   our `onPointerUp` turns that into an inertia fling). The options are: document
   it as the consumer's job, set it while the service runs — A and C both write
   it **only when the computed value is `auto`**, so consumer CSS wins — or use
   `setPointerCapture`. Note this also means R7.5 as I wrote it cannot be
   satisfied literally, which B caught.

---

## 4. API-level findings — where three independent agents agreed

| Finding                                                            | critique | design D | design E |
| ------------------------------------------------------------------ | -------- | -------- | -------- |
| Drag is not the same kind of thing as a sampled source             | ✓        | ✓        | ✓        |
| No honest cold `props()` for the clock, the pointer, or drag       | ✓        | ✓        | ✓        |
| `breakpoint` does not belong in the size props                     | ✓        | ✓        | ✓        |
| `last*` / `changed*` are derived, not fields                       | ✓        | ✓        | ✓        |
| The string-keyed mixin must go                                     | ✓        | ✓        | ✓        |
| A typed handle for the sub-mount span, not `$enable('name')`       | ✓        | ✓        | ✓        |
| The resize-only first-emission asymmetry is wrong                  | ✓        | ✓        | ✓        |
| Drop drag's `isGrabbing` / `hasInertia` / `target`                 | ✓        | ✓        | ✓        |
| Direction as one value, not four booleans                          | ✓        | ✓        | ✓        |
| `subscribe`, not `add`                                             | ✓        | —        | ✓        |
| One frame-aligned emission phase for **all** sources, not just raf | —        | ✓        | ✓        |

D and E independently named the sub-mount-span helper **`toggle`**, with
near-identical signatures — replacing `manual` + `$enable`/`$disable` + the
symbol map (~40 lines) with a ~15-line source-agnostic wrapper that also works
outside a component.

### The deepest argument against our mixin layer

D: under C5 (`Base` knows nothing about services) detection must be opted into at
every class — `extends withScroll(Base)`. So **v3's actual convenience cannot be
preserved by any C5-compliant design**. The mixin keeps the _look_ of `scrolled()`
while the author still edits the class declaration, so it buys no migration
continuity — it only shortens a subscription, and pays with string keying,
untyped hooks under a custom name, string enable/disable verbs, and threading the
component's generic through a mixin chain. Our `MixedClass = Pick<T, keyof T> & …`
with its TS2510 comment is the scar from that last cost; D predicted it without
seeing the code.

### Precise verdict on the typing (measured, correcting the critique)

- Default hook name: **props are typed**. `ticked(props: ScrollProps)` on
  `withRaf(Base)` is a **TS2416 error**, and an unannotated parameter is an
  implicit-any error under `strict`. The critique's claim that the hook's props
  cannot be typed even in principle is too strong.
- Custom hook name: **typing is lost** (defect 14).
- Renaming a hook: **compiles, ships, silently stops updating.** The critique's
  central scenario is real and unmitigated — nothing calls `$enable`, so our
  runtime warning never fires.
- `$enable('typo')`: compiles, but ours _does_ `console.warn` at runtime, so this
  one is mitigated.

---

## 5. Claims that did not survive verification

- `getBreakpoints()` leaking a mutable live set — we return a copy.
- A pre-existing `--strict` error in `scheduler.ts` — our project and that file
  both type-check clean; an artifact of the agent's isolated `lib` settings.
- Negative `max` from subpixel rounding — not reproducible in Chromium.
- The critique's phase argument (F20) assumes raf callbacks run in `tick`; ours
  run in `read`. The one-frame lag it describes is ordinary read-before-write
  ordering — document it, do not "fix" it.
- The critique's F6b framing that `isDown` is _new_ churn — v3 shipped
  `isUp/isRight/isDown/isLeft` **and** `direction: {x, y}`. The collision with
  `PointerProps.isDown` is inherited; what is new is that v4 dropped the
  non-colliding spelling and kept the colliding one.

## 6. Where we are already ahead

- Not listening to `scroll` in the capture phase on `document` — C flagged that
  v3's approach fires for every element scrolling anywhere. Our per-target,
  non-capturing listener is right, and our source comment already says why.
- `scrollend` **or** a quiet-period fallback, never both — C: a finger held still
  produces no events while the gesture is alive, so the two are mutually
  exclusive. Ours picks one on a feature probe.
- Checking `typeof this[hook] === 'function'` at **subscribe** time — C hit the
  trap that a hook written as a class field does not exist during a field
  initialiser.
- Stacked mixins with a custom hook name and the component's own props type
  type-check clean under `--strict`; C hit TS2425 with an `Omit`-based approach
  that our `Pick`-on-the-constructor avoids.
- One observer per target rather than a shared one: E flagged this as a claim it
  could not verify, and `Service.bench.ts` already answers it.
- Coalescing pointer events would collapse a down+up in one frame; ours emits
  presses synchronously.
