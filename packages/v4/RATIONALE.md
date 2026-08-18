# v4 design rationale

[DESIGN.md](./DESIGN.md) states what v4 does. This file states why, which options were refused, and what the measurements are. The section titles match, so each link from `DESIGN.md` lands here.

A rule in this file is often the record of a defect. Where that is the case, the defect is named, because it is the evidence that the rule is necessary.

## Core model

An instance exists because its element is in the document and its class is registered. Parent and child are DOM ancestry, not ownership. This removes the two-sided handshakes of v3, in which a parent constructed its children and a child had to find its parent.

Three forks were decided together.

**Custom elements as the mount primitive were refused.** `data-component` improves a native element — `<form>`, `<a>`, `<details>`, table markup — and it carries several components on one element. Custom elements do neither.

**`provide/inject` ships in core** with the shape of Vue and the mechanics of the WICG context protocol. The `Data*` components of `@studiometa/ui` rebuild on it.

**The `on<Child><Event>` method names stay.** They are the no-build path, and delegation makes them cheaper than the per-child binding of v3.

## 1. Independent components

### Why a move destroys and mounts again

A moved element gives one removal record and one addition record. Both sides must announce, so that `$watchChildren` on the old ancestor removes the child and `$watchChildren` on the new ancestor adds it. The real-browser test suite found this: when a still-connected moved element skipped the destroy, both watchers broke silently.

Open for later: an opt-in path that preserves state through a move, once the semantics of `Node.moveBefore()` are considered.

### Why termination went away

A third lifecycle notion earned its place only if something needed it, and by the end nothing did. `terminated()` had no override outside the specs that existed to test it. `$terminate()` had one production caller, the registry, on a withdrawn declaration — which is a registry bookkeeping step, not a state a component reaches. And the two registrations it released, `$provide` and `$watchChildren`, both sit on things that already die on their own: the provider on the element, the watcher on the instance.

What it did earn was a leak. `$watchChildren` released a `document` listener from a terminate callback, and ordinary teardown never gets there — removing an element calls `$destroy()`. A `document` listener is a strong reference from the document to the instance, so every watching component stayed alive for the life of the page. The concept was not paying for itself; it was hiding a bug, and one that was fixed by removing the reference rather than by finding more ways to call `$terminate()`.

Two consequences are accepted rather than worked around:

- **A withdrawn declaration no longer releases the provider.** A component whose token leaves `data-component` while its element stays keeps providing context until the element goes. `$provide()` returns the value rather than a disposer, so termination was the only door out, and that door was never the right shape. Releasing a provider early wants its own answer.
- **Re-adding a token re-mounts.** Nothing latches "never again" any more. The registry drops the instance from the element, so declaring the name again builds a new one and mounts it — which is what the responsive crossing already expected on the way back.

`mount` and `destroy` are now the whole vocabulary, and both are reversible. That is one fewer word to explain, and one fewer word that meant two things.

### Why `mounted()` returns its cleanup

The cleanup lives in the same closure as the resource that it releases. There is no instance field and no paired `destroyed()` code, and the symmetry is guaranteed for each mount cycle. This matters because `data-mount` strategies mount the same instance many times.

The hook keeps the name `mounted`. In Vue, "setup" means "runs before mount", which is not what this is, and `mounted()` stays familiar to the authors of v3.

### Refs: the list suffix, and why there is one spelling

A rule that declared the `[]` suffix and then selected the unsuffixed attribute was tried and reverted. It turned correct `@studiometa/ui` markup into a silent no-op (REPORT.md gap 11). It also bought nothing: the suffix says in the markup what the markup is, one of several and not the only one. To accept both spellings would be a compatibility layer over a decision that is made.

### Refs: why the namespace lives in the markup only

`FigureShopify` declares `refs: ['img']` once, inherited from `AbstractFigure`. Its templates write `data-ref="img"` three times and `data-ref="FigureShopify.img"` once, and each template chooses by how deeply the image is nested. To move the namespace into the declaration would force one component to pick a single spelling for every template, and it would make an inherited ref impossible to declare, because `AbstractFigure` cannot know the name of the subclass that will use it.

The plain form and the namespaced form answer two different questions — who is my nearest owner, and who is my named owner — into one property.

`@studiometa/ui` writes the namespaced form three times, and all three are a ref inside a presentational component: `data-ref="App.form"` reaches the form of a `Frame` from the app root, and `data-ref="FigureShopify.img"` reaches an image inside a `Transition`.

### Refs: the cost of two spellings, and the cache

A second spelling costs the cold lookup only, and a split query buys it back. `[data-ref="a"],[data-ref="b"]` loses the single-attribute fast path of Chromium. Over a subtree of 25 elements, a cold lookup went from 8.0 µs to 11.2 µs when it matched, and from 1.2 µs to 3.4 µs when it did not. Two separate queries cost 8.7 µs and 2.1 µs instead. Document order is restored with `compareDocumentPosition` only when one ref is written both ways under the same component.

Resolution on every access was expensive: a ref list of 25 elements measured about 26 times slower than the mount-time snapshot of v3. The cache fixes that. Reading the version drains the pending records with `takeRecords()`, which keeps the cache correct inside the same task: the records enter the shared queue before the read returns, so synchronous ref correctness never steals registry work.

### Measurements against v3

Benchmarked in `packages/tests/__benchmarks__/v3-vs-v4.bench.ts`. Both sides work synchronously, so the comparison is work per operation and not scheduling.

| operation                        | result                             |
| -------------------------------- | ---------------------------------- |
| mount a list of 25 children      | v4 ~3.6× faster                    |
| resolve descendants (`$query`)   | v4 ~7× faster                      |
| resolve an ancestor (`$closest`) | v4 ~8.6× faster                    |
| read `config`                    | v4 ~5.9× faster (cached per class) |
| read a ref                       | v4 ~2.5× slower                    |
| `$emit`                          | v4 ~1.8× slower                    |

The two regressions are understood. `$emit` pays for a bubbling, cancelable event through the tree, which is the feature. A ref read pays the version check that keeps it live, and it started about 26 times slower before the cache.

### Why the registry reads the merged config

Every subclass declares a `static config`, if only for its `name`. When the registry read the own static of a class, a subclass fell back to `eager` and registered nothing that its base declared, while its instances still announced and queried those children through `$config`. A `() => import(…)` child had no other registration path, so it disappeared. The name had the same defect: a subclass that declared options and forgot to rename registered under `undefined`.

### Why `withExtraConfig()` is deleted

v3's `withExtraConfig(Class, config, deepmergeOptions)` returned a subclass whose config was the original deep-merged with an override, renamed on a collision. It existed because v3 read the own static config of a class: a subclass could not add one option without restating everything of its parent. A merge along the prototype chain removes that reason, so the operation is a class declaration.

That is the whole translation of all three call sites in `@studiometa/ui` — `MapboxNavigationControl`, `MapboxGeolocateControl` and `MapboxFullscreenControl` — each of which overrides `createControl()` and needs a class body anyway. `@component({ name, options })` is the same thing with the registration included, and it takes a config object already. `src/config-extension.spec.ts` holds the proof.

Two behaviours of v3 are not reproduced:

- **The automatic rename.** v3 renamed a colliding result to `<Name>WithExtraConfig`, a name that nobody writes in HTML. `name` is required by `BaseConfig` and the registry is first-wins-and-warn, so a forgotten rename is a diagnostic and not a token invented by the machine. All three call sites already name their extension, so the branch was dead.
- **The deep merge.** Core ships its own `deepmerge` (`utils/deepmerge.ts`), but config is not where it belongs. `Base` merges config one level on purpose, because an option definition is a unit: a derived class that restates `theme` restates its type and its default, which is what "this option is different here" means. A deep merge would also have to reach into `default` factory functions, which it treats as opaque values.

### Why props are read through intersections

Inside a class body, `T` is a naked type parameter, and TypeScript resolves a conditional type only when its checked type is concrete. So `Options<T> = T['$options'] extends Record<string, unknown> ? T['$options'] : Record<string, unknown>` is deferred there, and every option reads as the fallback. `T extends ActionProps` fails in the same way, because the parameter is still naked. This cost the `Action` port its type parameter (REPORT.md gap 22).

An intersection has no gate: the apparent type of `A & B` is the intersection of the apparent types, so a declared half answers at once and a deferred half contributes its constraint. It also absorbs the two ways a key can be absent: `undefined & X` is `never` and drops out of the union, and `unknown & X` is `X`.

Two consequences:

- **A conditional over `T` makes `Base` invariant in `T`.** Two conditionals with different checked types are unrelated in both directions, so TypeScript measures invariance and `Base<SliderProps>` stops being assignable to `Base` — which is what `$query`, `$closest` and `$watchChildren` return, and what every helper that takes "some component" is annotated with. An intersection measures as covariant. The first attempt at this fix broke exactly this.
- **`$emits` needs a conditional.** `keyof (Declared & EmitMap)` is `string`, so an intersection would throw away every declared name. It reads `NonNullable<T['$emits']> & (unknown extends T['$emits'] ? EmitMap : unknown)`. The conditional is checked against `unknown`, the type that an omitted key reads as, so it fires for an omitted `$emits` and for nothing else, and its branches union to `unknown`, so a deferred instance contributes nothing. Everything after it is checked against the map and not against `T`. The one unavoidable conditional — a `void` payload takes no argument and a declared one is required — is written `void extends M[K] ? … : …`, so the checked type is concrete. The other way round, `$emit()` refuses every argument list that a generic component gives it.

### Why an option default is a primitive or a factory

`$options` reads its attribute on every access, because an attribute is the source of truth and stays live. A default is the opposite kind of value: it is not in the DOM, so it belongs to the instance that reads it.

A literal object or array default would live on the class, so two instances would share and corrupt one value. This is the shape that `data()` and the object prop defaults of Vue enforce, for the same reason.

**A literal default is warned about and not repaired.** A shallow copy made an unsupported declaration appear to work one level deep. A deep copy made core guess how to rebuild a `Date`, a `Map` or a class instance. Neither is the job of core when the contract already has an answer that works all the way down. The type-level ban settles it for anyone with a build step; the no-build path never sees a type, so the rule is said out loud once per declaration.

