# Size — where v4's bytes are, and what would remove them (2026-08-14)

Measured against `origin/main` at `f98d3e93`, `npm run build -w @studiometa/js-toolkit-v4`,
Node 24, esbuild bundling `packages/v4/dist`, `gzip -9`.

**The headline: v4 is already under 10 kB gzipped on the metric that matters —
9.14 kB for everything a page pays to run one component.** So the question is not
"how do we get there", it is "what keeps it there, and what is the floor if the
budget tightens". This document answers both, and every number in it was produced
by building the package and measuring, not by counting lines.

Everything marked _measured_ was produced by an actual build. Everything marked
_measured on a patched build_ was produced by editing `src/`, rebuilding, measuring
and reverting — the patch scripts are described in §6 so any number here can be
disagreed with by re-running it.

Companion document: `SIMPLIFY.md` asks what v4 could stop _doing_ rather than
what it costs. Where the two overlap — the duplication of §R7, the
`registry.ts` → `Base.ts` edge of §R2 — they cross-reference rather than repeat,
and one conclusion here was corrected by that audit (§R7).

---

## 1. What "under 10 kB gzipped" has to mean

The number depends entirely on which of three things is counted, and the three
differ by a factor of nine. Naming one is the first job.

| Candidate                 | What it is                                                                       | Baseline _(measured)_                                                                  |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **A — one component**     | `Base` + `registerComponent` and their transitive graph, as a bundler ships them | **9.14 kB gzip** (24.93 kB min, 8.30 kB brotli), 15 modules                            |
| **B — critical path**     | what a `registerManifest()` bootstrap costs before the page is interactive       | **9.20 kB gzip** bundled; **45.96 kB gzip / 15 requests / 5 RTT** served as published  |
| **C — the whole package** | every runtime export in one bundle                                               | **16.44 kB gzip** (44.94 kB min); `dist/` is 106 modules, 208.77 kB raw, 82.72 kB gzip |

**This document uses A as the metric.** It is the only one of the three that
answers a question a user asks. C is the easiest to quote and the least
meaningful — nobody imports every export, and the package is deliberately
unbundled so that nobody has to. B matters, but it is a _different_ budget with a
_different_ answer, and §4 shows it is the one with the largest available
reduction, so it is reported alongside A throughout rather than folded into it.

Two things A deliberately excludes:

- **Decorators.** A component written with `@on`/`@component` imports
  `./component`, which is 9.23 kB gzip — 0.09 kB over `./registerComponent`,
  because `decorators.ts` re-uses the graph `Base` already pulled. Adding
  decorators to the metric would move it by 1 %, so it is left out to keep the
  comparison to a single fixed pair.
- **The barrel.** `import { Base } from '@studiometa/js-toolkit-v4'` is
  15.75 kB gzip / 29 modules. That is the bundler-convenience path; it costs
  6.6 kB more than the two subpaths a component actually needs, and it is
  tree-shaken back down by any bundler that sees the whole graph. Quoting the
  barrel as "v4's size" would overstate it by 72 %.

### The per-export baseline

The equivalent of what `.github/workflows/export-size.yml` reports in CI, run
locally over `packages/v4`. Top 12 of 76 runtime exports, gzip kB:

| Subpath                | gzip  | brotli | min   | modules |
| ---------------------- | ----- | ------ | ----- | ------- |
| `.`                    | 15.75 | 14.23  | 43.45 | 29      |
| `./component`          | 9.23  | 8.35   | 25.16 | 17      |
| `./registerManifest`   | 9.21  | 8.35   | 25.21 | 16      |
| `./registerComponents` | 9.15  | 8.31   | 24.98 | 16      |
| `./registerComponent`  | 9.14  | 8.30   | 24.94 | 16      |
| `./Base`               | 7.52  | 6.79   | 19.49 | 14      |
| `./swap`               | 3.91  | 3.55   | 9.39  | 4       |
| `./SWAP_MODES`         | 2.99  | 2.69   | 6.99  | 4       |
| `./withDrag`           | 2.57  | 2.34   | 6.16  | 7       |
| `./on`                 | 2.33  | 2.08   | 5.07  | 17      |
| `./utils`              | 2.32  | 2.13   | 5.03  | 11      |
| `./useDrag`            | 2.25  | 2.03   | 5.38  | 7       |