### Why `$options` has no setter

**An option is an input, never a store.** The view is built from getters alone, and the type now says so: `$options` is `Readonly<…>`, which is the type-level half of a rule the runtime already enforced — an assignment to a getter-only property throws a `TypeError` in a module, and it always did. What was missing was a compiler that agreed with it.

The real surface was counted rather than estimated: **nine assignments across three files of `@studiometa/ui`** — `Disclosure` five, `AccordionItem` two, `withIndex` two. Only `Disclosure`'s `enable()`/`disable()` pair is genuine reconfiguration, and both become one `removeAttribute()`/`setAttribute()` call. The rest is component state that was living in the wrong place: `AccordionItem.isOpen` and `Indexable.isReverse` are private fields seeded from their option, which is the shape both had to take in the port anyway.

Two setters were considered, and each fails on its own terms.

**A setter that writes the attribute back has no attribute to write.** Every option is responsive, so `open` is spelled by nine names — the base one and one per breakpoint — and the base attribute is silently outranked by `data-option-open:s` while the viewport is at `s`. A setter would have to pick one, and every choice is wrong somewhere: write the base name and the assignment does nothing visible at that breakpoint; write the active one and a component invents markup the author never wrote, which then survives the crossing back. The write also comes back as a mutation record, so it re-enters `option<Name>Changed()` as though the DOM had spoken — and a component which sets an option from inside its own change hook is a loop.

**A setter that shadows the value in memory is v3's `__values` cache**, whose consequence v3 shipped: `OptionsManager.get()` fills `__values[name]` on the first read of an `Array` or `Object` option and returns it forever after, so the attribute stops being the source of truth for exactly the options most likely to carry structure — and `set()` writes the shadow only, leaving the DOM saying something else. It also splits every read in two, into the DOM's answer and the shadow's, which is the question a derived read exists to not have.

**v3 already refuses this**, from the responsive half: `ResponsiveOptionsManager.set()` warns "Responsive options are read-only." In v4 every option is responsive, so a writable `$options` would make v4 **less** consistent than the version it replaces, not more.

**The readonly has one price, and it was measured rather than assumed.** `Readonly<…>` is a mapped type, and a mapped type over a props parameter is deferred for the same reason the conditional of gap 22 was: inside a class **generic in its props**, an option is no longer a type identical to the declared one. Nothing about reading it changes — it assigns to an annotated slot, it passes to a function, it typechecks — but two things stop compiling on their own: an identity assertion, and a variable inferred from one option then assigned from another. Across the fifteen ported families the whole cost is **one line** — `Cursor.moved()` annotates its `scale` — plus three assertions in `props.spec.ts` which move to the `assignableTo()` helper that file already had, and already used for `$el` in exactly the same generic classes. Concrete props, which is nearly every component, keep their exact types and their identity assertions.

What is left is not a hole, because the two replacements are already the documented idiom. Presence-only booleans made the DOM update a one-line statement, and the private field seeded from an option is the port's own precedent, found twice before this ruling was written. The type stops the mistake for anyone with a build step; the no-build-step audience — this framework's first-class one — is reached by a lint rule, which is a different item and not core's code.

### Responsive options: why there is no `responsive: true` flag

A prototype carried one and it was removed before the merge. Three reasons:

- It breaks the rule of the project: do not add an option whose only job is to name a thing. The framework already knows that the option exists, because it is in `config.options`, and the author who writes `data-option-columns:s` has already said what a flag would repeat.
- The flag arrives too late for the machinery that it gates. The scoped names must be in the filter of the observer at `registerComponent()`, so an option that nobody flagged could never grow a scoped attribute at runtime — silently, in a framework whose premise is that the attribute is live.
- The shorthand form `options: { theme: String }` has nowhere to put a flag, and it is as responsive as any other declaration.

### Responsive options: why the value is derived and not written

`$options` is read-only on purpose, and gap 2 of the port records the `@studiometa/ui` components that broke when it became so. An option that reacted to the viewport by being written would reopen that setter for the kind of value that has the least reason to be written: the DOM still holds the truth, and the viewport only says which part of it to read.

Derivation needs no setter, no invalidation and no staleness window. A component that reads `$options.columns` before a crossing and after it gets two different numbers because it asked twice, not because something raced to update it.

The case that derivation is supposed to lose — a component that must lay out again on a crossing — is covered by the existing option-change channel, because that channel was never a write path. It is a notification, and the value in `OptionChange` is read through the reader of the option at the moment the hook runs.

### Responsive options: why the suffix names one breakpoint

This is the one break with v3, which spelled a set such as `data-option-columns:xs:s`. Three reasons, in increasing weight:

- Set membership is what nothing else on the page means. The breakpoints are `min-width` queries and the utility classes beside them cascade. Only the toolkit did exact membership. "From `s` up" was `:s:m:l:xl:xxl:xxxl`, a list that silently stopped covering the top of the range on the day that a breakpoint was added. It is now `:s`.
- A set is not enumerable, and `attributeFilter` takes no wildcard. The powerset of eight breakpoints cannot be written down; `attribute × breakpoint` can. With the spelling of v3, v4 could not observe responsive attributes at all: `data-option-columns` rewritten at runtime would be honoured and `data-option-columns:s` ignored.
- Resolution stops being a scan. v3 read every attribute name on the element and tested each one with a regular expression, on every option access. The cascade walks a precomputed list of `attribute:breakpoint` names, which is what makes the derived read affordable.

The separator stays a colon, because a kebab-case option name can contain a dash — `data-option-columns-s` is ambiguous between `columns` at `s` and `columnsS` — and a colon can never appear in one.

The real cost was measured before the decision. Across `@studiometa/ui`, the v3 spelling is used by one component and two attributes, plus eight documentation examples.

### Responsive options: what the flag would have saved, measured

Measured in `responsive-options.bench.ts`, in Chromium:

- **The filter of the observer widens by about 9×.** It is 3 + 33 + 8 = 44 names across the ported families when one option opts in, and 3 + 33 × 9 = 300 when they all do. It costs nothing measurable: an unfiltered attribute write on the page (a `class` rewrite, the common case) and a filtered `data-option-*` write are both flat from 44 to 723 names, inside the noise. The engine does not scan the filter linearly. Re-observing does scale with it — `observe()` goes from 0.007 ms to 0.046 ms to 0.131 ms — but it runs once per registered class at startup, so a large app pays a few milliseconds once. Memory is a few hundred interned strings.
- **`data-option-no-<name>` is kept, and kept as a spelling rather than a rule.** v3 has it, `@studiometa/ui` writes it 33 times over 12 options, and it reads better than `="false"` for what is a flag. What it is not is a second grammar: it resolves to the string `false` and re-enters the one boolean rule, it cascades through the one breakpoint walk, and it is registered by the one filter. The alternative — refusing it and warning — was costed at twelve lines and rejected: the markup is not wrong, and a framework whose premise is that the attribute is the source of truth should read the attribute the audience already writes.
- **A boolean reads presence, and only presence.** The platform's own boolean attributes do: `disabled="false"` disables. Reading the string as well would give a component two ways to be off — a missing attribute and a particular value — and the two disagree the moment a template interpolates `{{ flag }}` into the attribute, which is the bug v3 shipped. One rule, stated in one line: the attribute is there or it is not. Code toggles it with `setAttribute`/`removeAttribute`, a template writes it inside a condition, and an option declared `default: true` is turned off by its negated spelling.
- **`noSort` needs no special case.** Its own off spelling is `data-option-no-no-sort`, so an option whose name starts with `no` collides with nothing. Only a component declaring both `sort` and `noSort` would make one attribute mean two things, and that is a mistake in a declaration — where a lint rule can see it — rather than a condition worth checking on every mount.
- **"My work is done" is a field, and there is no lifecycle notion for it.** v3's `$terminate()` kept a memory on the element and refused forever; v4's detached the instance, so the next mount pass built a fresh one which had never heard of the termination — the same word doing two different things. The answer was not a better termination but none at all: `$destroy()` leaves the instance where it is, so a plain field outlives every move, re-insertion and swap that keeps the element, and a replaced element gets a new instance, which is exactly when the work should happen again. The framework needed no mechanism for this. See "Why termination went away" below for the rest of what fell out with it.
- **Every read walks the cascade, and this cost was real.** In a loop, a read cost 4.70 µs against 0.052 µs for a plain `getAttribute()`, which is 91×. Nearly all of it was asking eight `MediaQueryList` objects for `.matches`. After the active breakpoint name was memoised, the same batched read is 0.38 µs, which is 12.3× faster, and 7.4× a plain attribute read instead of 91×. What is left is the cascade walk itself, up to nine `getAttribute()` calls instead of one, which is the feature.

### Why the memo lasts one task

A media query is re-evaluated when the viewport changes, and that change is delivered as a task. Script runs to completion before a task can run. So the active breakpoint is a constant for the length of a task, and a value dropped at the microtask checkpoint is exactly as fresh as a new query would be, for every read that it served. There is no staleness window to trade against a hit rate, which is what a `maxAge` would have been.

Two events cut the cache shorter, and both are stronger than the boundary. `setBreakpoints()` replaces the named set synchronously, which is a crossing that no `matchMedia` event announces. And the `change` handler of a running service knows that a crossing happened. Both share the one cache with the cold path.

Memoising a read did not turn a read into a subscription. Nothing here calls `addEventListener`, and `responsive-options.spec.ts` proves it: it crosses a breakpoint inside one task, reads the new value, and asserts zero registrations on `MediaQueryList.prototype` for the same window. The first read of a task still pays the full sweep, by design. The shape that this fixes is the real one — a handler, a `raf` callback, or a layout pass that reads several options across several instances.

### Why the breakpoint service stays in core

`Base` reaches `services/breakpoint.js`, which pulls `services/service.js`, on every page, whether or not any markup is responsive. A plugin seam was considered and refused: a responsive option is a basic feature and not an extra, and an option that resolves per breakpoint only if the page imported something is exactly the configuration that this design removes. This is a price, not an open question.