The 60 exports below `./useRaf` are all under 1 kB gzip; 40 of them are under
0.3 kB. The long tail is not where the weight is.

---

## 2. Where the bytes are

Per-module weight inside the metric-A bundle, from esbuild's metafile
(`bytesInOutput` — post-tree-shake, pre-minify, total 25 526 B). _Measured._

| Module                   |  bytes | share |
| ------------------------ | -----: | ----: |
| `Base.js`                | 10 491 |  41 % |
| `registry.js`            |  4 514 |  18 % |
| `context.js`             |  1 922 |   8 % |
| `dom-mutations.js`       |  1 885 |   7 % |
| `scheduler.js`           |  1 884 |   7 % |
| `services/breakpoint.js` |    879 |   3 % |
| `mount-strategies.js`    |    875 |   3 % |
| `negotiated-events.js`   |    861 |   3 % |
| `responsive-options.js`  |    753 |   3 % |
| `viewTransition.js`      |    532 |   2 % |
| `services/service.js`    |    394 |   2 % |
| `utils/memo.js`          |    278 |   1 % |
| `utils/strings.js`       |    143 |  <1 % |
| `lifecycle-events.js`    |     50 |  <1 % |
| `utils/selectors.js`     |     47 |  <1 % |

Two structural facts follow, and they set the shape of everything in §4.

### 2.1 `Base` is one indivisible unit

41 % of the metric is a single class. **No bundler tree-shakes a class method.**
`$provide`, `$domUpdate`, `$emitExtendable`, `$viewTransition`, `$watchChildren`,
`$query`, `$closest` and `$watchAttributes` ship to a component that uses none of
them, and they drag their imports in with them: `context.js`, `negotiated-events.js`
and `viewTransition.js` are in the graph above _only_ because methods on `Base`
reference them.

Priced by deleting the members and rebuilding — _measured on a patched build_:

| Members removed from `Base`                                    |    metric A |      saving |
| -------------------------------------------------------------- | ----------: | ----------: |
| baseline                                                       |     9.14 kB |           — |
| `$provide` `$inject` `$injectSync`                             |     8.42 kB |     0.72 kB |
| `$viewTransition` `#negotiated` `$domUpdate` `$emitExtendable` |     8.60 kB |     0.54 kB |
| `$watchChildren` `$query` `$closest`                           |     8.88 kB |     0.26 kB |
| `$watchAttributes`                                             |     9.03 kB |     0.11 kB |
| **all eleven**                                                 | **7.47 kB** | **1.67 kB** |

The eleven together are 18 % of the metric. They are not dead code and nothing
here argues for deleting them — §4 R3 is about _where they live_, not whether
they exist.

### 2.2 `registry.js` imports `Base.js`, and that is the whole critical path

`registry.ts:1` is `import { Base, resolveConfig, … } from './Base.js'`. `Base`
is used for exactly one thing — `isComponentClass()`'s
`value === Base || value.prototype instanceof Base` — and `resolveConfig()` does
not touch `Base` at all; it walks a constructor's prototype chain and merges
`static config` objects.

That one edge means **a page whose components are all lazy still downloads `Base`
and its entire subtree before it can register the manifest.** It is the exact
shape `autoload` and `data-mount` were built to avoid, defeated by an
`instanceof`.

### 2.3 What v4 did _not_ inherit from v3

v3's `Base/managers/ServicesManager.ts` statically imports all five `use*`
services, so any v3 component pulls 16 of `Base`'s 36 modules for services it may
never touch. **v4 does not have this.** _Read:_ no module in `packages/v4/src`
statically imports more than one service. The only service that reaches a
default component's graph is `services/breakpoint.js`, pulled by
`responsive-options.ts:41`, and it costs 0.45 kB gzip (§4 R6). That is a 35×
smaller version of the same shape, not a repeat of it.

---

## 3. What the package ships, versus what a bundler emits

`dist/` is **not minified** — `packages/v4/scripts/build.js` passes no `minify`
option, and neither does `packages/js-toolkit/scripts/build.js`. The emitted
modules keep every JSDoc block, and v4's sources are heavily commented by design.

This splits the audience in two, and only one half is described by metric A:

| Consumer                        | What they download for metric A's graph    |
| ------------------------------- | ------------------------------------------ |
| Bundler (Vite, webpack, Rollup) | 9.14 kB gzip — it minifies and tree-shakes |
| CDN serving files as published  | **45.96 kB gzip**, 15 requests, 5 RTT deep |
| CDN serving files minified      | **13.23 kB gzip**, 15 requests, 5 RTT deep |

_Measured_: each module of the graph gzipped individually, which is what a
browser actually pays per request. `126.46 kB` raw becomes `29.43 kB` raw when
the same modules are minified in place, still unbundled, still one file per
source module.

**The comments are 71 % of the CDN cost of v4.** That is by far the largest single
number in this document, and it costs a bundler user nothing.

---

## 4. Ranked reductions

Ranked by measured saving on the metric each one moves. "Size" is the size of the
change, not of the saving.

|     | Reduction                             | Moves        | Saving _(measured)_        | Risk    | Size |
| --- | ------------------------------------- | ------------ | -------------------------- | ------- | ---- |
| R1  | Ship `dist/` minified                 | B, as served | −32.7 kB gzip (−71 %)      | low     | XS   |
| R2  | Break `registry.ts` → `Base.ts`       | B            | −5.31 kB gzip, −4 requests | low     | S    |
| R3  | Optional `Base` methods off the class | A and B      | −1.67 kB gzip (−18 %)      | high¹   | L    |
| R4  | Strip dev warnings from production    | A, B, CDN    | −0.74 kB gzip (−8 %)       | low²    | S–M  |
| R5  | `morphdom` behind a dynamic import    | `./swap`     | −1.99 kB gzip (−51 %)      | low     | XS   |
| R6  | Responsive options lazy               | A and B      | −0.81 kB gzip (−9 %)       | medium³ | M    |
| R7  | Collapse duplicated code              | —            | **< 0.12 kB gzip**         | low     | M    |

¹ On API design, not correctness — it changes the `$method` idiom. ² On
correctness; medium on choosing a guard that does not silence the warnings for
the audience they were written for. ³ It trades against a `DESIGN.md` decision.

**Do R1, R2 and R5 now** — together they cost nothing in API surface, are all
small, and R2 is already validated against the full test suite. **Decide R4 on
the guard question**, not on the byte count. **Hold R3 and R6** unless the budget
is cut below 8 kB.

### R1 — Ship `dist/` minified · CDN slice 45.96 → 13.23 kB gzip (−71 %)

_Measured on the emitted modules._ Minify each `dist/*.js` in place, unbundled,
one output file per source module. The graph shape is unchanged: still 15
requests, still 5 RTT, still one shared copy of every module across entry points.
Combined with R2 the CDN critical path is **6.76 kB gzip over 11 requests**.

- **Saving:** metric B (as served) −32.7 kB gzip. Metric A **0** — a bundler
  already does this.
- **Cost:** published modules stop being readable in devtools. Source maps are
  already emitted next to them (`build.js` runs a `sourcemap: true` pass), so the
  mitigation exists; it has to be verified to still resolve after minification.
- **Risk:** low. Nothing about the module graph or the export map changes.
- **Size:** one option in `packages/v4/scripts/build.js`. It is a project-wide
  decision, though — v3 ships unminified too, and the two packages should agree.