## 2. One registry

### Why one entry per name

One name gives one entry, as with `customElements.define`. A collision gives a warning and is ignored. A class and a lazy entry are two answers to "who owns this name?", not two schedulers.

### Mount strategies: the open questions of #751

- **One canonical constructor.** A strategy constructs nothing; it decides when the registry calls the mount and destroy hooks that it was given. Nothing wraps the class, so the identity conflicts that the issue describes cannot happen. `withMountWhenInView` is deleted and not kept, because a version that wraps a constructor would model the anti-pattern now that the framework owns this.
- **One-shot and reversible are separate values.** To mount again is right for a scroll animation and destructive for a map, a video or a form, so the choice is explicit and not inferred.
- **`interaction` uses intent, not replay.** `pointerenter`, `pointerdown` and `focusin` all happen before the interaction that they lead to, so the component is mounted before the click arrives.
- **The scope of an interaction is a parameter, not a second strategy.** "Aim at this element" and "the visitor is alive" are two different questions, and both are useful — one defers a component until it is about to be used, the other defers a whole widget until the visit proves it has a user. They are one strategy because they answer with the same fact and differ only in where it is heard, which is what `interaction:page` says and what a second name would have hidden. The scope also decides the event set: hovering an element is intent, hovering a document is not, so the page scope keeps the deliberate acts and drops `pointerenter`.
- **The page signal is shared, and it is a fact about the visit.** One listener set for the page rather than one per waiting element, and once it has fired an element arriving later mounts at once. The alternative — every waiting element with its own document listeners, each waiting for the next interaction — costs a hundred and fifty listeners for fifty components and makes "already interacted" mean nothing.
- **A component that waits has no instance.** Construction happens on the first mount and not at discovery, which is consistent with "an instance exists because it is mounted".

### Why an invalid strategy leaves the component unmounted

A fallback to `eager` would mount a map or a video that the author asked to defer. The inert controller stays current while the declaration does not change, so reconciliation does not retry and does not report twice. A failed strategy is isolated to its element and component pair.

## 3. One mutation engine

### What v3.9 did

v3.9 re-queries every registry entry and sweeps every live instance for each mutation batch. v4 resolves the effective token set from each inserted subtree in one pass and looks each token up in the registry.

### Why the vocabulary moved down into `attributes.ts`

The engine used to spell these names as string literals, because an import of their owners would close the cycle `dom-mutations → component-declarations → responsive-options → dom-mutations`. The engine and the registry then classified the same records against two copies of one vocabulary. `attributes.ts` is a leaf that imports nothing from core, which breaks the cycle without the copies.

### Why the filter and the relevance test are one set

Any module can widen the filter: declared options and their scoped spellings arrive at `registerComponent()`, and `setBreakpoints()` replaces a derived slice of it. A relevance test written against the framework prefixes silently dropped the records of a name that matched neither, on an invariant that nothing stated and nothing could check.

### `watchAttributes()`: the two refused answers

`data-on:<event>` forces the point, because its name is any DOM event. A registration made at parse time is never complete, and an in-place rewrite — `swap({ mode: 'morph' })`, a `data-bind:` re-render — leaves the binding of a component stale and silent.

- To add the names to the global filter cannot be complete against an open-ended set.
- To drop the filter and test each record in the callback is correct, and it puts every `class` and `style` write in the document, animation churn included, through the queue. That is the cost that the filter exists to avoid.

### `watchAttributes()`: why it is caller-owned and runs last

The helper knows nothing about `Base` or the component lifecycle, so a component calls it from `mounted()` and runs the cleanup before it releases resources that a callback could reach.

A callback must see settled component lifecycle and settled declared options, not a half-reconciled batch. Nothing in the framework reads these arbitrary attributes, so no framework decision can depend on a callback, and the reverse order would have no reader. The consequence is accepted: a component that stops its watcher from its mount cleanup during a teardown in the same batch hears nothing about the attribute change of that batch.

### `watchAttributes()`: measured cost

Measured from the previous `origin/main`, with esbuild tree shaking and minification, `morphdom` external, and gzip level 9:

| entry               | retained source lines before → after | gzip before → after |
| ------------------- | -----------------------------------: | ------------------: |
| `Base.ts` source    |                          2000 → 1949 |                   — |
| `./Base` graph      |                          4361 → 4310 |     8002 B → 7887 B |
| root graph          |                          9670 → 9624 | 17,832 B → 17,819 B |
| `./watchAttributes` |                            new → 906 |        new → 1738 B |

`Base` loses the method, its documentation and its mutation-helper import. The root graph also shrinks while it adds the public helper name, because it already retained the mutation engine through `Base` and the registry. The generated subpath retains that engine directly; it adds no second timeline and no runtime layer.

The package dry run moves from 282 files, 267,606 B packed and 847,465 B unpacked, to 284 files, 265,174 B packed and 840,221 B unpacked.

## 4. Parents listen to child events

### Why the payload is one object

- **The platform says so.** `CustomEvent.detail` is one value. The variadic form that v4 started with — `$emit(name, ...args)` packing `detail: args` — was an invention on top of it, and every listener outside the framework paid for it: plain JavaScript on the page, an `addEventListener` in a Twig template, a test, all read `event.detail[0]` for what the emitter called one thing.
- **Named fields survive evolution; positions do not.** A third thing worth announcing is a new key that every existing listener ignores. A third positional argument is a signature change, and `$emit('open', item, index)` must be read against the declaration to know which is which.
- **It removes an ambiguity instead of moving it.** With variadic arguments, `detail` was sometimes a payload and sometimes a list of payloads, and the delegation path had to guess with `Array.isArray(detail)`. This is why a bare non-object is not accepted as a shortcut: it would put the guess back.

The runtime warning is not redundant with the type. The no-build path is a first-class audience and never sees a type, so without the warning the rule would be a convention that nothing checks, and `$emit('slide', 1)` would silently box a positional argument back into an API that just removed them.

The cost of the migration was measured first. Across `src/`, `migration/` (five ported `@studiometa/ui` families) and `demo/` there are 24 `$emit` call sites. 18 pass nothing and did not change. One (`SliderDrag`'s `$emit(props.mode, props)`) already passed a single object and only changed its declaration. Five carried positional values: `slide`, `goto`, `index`, and the `open`/`close` pair of `Accordion`.

### Why global handlers keep the two v3 prefixes

Delegation covers what happens inside a component. It structurally cannot cover a click outside it, a `popstate`, a `visibilitychange` or a window `resize`. There is no partial substitute: `ClickOutside` of `@studiometa/ui` is an `onDocumentClick` and nothing else, so without this it has no v4 form.

Four decisions, each the answer to "what would surprise a reader least":

- **Scope: the mount cycle.** The alternative, the instance lifetime, means a destroyed component that keeps reacting to window scroll.
- **Phase: bubble.** `CAPTURED_EVENTS` exists for delegation only, because an event that does not bubble and is fired on a descendant never reaches the delegating root. A global handler delegates nothing: its listener already sits at the top of every propagation path. Capture would only change what it hears — the `scroll`, `focus` and `mouseenter` of every element on the page — and when it hears it.
- **The prefixes are reserved.** To let a declared name win would make the meaning of a handler depend on a `config` entry declared elsewhere in the file. The asymmetry settles it: a child named `Window` can still be reached with `@on('Window', 'resize')`, and nothing else could reach `window`. The side with an escape hatch is the side that yields.
- **Payload `{ event, target }`.** The same vocabulary as the two delegated shapes. No `payload`, because a platform event is not the announcement of a component, and no `index`, because there is nothing to index.

Listener options are not part of this: a method name has nowhere to put them.

### Negotiated events: why they belong in core

`@studiometa/ui` grew this protocol twice, independently. Its `utils/dom-update.ts` (`wrap`, used by `DataBind` and `Fetch`, wrapped by `MotionView`) and `Dialog.__emitExtendable` (`waitUntil`, extended by `MotionView` again) have the same transport, the same synchronous-only window, nearly the same warning text and the same duck typing. Both collapse onto standalone helpers, and each drops its private copy of the window, the warning and the normalization. In the code the two modes share `negotiate()`, and the only difference is what `accept` does with a registration: overwrite the single one, or push onto the list.

- **It is ambient interception through DOM ancestry.** There is no registration, no handshake and no ownership. The emitter never learns who answered, and the answerer never learns what the step does.
- **The alternative is coupling.** Without it, to animate a fetched replacement means that the code which mutates knows about the transition, or that the transition reaches into that code. To hold a dialog open means that the dialog knows that its contents animate. Both are the `$closest()`-and-poke shape that the flat topology exists to remove.
- **It closes the gap of §9.** `exit` and `layout` animations need a hook before the DOM changes, and a MutationObserver fires after the element is gone. An announced step is that hook.

### Negotiated events: what changed from the `@studiometa/ui` form

The detail is one object, so a negotiated event has the shape of every other v4 event. `@studiometa/ui` dispatched a raw value for a stated reason that was not the real one: `Fetch` overrides `$emit` with a string-only signature that would mangle a `CustomEvent`, which is a defect that v4 does not have.

Delegation is not the price of that. A namespaced framework event uses `@on('Fetch', EVENTS.dom.update)`, because a magic method name cannot spell its colons. A decorated handler is bound by event type on the root element and walks up from `event.target`, so it never inspects how the event was constructed.

Other decisions:

- **`defaultPrevented` is ignored.** To honour cancellation would make "the work of the emitter always completes" false. A listener that wants nothing to happen says so through its own state.
- **A late registration is warned and ignored.** By then the step has already happened, so to give a change to a runner at that point would apply it twice or not at all. The warning is built from the key of the mode and the name of the event, so there is one wording and not two.
- **The duck-typed method has the name of the event.** This is the `on<Child><Event>` rule again: resolve by name, and do not add an option that names a thing. The `Dialog` of `@studiometa/ui` mapped `open` to `enter()` and `close` to `leave()`, a vocabulary specific to `Dialog` that the core rule replaces.
- **The work of the emitter always completes.** A runner that throws, rejects, or resolves without a call to `apply` loses the animation and never the change. `@studiometa/ui` covered the first two only, so a runner that forgot to apply dropped the update silently. An extension that rejects is swallowed, because a failing extension must never leave a dialog painted with the scroll locked.
- **The last claim wins in take-over mode.** Bubbling reaches the nearest ancestor first, and the nearest is not necessarily the one that should animate: an outer component that owns the whole region takes over deliberately. Delay mode keeps every registration, and the difference is intrinsic: to replace an action is exclusive, and to postpone one is not.
- **An unclaimed `domUpdate()` is synchronous**, because the synchronous binding pass of `DataBind` reads the DOM back on the next line.

Neither runner is the default, so `domUpdate()` with no listener stays a plain synchronous mutation. To choose a lane is the decision of the ancestor, because the ancestor knows whether the region animates.

## 5. Children advertise their existence

### Why the initial sweep of `$watchChildren` is deferred

`$watchChildren` is usually called in a field initializer. Children that are already mounted would otherwise fire `added` synchronously while the instance is half-constructed. This happened live: the Slider demo read `this.items` from an `added` callback before the field was assigned, and its provided state signal stayed at `total: 0`. The announcement listeners attach synchronously, so nothing that mounts in between is missed, and the internal `Set` removes duplicates.

The constructor overload cannot select one `data-component` token, because every named subclass has a different token. So it walks the descendant elements and reads their existing instance maps. No global instance registry is added.

### Why `getInstances()` derives from the DOM

The document already knows where the components are, and a second index of it can go stale. It is also not the slow path: a `querySelectorAll` narrowed by name beats the walk of every instance on the page that v3 did, measured on the `Action` port. That measurement is why "a per-class instance registry", gap 7 of the port, is answered with a function and not with a registry.

`Action` forced the page-wide form. It acts on components named at runtime, anywhere on the page, so it has no descendant scope, no ancestor scope and no ancestor to inject from.

There is no selector-strategy seam behind it. v4 resolves components through `data-component` alone, so name-to-selector is the only lookup shape that there will ever be, and `selectorFor(name)` is the one place that writes it down.

### Why the instances live under a symbol

v3 stores `Map<string, Base | 'terminated'>` under `el.__base__`. v4 stored `Map<string, Base>` under the same name. Two versions in one document then read the map of the other as their own: the teardown of v4 called `$destroy()` on the instances of v3 and on the `'terminated'` string that v3 leaves behind, which is a `TypeError`, while the child resolution of v3 accepted a v4 instance as one of its children. That blocked any migration page by page. `src/coexistence.spec.ts` mounts both versions in one document and holds the line.

`Symbol.for` and not a module-local `Symbol()`: the key is global to the realm, so two evaluated copies of v4 still agree on it, which is the one property of the string that had to survive.

The cost is the devtools habit of typing `$0.__base__`. The replacement is one line that needs no import.

The element overload became the job of core with this symbol. While the map was a plain property, a caller could read it in one line, and the `Action` port did exactly that. A key documented as "not public API" is not something a port should import, so `migration/Action/instances.ts` is deleted and `ActionEvent` keys the result by `$config.name` at the call site.

### Why the provided value is not wrapped

The first shape of this wrapped every value in a `Signal`. That made the third case impossible: an object that holds Signals, which is state to read plus commands to call. A control that needs `goNext()` then has one way left to reach it, `$closest('Slider')`, which is the coupling that the primitive exists to remove. An event and a command are both legitimate and not interchangeable: `$emit` says "this happened" upwards, and an exposed method says "do this" to a known owner.

### Why `$inject()` never settles, and why `$injectSync()` exists

Order independence means that a missing provider is "not yet" and not "not there". `$injectSync` costs nothing extra, because the context request is answered synchronously when a provider is listening. It is the form that a click handler or a keyboard shortcut wants: an answer now or not at all.

The mechanics follow the WICG context protocol, which fixes both critical defects of the earlier `withStore` design: resolution goes through the DOM event path instead of walking attributes, and a late provider can answer a pending consumer.

### Why `provideRootContext()` exists

`DataBind` is `withGroup(Base, { getScope: (i) => getDataScope(i.$el) })`, and `getDataScope` returns `undefined` when no `DataScope` is above it. At that point v3 fell back to a page-global registry on `globalThis`. So a bare `DataBind` binds by name across the document with no ancestor at all, and "rebuilds on provide/inject" was true for the scoped half and structurally impossible for the other.

The value is provided on `document.documentElement`, so a page-wide default and a scoped override are one primitive at two depths. `create` runs at most once per key, so peers join instead of racing, and nothing is created at import time.

A root provider cannot be disposed, and it outlives the instance that asked first: it is page state, and to tie its lifetime to the first consumer that mounts is exactly the ordering dependency that the primitive removes.

`withGroup` is not ported, because its `$group` was a member `Set` with no value cell, which is why `@studiometa/ui` had to build `getDataChannel(this.$group)` on top of it. A provided registry of Signals is that cell, owned by the provider, and it makes the two registries one.

`context.spec.ts` carries the spike: bare peers on a name share a channel, scoped peers share a different one, names never collide, and the value is live.

### Why `subscribeContext()` exists

The outermost scope has a sharp edge that the `Data*` port found. A page-wide provider answers from `document.documentElement`, so it reaches every unscoped consumer on the page, and an answered request was deleted. Replay only ever helped a request that nobody had answered. So every consumer that fell back to the root provider was bound to it permanently and silently: wrap a `DataScope` around content that is already on the page, and its descendants keep trading values with the page-wide channel. Nothing errors. The port worked around it with an eight-line `RESCOPE` broadcast of its own and filed it as a request for core.

**The trigger is the mount announcement, not a broadcast from the provider.** A `context-provided` event dispatched down the subtree of a provider was the obvious alternative, and it makes providers special for something that they are not special in. Every mount already announces itself with the bubbling `EVENTS.component.mounted` event. `$watchChildren` only looks parent-scoped because it listens on `this.$el`. The listener fires after `mounted()` has run, which is also why the new answer does not go in `provideContext()`: a `$provide` in a field initializer would answer consumers from a provider that is still constructing itself.

Two `contains()` calls are exactly the set of consumers whose answer can have changed: the new provider must contain the consumer, and it must sit inside the provider that answers it now. The second is the general form of "only root-answered consumers can be wrong", because the root provider contains everything.

**The index holds nothing.** A plain `Set` would have been simpler and wrong: the callback closes over the consumer instance, which holds its element, so every consumer that ever resolved would stay alive for the life of the page. `context-subscription.spec.ts` asserts the weak-ownership requirement with a real collection over CDP, without prescribing the implementation of the index.

**An identical value is not an answer.** A nearer provider can hand over the same object, and to tear a working binding down and rebuild it identically is churn and not correctness.

The changed basic schema keeps the old slot name and increases its revision, so a copy with the former combined schema fails clearly instead of sharing an incompatible shape.

**The port consumes it and its workaround is gone.** `DataBind.mounted()` calls `subscribeContext()` directly; its callback joins the group, its returned teardown leaves it, and `mounted()` returns the unsubscribe cleanup. `DataScope` has no `mounted()` at all: its only job is the boundary in its field initializer. The three specs that encode the problem pass unchanged, because they always asserted which registry a member ends up on and not how it got there. One thing the shape demands: a subscription waits forever while nothing provides, so a member with no scope above it still creates the page-wide registry with `injectContextSync(…) ?? provideRootContext(…)`, and creating the provider replays its own pending request.

### Context: measured cost

Measured from `origin/main` with esbuild tree shaking and minification, `morphdom` external, gzip level 9, and physical lines across the retained v4 source modules:

| entry                | source lines before → after | gzip before → after |
| -------------------- | --------------------------: | ------------------: |
| `./Base`             |                 4650 → 4376 |     8463 B → 8002 B |
| `./injectContext`    |                   694 → 423 |      1285 B → 684 B |
| root barrel          |                 9541 → 9477 | 17,803 B → 17,832 B |
| `./subscribeContext` |                   new → 649 |        new → 1270 B |

The basic entries shrink. The root pays 29 gzip bytes to name the new public helper. An import of `./subscribeContext` retains the optional four-module graph; an import of `./Base` or `./injectContext` does not.

### Why the reactive container is `signal()`

`Signal` is the name that the ecosystem settled on — Angular, Solid, Preact, the TC39 proposal — and the name that `@studiometa/ui` already uses for its `Data*` suite. It is a factory over a closure and not a class: nothing about it wants inheritance or an instance identity, `new` was the only reason for the class, and a closure makes the private delivery state genuinely private.

The accessor stays `.value`. The call-style accessor of alien-signals was refused: it costs every existing call site, it turns `count.value++` into `count(count() + 1)`, and it gives a reader no way to tell a read from a write at the call site.

### Why a write restarts the delivery round

The obvious fan-out — assign, then walk the subscribers — is wrong under re-entrancy, and `Data*` is where that shows up. When a subscriber writes back during the delivery, the walk continues with the value that it started on, so a subscriber positioned after the writer is handed a frame that is already stale, after it has been handed a newer one. Last-write-wins becomes last-listener-wins.

So the value that a reader sees is split from the value being delivered, and the delivery loop re-reads the first after every callback. When it has moved, the round is abandoned and starts again on the new value.

This is the property that the `DataChannel` of `@studiometa/ui` gets from alien-signals today, and the reason that the dependency can be dropped: its `publish()` always builds a fresh frame object, so the `===` bail-out never fires there, and what it relies on is one delivery per subscriber per settle, carrying the latest value.

Settling stays in the same task on purpose: `DataBind` echoes the input of a form control, and a microtask hop would be a visible change of behaviour. The price is that a subscriber that writes unconditionally on every delivery live-locks the loop instead of overflowing the stack, which is the trade that every synchronous reactive graph makes.

### Why `createGroup()` is a membership Signal

v3's `withGroup` gave every instance a `$group: Set<Base>` of its peers, keyed by a group name and optionally scoped by a resolver. The set had no value cell, so a coordinator could not act on a change.

The membership is a value, so a peer that arrives or leaves is an event. That matters because v4 mounts on DOM insertion with no ordering guarantee: "the set of my peers" is not settled at any point in time, and an invariant over the set — one open at a time, one selected item — must be re-checked on every change instead of established once.

`join()` returns its own `leave`, because the answer-and-teardown contract of `subscribeContext()` already has the shape of joining and leaving a group. There is no `__connect` and `__disconnect` handshake to write.

Scope comes free from nearest-provider-wins, so a nested group takes its own members and never those of its parent. `$watchChildren` cannot express that, because it collects every matching descendant across nested boundaries.

**Document order is the tie-breaker**, so which peer keeps its state is a fact about the markup and not about which peer mounted first. A disclosure written open that mounts late loses to the one before it in the DOM and wins over the ones after it. Both orders are asserted in `group.spec.ts`, which builds the Disclosure pattern from this helper plus `$provide` and `subscribeContext` alone.

Nothing sweeps disconnected members, because v4 destroys a component when its element leaves the DOM. v3 swept on every read of `$group`, because its membership was written from `mounted` and `destroyed` on a registry that outlived both.

**The two v3 consumers of `withGroup` divide on exactly this line.** `Disclosure` groups by ancestry: its group is a component in the DOM, and the whole difficulty was that the two sides had to find each other. `Data*` groups by name, with the nearest `DataScope` choosing which partition table to look in and a page-wide table when there is none, so `DataRegistry` keeps a record per name in which membership is one field beside values, sources and hydration state, and it never observes membership changes. It has its own `join(group, member)` that returns the same leave function, and no members signal, because nothing subscribes to one. A group that is a set of peers gets `createGroup()`. A group that is a partition of a keyed store keeps the store.

## 6. Decorators

### Why every decorator is optional

No engine ships stage-3 decorators, so a requirement would break the no-build promise. A page that loads the package from an ESM CDN keeps the function API and the magic method names.

### Why `@component` and `static config` merge in a class initializer

A class decorator runs before the static field initializers, so the object of the field replaced the object that the decorator wrote, and half of the declaration disappeared with no warning. A class initializer runs after the fields and still inside the class definition, so `registerComponent()` on the next line sees the finished config. They merge by the rules that `resolveConfig()` already applies, so there is no second set of rules. Only a key that both sides declare differently needs the precedence, and that is an authoring mistake and not an intent, so it is reported.

### Why `@on` is better than the name it replaces

The explicit pair removes the name parsing, so the ambiguity of `onSliderDragStart` disappears. It needs no `config.components` entry, because the child name is in the decorator. Any event name works, including names that no method name can spell, such as `fetch:after`. The method can be named after what it does, such as `autoclose()`. Several `@on` stack on one method.

### Why nothing is reserved in the string space of `@on`

To take a value is what gives the global form a spelling. As a string, the global would have to be reserved, and a second reserved-name rule inside the string space of the decorator is worse than the one that the magic names carry. `on<Event>` reserves `Window` and `Document` at no cost, because `@on('Window', 'resize')` is the escape hatch for a child of that name; to reserve the string there would close the escape hatch that it is the escape hatch for.

A class resolves through `resolveConfig()` and not through the own `config.name`, because the merged config is by definition what the instance mounts under, and so what the delegation walk looks up.

**A lazy child is the reason that the string form exists.** A child declared as `Child: () => import('./Child.js')` exists to keep its chunk out of the chunk of its parent, and `@on(Child, 'open')` would import exactly what the thunk defers. So the string form is not a fallback for that case; it is the form that serves it.

**Any other `EventTarget` is refused.** A decorator is evaluated once, at class definition, with no instance and no document, so an arbitrary target can only be a module-scope value shared by every instance, which is not what a listener per mount cycle means. A ref is covered by the string form, and anything else is one line in `mounted()`.

### Why the skip is keyed by the method name

`@on` and `@read`/`@write` meet on one method, such as `@write @on(window, 'resize') onWindowResize()`, and only one family leaves its method alone: `@read` and `@write` replace it with a wrapper that schedules the body. Applied bottom-up, a phase decorator written above the `@on` therefore handed the class a function that the registration below it never saw. The skip compared the registered function against the one that the instance carries, missed it, and bound the handler twice. Nothing failed loudly, so the stacking order was part of the interface and documented nowhere.

The name is the one thing that both passes hold: the plan keys every magic handler by `method`, and `context.name` names the decorated method whatever else is stacked on it.

## 7. One scheduler

### The weaknesses of v3.9

v3.9 has four independent scheduling mechanisms: `domScheduler` (a microtask flush), `RafService` (its own rAF loop), `SmartQueue` (a nextTick waiter with a 40 ms budget for lifecycle work), and the MutationObserver callback of the registry. `@studiometa/ui` adds a `viewTransition` scheduler on top.

- `domScheduler` flushes on `Promise.resolve().then()`. It batches inside one microtask and not inside one frame. A `write()` from an event handler flushes in the middle of the turn, and a later read-then-write batch still forces a synchronous layout.
- There is no cancellation, because tasks are anonymous closures. Queued work can run against elements that are already removed.
- A task that throws deadlocks the scheduler: `flush()` never resets `isScheduled` on a throw, so every later `scheduleFlush()` returns early. Silent and fatal.
- Lifecycle work and render work compete with no coordination.

### Naming

`read` and `write` are kept exactly as they are: fastdom, framesync and Motion spell them the same way, and they say what they do. `background` becomes more accurate once the lane runs off-frame, because it maps onto `scheduler.postTask({ priority: 'background' })`. `frame(callback)` becomes `tick(callback)`, because the component hook is already `ticked()` and the shared clock of GSAP is `gsap.ticker`, while `frame` collided with the `nextFrame()` helper.

### Why `afterWrite` is removed

It had no consumer, in v4 or in `@studiometa/ui`, and its name promised something that `requestAnimationFrame` cannot deliver. The flush runs in a rAF callback, which the "update the rendering" steps of HTML place before style, layout and paint, so nothing scheduled inside the frame can observe post-layout geometry. The only in-frame hook that can is a `ResizeObserver` callback, which those same steps run after layout. To rename a phase that nobody called would keep the confusion alive under a new spelling.

An "after paint" phase can be added later on its own merits, under a name that does not promise same-frame layout.

### Why the phases are double-buffered

To drain a phase until it is empty (`while (queue.shift())`) let a `read` that schedules a `read` re-enter without end: 100,000 chained reads in one frame, no paint and no yield. The render steps of Motion double-buffer for the same reason. Theatre.js caps recursion instead — a warning at 10 and a throw at 100 — which was refused, because it needs a limit to tune, it surfaces as warnings and throws in the code of the caller, and it aborts work instead of letting it progress. To swap the array costs nothing and it preserves the cross-phase rule for free, because the `write` batch is taken after the reads ran.

### Why the background lane runs off-frame

rAF callbacks run before style, layout and paint, so non-rendering work placed there competes with the frame whatever budget guards it, and a budget measured from the top of the flush is spent by the tick callbacks and the render phases before the lane is reached.

Measured: one tick subscriber busy for 10 ms per frame — one running animation — starved the lane completely. Zero background tasks in 400 ms, so nothing mounted while the animation ran.

The lane posts its own turns and falls back to a `MessageChannel` message, because `setTimeout` clamps nested timeouts. The scheduler of React moved to a message channel for exactly this reason (facebook/react#16214). `isInputPending` is deliberately not used, because that recommendation was retracted. Motion runs a second batcher on `queueMicrotask`, outside rAF, instead of budgeting inside it.

### Why the tick delta is clamped

Raw wall time includes everything that a frame is not: a backgrounded tab, a long task, an iOS scroll pause. Every subscriber that integrates it then jumps by the whole gap. Motion clamps to `[1, 40]`, framesync to 40, and rafz to 64. The `lagSmoothing` of GSAP is the same idea. `TickProps.time` stays raw on purpose, because it is the timestamp of rAF, the clock that the Web Animations API and `requestVideoFrameCallback` are expressed in.

### Why the loop stops on its own

`#schedule()` is called again at the end of a flush when a queue inside the frame is not empty, or when a tick subscriber stays, so the rAF loop stops when the last one leaves. Pending background work is deliberately not part of that condition.

That property is only true if a component can let go inside a mount cycle, which is what `toggle()` is for. A component that holds `ticked()` for the life of the page would make "no permanent rAF loop" false on any page with a slider or a scroll animation.

Tick subscribers are not queued work, so `whenIdle()` ignores them. A page with a live scroll animation would otherwise never be idle, and the test helper `settle()` would never return.

### Why view transitions move into core

A view transition is a scheduling concern, because `startViewTransition` snapshots the DOM, so its timing must coordinate with the pending reads and writes. The helper and its batching scheduler currently live in `@studiometa/ui` (`ViewTransition/scheduler.ts`).

Serialization of later batches into one promise tail matters when several flushes arrive during one transition: they stay serialized instead of all resuming when the same `finished` promise settles.

### A known future slot

Motion has a phase between read and write, `resolveKeyframes`, which owns the write-read-write-read pass that some animations need to resolve their keyframes, amortised across every animating component so that the whole page pays one layout instead of one each. This is where the measured 2.5× to 6× of Framer came from, and it is the right shape for measurement-heavy mounting.

Nothing in v4 needs it today, so nothing implements it. It is recorded as the slot to fill: between `read` and `write`, batched, and never as an escape hatch per component.

## 8. Services

The services section was hardened after an adversarial review (`SERVICES-REVIEW.md`, 2026-08-12): 17 confirmed defects, each with a regression test. Three claims that the section used to make were falsified by that review.

Two findings of that review stay open on purpose (`SERVICES-SURFACE.md`, 2026-08-13), because both change semantics across all five services and both amend decisions that were made deliberately. The short version of each: the phase is the wrong axis and the write path is the right one, because to frame-align a discrete source must either collapse a tap or copy its props; and `props()` should split, staying `T` for the sampled sources and becoming `T | null` for the pointer, the drag and the frame, which is what `hasProps()` already says at runtime while the type says `T` for all six.

### Lazy and reference-counted, and what broke

Publishing is re-entrant, so a subscriber that unsubscribes while it is called can tear the service down inside the `emit()` that it is still in. The `drop()` of the drag service did not check for that, and subscribed an inertia tick to a dead service, which is a frame loop that nothing could release.

### Why a subscription is a record

`AbortSignal` was measured as the alternative and refused: 17 times the cost per subscription, and it is not what the ecosystem uses internally either.

The name is `subscribe` and not the `add` of v3, because the arity changed: `add('id', callback)` would otherwise compile and subscribe the string.

A closure is not automatically safe. When subscribers were keyed in a `Set` by the callback itself, two holders of one function collapsed into one entry, so the second was never called and the first unsubscribe tore the service down under it. Reference counting counts holders.

The fan-out walks a snapshot, and each record carries an `isActive` flag. Iteration over the live set visited subscribers that were added during the update, and handed them props measured before they existed — unbounded if a subscriber subscribes from its own callback. Removal was only correct because the set was live, so the two changes are one change.

### Why `{ immediate: true }` exists

A subscription says "tell me when this changes". A component that lays itself out also needs "tell me where it stands". Those are two requests and only one was available. Which sources answered the second was an accident of their machinery: a `ResizeObserver` delivers the current box on `observe()`, so the resize service spoke on subscribe and the other four did not. Three of the six agents of the review flagged that asymmetry independently. It was invisible in the types.

To deliver the resting value of a source instead would announce the centred pre-event pointer position and the `idle` drag as readings, which is what makes them dishonest. Only the new subscriber is called, because an emit would hand every other subscriber props that it already has.

`withInView` defaults it to `true`: before the first platform entry it still emits nothing, while a later component that joins an active observation receives the real entry that the service holds.

This option exposed a defect that was invisible while nothing read the first props of a run: `deltaX` and `deltaY` were measured against the position where the previous run ended, so a service restarted after the page had moved announced a scroll that nobody performed — 100 px of it, in the test that now guards it.

### Why one service instance per target and options

Reference counting only means something against a target, so the last subscriber of one element must release the observer of that element and leave the others running. This is lifecycle bookkeeping and not throughput.

To share one observer across targets was measured indifferent. The widespread claim traces to a single measurement from 2017, and 500 idle observers now cost about 0.02 ms per frame in total (`service.bench.ts`).

**The options are read by meaning, not by spelling.** The key was `JSON.stringify(args)`, so `{ axis, inertia }` and `{ inertia, axis }` — one drag — bought two services, two sets of pointer listeners and two `touch-action` claims on one element, and `{ threshold, rootMargin }` bought a second `IntersectionObserver`. `perTarget()` now sorts object keys at every depth and drops the keys that hold `undefined`, because to name an option without a value is not to name it. Arrays keep their order, because a threshold list is ordered data and not a record.

**A mixin's own options are not the service's.** Forwarding the whole object — `use: (target, options) => useDrag(target, options)` — is what let `withDrag(Base, { manual: true })` bind a drag service of its own on an element that the plain `withDrag(Base)` already owned. `withInView`, `withMutation` and `withScrollProgress` each filtered the lifecycle keys out by hand. Those filters are deleted, because a seam that only one of four mixins used correctly was the defect.

### Why there is no `hook` option

Two layers with the same name collapsed into one subscription with no warning. A custom name lost the props typing of the hook entirely. To rename one compiled, shipped and silently stopped updating.

Deleting the option is what bought `$services.<hook>`: with one fixed name per mixin, the property is declared in the type as `ServiceHandles<'ticked'>`, so `$services.ticked` completes and a renamed hook is `TS2551: Property 'onScrolled' does not exist… Did you mean 'scrolled'?` instead of the silence that `$enable('onScrolled')` gave. What is gone is the per-instance map from hook to subscription behind a module symbol, and the runtime `console.warn` that was the only check on a string.

### Why `useMutation()` keeps nothing after the delivery

A `childList` record holds the nodes that it removed, so a service that retains the last batch — as the persistent props object of v3 did — keeps a detached subtree alive for the life of the page. That also makes `hasProps()` honest: a batch is a mutation that happened and not a state that holds.

`Disclosure` of `@studiometa/ui` was writing an observer by hand, because neither the framework engine nor `watchAttributes()` covers "tell me when anything under this node changes".

### Why `KeyService` came back

The spec dropped it, the migration ports were the measurement, and the measurement went the other way.

`Modal.keyed()` of v3 (`node_modules/@studiometa/ui/Modal/Modal.js:121-131`) handled the focus trap and Escape in 6 lines, with no setup at all. Its replacement in the port was a 10-line `mounted()` whose whole content was a `keydown` listener and its teardown, and it covered the trap only. Escape moved to `onCancel()`, which is the native `<dialog>` `cancel` event doing that work, and not a saving from dropping the service. So the document-level case gets bigger without a service, not smaller.

The ported `Dialog` now consumes `withKey`, which is the claim tested rather than asserted: the `mounted()` method is gone, `keyed()` is six lines under its v3 name, the component is 83 code lines to 79, and both keyboard specs — the trap and its release on destroy — pass unchanged, because `withKey` defaults to the same document the hand-rolled listener used.

`Slider` of v3 (`node_modules/@studiometa/ui/Slider/Slider.js:280-301`) spent about 16 lines on `hasFocus`, `onWrapperFocus`, `onWrapperBlur` and `keyed`, against 6 lines for v4's `onWrapperKeydown`. That saving is real, and it is not a saving against the service: it comes from ref delegation, and a target-scoped `useKey(this.$refs.wrapper)` earns the identical one. v3 needed the focus bookkeeping only because its service was document-only, with no target to scope to.

Of the three consumers in `ui` — `Modal`, `Menu`, `Slider` — two are document-level.

The cost, stated honestly: the module is about 160 lines in core, some 85 of them code, and every consumer of the package pays for it. Against three consumers it is roughly line-neutral. What it buys is one shared `keydown`/`keyup` pair per target instead of one per component, a target to scope to, and the repeat counter in one place rather than in none.

### Why `until()` exists

`isScrolling` is documented as the flag that a component waiting for a scroll to finish should read, and there was nothing to wait with.

The hand-written version is a trap twice over. To release the subscription from inside the callback names the unsubscribe before `subscribe()` returned it: a temporal dead zone, and a `ReferenceError` at the first match. To hoist it to a `let` fixes the crash and not the case where the match arrives during `subscribe()`, where the binding is still `null`, nothing is released, and the service — a frame loop, for `useRaf()` — runs for the life of the page. Measured: the naive form leaves the service started and never stopped.

It resolves with a copy of the props, because the object belongs to the service and an `await` resumes one microtask later.

It consumes a `Service<T>` and nothing else. That matters beyond convenience: `toggle()` and `until()` are what the uniform interface is for, and until they existed nothing in the public surface consumed it, so its uniformity was paid for and never spent.

### Why the pointer box is cached

`getBoundingClientRect()` is a layout read, and a mouse reports up to 1000 events a second. Measured in Chromium over 1000 reads: 1.7 µs each against a clean layout, and 31.6 µs each when a write sits between them. The forced reflow is the realistic case, because the effect being driven writes to the DOM. With the cache, 1000 events cost one read instead of 1000, which the spec asserts by counting them.

The layout box is deliberately the frame of reference, so a transform that the consumer applies from `moved()` does not invalidate it and a hover effect cannot feed its own output back in.

`withRelativePointer` of v3 was a decorator whose whole content was a target and a subtraction. v4 puts both in the service, and `ElementPointerProps` is a superset, so `x` never changes meaning with the way the service was obtained.

### Why a `ResizeObserver` is not enough for the viewport

For the root element, `clientWidth` and `clientHeight` report the viewport, and on a page taller than the viewport the two are decoupled: a measured height of 3000 against a `clientHeight` of 896. A mobile toolbar that slides away therefore fires no observer. Both mechanisms are kept, because neither sees what the other does.

### Why extents are observed

A scroll container's own box never grows with its content, and content that grows announces itself with no `scroll` and no `resize`: `maxY` stayed at 400 for content that had gone from 500 px to 5000 px.

### Why props are flat and readonly

Without `readonly`, `useScroll().subscribe((p) => { p.y = 999 })` compiled and corrupted every other subscriber on the page. What a callback can return is a type parameter too, so `useRaf().subscribe(() => 42)` used to compile and run a stray return as a DOM mutation every frame.

One signed direction value that multiplies replaces `isUp`, `isRight`, `isDown` and `isLeft`, which also settles the collision between a `ScrollProps.isDown` that means "scrolling down" and a `PointerProps.isDown` that means "pressed".

### Why a closed set of strings is a named constant

`DRAG_MODES` partly reverses the removal of `props.MODES`, and the reversal is narrower than it looks. What v3 shipped was a copy of the set on every emission, which deserved to go. A module export is a different thing.

The original decision — "the `DragMode` union types it" — weighed the TypeScript audience only. The first-class audience here writes components in plain JavaScript with no build step, and a literal union gives them nothing: no completion, no protection against a typo, and no way to discover the set. `DRAG_MODES.INERTIA` gives all three, the literals still type-check, and a type derived from the object keeps one source of truth.

### Why breakpoints are a `matchMedia` service

A media query answers about the viewport, so a `breakpoint` field of `ResizeProps` said nothing about the element that the service was observing. `matchMedia` `change` listeners emit on crossings and not once per resize frame, and they are the only mechanism that reports a change of the font size of the reader.

The values are in `rem`, and in a media query `rem` resolves against the initial font size and not against the root element. So the font-size preference of the reader moves every breakpoint, and `html { font-size: 62.5% }` moves none of them. Verified at a viewport of 414 px, where `xs` (30rem) matched neither at a root of 10px nor at 32px.

Building the `MediaQueryList` objects once instead of once per breakpoint per resize measured 5.2 times faster. When `defineFeatures` lands it carries the set, and it calls `setBreakpoints()`.

### Why `usePrefersReducedMotion()` is a service

v4 ships a frame loop, drag inertia, damped scroll animations and a spring, and had no way to ask whether the reader turned motion down. It is a service and not a read at load time, because the preference changes while the page is open: a reader who flips it in their system settings leaves every value captured at load wrong for the rest of the session. Verified against a real crossing: the spec emulates the media feature through the browser instead of stubbing `matchMedia`.

### Why decay is expressed in time

A damping factor is a number per step, which only means something if the steps are equal, and frames are not. To decay once per frame made the same flick coast half as far at 120 Hz.

Two parts of this are easy to get wrong, and both were wrong once.

- **Exponential decay is not enough on its own.** To advance by `velocity · elapsed` is a left rectangle sum over a curve that falls throughout the step, so it overshoots by an amount that depends on the step: 60 Hz and 120 Hz still landed 4% apart. `inertiaStep()` integrates the decay across the step, which telescopes, so any sequence of frames sums to `velocity · τ` exactly and the destination announced at the drop is the one that the coast reaches.
- **The velocity has to be a speed.** The delta between two pointer events made it a function of the report rate of the device, so a 1000 Hz mouse and a 125 Hz trackpad threw differently. It is sampled as a distance over the interval between events, smoothed, with the interval clamped at both ends: under half a frame is coalescing and not speed, and over 100 ms is not one movement.

`inertiaDecay()` is `decayOver()` with the tighter clamp that the coast needs, because a retention of `1` has no finite destination. That is a restriction of the inertia and not of decay, and to reuse it in `damp()` made a factor of `0` drift instead of holding still.

Decaying the velocity by the idle time at the drop, through the same law rather than against a staleness threshold, is what makes a pause cost the right thing: to hold still and then let go used to throw as hard as letting go in the middle of a swipe.

### Why `damp()` takes the elapsed time

Every per-frame damping in the ported components — the position of the slider, the damped progress of the scroll animations — applied its factor once per call, so the speed was whatever the display happened to be. Measured on the v3 helper it is a clean doubling: 56 frames to settle at 60 Hz, and 28 at 120 Hz. All three call sites sit inside `useRaf().subscribe()`, which hands them the elapsed time of the frame, and all three discarded it.

`elapsed` is required and not defaulted, because the only available default is "assume 60 Hz", which is the defect.

The v3 helper was also unstable for values that a caller can pass: `factor = 2` flipped the sign of the gap and oscillated forever, above that it diverged, and a non-finite factor returned `NaN` and poisoned every value downstream.

### Why `spring()` and `smoothTo()` needed a different fix

They were held out of the inertia work, because neither can take its trick.

`spring()` is second order, so there is no single exponential to integrate exactly across a step. Measured on the v3 helper, `dt` appeared nowhere in it, which made it a pure step recurrence: the shape of the trajectory survived, with an identical `104.24` overshoot at both rates, while its rate was whatever the display was — 56 real frames at 60 Hz and 28 at 120 Hz. A quarter frame and not a whole one, so that a 120 Hz display advances the spring twice per frame instead of every second frame, which would be visible as judder.

A fixed step turned out to be most of the stability answer and not all of it, which a test caught. Semi-implicit Euler holds only while `√(stiffness / mass)` times the step stays under `2`, so a stiff enough spring diverges at any fixed step. v3 had no guard and paid for it: `stiffness: 1.9` overshot to `190`, and `stiffness: 4` ran away to `-1.6e15`. The clamp costs nothing perceptible, because a spring at that ratio already arrives inside a frame.

`smoothTo()` needed a rewrite and not a port, for a defect. `update()` called `tick()` synchronously, and `tick()` re-scheduled itself through `requestAnimationFrame` with nothing that cancelled or removed duplicates, so every call while the value was still settling started another self-perpetuating chain: five updates in one frame measured five chains, five subscriber notifications per frame, and five more frames queued. The value then converged N times faster than asked, where N was the number of times the caller set it, so a `smoothTo` driven from a scroll handler — which is what it is for — sped up with the scrolling. It also owned a `requestAnimationFrame` loop, which this section forbids, and it had no teardown.

### Why `useDrag` owns `touch-action`

Without the matching `touch-action`, a native pan wins on touch, the browser fires `pointercancel`, and the drag service can receive a half-finished drag only.

It writes only when the computed value is `auto`, so consumer CSS is deliberate and wins. Concurrent services on one target share that ownership instead of restoring CSS under one another.

The click that ends a drag is suppressed from a flag armed by movement. Reading the persistent `distance*` fields instead made every later click on the target unreachable, keyboard activation of a link inside it included.

- **A mixin binds from `$mount()`, not from `mounted()`.** Occupying a lifecycle hook made a mixin's correctness depend on every subclass remembering `super.mounted()`, and forgetting was total and silent — no warning, no type error, no failing hook, just a subscription that never happened. The port found it the hard way: a component was written without the chain and twelve specs failed at once with nothing to point at. A diagnostic would have made the trap visible; overriding the framework's own method removes it, and costs a component nothing it can forget.

## 9. Animation

The usage data across `@studiometa/ui` is one-sided:

| utility            | real consumers in `@studiometa/ui`                                               |
| ------------------ | -------------------------------------------------------------------------------- |
| `animate` (719 ln) | 1 — `AbstractScrollAnimation`, which never plays it and only calls `.progress()` |
| `tween`            | 0                                                                                |
| `transition`       | 5 — `Modal`, `Tabs`, `Panel`, `AccordionItem`, `withTransition`                  |

The player is the part that nobody uses. The 719 lines exist to own a rAF loop, a registry of running animations per element, and a `start`/`pause`/`play`/`finish` surface, and the only consumer scrubs a progress value instead. The most-used utility of the three is not an animation engine at all: `transition` is a state machine over CSS classes.

This is already the actual state, because `src/` contains no animation utility. The decision is about what is promoted, not about what is deleted.

`transition` was promoted with one fix: an interrupted run used to drop its `transitionend` listener without resolving, so the caller that it interrupted waited forever.

**The keyframes interpolator is not promoted (2026-08-16), because what needs it is going away.** It was on the list — `compile(keyframes, { easing }) => (progress, size) => styles`, about 150 lines including the `cubicBezier` that replaces `@motionone/easing`. `ui-motion` does not ship an interpolator either: it carries the scroll-linked animation of Motion, which is the whole job that the `ScrollAnimation` family exists to do. Those components become obsolete, and the interpolator with them, so to promote it into core would hoist a primitive whose only consumer is scheduled for deletion.

Springs were on the list for the separate package and came off it (2026-08-12). `spring()` is forty lines of pure mathematics with no player, no registry and no scheduling of its own, and `smoothTo()` is the one primitive that the ported components need to smooth a value towards a target. What belongs outside is the engine — a timeline, playback controls, a registry per element — and not a function that advances one number by one step.

The vocabulary of each engine is kept: the props of Motion are its API and port faithfully, while the API of GSAP is code and only maps lossily onto attributes.

## 10. DOM content swapping

### Why one primitive

`@studiometa/ui` writes the same swap twice. `Fetch.__updateDOM` matches elements from a fetched document by `id` and applies one of four modes, and `FrameTarget.updateContent` does the same job between its leave and enter transitions. Both then call `adoptNewScripts(getScripts(el), oldScripts)`.

Two copies of a swap are tolerable. Two copies of the script rule are not, because the rule is not obvious in either direction: a `<script>` produced by the fragment parser is flagged as already started and stays inert wherever it is moved, so it runs only if it is recreated, and to recreate one that was already in the page runs it twice.

### Why v4 makes it small

Under v3, each family had to mount the components inside the new markup again and refresh stale refs. v4 removes both jobs, because the registry mounts and destroys on DOM insertion and ejection, and `$refs` read on access. What is left is one mutation plus one script-adoption pass: about forty lines against the two implementations of `@studiometa/ui`, with no `$update()`, no child teardown and no `settle()` helper for the caller.

The browser suite asserts exactly that: components inside swapped-in markup mount, components swapped out are destroyed, and a component that morphdom preserves is neither destroyed nor mounted again — all with the promise of `swap()` as the only synchronisation point.

### Why `prepend` and `append` stay in core

Each is a one-line DOM call, but each needs the same before-and-after script diff as the other two modes. To cut them would force core to export the script-adoption helper instead, which hoists two primitives where one will do and leaves the subtle one in the hands of the caller.

### Why element-level replace is not in core

`Fetch`'s `replace` calls `oldElement.replaceWith(newElement)`, which discards the element that the caller just found and, with it, its `id`, its instance and every live reference to it. In v3 the element-level form bought a guaranteed-fresh subtree. In v4 refs are live and the registry mounts on insertion, so it buys nothing and costs identity. `FrameTarget` already used the content-level form.

### Why `morph` does not sync attributes

`@studiometa/ui` morphs the target itself, so the attributes of the incoming element land on it. On a v4 element, `data-component` and `data-mount` are lifecycle declarations, and to rewrite them as a side effect of a content update would tear down and recreate instances. A caller who wants attributes synced is asking for something else than a content swap.

### The `morphdom` dependency

Approved by the user, and taken as a real dependency instead of reimplemented. A DOM-diffing algorithm is not something to write again: morphdom is about 800 lines of special-cased element handlers accumulated over ten years, `@studiometa/ui` has already shipped it in production, and to reimplement it would be exactly the "common functionality written again with no clear reason" that this project avoids.

Measured with esbuild (minify and gzip -9):

| artifact                                         |    min | min+gzip |
| ------------------------------------------------ | -----: | -------: |
| `morphdom` 2.7.8, its own esm bundle             | 5203 B |   2199 B |
| `dist/swap.js`, the emitted module alone         |  910 B |    529 B |
| `./swap` subpath, whole graph, morphdom external | 3845 B |   1737 B |
| `./swap` subpath, whole graph, morphdom included | 9058 B |   3781 B |

So the primitive costs about half a kilobyte and the dependency costs about two, which roughly doubles the flattened `./swap` graph. The import is static: a dynamic `import('morphdom')` would keep `replace` mode free, at the price of a CDN round trip exactly when `morph` is used, and 2 kB is not worth a second network hop. `src/index.ts` says this in place of its former "Zero dependencies."

## 11. Autoload

v3 ships 1033 source lines of autoload across seven modules, plus 1419 lines of spec (`packages/js-toolkit/src/autoload/`). §2 promised that the layer would stay and that "its loader, observers, and scheduler become the registry's own". Measured against what the registry and the mount strategies now do, that promise is generous.

### What each absorbed piece cost in v3

- **The discovery observer.** `ComponentLoader.start()` creates a second MutationObserver on the root and scans added subtrees for `[data-component]` (`loader.ts:147-199`). About 90 lines gone, and with them the second observer that §2 named as one of the three mounting systems.
- **The four load triggers.** `__schedule()` reimplements `visible` (an `IntersectionObserver` with a 200 px `rootMargin`), `idle` (`requestIdleCallback` with a 2 s timeout and a `setTimeout` fallback) and `interaction` (`pointerover`, `pointerdown`, `focusin`, once) — `loader.ts:270-337`. `mount-strategies.ts` is the same code, already written and specced, and richer: `visible:200px` preserves that early viewport boundary, it adds the reversible `in-view[:<rootMargin>]` and `media:<query>`, and it keeps the import one-shot even when the later mount lifecycle is reversible. About 70 lines gone.
- **The cleanup bookkeeping.** `__addCleanup`, `__cleanSubtree`, `__clean`, `__elementCleanups` and `__elementSchedules` — `loader.ts:434-480`, about 50 lines whose whole job is "dispose the trigger when the element leaves". `registry.ts` already owns that shape, and the lazy half does not reuse it so much as be it. Zero extra lines.
- **Recursive registration of configured children.** `__registerConfiguredChildren`, `__registerConfiguredChild` and the `children: string[]` field of the manifest — `loader.ts:381-432`, about 50 lines and a `visited` cycle guard, because `registerComponent(Ctor, token)` of v3 did not walk `config.components`. The 15 `children` arrays in the generated manifest of `@studiometa/ui` are dead data on v4.
- **Component-state bookkeeping.** `ComponentRecord` with `scheduled | loading | registered | failed`, `scheduledStrategies`, and the `record.state !== 'scheduled'` guards threaded through every branch (`loader.ts:37-45, 256-337`).
- **`readEagerTokens` and `<meta name="js-toolkit:eager">`** (`runtime.ts:88-98`), a per-page escape hatch that forced tokens eager and bypassed both the manifest strategy and `data-load`. Grepped across `@studiometa/ui`: the meta appears in the changelog and the documentation, and in no page and no template.

Resolving the class out of the imported module was split in v3: a generated manifest writes `.then(({ Slider }) => Slider)` once per entry, 80 times in the manifest of `@studiometa/ui`, and `defineManifest` does `module[exportName] ?? module.default` for hand-built entries. v4 does it once, in six lines.

### Why `data-load` did not survive

v3 has two orthogonal knobs: `ComponentLoadStrategy` (`eager | visible | idle | interaction`, per manifest entry, overridable per element with `data-load`) and, in v4, `MountStrategy`. They are the same decision asked twice. To defer the import until visible and to defer the mount until visible have one trigger and one answer. The only case where they differ is "download it now but do not mount it yet", which buys a page nothing that an eager import could not give it, and costs a second vocabulary in the markup.

A lazy entry needs a strategy field for exactly as long as the class that it names is not downloaded. That is its whole justification.

The evidence says the same. Across the three generated manifests of `@studiometa/ui`: 80 `@studiometa/ui` entries are all `strategy: 'eager'`, all 14 `ui-mapbox` entries and all 4 `ui-motion` entries are `strategy: 'visible'`. That is a policy per package family and never per component. And `data-load`, the per-element override that the four-value vocabulary exists to serve, appears in the `@studiometa/ui` repository once, in a documentation page.

### What `registerManifest()` cost to build

`registerManifest(entries)` in `registry.ts` is +245 and −18 lines in one file, comments included, sharing the map of the registry, its scan, its element bookkeeping and its mount strategies. No new module, no new observer and no new dependency. Against the 1033 source lines of v3 across seven modules, which collapse to one exported function and three exported types. The specs are +18 in `src/autoload.spec.ts`.

Two details worth keeping:

- **A trigger stands down without a teardown of its own.** `media:` reads its query inside `applyMountStrategy()`, so a lazy trigger can fire before the registry holds its teardown. The controller therefore only marks itself spent, and the teardown runs from the ordinary controller replacement. No caller depends on when a hook fires.
- **A failure is never retried.** The trigger is spent, and a retry loop against a chunk that returns 404 is worse than a quiet page.

### `config.components` and the thunk

`registerComponent()` already walked the merged map to register it, so it now defers a thunk instead of resolving it. Nothing new observes, schedules or imports.

**The object shape is what makes this work.** The key supplies the component name, and a thunk cannot until it resolves. So a lazy child is a name that the registry knows with nothing downloaded — the same knowledge that a manifest entry carries, read out of the source of the parent instead of a separate file.

**To tell a class from a thunk is the one real trap**, because a class is a function. `isComponentClass()` walks the prototype chain, which is what `resolveComponentClass()` already uses on whatever an importer resolved, so the two halves agree by construction. It is the definition of a component class and not a proxy for it: a `config` static can be forgotten, and `fn.toString()` reads source text. One shape is worth catching early: a value written with `class` that does not extend `Base` would be called as an importer and would throw "cannot be invoked without 'new'", on an element, long after the mistake.

**First wins quietly here, unlike `registerManifest()`.** Several parents that declare the same lazy child is the normal case and not a collision, and two thunks that import one module are two different function objects, so there is nothing to compare a real conflict against.

**No `mountStrategy` field**, because a `config.components` thunk is declared beside a class that carries its `config.mountStrategy` as soon as it registers. A second place to say the same thing would put back the knob that §11b dropped. Reading the merged config means that a lazy child which is a subclass inherits the strategy of its base, so the deferral never becomes the way to lose it.

Cost: about 35 lines in `registry.ts` and one union in `BaseConfig`. `ComponentImporter` moves next to `BaseConstructor` in `Base.ts` and is re-exported where it was.

### The diagnostic protocol: what it replaced and what it measured

`__reportError` of v3 is 12 lines plus a dedicated error event (`loader.ts:488-500`). v4 reports load and mount recovery through one protocol.

Runtime modules pass code literals checked against `ToolkitDiagnosticCode`, so the full public `DIAGNOSTICS` object enters the root and `./DIAGNOSTICS` export graphs only.

Warning deduplication does not collapse unrelated warnings because their text matches, and it retains no instance, element, declaration, runner or manifest input.

From `main` after #813, the public root moves from 61 to 62 runtime exports and from 90 to 91 type-only exports.

### The shared runtime: what it proves and what did not come back

A browser fixture builds two independent bundles and proves one frame request, one observer and processor path, one mount, cross-copy family and lazy-class recognition, one public diagnostic protocol with single registry reports and shared weak warning state, shared option-sensitive services, shared context state, and a final teardown.

None of the manifest coalescing, stop and restart logic, load strategies, package-version negotiation or global instance registry of v3 came back.

### Composing manifests

`composeManifests` of v3 is later-wins, so an app can shadow a packaged component by declaring its token last (`autoload.ts:32-40`). v4 is first-wins-and-warn, following `customElements.define`. An `{ override: true }` option is about five lines, but the decision is the expensive part, and first-wins is the safer default to start from.

### A scoped `root`

The cost is unknown and not small: it would change `scanName()`, `scan()` and the target of the observer. No consumer has asked.

### Informational manifest metadata

The loader reads none of `packageName`, `subpath`, `exportName`, `group`, `styles` or `integrations`. `types.ts:16-49` says so six times. They exist for tooling around the manifest.

## 12. Storage

### Why the seam is where it is

`createStorage()` owns key namespacing, serialization both ways, the `Signal` per key, and the reference-counted wiring to `useStorageSync()`. A provider owns none of that; it moves strings. That is what makes a custom backend — an in-memory map, an `IndexedDB` mirror behind a synchronous cache, a snapshot rendered by a server — six small methods and not a reimplementation, and it is what lets one storage instance be tested with no browser at all.

### Why a built-in provider never throws

Web storage fails for reasons that the caller cannot prevent: a full quota, or an area that the browser refuses to hand over, such as the private mode of Safari or a third-party frame with storage access denied. `guard()` turns each of those into a diagnostic and returns the fallback of the method, so a `set()` never becomes an exception that a component has to catch.

It reports once per operation and not once per area, because a silent write is data loss and the second failure is as informative as the first.

The area is resolved per call, inside the guard, because the getter itself is what throws when storage is denied, so a provider built at module scope must not touch it at construction.

### Why the URL adapters rebuild the whole location

The part of the URL that the adapter does not own is not its to drop, so a search write keeps the hash and a hash write keeps the query string.

### Why `syncEvents` is only a list of event names

The event carries no usable state: a `StorageEvent` names one key, and a `hashchange` names none. So the subscriber re-reads every observed key instead of trusting the payload. A provider whose changes arrive on a `BroadcastChannel` or through an observer has no way to announce them yet. That is a known gap, not an oversight, and to widen the field is the layer to add when a consumer needs it.

### Why two factories were removed

`createLocalStorageProvider()` and `createSessionStorageProvider()` resolved `globalThis[name]` per call, so a fresh instance was indistinguishable from the shared one, and five of the seventeen storage names were two ways to reach one thing. `createMemoryStorageProvider()` keeps its factory because it holds a `Map`, and two of them are genuinely two stores.

The `create<Area>Storage` presets are a different case and stay, because each removes an argument from every call site instead of only moving it.

### Why the adapters are tested against the platform

`providers.spec.ts` drives each adapter through the six methods for real — the actual storage areas, the actual `location` and `history` — including the paths that only the platform has. To test `createStorage()` over the memory provider proves the storage. It proves nothing about the four adapters that touch the platform, which are the part that can fail.