- **Caveat:** some CDNs (esm.sh, jsDelivr's `/+esm`) already minify what they
  serve, so this recovers nothing for those users. It recovers everything for
  unpkg, jsDelivr's raw file paths, and any self-hosted copy of the package.

### R2 — Break the `registry.ts` → `Base.ts` edge · critical path 9.20 → 3.89 kB gzip (−58 %)

_Measured on a patched build, full test suite green._ Move `resolveConfig()` and
its `WeakMap` cache into a new `src/config.ts` — it has no runtime dependency on
`Base`, only on the `BaseConfig`/`BaseConstructor` types — and replace
`isComponentClass()`'s `instanceof Base` with a brand: a `COMPONENT` symbol
declared in `config.ts` and set as a static on `Base`, which every subclass
inherits through the constructor chain.

| Metric                            | before                    | after                         |
| --------------------------------- | ------------------------- | ----------------------------- |
| B — manifest bootstrap, bundled   | 9.20 kB gzip              | **3.89 kB gzip**              |
| B — manifest bootstrap, as served | 45.96 kB / 15 req / 5 RTT | **22.66 kB / 11 req / 4 RTT** |
| A — one component                 | 9.14 kB gzip              | 9.15 kB gzip                  |

- **Saving:** metric B −5.31 kB gzip and −4 requests. Metric A **+0.01 kB** —
  one more module boundary, which is the honest price.
- **Cost:** `instanceof Base` stops being the test for "is this a component".
  A brand is weaker: a class that copies the static would pass. In exchange it is
  the only test that works across two copies of the package, which `instanceof`
  never did.
- **Risk:** low, and evidenced — `npm run test:v4` passes on the patched build
  (48 files, 636 passed, 1 expected fail; identical to `main`).
- **Size:** one new ~40-line module, two edits in `Base.ts`, two in `registry.ts`.
- **Why this is first among the real reductions:** it is the only one that moves
  the number `autoload` exists to move, and it costs the metric-A budget nothing.

### R3 — Move `Base`'s optional methods off the class · metric A 9.14 → 7.47 kB gzip (−18 %)

_Measured on a patched build_ (§2.1). Eleven methods on `Base` are paid by every
component whether or not they are called, because a class body is atomic to every
bundler. As free functions taking the instance — `provide(this, key, value)`,
`domUpdate(this, mutate)` — they are tree-shakeable, and the modules they pull
(`context.js`, `negotiated-events.js`, `viewTransition.js`) leave the default
graph with them.

- **Saving:** metric A −1.67 kB gzip (−4.90 kB min). Metric B −1.66 kB.
- **Cost:** **this is a trade, not a free win.** The `$method` idiom is the v4
  API. `this.$provide(k, v)` reading as `provide(this, k, v)` is a real
  ergonomic loss and a real migration, and it splits the surface into "methods"
  and "functions on a component" with no rule a reader can guess. A middle path —
  opt-in mixins, `class Foo extends withContext(Base)` — keeps the call sites but
  reintroduces the mixin ceremony v4 removed.
- **Risk:** high, on API design rather than on correctness.
- **Size:** large. Eleven methods, their types, their docs, every call site and
  every spec.
- **Recommendation:** do not do this to hit 10 kB, which is already met. Keep it
  as the answer if the budget is later cut to 8 kB.

### R4 — Strip developer-mistake warnings from production builds · metric A 9.14 → 8.40 kB gzip (−8 %)

_Measured on a patched build._ Ten `console.warn` sites across `Base.ts` (4),
`registry.ts` (3), `negotiated-events.ts` (2) and `responsive-options.ts` (1),
plus the state that exists only to deduplicate them —
`reportedLiteralDefaults`, the `checked` set threaded through `buildRefs`, and
`checkResponsiveAttributes()`'s whole body. Their message strings alone are
2.4 kB of source, and prose gzips _worse_ than code relative to its size because
it shares almost nothing with the tokens around it.

| Metric               |   before |       after |
| -------------------- | -------: | ----------: |
| A — one component    |  9.14 kB | **8.40 kB** |
| `./Base`             |  7.52 kB |     6.77 kB |
| `.` barrel           | 15.75 kB |    14.98 kB |
| CDN slice, as served | 45.96 kB |    43.95 kB |

The `console.error` sites are **not** included and should not be: they report
runtime failures in user code (`mounted()` threw, an importer rejected) and
belong in production.

- **Saving:** metric A −0.74 kB gzip.
- **Cost:** the guard has to be strippable, and the obvious guards are all
  compromised for v4's audience:
  - `process.env.NODE_ENV !== 'production'` is replaced by Vite, webpack and
    Rollup production builds, so it strips by default — but it throws
    `ReferenceError: process is not defined` on the no-build `<script type="module">`
    path v4 explicitly supports.
  - `typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'`
    is safe everywhere and still folds to `false` under a production define — but
    it silently turns the warnings **off** for the no-build audience, which is
    the audience the warnings were written for (`warnLiteralDefault`'s own
    doc comment says so: "this is the same rule said out loud for the no-build
    path, which never sees a type").
  - v3's existing `isDev` (`packages/js-toolkit/src/utils/is.ts`) is
    `typeof __DEV__ !== 'undefined' && __DEV__`, which no bundler folds unless
    the consumer defines `__DEV__`. _Read:_ nothing in this repository defines it.
    So v3's dev-stripping does nothing by default today.
  - The only shape that keeps warnings for the no-build path _and_ strips them
    for bundler users is **two published trees behind the `development` /
    `production` export conditions** — which Vite and webpack both honour. That
    is not bundling (both trees stay unbundled and one-to-one with `src/`), but
    it doubles the published tree and the subpath generator has to emit both.
- **Risk:** low on correctness, medium on getting the condition right.
- **Size:** small if a single guard is chosen (10 sites + 3 helpers); medium for
  the two-tree option (`build.js` and `scripts/generate-subpaths.js`).
- **Recommendation:** worth doing, and the export-conditions variant is the one
  that does not trade the feature away. Decide the guard before the sites.

### R5 — Load `morphdom` only when `swap()` morphs · `./swap` 3.91 → 1.92 kB gzip (−51 %)

_Measured._ `swap.ts:1` statically imports `morphdom`, but `swap.ts:100` calls it
in one of four modes. A page that only ever uses `replace`, `before` or `after`
downloads 1.99 kB gzip of DOM-diffing it never runs.

- **Saving:** 1.99 kB gzip for every `swap()` user who does not morph. Metric A
  and B: **0** — `swap` is not in either graph, which is the design working.
- **Cost:** `morph` mode becomes asynchronous on first use. `swap()` already
  returns a promise, so the signature does not change; the first morph on a page
  gains one network round trip.
- **Risk:** low.
- **Size:** one `await import('morphdom')` inside the morph branch.

### R6 — Make responsive options lazy · metric A 9.14 → 8.33 kB gzip (−9 %)

_Measured on a patched build_ (stubbing `responsive-options.js`, which also
removes `services/breakpoint.js` and most of `services/service.js`). Responsive
options are unconditional by design — `DESIGN.md` states every option is one —
and the cost of that decision is now priced: **0.81 kB gzip on every page**,
including pages where no component declares a single breakpoint-scoped
attribute.

- **Saving:** metric A −0.81 kB gzip; metric B −0.33 kB.
- **Cost:** **this is a trade with a design decision, not a defect.** Making it
  lazy means either (a) the registry only wires the responsive cascade when it
  sees a `data-option-…:<breakpoint>` attribute, which makes an attribute added
  later at runtime invisible until something re-scans, or (b) responsive options
  become opt-in per component, which is the "add an option that names a thing"
  configuration the project has ruled against.
- **Risk:** medium — (a) changes observable behaviour in a way that is hard to
  test for and easy to hit with server-rendered fragments.
- **Size:** medium.
- **Recommendation:** price it, do not spend it. 0.81 kB is not worth
  reintroducing a "did the framework see my attribute" failure mode.

### R7 — Collapse the duplicated code · under 0.12 kB gzip · **not worth doing for size**

There is real duplication in v4, and it is worth reading as a maintenance
finding. It is not worth anything as a size finding, and the number says so.

_Read_, the concrete pairs:

| Duplication                                                                                                                                                                    | Copies |          Each |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -----: | ------------: |
| Error-isolated "run these callbacks" (`$destroy`, `$terminate`, `#clearOptionEffects`, three identical option-cleanup blocks, `mounted`/`destroyed`/`terminated`) in `Base.ts` |      9 |    6–11 lines |
| `WeakMap<Element, Map<string, X>>` dispose bookkeeping — `disposeController()` `registry.ts:377` vs `disposeLoader()` `registry.ts:422`                                        |      2 |     ~12 lines |
| Singleton-service memoisation — `raf.ts:116`, `pointer.ts:158`, `breakpoint.ts:264` (`perTarget()` absorbs the keyed case; there is no equivalent for the no-argument one)     |      3 |       4 lines |
| Instance lookup by name — `Base.$query()` `Base.ts:1224` vs `getInstances()` `instances.ts:175` (plus `$closest()` and the delegation walk)                                    |      4 |    5–12 lines |
| `data-option-${kebabCase(name)}` composed inline — `Base.ts:786`, `registry.ts:295`                                                                                            |      2 |        1 line |
| The resolve-all / reject-all batch tail in `viewTransition.ts:51` and `:61`                                                                                                    |      2 |      ~9 lines |
| Config-chain walk — `resolveConfig()` `Base.ts:879` vs `optionAttributes()` `registry.ts:290`, which re-derives the merged option set `resolveConfig` already computed         |      2 | 28 / 16 lines |

Priced with the crudest possible upper bound — _measured on a patched build_ that
**deleted all eleven `try`/`catch` wrappers in `Base.ts` outright**, keeping only
their bodies: metric A 9.14 → **9.02 kB gzip** (24.93 → 24.24 kB min). Removing
error isolation entirely, which nobody would do, is worth 0.12 kB. Factoring the
copies into one helper is worth strictly less than that.

The reason is gzip. Minified `Base.js` is 11.4 kB, comfortably inside one 32 kB
deflate window, so the second and third copies of an identical block cost a back
reference rather than the block. **Duplication that a reader notices is
duplication the compressor has already removed.** Fix these for the maintenance
reasons — `optionAttributes()` re-deriving what `resolveConfig()` caches is a
genuine divergence risk, and `registry.ts:85–92` flags that exact class of bug
twice in its own comments — but do not expect the size report to move.

`SIMPLIFY.md` §2.1 takes the same eleven `try`/`catch` blocks from the other
side and reaches a stronger conclusion: six of them have **no regression test**,
so the 0.12 kB above is not just a small win, it is a small win with nothing
standing in its way. Do not take it.

**Correction (2026-08-14, from `SIMPLIFY.md` §1.1).** This section originally
said the config-chain row was worth doing _for_ R2, because `resolveConfig()`
moving to `config.ts` is what would make `optionAttributes()`'s private walk look
like the outlier it is. That gate does not exist: `registry.ts:1` **already
imports `resolveConfig`**, so collapsing the hand walk to
`Object.keys(resolveConfig(ComponentClass).options ?? {})` is a standalone
~8-line deletion available today, independent of R2. It is still not a size win —
it is a correctness one, and `SIMPLIFY.md` §1.1 carries it.

### Not recommended

- **Bundling anything.** Ruled out on 2026-08-10 and nothing measured here
  argues against that ruling: a bundled entry mixed with any subpath yields two
  `Base` classes and the instance registry silently returns nothing. Every
  reduction above is graph flattening, deferred loading or lazy resolution.
- **Trimming the long tail.** 40 of the 76 exports are under 0.3 kB gzip. Merging
  them would save nothing measurable and would cost the per-symbol subpaths that
  make the CDN path work.
- **Dropping `utils/memo.js`, `utils/strings.js`, `utils/selectors.js`.** 0.08,
  0.06 and 0.01 kB gzip respectively in metric A. Below the noise floor.
- **Deduplicating code to save bytes.** R7. Under 0.12 kB gzip for the largest
  candidate.

---

## 5. Is 10 kB reachable, and what is the floor

**Yes, and it is already met: 9.14 kB gzip today, with 0.86 kB of headroom.**

Stacking the three reductions that do not trade a feature away — R4 (dev
warnings), R2 (registry/`Base` flattening) and R3 (methods off the class) —
_measured together on one patched build_:

| Metric                            |             today |                       R4+R2+R3 |     +R6 |
| --------------------------------- | ----------------: | -----------------------------: | ------: |
| A — one component                 |           9.14 kB |                    **6.80 kB** | 6.07 kB |
| B — manifest bootstrap, bundled   |           9.20 kB |                    **3.86 kB** | 3.53 kB |
| B — manifest bootstrap, as served | 45.96 kB / 15 req | **6.76 kB / 11 req** (with R1) |       — |
| `./Base` alone                    |           7.52 kB |                    **5.17 kB** |       — |
| `.` barrel                        |          15.75 kB |                       14.33 kB |       — |

**The floor for metric A is about 5.2 kB gzip**, and what makes it the floor is
`Base` itself: 41 % of the metric is one class, and after the eleven optional
methods are gone what remains is not optional. The mount/destroy/terminate
lifecycle, the live `$refs` view, the `$options` readers, `$emit`/`$on`/`$off`
and the `on<Thing><Event>` handler binding are what a component _is_. They cannot
be tree-shaken, they cannot be deferred (a component needs them on its first
frame), and splitting them across modules moves bytes between files without
removing any.

Below 5.2 kB the only remaining moves delete features, which is out of scope for
this document.

Headroom, stated plainly: v4 sits 0.86 kB under 10 kB with the eleven optional
methods, the dev warnings, the responsive cascade and the `Base`-in-the-registry
edge all still in. **The risk is not that 10 kB is unreachable — it is that the
next feature added to `Base` costs the last 0.86 kB.** R4 and R2 together buy
2.3 kB of headroom for a small, low-risk, fully-tested change, and that is the
argument for doing them now rather than when the budget is already breached.

---

## 6. Method

Every number here can be reproduced. Nothing in this document is checked into
`packages/v4`; the measurement scripts were throwaway and are described rather
than shipped, because the repository already has the two tools that matter.

- **Per-export sizes (§1).** `packages/js-toolkit/scripts/measure-graph.js` does
  this for v3 and takes an entry from a package's `exports` map; the same routine
  over `packages/v4/package.json` produces the table, with `gzip -9` in place of
  brotli. CI runs the canonical version:
  `.github/workflows/export-size.yml` → `weareikko/export-size@1` over
  `@studiometa/js-toolkit-v4:packages/v4` after `npm run build`.
- **Metric A / B bundled (§1, §2).** esbuild `bundle: true, minify: true,
format: 'esm', target: 'esnext'` over a two-line entry importing `Base` from
  `dist/Base.js` and `registerComponent`/`registerManifest` from
  `dist/registry.js`, then `gzipSync(level: 9)`. Per-module weight from the same
  build's `metafile.outputs[…].inputs[…].bytesInOutput`.
- **Metric B as served (§3).** The transitive graph walked from `dist/` with the
  relative-specifier regex from `measure-graph.js`, each module gzipped
  **individually** — one request, one gzip stream, which is what a browser pays.
  Dynamic `import()` is deliberately not followed: it is a request the consumer
  opted into, not part of the entry's cost. RTT depth is the longest import
  chain.
- **Removal experiments (§2.1, §4).** Two kinds. Where a module could be removed
  wholesale, an esbuild `onLoad` plugin replaced it with a no-op module exporting
  the same names, which prices the module _and_ everything only it pulled. Where
  the change was inside a module (`Base`'s members, the warnings, the registry
  edge), `src/` was patched by script, `npm run build:v4` re-run, the bundle
  re-measured and `git checkout -- packages/v4/src` run to revert. The R2 patch
  was additionally validated with `npm run test:v4` (48 files, 636 passed,
  1 expected fail — identical to `main`).
- **The duplication upper bound (R7).** A script walked `Base.ts` matching braces,
  replaced each `try { body } catch (error) { … }` with `{ body }`, and the
  package was rebuilt and re-measured. Eleven blocks, 0.12 kB gzip in total.
- **What was deliberately _not_ measured.** Real-network effects. Every number
  above is bytes and request counts; on a real connection the 5-deep import chain
  of metric B is likely to matter more than the bytes, and R2 shortens it to 4.
  That is a claim this document does not evidence.
