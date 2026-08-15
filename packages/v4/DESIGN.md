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

| Fork            | Decision                                                                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mount primitive | **Observer-first**: `data-component` + one record-based MutationObserver. No tag or arbitrary-selector matching, no custom-element lifecycle, no separate directive system in core.                         |
| Shared state    | **provide/inject ships in v4 core**, Vue-shaped, with context-protocol mechanics, plus `provideRootContext()` for the sibling case that has no ancestor. The `Data*` components in ui rebuild on top of it. |
| Child events    | **Keep `on<Child><Event>` magic methods**, resolved through delegation against names declared in `config.components`.                                                                                       |

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
- Two cleanup scopes follow from the lifecycle model: `mounted()` returns are **destroy-scoped** (per cycle), and so is a pending `$inject()` request — `mounted()` re-runs on remount, which re-issues it, and a destroyed instance must not sit in the context module's pending set forever. Constructor-time registrations that outlive a cycle (`$provide`, `$watchChildren`) are **terminate-scoped** (instance lifetime).
- The hook keeps its `mounted` name — "setup" in Vue means "runs before mount", which is not what this is, and `mounted()` stays familiar to v3 authors. `destroyed()`/`terminated()` hooks remain for cases that do not fit the returned-cleanup shape.
- `config.components` loses its ownership meaning. Two jobs remain: register the declared family when the parent registers — a class right away, a `() => import('./Child.js')` thunk as a lazy entry (§11d) — and provide the name set for `on<Child><Event>` resolution. The object shape is what carries both: the key is the component name, so a lazy child is a name the registry knows with nothing downloaded.
- `$parent`, `$children`, `$root`, and `createApp` are removed. `$query()` / `$closest()` (shipped in 3.x) are the replacements.
- Sibling composition (#697, `config.use`) fits the model: a sibling is another instance on the same element, created by the registry, resolvable through the element's instance map.

### Refs are live, so there is no `$update()`

v3 resolved `$refs` once per mount and offered `$update()` to redo it when a subtree changed. v4 drops the method instead of porting it: each `$refs` property re-reads the DOM on access, so markup swapped into a component — a `Fetch` replacement, a re-render — is picked up with nothing to refresh and no detached elements left behind. The DOM is the source of truth for refs, exactly as the registry already treats it for components. `on<Ref><Event>` handlers follow the same rule: they are delegated from the root element, so refs appearing later need no rebinding.

Non-bubbling events (`focus`, `blur`, `scroll`, `mouseenter`…) are delegated from the **capture** phase, where they are still observable — the same trick makes the `mouseenter`/`mouseleave` limitation noted in #694 disappear for refs.

**A list ref keeps v3's spelling: the `[]` is part of the attribute too.** `config.refs: ['dots[]']` selects `[data-ref="dots[]"]` and exposes `$refs.dots` as an array; a plain `'dots'` selects `[data-ref="dots"]` and yields the first match. A v4-only rule that declared the suffix and selected the unsuffixed attribute was tried and reverted — it turned correct ui markup into a silent no-op (REPORT.md gap 11), and it bought nothing: the suffix says in the markup what the markup is, one of several rather than the only one. **One spelling, not two.** A list definition matches the suffixed attribute and nothing else, exactly as in v3; accepting both would be a compatibility layer over a decision that has been made. The inverse mistake — the suffix left out of the attribute — is a dev warning, once per instance and per ref, naming the component and both spellings.

**A ref may name its owner: `data-ref="Slider.next"`.** By default a ref belongs to the nearest enclosing component, so a `data-component` element between the ref and the root takes it away — which is the right rule almost always, and leaves no way at all to say _this one belongs to the `Slider` further up_. v3 had that escape hatch and v4 dropped it; it is restored here, with v3's semantics: the prefixed form walks past every boundary **except another component of that name**, so the nearest `Slider` wins and a nested one still shadows its parent. ui writes it three times, and all three are the same shape — a ref wrapped in a presentational component. `data-ref="App.form"` reaches a `Frame`'s form from the app root; `data-ref="FigureShopify.img"` reaches an image wrapped in a `Transition`.

The namespace lives in the **markup, never in `config.refs`**, and that is not a shortcut — it is what the feature requires. `FigureShopify` declares `refs: ['img']` once, inherited from `AbstractFigure`, and its templates write `data-ref="img"` three times and `data-ref="FigureShopify.img"` once, choosing per template by how deeply the image is nested. Moving the namespace into the declaration would force one component to pick a single spelling for every one of its templates, and would make an inherited ref undeclarable: `AbstractFigure` cannot know the name of the subclass that will use it. So the two forms are not two spellings of one thing, the way the `[]` question was — they are two different questions, _who is my nearest owner_ and _who is my named owner_, answered into one property. The name a ref carries elsewhere is unchanged and never namespaced: `Slider.next` is `$refs.next`, `onNextClick()`, and `@on('next', …)`; `Slider.dots[]` is `$refs.dots`, `onDotsClick()`, and `@on('dots[]', …)`. The namespace qualifies the pair, so it goes outside the suffix — `Component.name[]`, which is both v3's order and the order ui's documentation is written in.

Accepting a second spelling costs the **cold** lookup only, and it is bought back by splitting the query rather than widening the selector. `[data-ref="a"],[data-ref="b"]` costs Chromium its single-attribute fast path: over a 25-element subtree, a cold lookup went 8.0 → 11.2 µs when it matched and 1.2 → 3.4 µs when it did not. Two separate queries — the plain one keeping its fast path, the namespaced one usually returning nothing — cost 8.7 µs and 2.1 µs instead. Document order is restored with `compareDocumentPosition` only when a ref is genuinely written both ways under the same component, so one property still has one numbering for `on<Ref><Event>`'s `index`.

Resolving on every access was measurably expensive — the benchmark put a 25-element ref list ~26× behind v3's mount-time snapshot — so lookups are cached against a counter bumped by the framework's single MutationObserver. A repeated read is a property read again; any structural or `data-ref`/`data-component` boundary change invalidates it. Reading the version drains pending records with `takeRecords()`, which keeps the cache correct _within the same task_: the records enter the shared mutation queue before the read returns, so synchronous ref correctness never steals registry work. Detached elements are never cached, since no observer can see them change.

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

`$config` walks the prototype chain and merges every config it finds, so extending a component keeps what its parents declared — the crash reported in #627. `refs`, `options` and `components` all merge (v3 merged only `options` and `emits`); scalar keys stay overridable by the most derived class, and a subclass restating a `components` key wins for that key alone. An intermediate class should annotate `static config: BaseConfig`, otherwise TypeScript infers a literal type its subclasses must match.

**The registry reads the merged config too**, and reads it before any instance exists, which is why `resolveConfig()` is exported from `Base.ts`. It resolves the mount strategy of a pair (§11b) and registers the family of `config.components` (§11d) from the merged set, not the class's own static. Every subclass declares a `static config` if only for its `name`, so reading the own static made a subclass fall back to `eager` and register nothing its base declared — while its instances still announce and query those children through `$config`. A `() => import(…)` child has no registration path besides this one, so it went missing outright.

### The public surface is typed, and free

`Base` takes an optional props type — `class Slider extends Base<{ $refs: …; $options: …; $emits: … }>`. It types `$refs` and `$options` (no more casting on access) and checks `$emit()`'s event names and payloads. `$emits` maps each name to the **payload object** the event carries, `void` for one that carries nothing:

```ts
class Slider extends Base<{
  $emits: { goto: { index: number }; stop: void };
}> {}
```

It is the successor to v3's runtime `config.emits`: it keeps the documentation value of declaring what a component dispatches, with nothing left in the bundle.

#### Props are read through intersections, never conditionals

A component may take a props parameter of its own, which is how one component is extended by another:

```ts
class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
  mounted() {
    this.$options.target; // string, not `{}`
  }
}
```

Inside that class body `T` is a naked type parameter, and **TypeScript only resolves a conditional type once its checked type is concrete**. So `Options<T> = T['$options'] extends Record<string, unknown> ? T['$options'] : Record<string, unknown>` — the obvious way to give an optional key a default — is deferred there, and every option reads as the fallback however the parameter is written. `T extends ActionProps` fails identically; the parameter is still naked. This cost the `Action` port its type parameter (REPORT.md gap 22) before it was fixed.

The fix is v3's, and it is one operator: read each prop as an **intersection** with its default, `T['$options'] & Record<string, unknown>`, the way `packages/js-toolkit/src/Base/Base.ts` has always done it. An intersection has no gate — the apparent type of `A & B` is the intersection of the apparent types, so a declared half answers immediately and a deferred half contributes its constraint. It also absorbs the two ways a key can be missing: `undefined & X` is `never` and drops out of the union, `unknown & X` is `X`.

Two consequences worth knowing before changing these types again:

- **A conditional over `T` makes `Base` invariant in `T`.** Two conditionals with different checked types are unrelated in both directions, so TypeScript's variance measurement concludes invariance and `Base<SliderProps>` stops being assignable to `Base` — which is what `$query`, `$closest` and `$watchChildren` hand back, and what every helper taking "some component" is annotated with. Intersections measure as covariant and it keeps working. This is not theoretical: it is what the first attempt at this fix broke.
- **`$emits` is the exception, and needs a conditional.** `keyof (Declared & EmitMap)` is `string`, so intersecting the default in would throw away every declared name. It gets `NonNullable<T['$emits']> & (unknown extends T['$emits'] ? EmitMap : unknown)` instead — the conditional is checked against `unknown`, the type an omitted key reads as, so it fires for an omitted `$emits` and nothing else, and its branches union to `unknown` so a deferred instance contributes nothing. Everything downstream of it is then checked against the **map** rather than against `T`, and the one place a conditional is unavoidable — a `void` payload takes no argument, a declared one is required — is written `void extends M[K] ? … : …` so the checked type is concrete and only the `extends` side is deferred. Written the other way round, `$emit()` rejects every argument list a generic component gives it.

The price, also v3's: the default's index signature comes along, so reading an option or a ref a component did not declare is `unknown` (respectively `HTMLElement | HTMLElement[]`) rather than an error. Declared props keep their exact types, which is what declaring them is for.

`src/props.spec.ts` holds the assertions — `expectTypeOf` and `@ts-expect-error`, enforced by `npm run lint:types`, since none of this is visible at runtime.

### Option defaults belong to the instance: a primitive, or a factory

**The contract, in one line: a primitive can be set as a default; any other data type needs a factory function.**

`$options` reads its `data-option-*` attribute on every access — an attribute is the source of truth, and stays live. A **default** is the opposite kind of value: it is not in the DOM, so it belongs to the instance that reads it, which is what the contract is there to guarantee.

```js
options: {
  speed: { type: Number, default: 1 },
  tween: { type: Object, default: () => ({ ease: 'linear' }) },
}
```

- **`default` is a primitive or a factory.** `Function` is not an `OptionType`, so `typeof definition.default === 'function'` unambiguously means factory. `TypedOptionDefinition` requires the factory form for `Array` and `Object`, because a literal there would live on the class — the shape Vue's `data()` and its object-prop defaults enforce for exactly the same reason.
- **Built once per instance, then memoised.** Repeated reads hand back the same object, so `this.$options.list.push(x)` persists and two instances of one component never share — and corrupt — the same default. `Array` and `Object` with no declared default memoise an empty one per instance, for the same reason. Primitive defaults are unaffected.
- **The factory is lazy**: nothing is built for an option that is never read, and a component whose attribute is present never runs its factory at all.
- **A literal object or array default is warned about, not repaired.** The type-level ban settles it for anyone with a build step; the no-build path never sees a type, so the same rule is said out loud — once per declaration, naming the component, the option and the fix — and the value is then handed over exactly as declared, shared between instances. Copying it was tried and removed: a shallow copy made an unsupported declaration appear to work one level deep, and a deep copy made core guess at how to rebuild a `Date`, a `Map` or a class instance. Neither is core's job when the contract already has an answer that works all the way down.
- A mutation of a value **parsed from an attribute** is not kept, on the other hand: the attribute is re-read and re-parsed on the next access, which is what keeps options live.

### Setup-sensitive options are live effects

Reading an option on demand is enough for values used inside handlers and insufficient for an option which chooses a subscription, target, or other mount-scoped resource. A declared method named `option<Name>Changed()` turns that option into a live effect:

```js
optionTargetChanged({ value, previousValue, initial }) {
  const connection = connect(value);
  return () => connection.dispose();
}
```

The hook runs before `mounted()` on every mount cycle. Several writes in one mutation batch are coalesced from the first old raw value to the final DOM value. Before an update, the previous returned cleanup runs; all active option cleanups run on `$destroy()`, and remount starts each effect again with `initial: true`. Removing an attribute applies its declared default. Components without the convention pay no setup cost and continue to read their options directly.

### Responsive options are derived, not recomputed — implemented

One option, several values, chosen by the viewport. **Every option is responsive**, and there is nothing to declare for it — an option is declared, and the markup may scope its attribute to a breakpoint:

```js
options: {
  columns: { type: Number, default: 1 },
}
```

```html
<div
  data-component="Grid"
  data-option-columns="1"
  data-option-columns:s="2"
  data-option-columns:l="4"></div>
```

**There is no `responsive: true` flag, and there will not be one.** A prototype carried one; it was removed before merge. The rule it broke is the project's own — convention over configuration, and specifically: do not add an option whose only job is to name a thing. The framework already knows the option exists, because it is in `config.options`; the author who writes `data-option-columns:s` has already said everything a flag would repeat. A flag would also have been an opt-in that arrives too late for the machinery it gates: the scoped names have to be in the observer's filter at `registerComponent()`, so an option nobody flagged would be permanently unable to grow a scoped attribute at runtime — silently, in the framework whose premise is that the attribute is live. The shorthand form `options: { theme: String }` settles it from the other side: it has nowhere to put a flag, and it is as responsive as any other declaration.

**The value is derived on read.** `$options.columns` walks from the active breakpoint down to the base and hands back the first attribute present — the same shape an option always had, consulting the element on every access, with the viewport as a second coordinate. Nothing is stored and nothing is written.

That is what settles the constraint this feature ran into: **`$options` is read-only**, deliberately, and gap 2 of the port records the ui components that broke when it became so. An option that reacted to the viewport by being _written_ would have had to reopen the setter that was closed on purpose, for the one kind of value that has the least business being written — the DOM still holds the truth, the viewport merely says which part of it to read. Derivation needs no setter, no invalidation, and no staleness window: a component that read `$options.columns` before a crossing and after it gets two different numbers because it asked twice, not because something raced to update it in between.

The case derivation is supposed to lose — a component that has to **re-lay-out** when the viewport crosses, rather than read a value inside a handler — is not an argument for recomputation either, because the existing option-change channel already carries it:

```js
optionColumnsChanged({ value, previousValue }) {
  this.layout(value);
}
```

The hook fires on a crossing whose _resolved_ value differs, with exactly the payload an attribute rewrite produces, and the component never learns which of the two moved. This works because the option-change plumbing was never a write path in the first place: it is a **notification**, and the value in `OptionChange` is read through the option's reader at the moment the hook runs. So the reactive half costs nothing the derived half gave up. Rewriting `data-option-columns:s` while the viewport sits at `l` is not a change to `columns`, and neither is a crossing that lands on the same resolved value — the rule is one rule, stated once: a change is a change of the resolved raw value.

The listener follows from that. Reading needs no subscription, since `useBreakpoint().props()` answers honestly cold; only being **told** does. So a mount opens a `matchMedia` subscription when the component declares an `option<Name>Changed()`, and not otherwise, and `$destroy()` releases it — the same per-cycle span as every other service subscription, with the service's reference counting taking the listeners down with the last subscriber. A page whose options are only read holds no listener at all, which `responsive-options.spec.ts` asserts by counting registrations on `MediaQueryList.prototype` rather than by inspecting the service.

**The suffix names one breakpoint, and it cascades upwards.** This is the one break with v3, which spelled a _set_ — `data-option-columns:xs:s` — and it is not gratuitous. Three reasons, in increasing order of weight:

- Set membership is what nothing else on the page means. The breakpoints are `min-width` queries and the utility classes beside them cascade; the toolkit alone did exact membership. "From `s` up" was `:s:m:l:xl:xxl:xxxl` — a list that silently stopped covering the top of the range the day a breakpoint was added to the set. It is now `:s`.
- A set is not enumerable, and the one page-wide observer filters on **exact** attribute names — `attributeFilter` takes no wildcard, which §3 already says out loud for `$watchAttributes()`. The powerset of eight breakpoints cannot be written down; `attribute × breakpoint` can. Under v3's spelling, v4 could not have observed responsive attributes at all: `data-option-columns` rewritten at runtime would be honoured and `data-option-columns:s` ignored, in a framework whose premise is that attributes are the live source of truth.
- Resolution stops being a scan. v3 read every attribute name on the element and regex-tested each one, on every option access; the cascade walks a precomputed list of `attribute:breakpoint` names, which is why the derived-on-read side is affordable at all.

The separator stays a colon, because a kebab-cased option name can contain a dash — `data-option-columns-s` is ambiguous between `columns` at `s` and `columnsS` — and a colon can never appear in one. So migrating markup keeps its separator and only a multi-breakpoint suffix is rewritten. The real-world cost was measured before deciding: across `@studiometa/ui` v3's spelling is used by **one** component and **two** attributes, plus eight doc examples. A suffix naming no breakpoint is warned about once per mount, which is precisely the shape v3 markup arrives in.

`setBreakpoints()` remains the single source of breakpoint truth, and replacing the set re-derives both caches built from it — the scoped attribute names and the slice of them the observer filters for.

#### What it costs, and why it stays in core — settled

**The breakpoint service is part of the core graph, unconditionally.** `Base` reaches `services/breakpoint.js`, which pulls `services/service.js`, on every page — whether or not any markup on it is responsive. A plugin seam was considered and **rejected**: a responsive option is a basic feature of the framework, not an extra, and an option that only resolves per breakpoint if the page also imported something is exactly the configuration this design removed. The cost statement stands as written; it is a price, not an open question.

The two prices of dropping the flag were measured before it was dropped (`responsive-options.bench.ts`, Chromium):

- **The observer's filter widens by ~9×** — 3 + 33 + 8 = 44 names across the ported families when one option opted in, 3 + 33 × 9 = 300 when they all do. It costs **nothing measurable**: an unfiltered attribute write on the page (a `class` rewrite, the common case) and a filtered `data-option-*` rewrite are both flat from 44 to 723 names, within noise. The engine does not scan the filter linearly. Re-observing does scale with it — `observe()` goes 0.007 ms → 0.046 ms → 0.131 ms — but it runs once per registered class at startup, so a large app pays a few milliseconds once. Memory is a few hundred interned strings.
- **Every read walks the cascade**, and this one was real: measured in a loop, a read cost **4.70 µs** against a plain `getAttribute()`'s 0.052 µs — **91×** — and nearly all of it was asking eight kept `MediaQueryList` objects for `.matches`, not the attribute walk. **Fixed by memoising the active breakpoint name**, below: the same batched read is now **0.38 µs, 12.3× faster**, and 7.4× a plain attribute rather than 91×. What is left is the cascade walk itself — up to nine `getAttribute()` calls instead of one — which is the feature, not an accident of it.

#### The active breakpoint is memoised for the length of a task

The sweep of eight `MediaQueryList` objects was the whole cost of an option read. It is now computed at most once per task, through `utils/memo.js`, and the invalidation is the design:

- **A microtask boundary ends the cache.** This is not a heuristic with a tuned duration. A media query is re-evaluated when the viewport changes, and that change is delivered as a **task** — script runs to completion before one can be. So the active breakpoint is a _constant_ for the length of a task, and a value dropped at the microtask checkpoint is exactly as fresh as re-querying would have been, for every read it served. There is no staleness window to trade against a hit rate, which is precisely what a `maxAge` would have been.
- **Two events cut it shorter, and both are stronger.** `setBreakpoints()` replaces the named set synchronously — a crossing that no `matchMedia` event announces, and the one the specs perform — so it clears the value itself rather than waiting for the boundary. And a running service's `change` handler _knows_ a crossing happened, so it clears too. Both share the one cache with the cold path instead of keeping a second.

**Honest cold survives untouched**, which was the property at risk: memoising a read did not turn a read into a subscription. Nothing here calls `addEventListener`, and `responsive-options.spec.ts` proves it by crossing a breakpoint mid-task, reading the new value, and asserting zero registrations on `MediaQueryList.prototype` for the same window.

The first read of a task still pays the full sweep, by design. The shape this fixes is the one components actually have — a handler, a `raf` callback, a layout pass reading several options across several instances — where the sweep happened once per read to learn a name that could not have changed in between.

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

**`loadStrategy` did not survive** — see §11b. Deferring the import and deferring the mount are one decision, so a lazy entry carries a `mountStrategy` (standing in for the `config.mountStrategy` of a class not yet downloaded) and there is no `data-load`. Section 11 is the measurement.

### Responsive component declarations — implemented

The plain `data-component` token set remains unconditional. The same one-breakpoint, upward-cascading spelling as responsive options adds one responsive token set:

```html
<div
  data-component="Action Analytics"
  data-component:xxs="MobileMenu MobileSearch"
  data-component:m="DesktopMenu DesktopSearch"></div>
```

At the active breakpoint the registry walks from the widest active suffix down and takes the first attribute that is present. That value is the complete responsive set: a wider value replaces every lower value rather than merging with it. An explicitly present empty value is therefore a stop — `data-component:s="TabletFeature" data-component:l=""` runs `TabletFeature` at `s` and `m`, then removes it at `l`. The effective declaration is the deduplicated union of the unconditional set and the selected responsive set.

A crossing diffs that effective set against the registry's current element state. Shared names keep their controller and instance. Old-only names are terminated because they are no longer declared; crossing back creates a fresh identity. New-only names enter the normal registry pipeline, so eager and conditional mount strategies, `data-mount`, lazy manifest entries and lifecycle events keep their existing meaning. In particular, an inactive lazy declaration does not import its class.

The breakpoint set makes every valid spelling enumerable. The document observer registers exact `data-component:<breakpoint>` names and replaces that filter slice after `setBreakpoints()`, never observing every document attribute and never creating one observer per responsive element. Connected elements carrying a scoped declaration share one reference-counted `useBreakpoint()` subscription; pages with plain declarations open none. Breakpoint work runs through the background lifecycle boundary, so `whenDOMSettled()` includes eager teardown, import and mount work caused by a crossing.

A suffix naming no configured breakpoint is ignored and warned about once, including v3 list syntax such as `data-component:xxs:xs:s`. There is no range or breakpoint-list form: a wider replacement creates a range naturally.

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
- **Teardown follows the element.** Strategies are disposed when their element leaves the document. A _moved_ element is handed back to the registry by that teardown, so a move ends as destroy + remount of the same instance (caught by the browser suite).
- **The attribute is live.** Changing `data-mount` disposes the old strategy and applies the final declared or class-default strategy. A queued callback from a disposed strategy is guarded by controller identity and cannot mount or destroy its replacement.

## 3. One mutation engine drives the DOM

One internal engine owns one MutationObserver for component discovery, lifecycle, mount strategies, ref invalidation and declared options. Its `attributeFilter` contains the fixed framework attributes, the exact responsive component spellings from the configured breakpoint set, and the option names accumulated from registered component configs, so unrelated `class`, `style` and ARIA writes create no records. It snapshots removed subtree membership when records enter its retained queue, before background processing, and processes each batch in a fixed order:

1. destroy removed subtrees and dispose their strategies;
2. reconcile final plain and breakpoint-scoped `data-component` attributes and `data-mount`;
3. deliver coalesced declared-option changes to retained mounted instances;
4. scan added subtrees once and schedule their registered component tokens;
5. report coalesced attribute changes to the elements which asked to watch them — see below.

v3.9 re-queries every registry entry and sweeps every live instance per mutation batch. v4 resolves the effective plain-plus-responsive `data-component` token set from each inserted subtree in one pass and looks each token up in the registry.

A disconnected element receives `$destroy()` and retains its instance for reinsertion. Removing one component token from a connected element — by a plain or scoped attribute change, or by a breakpoint crossing — is different: the DOM no longer declares that identity, so the registry calls `$terminate()`. Adding that token later creates a new instance. A moved node produces removal and addition records and deliberately completes a destroy/remount cycle with the same identity.

`whenDOMSettled()` provides an explicit completion boundary for morphing, fetch-style updates and breakpoint crossings. It drains pending records, follows mutation chains created by eager lifecycle work and resolves after eager mounts and teardown have run. It does not wait for visibility, interaction, idle or media conditions, and it does not await promises returned by `mounted()`.

### Attributes the framework cannot name — `$watchAttributes()`

The precise `attributeFilter` is what keeps the engine cheap, and it is also its one blind spot: `attributeFilter` takes **exact names** and the DOM has no wildcard, so an attribute the framework cannot enumerate produces no record at all. `data-on:<event>` is the case that forces the point — its name is any DOM event, so a parse-time registration is never complete, and an in-place rewrite (`swap({ mode: 'morph' })`, a `data-bind:` template re-render) leaves a component's binding stale and **silent**. The half that is enumerable already works: a `data-option-*` name joins the filter when its class registers, and `option<Name>Changed()` reports it.

Two answers were rejected before this one. Adding the names to the global filter cannot be complete against an open-ended set. Dropping the filter and testing each record in the callback is correct and puts every `class` and `style` write in the document — animation churn included — through the queue, which is the cost the filter exists to avoid.

So the opt-in is **element-scoped**: `this.$watchAttributes(callback)` observes every attribute of the component's own element, through a second, unfiltered observer created for that element and disconnected on cleanup. The page pays for the components which ask, not for the components which exist. Nothing is created at import time, and one component's opt-in observes nothing outside its own element.

- **Destroy-scoped**, like the `mounted()` cleanups and a pending `$inject()`: the observer is disconnected by `$destroy()` and a remount re-establishes it, so the call belongs in `mounted()`. The returned cleanup is for ending it early; it is idempotent and dropping it leaks nothing.
- **The records join the shared queue.** The element observer is drained wherever the engine drains its own — `whenDOMSettled()` included — and its changes are reported from the same background task, as step 5 above. So `swap()` covers a watched attribute exactly as it covers a mount, and there is no second timeline to reason about.
- **After the framework, deliberately.** A callback is component code and must see a settled framework rather than a half-reconciled one. The consequence is the intended precedence: a component whose `data-component` token was dropped in the same batch has already been terminated by step 2, so it is no longer watching and hears nothing about the accompanying attribute change — a callback never runs against an instance the framework has just ended. Nothing in the framework reads these attributes, so no framework decision can depend on a callback, and the reverse order would have no reader.
- **Coalesced like options.** Several writes to one attribute in a batch are one change, from the first old value to the final DOM value, and a rewrite ending where it started is not a change at all — the rule `$optionChanged()` already follows.
- Delivered as one payload object: `{ name, value, previousValue }`, raw attribute strings, `null` on either side for an absent attribute. It is the **entire** attribute set of the element, framework names included; a component narrows by prefix, which is what a `data-on:` or `data-bind:` family wants anyway.

The matching surface is deliberately narrower than v3: only plain and configured breakpoint-scoped `data-component` declarations are discovered, with whitespace-separated tokens for several components on one element. v3's `<tk-name>` tag sugar, breakpoint-list suffixes and lowercase arbitrary-selector registrations are not kept. `data-component` still enhances native elements (`<form>`, `<a>`, `<details>`, table markup) and supports several components on one element — both impossible with custom elements as the primitive.

## 4. Parents listen to child events

`$emit` becomes a native bubbling, cancelable event (#630):

```js
$emit(event, payload) {
  return this.#dispatch(event, payload); // detail = payload, verbatim
}

#dispatch(event, detail) {
  const e = new CustomEvent(event, { bubbles: true, cancelable: true, detail });
  e[SOURCE] = this; // symbol — avoids userland collisions
  this.$el.dispatchEvent(e);
  return e; // caller can check e.defaultPrevented
}
```

### The payload is one object, and it is the detail

`$emit(name, payload?)` takes **one optional object**, and `detail` **is** that object. Omitting it leaves `detail` at the platform's own `null` — the value `new CustomEvent('open')` stores — rather than at a synthesized `{}`, so `$emit('open')` stays a single word and nothing stands in for a payload nobody announced.

```js
this.$emit('open');
this.$emit('slide', { direction: 1 });
```

Three reasons, in order of weight:

- **The platform says so.** `CustomEvent.detail` is one value. The variadic form v4 started with — `$emit(name, ...args)` packing `detail: args` — was a v4 invention layered on top of it, and every listener outside the framework paid for it: plain JavaScript on the page, an `addEventListener` in a Twig template, a test, all read `event.detail[0]` for what the emitter called one thing. `detail` is now what a listener would have guessed.
- **Named fields survive evolution; positions do not.** A third thing worth announcing is a new key that every existing listener ignores. A third positional argument is a signature change, and `$emit('open', item, index)` has to be read against the declaration to know which is which — `$emit('open', { item, index })` does not.
- **It removes an ambiguity rather than moving it.** With variadic arguments, `detail` was sometimes a payload and sometimes a list of them, and the delegation path had to guess with `Array.isArray(detail)`. One object means one answer everywhere: a delegated `on<Child><Event>()` handler receives `{ event, target, payload }` where `payload` **is** `event.detail`. That is why a bare non-object is not accepted as a shortcut — it would put the guess back.

The type enforces it, and a `console.warn` says it out loud at runtime. The warning is not redundant with the type: the no-build path — magic `on<…>` method names, a plain `<script type="module">` — is a first-class audience here and never sees a type, so for them the rule would otherwise be a convention nothing checks. `$emit('slide', 1)` would work, silently, and box a positional argument back into an API that just removed them. The event still dispatches; the warning reports a shape rather than policing one.

The cost of the migration was measured before it was chosen. Across `src/`, `migration/` (five ported ui families) and `demo/` there are 24 `$emit` call sites: **18 pass nothing at all** and are untouched, one (`SliderDrag`'s `$emit(props.mode, props)`) already passed a single object and only changed its declaration, and **five** carried positional values — `slide`, `goto`, `index`, and `Accordion`'s `open`/`close` pair. Those five now name what they announce, which is the whole diff at the call sites.

`EventsManager` switches from per-child binding to delegation on `this.$el`:

- One listener per event type on the parent's root element.
- The handler walks from `event.target` up to `this.$el`, reads each element's instance map, and calls `on<Name><Event>` for the first matching mounted instance.
- Dynamically inserted children need no rebinding.
- `config.components` still provides the name set, because method names alone are ambiguous (`onSliderDragStart` → `SliderDrag`+`start` or `Slider`+`drag-start`).
- `mouseenter`/`mouseleave` do not bubble: these two keep direct binding (accepted limitation).
- `$on`/`$off` and `Action`-style directives keep working unchanged and benefit from bubbling.

### Global handlers — `onWindow<Event>` / `onDocument<Event>` — implemented

Delegation covers everything that happens **inside** a component. The events it structurally cannot cover are the ones a component needs precisely because they happen elsewhere: a click _outside_ it, a `popstate`, a `visibilitychange`, a window `resize`. There is no partial substitute — ui's `ClickOutside` is an `onDocumentClick` and nothing else, so without this it has no v4 form at all.

So the two v3 prefixes are kept, resolved in `#bindHandlers()` alongside the other three rules:

```js
class ClickOutside extends Base {
  onDocumentClick({ event }) {
    if (!event.composedPath().includes(this.$el)) this.$emit('click-outside', { event });
  }
}
```

Four things are decided, and each of them is the answer to "what would surprise a reader least":

- **Scope: the mount cycle**, like every other handler. The listener goes in the same `#listeners` array — which already stored an `EventTarget` — so `$destroy()` removes it and a remount rebinds it. The alternative, instance lifetime, means a destroyed component that keeps reacting to window scroll, which is the bug this is most likely to cause and the reason to be explicit about it.
- **Phase: bubble, always.** `CAPTURED_EVENTS` exists for delegation only — a non-bubbling event fired on a descendant never reaches the delegating root on the way up, so it has to be caught on the way down. A global handler delegates nothing: its listener already sits at the top of every propagation path, so an event dispatched _at_ `window` or `document` reaches it in either phase. Capturing would only change what it hears (the `scroll`, `focus` and `mouseenter` of every element on the page) and when (before the page's own handlers instead of after). Bubble phase makes `onDocumentClick` hear exactly what `document.addEventListener('click', …)` hears, which is what the name promises. A component that wants a descendant's non-bubbling event has `on<Ref><Event>`, from the right scope.
- **Resolution: the prefixes are reserved**, and matched before children and refs. `onWindowResize` binds to `window` even in a component whose `config.components` lists a `Window`. Letting a declared name win would make a handler's meaning depend on a `config` entry declared elsewhere in the file — and the choice is settled by an asymmetry rather than by taste: a child named `Window` can still be reached explicitly with `@on('Window', 'resize')`, whereas nothing would be left to reach `window` with. The side with an escape hatch is the side that yields. This is a rule about **method names** and stays one: the decorator reserves nothing, because it takes the global as a value — see §6. `on<Event>` and `onDocument<Event>` never collide at all: they are different method names, so `onClick` (own element) and `onDocumentClick` (the page) coexist on one component, and a click on the element fires both — it _is_ the element's event, and it _does_ bubble to the document.
- **Payload: `{ event, target }`**, where `target` is the global the handler named. Same vocabulary as the two delegated shapes, in which `target` is always whatever the handler resolved to — the child instance, the ref element. No `payload`, because a platform event is not a component's announcement, and no `index`, because there is nothing to index. Destructuring reads identically to the v3 hook it replaces: `onDocumentClick({ event })`.

Listener options (`once`, `passive`) are deliberately **not** part of this. A method name has nowhere to put them, and the question is the same one the `Action` port raised for its own bindings — it belongs to whatever answers it there, not to this.

### Negotiated events — `$domUpdate()` and `$emitExtendable()` — implemented

The strongest instance of this objective is not a notification but a **negotiation**: a component announces a step _before_ it happens, and anything up the tree may take part in it. There are exactly two things a listener can ask for, and they are the two modes of one mechanism.

| mode          | asks for   | registers with | keeps                 | on failure                     |
| ------------- | ---------- | -------------- | --------------------- | ------------------------------ |
| **take over** | the action | `wrap(runner)` | one runner, last wins | the mutation is applied anyway |
| **delay**     | the moment | `waitUntil(x)` | many, all awaited     | the step goes ahead anyway     |

```js
// Take over: the mutating component announces instead of mutating.
await this.$domUpdate(() => this.$el.replaceChildren(fragment));
this.$on(DOM_UPDATE_EVENT, ({ detail }) => detail.wrap(viewTransition));

// Delay: the choreography announces its step and waits for whoever asked.
async close() {
  await this.$emitExtendable('close');
  this.$el.close();
}
this.$on('close', ({ detail }) => detail.waitUntil(this.leave()));
```

**@studiometa/ui grew this protocol twice, independently.** `utils/dom-update.ts` (`wrap`, consumed by `DataBind` and `Fetch`, wrapped by `MotionView`) and `Dialog.__emitExtendable` (`waitUntil`, extended by `MotionView` again) have the same transport, the same synchronous-only window, near-identical warning wording and the same duck typing — two spellings of "let anything up the tree negotiate a step". Both collapse onto this one primitive: `Dialog` becomes `await this.$emitExtendable('close')`, `Fetch` and `DataBind` become `await this.$domUpdate(mutate)`, and each drops its private copy of the window, the warning and the normalization. In the code the two modes are one function, `negotiate()`, and the only thing that differs between them is what `accept` does with a registration — overwrite the single one, or push onto the list.

Why it belongs in core rather than in a component library:

- **It is ambient interception through DOM ancestry** — no registration, no handshake, no ownership. The emitter never learns who answered, and the answerer never learns what the step does. That is this section's thesis applied to the one thing components could not previously delegate.
- **The alternative is coupling.** Without it, animating a fetched replacement means the mutator knowing about the transition, or the transition reaching into the mutator; holding a dialog open means the dialog knowing its contents animate. Both are the `$closest()`-and-poke shape the flat topology exists to remove.
- **It closes the gap left by section 9.** `exit` and `layout` animations need a hook _before_ the DOM changes, and a `MutationObserver` fires after the element is gone. An announced step is that hook, and it is the only one the DOM can give us.

What the v4 form changes:

- **The detail is one object** — `event.detail.wrap(…)`, not `event.detail[0].wrap(…)`. This was once a difference between a protocol event and a component's own, and it is not one any more: `$emit()` carries one payload object too, so a negotiated event is shaped exactly like every other event in v4. ui dispatched raw for a stated reason that was not the real one (`Fetch` overrides `$emit` with a string-only signature that would mangle a `CustomEvent`, a wart v4 does not have), and the shape reason that did hold has now dissolved.

  **Delegation is not the price of that.** `on<Child><Event>()` handlers are bound by event _type_ on the root element and walk up from `event.target`, so they never inspect how the event was constructed: `onFetchDomUpdate()` fires either way. The delegated payload is `event.detail` verbatim, so a handler reads `{ payload: { wrap } }` for exactly what a raw listener reads as `event.detail` — one shape, no `Array.isArray` branch, framework protocol details included.

- **The protocol events keep their own dispatch path, for the one reason that survives.** They are framework events rather than a component's own, so they are deliberately absent from `$emits` — a component must not have to declare a protocol in order to announce through it. `$emit()` is precisely the method that forbids that: a component declaring `$emits` may only emit the names it listed. Routing `$domUpdate()` and `$emitExtendable()` through `$emit()` would therefore need a cast at every call — trading a documented bypass for a hidden one.

  So the split is drawn one level down instead. A private `#dispatch(event, detail)` builds and sends the event — `bubbles`, `cancelable`, `detail`, `[SOURCE]`, the four decisions, in one place. `$emit()` is `#dispatch()` plus the `$emits` type constraint; the negotiated events are `#dispatch()` without it. Nothing is duplicated, nothing is cast, and the constraint is not weakened. The three other framework protocol events — `component:mounted`, `component:destroyed`, `context-request` — sit outside `$emit()` for the same reason (`component:destroyed` also dispatches on `document`, its element being gone, so it does not share the primitive).

  One consequence is deliberate: a component overriding `$emit` does not intercept these. A framework protocol is not a component's own event.

- **`defaultPrevented` is ignored** (part of open question 2, for these events): the step is announced, not proposed. Honouring cancelation would make "the emitter's work always completes" false, and a listener that wants nothing to happen says so through its own state.
- **Registration is valid only while the event dispatches,** in both modes. A listener that keeps the function and calls it later is warned and ignored, because by then the step has already happened — handing a change to a runner at that point would apply it twice or not at all. The warning is built from the mode's key and the event's name, so there is one wording rather than two.
- **The duck-typed method is the one that names the event for the object:** `update(mutate)` for a DOM change, `close()` for a dialog's `close` step. This is the `on<Child><Event>` rule again — resolve by name, do not add an option that names a thing. ui's `Dialog` mapped `open`→`enter()` and `close`→`leave()`, a Dialog-specific vocabulary the core rule replaces; `waitUntil()` also accepts a plain thenable and a plain function, so `waitUntil(() => this.enter())` covers any pair of method names with nothing to configure.
- **The emitter's work always completes.** A runner that throws, rejects _or resolves without ever calling `apply`_ loses the animation, never the change — ui covered only the first two, so a runner that forgot to apply silently dropped the update. An extension that rejects is swallowed, because a failing extension must never leave a dialog painted with the scroll locked. Failures go through `reportError()` (section 8); misuse — a late registration, a runner that never applied — through `console.warn`.
- **The last claim wins in take-over mode,** as in ui. Bubbling reaches the nearest ancestor first, and the nearest is not necessarily the one that should animate: an outer component owning the whole region takes over deliberately. **Delay mode keeps every registration**, and that difference is intrinsic: replacing an action is exclusive, postponing one is not — two components animating out must both be waited for.
- **Unclaimed is synchronous.** With nobody listening, `$domUpdate()`'s mutation runs before the returned promise exists, so a reactive pipeline can read the DOM back on the next line — which is what `DataBind`'s synchronous binding pass requires.

**Composition with the two runners core already ships is the point of the function shape.** A `DomUpdateRunner` is `(apply) => void | Promise<unknown>`, so:

| claim                                         | effect                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wrap(viewTransition)`                        | the change plays as a batched native view transition (section 7), with no adapter — `viewTransition(update)` already has the runner's exact shape |
| `wrap((apply) => this.$write(apply).promise)` | the change lands in the frame's `write` phase, batched with every other write and canceled with the claiming instance                             |
| `wrap(motionView)`                            | the duck-typed transitioner form: any object with `update(mutate)`, which is what `MotionView` in `@studiometa/ui-motion` already is              |

Neither runner is the default, and that is deliberate: `$domUpdate()` with nobody listening must stay a plain synchronous mutation. Choosing a lane is the ancestor's decision, because the ancestor is the one that knows whether the region is animating.

## 5. Children advertise their existence

The piece that makes the flat, order-free topology workable. Two layers, a page-wide lookup for what neither layer is scoped to reach, plus a separate shared-state primitive.

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

### The page-wide lookup — `getInstances()` — implemented

Every lookup above is scoped to one component: `$query()` walks descendants, `$closest()` walks ancestors, `$watchChildren()` needs a component to watch from. A component that acts on other components _named at runtime, anywhere on the page_ — `Action` is the one that forced this — has none of them, and no ancestor to inject from either, because its targets are named by an arbitrary `config.name` and have no owner.

```js
getInstances('Dialog').forEach((dialog) => dialog.close()); // page-wide
getInstances('Dialog', section); // scoped to a region
```

**It re-derives the answer from the DOM instead of keeping a registry of instances**, which is the core model applied rather than an exception carved out of it: the document already knows where the components are, and a second index of it can go stale. It is also not the slow path — a `querySelectorAll` narrowed by name beats v3's walk of every instance on the page, measured on the `Action` port. That measurement is the reason gap 7's "per-class instance registry" is answered with a function rather than with a registry.

Three decisions, all of them the ones the component-scoped lookups already made:

- **A matching element with no instance is skipped.** A declaration is an intent: an unregistered name never gets an instance, and a `data-mount` strategy still waiting has none yet — consistent with "a waiting component is invisible to `$query`".
- **The filter is `$isMounted`**, so a destroyed _or_ terminated instance is never returned. `$terminate()` destroys first, so one predicate covers both, and a detached-but-retained subtree — the case that exists only because destroy is reversible — is exactly what a caller must not run effects on.
- **`root` is a `ParentNode`** and the call _is_ `querySelectorAll`: an element root searches its descendants and never matches itself.

There is no selector-strategy seam behind it. v4 resolves components through `data-component` alone — no tag matching, no arbitrary selectors, no custom elements — so name → selector is the only lookup shape there will ever be, and `selectorFor(name)` (already public, on `/utils`) is the single place that contract is written down. `getInstances` exists so that resolving by name never means hard-coding `[data-component~="…"]` and reading `el.__base__` in user code.

### Shared state — provide/inject in core

Advertisement solves "who is there", not "what is the current value". For continuous shared state, v4 ships a provide/inject primitive modeled on Vue:

- Typed injection key (no string collisions).
- Subtree scope with nearest-provider-wins shadowing.
- **The value is provided verbatim** — nothing is wrapped, so the key's type is the contract end to end.
- Which is what makes the curated owner surface (`expose` pattern) expressible: state to read, commands to call, and nothing else of the coordinator.

```ts
// The coordinator exposes what a control may ask for.
api = this.$provide(SliderContext, {
  state: signal({ index: 0, total: 0 }), // what changes
  goNext: () => this.goNext(), // what a control may command
});
```

A reactive value is a provided `Signal`; a command surface is a provided object; both together is an object holding Signals. Auto-wrapping every value in a `Signal` — the first shape this took — made the third case impossible, and a control that needs `goNext()` then has only one way left to reach it: `$closest('Slider')`, which is precisely the coupling the primitive exists to remove. An event and a command are both legitimate and not interchangeable: `$emit` says "this happened" upward, an exposed method says "do this" to a known owner.

Injection has two forms, and the difference is what the caller does about absence:

| form               | resolves                             | when nothing provides                                                                     |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `$inject(key)`     | a promise, `await` it in `mounted()` | **never settles** — deliberate: order independence means a missing provider is "not yet". |
| `$injectSync(key)` | the value, synchronously             | `undefined` — the caller falls back, does nothing, or degrades.                           |

`$injectSync` costs nothing extra: the context request is answered synchronously when a provider is listening, so the sync form is that same round trip without the promise. It is the form a click handler or a keyboard shortcut wants — an answer now or not at all. The async form's pending request is **destroy-scoped**: a destroyed instance leaves nothing in the module's pending set, and `mounted()` running again on remount re-issues it with nothing to re-declare. (The `@inject` field decorator requests once, at construction, so a field left unresolved through a destroy is not re-requested; a consumer that may wait through several cycles calls `$inject()` from `mounted()`.)

Mechanics follow the WICG community context protocol: the consumer dispatches a bubbling `context-request` event with a key, a callback and a `subscribe` flag; the nearest mounted provider answers, and replays to late requesters / re-announces on late provider mount. This fixes both criticals from the earlier `withStore` design: resolution goes through the DOM event path instead of attribute walking, and replay happens only after the provider is mounted and initialized. `subscribe: true` is what lets an **already answered** consumer be taken back by a nearer provider that appears later — see "Being re-answered" below.

The `Data*` suite in @studiometa/ui (DataScope/DataBind/…) rebuilds on this primitive and drops its bespoke channel plumbing — but only once the sibling case has somewhere to live, which needed one addition.

#### The outermost scope — `provideRootContext()`

Provide/inject needs an ancestor to provide from, and the sibling channel is the one case with nothing to name. `DataBind` is `withGroup(Base, { getScope: (i) => getDataScope(i.$el) })`, and `getDataScope` returns `undefined` when no `DataScope` is above it — at which point v3 fell back to a **page-global registry** hung off `globalThis`. So a bare `DataBind` binds by name across the document with no ancestor at all, and "rebuilds on provide/inject" was true for the scoped half and structurally impossible for the other.

`provideRootContext(key, create)` closes it by making the page-wide case the **outermost scope of the mechanism that already exists**, rather than a second mechanism beside it. The value is provided on `document.documentElement`, so a `context-request` from anywhere reaches it by bubbling and any nearer provider still wins by `stopPropagation` — a page-wide default and a scoped override are one primitive at two depths. `create` runs at most once per key, so peers join rather than race, and nothing is created at import time: a page that never asks never gets a listener.

```js
// Scoped or page-wide, resolved the same way, nearest first.
const channels =
  injectContextSync(el, DataChannels) ?? provideRootContext(DataChannels, () => new Map());
```

Two consequences, both deliberate. A root provider is **not disposable** and outlives whichever instance asked first: it is page state, and tying its lifetime to the earliest consumer to mount is exactly the ordering dependency the primitive exists to remove. And `withGroup` is therefore **not ported** — its `$group` was a member `Set` with no value cell, which is why ui had to build `getDataChannel(this.$group)` on top of it; a provided registry of `Signal`s is that cell, owned by the provider, and it makes the two registries one.

`context.spec.ts` carries the spike: bare peers on a name share a channel, scoped peers share a different one, names never collide, and the value is live.

#### Being re-answered — `subscribe: true`

The outermost scope has a sharp edge, and the `Data*` port found it: **a page-wide provider answers from `document.documentElement`, so it reaches every unscoped consumer on the page — and an answered request was deleted.** Replay only ever helped a request nobody had answered. So once the root provider existed, every consumer that fell back to it was bound to it permanently and silently: wrap a `DataScope` around content that is already on the page and its descendants keep trading values with the page-wide channel. Nothing errors. The port worked around it with an eight-line `RESCOPE` broadcast of its own and filed it as an ask for core.

The fix is the WICG protocol's `subscribe` flag, which v4 was implementing the protocol without. `injectContext(el, key, { subscribe: true, onProvide })` keeps the request live after it has been answered; `onProvide` is called for every answer, synchronously, and `cancel()` is the unsubscribe. Omitted or `false` is exactly the old behaviour — one answer, request deleted — which is what a control that found its coordinator wants. `$inject(key, options)` passes it through and keeps the subscription destroy-scoped, like the pending request it grew out of.

**The trigger is the mount announcement, not a provider-side broadcast.** A `context-provided` event dispatched down a provider's subtree was the obvious alternative and it makes providers special for something they are not special in. Every mount already announces itself with a bubbling `component:mounted` carrying its instance (objective 5, layer 1); `$watchChildren` only looks parent-scoped because it listens on `this.$el`. So the context module keeps **one listener, on the document**, attached on the first subscription and never at import time. It fires after `mounted()` has run, which is also why the re-answer does not go in `provideContext()`: a field-initializer `$provide` would re-answer consumers from a provider that is still constructing itself.

Two `contains()` calls bound the per-mount cost, and together they are exactly the set of consumers whose answer _can_ have changed: the newcomer must contain the consumer, and it must sit inside the provider already answering it. The second is the general form of "only root-answered consumers can be wrong" — the root provider contains everything, so those always pass, while a consumer already held by a nearer provider is dropped before any event is dispatched. Nothing is re-checked for a mount that changes nothing.

The registry that makes this iterable **holds nothing**. A subscription's lifetime is anchored on its consumer element through a `WeakMap` — the same reason v3's scoped-groups registry used one — and the iterable index holds `WeakRef`s, pruned on the sweep that finds them dead. A plain `Set` would have been simpler and wrong: the callback closes over the consumer instance, which holds its element, so every consumer that ever resolved would stay alive for the life of the page. `context.spec.ts` asserts it with a real collection over CDP rather than assuming it.

**A re-answer replaces, never accumulates.** `onProvide` may return a teardown for the value it was given; it runs before the next value is delivered and on unsubscribe, so whatever the consumer did with the previous provider is undone first. An identical value is not an answer — a nearer provider can hand over the very same object, and tearing a working binding down to rebuild it identically is churn, not correctness.

**The port consumes it and its workaround is gone.** `DataBind.mounted()` is now a single subscribed `$inject` whose `onProvide` joins the group and whose returned teardown leaves it, and `DataScope` has no `mounted()` at all — its only job is the boundary in its field initializer. That is the whole eight-line `RESCOPE` broadcast, plus a symbol and an interface, deleted; the three specs that encode the problem pass unchanged, because they always asserted which registry a member ends up on rather than how it got there. One thing the shape does demand of a consumer: a subscribed request waits forever while nothing provides, so a member with no scope above it still has to create the page-wide registry — `injectContextSync(…) ?? provideRootContext(…)` stays the fallback, and creating the provider replays the member's own pending request.

The reactive container is called `Signal` — the name the ecosystem settled on (Angular, Solid, Preact, the TC39 proposal), and the one @studiometa/ui already uses to describe its `Data*` suite. It is built by `signal(initialValue)`, a factory over a closure rather than a class: nothing about it wants inheritance or an instance identity, `new` was the only reason it was a class, and a closure is what makes the private delivery state genuinely private. **The accessor stays `.value`** — the factory changed, the read/write shape did not. `signal()`/`signal(next)`, the call-style accessor alien-signals uses, was the alternative and was rejected: it costs every existing call site, it makes `count.value++` into `count(count() + 1)`, and it gives a reader no way to tell a read from a write at the call site.

**A write settles synchronously and the newest value wins.** The obvious fan-out — assign, then walk the subscribers — is wrong in a way that only shows up under re-entrancy, and `Data*` is exactly where it shows up: when a subscriber writes back mid-delivery, the walk carries on with the value it started on, so a subscriber positioned _after_ the writer is handed a frame that is already stale, _after_ it has been handed a newer one. Last-write-wins quietly becomes last-listener-wins. So the value a reader sees is split from the value being delivered, and the delivery loop re-reads the former after every callback: when it has moved, the round is abandoned and restarted on the new value instead of being finished on the old one. Subscribers still to be reached skip the superseded frame entirely.

This is the property @studiometa/ui's `DataChannel` gets from alien-signals today, and the reason it can be dropped rather than depended on — its `publish()` always builds a fresh frame object, so the `===` bail-out never fires there and what it actually relies on is _one delivery per subscriber per settle, carrying the latest value_. Settling stays in the same task on purpose: `DataBind` echoes form-control input, and a microtask hop would be a visible change of behaviour. The price is that a subscriber writing unconditionally on every delivery live-locks the loop rather than overflowing the stack, which is the same trade every synchronous reactive graph makes.

## 6. Decorators — sugar, never a requirement

No engine ships stage-3 decorators yet, so requiring them would break the no-build promise: **every decorator is a thin wrapper over a function API that works without it.** Projects that build their sources opt in; a page loading the package from an ESM CDN keeps `registerComponent`, `$provide`, `$watchChildren`, `$read`/`$write` and the magic `on<Child><Event>` method names.

| Decorator                         | Wraps                                   | Notes                                                                     |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------------- |
| `@component({ name })`            | `static config` + `registerComponent()` | Registers as soon as the class is defined.                                |
| `@on(target, type)` / `@on(type)` | the magic `on<Child><Event>` names      | Target as a name **or** as a value. See below.                            |
| `@provide(key)` / `@inject(key)`  | `$provide()` / `$inject()`              | Same shape as Lit's `@provide`/`@consume` over the same context protocol. |
| `@children(name, callbacks)`      | `$watchChildren()`                      | Callbacks are bound to the instance.                                      |
| `@read` / `@write`                | `$read()` / `$write()`                  | Runs the method body in that scheduler phase, cancel-on-destroy included. |

`@on` is the one that is genuinely better than the form it replaces, not just shorter. The explicit `(target, type)` pair means: no name parsing, so `onSliderDragStart`-style ambiguity disappears; no `config.components` entry needed, since the child name is in the decorator; any event name works, including ones no method name could spell (`fetch:after`); the method is free to be named after what it does (`autoclose()`); and several `@on` stack on one method. The magic names stay for the no-build path, and a method bound through a decorator is skipped by the name scan so the two never double-bind.

**The target is a name or a value** — `@on('click')`, `@on('AccordionItem', 'open')`, `@on(AccordionItem, 'open')`, `@on(window, 'load')`, `@on(document, 'click')`. Taking the value is what gives the global form a spelling at all. As a string it would have to be reserved, and a second reserved-name rule inside the decorator's own string space is worse than the one the magic names already carry: `on<Event>` reserves `Window`/`Document` at the cost of nothing, because `@on('Window', 'resize')` is exactly the escape hatch left for a child of that name — reserving the string there would close the escape hatch it is the escape hatch for. So nothing is reserved: `'Window'` still means the child, `window` means the global, and the two stand side by side in one component.

- **A class resolves to its merged `config.name`** — the same string the string form resolves to, landing on the same delegated entry. It is not a parallel path, it is the same one with the name read off the class instead of typed out. `resolveConfig()` rather than the class's own `config.name`, because the merged config is by definition what the instance mounts under, and so what the delegation walk looks up. What the class form adds is the type: the class _is_ the type, so `target` is the component and `payload` is read from its `$emits` with nothing to annotate. `@on(window, 'click')` types the event from `WindowEventMap` and falls back to `Event` — never `any` — for a custom name.
- **A lazy child is the reason the string form exists.** A child declared as `Child: () => import('./Child.js')` exists to keep its chunk out of its parent's, and `@on(Child, 'open')` would import exactly what the thunk defers — the class form is useless there, by construction. So `@on('Child', 'open')` is not a fallback for it, it is the form that case is served by, and it imports nothing at all. The thunk is not itself a target — a function with no `config`, refused by the overloads and at runtime.
- **A name is a child _or_ a ref**, resolved children-first, so the string form types its handler as either `DelegatedEvent` or `RefEvent`. The class form has no such doubt: a class can only be a child.
- **A ref is named the way it is declared** — `@on('dots[]', 'click')` for `config.refs: ['dots[]']`. One rule covers the whole family: _the declaration spelling is what you write to refer to the entry, the property spelling is what you write when a name is derived from it._ `config.refs`, `data-ref="dots[]"` and `@on()` all refer to the entry and all carry the `[]`; `$refs.dots` and `onDotsClick()` derive a name and drop it. One spelling each, never two — the same choice #785 settled for the attribute, applied one layer up. A mismatched `@on('dots', 'click')` **warns** rather than binding silently, which is the failure it would otherwise be: there is no type that could catch it, since the decorator sees a string and cannot read the `config.refs` declared elsewhere in the class body. The warning is raised at bind time, where both are known, and only when the other spelling is actually declared — a name matching nothing at all stays silent, because `@on('Child', …)` deliberately needs no `config.components` entry.
- **A global target goes through `bindGlobal()`**, the same binding `onWindow<Event>` uses: bubble phase for the reason above, listener per mount cycle, removed by `$destroy()`. `HandlerRegistration` records the target as itself rather than encoding it into `child`, which is what keeps the string space free.
- **Any other `EventTarget` is refused**, by the overloads and by a `TypeError` for the untyped path. Not a gap: a decorator is evaluated once, at class definition, with no instance and no document, so an arbitrary target can only ever be a module-scope value shared by every instance — which is not what a per-mount-cycle listener means. A ref is already covered by the string form; anything else is one line in `mounted()`, `addEventListener` plus the cleanup returned beside it, scoped by the machinery that is already there.

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
- That property is only true if a component can actually let go **within** a mount cycle, which is what `toggle()` (§8) is for. A component holding `ticked()` for the lifetime of the page would make "no permanent rAF loop" false on any page with a slider or a scroll animation.
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

A service is a shared source of props components subscribe to: `ticked`, `scrolled`, `resized`, `moved`, `dragged`, `intersected`. `KeyService` and `LoadService` are not ported — a `keydown` listener and `window.onload` need no service around them.

> **Hardened after an adversarial review** (`SERVICES-REVIEW.md`, 2026-08-12): 17 confirmed defects, each with a regression test, plus the API changes recorded below. Three claims this section used to make were falsified by that review and are corrected in place.
>
> **Two of that review's findings are still open, on purpose** (`SERVICES-SURFACE.md`, 2026-08-13): whether every source should emit in one frame-aligned phase, and whether one `Service<T>` with an honest `props()` can cover a gesture. Both change semantics across all five services and both amend decisions this section made deliberately, so they are written up with their evidence — measured, not asserted — and not implemented. The short version of each: the phase is the wrong axis and the **write path** is the right one, since frame-aligning a discrete source has to either collapse a tap or copy its props; and `props()` should split, staying `T` for the sampled sources and becoming `T | null` for the pointer, the drag and the frame — which is what `hasProps()` already says at runtime while the type says `T` for all six.

- **Lazy and reference-counted.** `createService()` starts the definition on the first subscriber and tears it down on the last: no listener, no observer and no frame while nobody listens. This is the property the whole design leans on, since components mount and unmount constantly under `data-mount` strategies. **Publishing is re-entrant**, so a subscriber that unsubscribes while it is being called can tear the service down inside the `emit()` it is still in: anything that mutates state after publishing checks first. The drag service's `drop()` did not, and subscribed an inertia tick to a dead service — a frame loop nothing could release.
- **Symmetric subscriptions.** `subscribe(callback)` returns the unsubscribe, like `Signal.subscribe()`, `provideContext()` and the mount strategies. `AbortSignal` was measured as the alternative and rejected: 17× the cost per subscription, and not what the ecosystem uses internally either. It is spelled `subscribe` rather than v3's `add` because the arity changed — v3's `add('id', callback)` would otherwise have compiled and subscribed the string. **A closure is not automatically safe:** keying subscribers in a `Set` by the callback itself made two holders of one function collapse into a single entry, so the second was never called and the first unsubscribe tore the service down under it. Subscriptions are records; reference counting counts holders. **The fan-out walks a snapshot,** and each record carries an `isActive` flag: iterating the live set visited subscribers _added_ during the update — handed props measured before they existed, and unbounded if a subscriber subscribes from its own callback — while removal was only correct _because_ the set was live, so the two changes are one change.
- **The first delivery is asked for — `subscribe(callback, { immediate: true })`.** A subscription says "tell me when this changes", and a component laying itself out also needs "tell me where it stands"; the two are different requests and only one of them was available. Which sources answered the second was an accident of their machinery: a `ResizeObserver` delivers the current box on `observe()` for free, so the resize service spoke on subscribe and the other four did not — the asymmetry three of the review's six agents flagged independently, invisible in the types. It is now the option `Signal.subscribe()` already had, honoured by the sources that have a current value and a no-op for the ones that do not, which each service states through `hasProps()`: the frame tick has none between two frames — its `time`/`delta` describe _a frame_, and handing over the last one would have a newcomer integrate a delta everyone else has spent — the pointer has none before it has been seen, and a drag has none outside a gesture. Delivering to a source's resting value instead would mean announcing the centred pre-event pointer position and the `idle` drag as readings, which is exactly what makes them dishonest. Only the new subscriber is called: an emit would hand every other one props it has already been given. The mixins take the same option, so `withResize(Base, { immediate: true })` is how a `resized()` learns its starting box. `withInView` defaults it to `true`: before the first platform entry that still emits nothing, while a later component joining an active observation receives the real entry already held by the service; `immediate: false` opts out.

  It also exposed a defect of its own, which had been invisible while nothing read a run's first props: `deltaX`/`deltaY` were measured against the position the _previous_ run ended at, so a service restarted after the page had moved announced a scroll nobody performed — 100 px of it, in the test that now guards it. A run's first props carry no movement.

- **Scoped to a target.** `useScroll(target?)` takes an element or the window, `useResize(target?)`, `useScrollProgress(target, options?)` and `useInView(target, init?)` take an element, and `useDrag(el)` takes an `HTMLElement` or an `SVGElement`; `useWindowScroll()` and `useWindowSize()` name the default cases, the split VueUse, solid-primitives, react-use and runed all make. `useRaf()`, `usePointer()` and `useBreakpoint()` have nothing to scope — the frame is the clock, the pointer is read from the window, and a media query answers about the viewport. `useScroll(document.documentElement)` is the window service, because the document scroller dispatches its events at the document.
- **One instance per target and service options,** keyed in a `WeakMap` by `perTarget()`. This is lifecycle bookkeeping rather than throughput: reference counting only means something against a target, so the last subscriber of one element must release that element's observer and leave the others running. `useInView()` includes every `IntersectionObserverInit` field in the key and gives object roots stable weak identities; `useScrollProgress()` includes its resolved offset. Sharing one observer across targets was measured indifferent — the widespread claim traces to a single 2017 measurement, and 500 idle observers now cost ~0.02 ms/frame in total (`service.bench.ts`) — so nothing tries to group them.
- **Bound per mount cycle, by a mixin.** `withRaf`/`withScroll`/`withResize`/`withScrollProgress`/`withPointer`/`withDrag`/`withInView` override `mounted()`, subscribe the component's `ticked`/`scrolled`/`resized`/`scrolledInView`/`moved`/`dragged`/`intersected` method, and hand the unsubscribe back as a cleanup — so `$destroy()` releases it and a remount subscribes again, with `Base` knowing nothing about services. The mixin is the primitive because it needs no build step; `@withScroll()` is the decorator sugar over it, and both are tree-shakeable: an unimported service cannot make a hook silently do nothing. `withInView` observes a component that is already mounted; it does not replace the `visible` or `in-view` mount strategy. `withScrollProgress` keeps the useful v3 `scrolledInView` hook but not the old decorator's damping or mount control. Its first raw measurement is immediate by default, and a render returned by the hook goes through the instance `$write()` lane.
- **One method name per mixin, and it is the service's own.** A hook is sugar for the default target; `target` is the only option. There is no `hook` option: two layers with the same name collapsed into one subscription with no warning, a custom name lost the hook's props typing entirely, and renaming one compiled, shipped and silently stopped updating. Any other target is an explicit subscription in `mounted()`, where the returned unsubscribe is the cleanup:

  ```js
  mounted() {
    return useScroll(this.$refs.panel).subscribe((props) => { … });
  }
  ```

- **Suspendable within a cycle — `toggle()`.** A mount cycle is the right span for most subscriptions and the wrong one for a component that needs the frame loop only while something settles. `toggle(subscribe)` returns `{ isActive, start, stop }` over anything that hands back its own unsubscribe, with `start` and `stop` bound:

  ```js
  class SliderItem extends Base {
    #frame = toggle(() => useRaf().subscribe(({ delta }) => this.follow(delta)));

    // `stop` is bound, so it is a cleanup as it is.
    mounted() {
      return this.#frame.stop;
    }

    onIndexChange() {
      this.#frame.start();
    }

    onSettled() {
      this.#frame.stop();
    }
  }
  ```

  `start()` is idempotent and `stop()` is safe to repeat, and it works on a `Signal`, on a bare listener, and outside a component, which a pair of instance methods could not. Reference counting does the rest: a stopped service with no other subscriber genuinely stops, frame loop included (asserted in `toggle.spec.ts` by watching `requestAnimationFrame`).

- **A one-shot wait — `until(service, predicate)`.** `isScrolling` is documented as the flag "a component waiting for a scroll to finish should read", and there was nothing to wait _with_: `await until(useScroll(), ({ isScrolling }) => !isScrolling)`. It resolves on the first matching update, releases the subscription before resolving, and resolves with a **copy** of the props, since the object belongs to the service and an `await` resumes a microtask later. It resolves on the current props when they already match — asking whether a scroll has finished must not wait for the next scroll to answer — which is `{ immediate: true }` doing that work, so the sources with no current value are the ones that always wait.

  It exists because the hand-rolled version is a trap twice over. Releasing the subscription from inside the callback names the unsubscribe before `subscribe()` returned it: a temporal dead zone, `ReferenceError` at the first match. Hoisting it to a `let` fixes the crash and not the case where the match arrives _during_ `subscribe()`, where the binding is still `null`, nothing is released, and the service — a frame loop, for `useRaf()` — runs for the life of the page. Measured: the naive form leaves the service started and never stopped, which the spec asserts on. `toggle()` is the same argument for a suspendable subscription; this is the same argument for a wait.

  It consumes a `Service<T>` and nothing else. That matters beyond convenience: `toggle()` and `until()` are what the uniform interface is _for_, and until they existed nothing in the public surface consumed it, so its uniformity was paid for and never spent.

- **A hook can be suspended too — `{ manual: true }` and `$services.<hook>`.** `toggle()` is the primitive, not a replacement for the hook: writing the subscription by hand to get a shorter span costs the thing the hook was for, which is that the behaviour reads as a method on the class. So `manual` stays, and the mixin puts a `Toggle` under the hook's own name:

  ```js
  class SliderItem extends withRaf(Base, { manual: true }) {
    ticked({ delta }) { … }                        // declared, not running
    onIndexChange() { this.$services.ticked.start(); }
    onSettled() { this.$services.ticked.stop(); }
  }
  ```

  This is v3's `$services.enable('ticked')` with the string taken out, and it is what deleting the `hook` option bought: with one fixed name per mixin, the property can be **declared in the type** — `ServiceHandles<'ticked'>` — so `$services.ticked` completes, and a renamed hook is `TS2551: Property 'onScrolled' does not exist… Did you mean 'scrolled'?` instead of the silence `$enable('onScrolled')` gave. Intersections merge, so stacked mixins accumulate their keys and each handle reaches its own layer. What is gone is the per-instance `hook → subscription` map behind a module symbol and the runtime `console.warn` that was the only thing vetting a string.

- **No loops of their own.** The raf service and the drag inertia subscribe to `scheduler.tick()`; the scroll service coalesces its events into one `read` per frame instead of debouncing; the resize service is a `ResizeObserver`. That observer's delivery on `observe()` used to be published as the service's first emission, which is how this one service came to speak on subscribe while the other four did not; it is gated like any other delivery now, and telling a subscriber where things stand is `{ immediate: true }`. The raf service collects the render functions its callbacks return itself — the shared primitive fans props out and expects nothing back — and **cancels a render whose subscriber left between the two phases**: a destroyed component must not write to the DOM after its cleanup ran, and an animation that wants a last paint does that write before it unsubscribes.
- **A `ResizeObserver` does not see the viewport.** It reports the observed element's box, which is what catches a zoom or a scrollbar appearing — a layout-viewport change with no `resize` event at all. But for the **root element** `clientWidth`/`clientHeight` report the viewport, and on a page taller than the viewport the two are decoupled: measured height 3000 against a `clientHeight` of 896. A mobile toolbar sliding away therefore fires no observer, so the viewport service keeps a `resize` listener beside it. Both mechanisms, because neither sees what the other does.
- **Extents are observed, not sampled once.** A scroll container's own box never grows with its content, and content growing announces itself with no `scroll` and no `resize`: `maxY` stayed at 400 for content that had gone from 500 to 5000 px. The scroll service therefore watches the scroller **and its element children** with a `ResizeObserver`, plus a `childList` `MutationObserver` to keep that set in sync — `1 + n` observed boxes per scroller, lazy and released with the last subscriber like everything else.
- **Props are flat, one per axis, and nothing derivable is a field.** `ScrollProps` is `x`/`y`, `deltaX`/`deltaY`, `maxX`/`maxY`, `progressX`/`progressY`, `directionX`/`directionY`, `isScrolling`. The grouped objects (`last`, `delta`, `max`, `progress`, `direction`, `changed`) are gone, and so are the derivations v3 shipped as fields: `lastX` is `x - deltaX`, `changedX` is `deltaX !== 0`. `directionX`/`directionY` are `-1 | 0 | 1`, one signed value that **multiplies**, replacing `isUp`/`isRight`/`isDown`/`isLeft` — which also settles the collision between a `ScrollProps.isDown` meaning "scrolling down" and a `PointerProps.isDown` meaning "pressed". `PointerProps` and `DragProps` follow the same convention, which flattens `origin`, `distance` and `final`; drag drops `isGrabbing`/`hasInertia`/`target`, all readings of `mode`, and `DragMode` gains `idle` for what `props()` reports outside a gesture. A handler destructures what it uses — `scrolled({ deltaY, directionY })` — instead of reaching through a group.
- **Every prop field is `readonly`, and the props object belongs to its service.** It is valid for the duration of the call that received it: a service may hand the same object to every subscriber and overwrite it on the next update, which is what the sampled sources do rather than allocate per frame. `{ ...props }` is how you keep one. Without `readonly`, `useScroll().subscribe((p) => { p.y = 999 })` compiled and corrupted every other subscriber on the page. What a callback may return is a type parameter too, so `RafRender` is enforced — `useRaf().subscribe(() => 42)` used to compile and run a stray return as a DOM mutation every frame.
- **What the simplification dropped.** `PointerService` is pointer-events-only and viewport-relative (v3 branched on `TouchEvent` and took a target element), and follows one `pointerId` at a time so a second finger cannot end a live gesture; `ResizeService` keeps `width`/`height`/`ratio`/`orientation` and drops `breakpoints`/`activeBreakpoints`; `DragService` drops `props.MODES` from the props and fixes the `dragTreshold` spelling.

- **Closed sets of strings are named, and the type is derived from the name.** `DRAG_MODES` is a module-level `as const` object, with `DragMode = (typeof DRAG_MODES)[keyof typeof DRAG_MODES]`. This partly reverses the line above, and the reversal is narrower than it looks: what v3 shipped was `props.MODES`, a copy of the set on **every emission**, which deserved to go. A module export is a different thing, and the original decision — "the `DragMode` union types it" — weighed only the TypeScript audience. The first-class audience here writes components in plain JavaScript with **no build step**, and a literal union gives them nothing: no completion, no typo protection, no way to discover the set at all. `DRAG_MODES.INERTIA` gives all three, the literals still type-check, and deriving the type from the object keeps one source of truth. This is the pattern for every closed set of strings in the framework, not just this one.
- **Breakpoints are their own source — `useBreakpoint()`.** A media query answers about the viewport, so a `breakpoint` field of `ResizeProps` said nothing about the element that service was observing. It is backed by `matchMedia` `change` listeners, which emit on **crossings** rather than once per resize frame and are the only mechanism that reports a change of the reader's font size. `setBreakpoints()` replaces the named set — the values v3 ships are only the default — and re-emits at once instead of leaving a stale name until something unrelated resized. The matching `MediaQueryList` objects are built once instead of once per breakpoint per resize, which measured 5.2× slower. When `defineFeatures` lands it carries the set; this setter is what it will call.

  The values are in `rem`, and **in a media query `rem` resolves against the _initial_ font size, not the root element's.** So the reader's browser font-size preference moves every breakpoint and `html { font-size: 62.5% }` moves none of them — verified at a viewport of 414 px, where `xs` (30rem) matched neither at a root of `10px` nor at `32px`. This is the reason `matchMedia` is the only honest source for them.

- **The `matchMedia` engine is exposed — `useMediaQuery(query)`.** The breakpoint service is that engine behind a named set of widths, and the engine itself was not reachable: `useMediaQuery('(orientation: portrait)')` is the same service with nothing named, one instance per query string so two components asking one question share one listener. Its `props()` is honest cold for the same reason the breakpoint one is — asking a `MediaQueryList` is a read — so a caller that only needs to branch once needs no subscription. Emissions are crossings, since `change` fires when the answer becomes different and never once per resize frame.

  **`usePrefersReducedMotion()` is the named case, and it is an accessibility gap rather than a convenience.** v4 ships a frame loop, drag inertia, damped scroll animations and a spring, and had no way to ask whether the reader turned motion down. It is a service and not a boolean read at load time because the preference **changes while the page is open**: a reader flipping it in their system settings leaves every value captured at load wrong for the rest of the session. Verified against a real crossing — the spec emulates the media feature through the browser rather than stubbing `matchMedia`, so the change travels the event path a reader's does.

- **Decay is expressed in time, not in frames.** A damping factor is a number per _step_, which only means something if the steps are equal — and frames are not. `INERTIA_FRAME` (16.67 ms) is the reference every factor is anchored to and `decayOver(retained, elapsed)` converts an elapsed time into the decay that belongs to it, so a factor keeps meaning one physical decay wherever it runs. `inertiaDecay()` is that with the tighter clamp the coast needs — a retention of `1` has no finite destination, which is a restriction of the inertia rather than of decay, and reusing it in `damp()` made a factor of `0` drift instead of holding still. For the inertia, and the coast runs on the elapsed time each `scheduler.tick()` already carries. Decaying once per frame instead made the same flick coast half as far at 120 Hz.

  Two parts of this are easy to get wrong and both were, once each. **Exponential decay is not enough on its own:** advancing by `velocity · elapsed` is a left rectangle sum over a curve that falls throughout the step, so it overshoots by an amount that depends on the step — 60 Hz and 120 Hz still landed 4% apart. `inertiaStep()` integrates the decay across the step, which telescopes, so any sequence of frames sums to `velocity · τ` exactly and the destination announced at the drop is the one the coast reaches. And **the velocity has to be a speed:** using the delta between two pointer events made it a function of the device's report rate, so a 1000 Hz mouse and a 125 Hz trackpad threw differently. It is sampled as distance over the interval between events, smoothed, with the interval clamped at both ends — under half a frame is coalescing rather than speed, over 100 ms is not one movement.

  The settle position is `value + velocity · τ` with `τ = INERTIA_FRAME / ln(1 / damp)`, so it stays exact and invariant along the coast. It is also what makes a _pause_ cost the right thing: the velocity is decayed by the idle time at the drop, through the same law, rather than against a staleness threshold — holding still and then letting go used to throw as hard as letting go mid-swipe.

- **`damp()` is the same law, and was the same bug.** Every per-frame damping in the ported components — the slider's position, the scroll animations' damped progress — applied its factor once per call, so the speed was whatever the display happened to be. Measured on the v3 helper it is a clean doubling: 56 frames to settle at 60 Hz, 28 at 120 Hz. All three call sites sit inside `useRaf().subscribe()`, which hands them the frame's elapsed time, and all three were discarding it.

  `elapsed` is a **required** argument rather than a defaulted one, because the only available default is "assume 60 Hz" and that is the defect. `factor` is the fraction of the gap closed per reference frame, so the values the components already pass keep roughly their old meaning. It is also stable for anything a caller can pass, which v3 was not: `factor = 2` flipped the gap's sign and oscillated forever, above that it diverged, and a non-finite factor returned `NaN` and poisoned every value downstream.

  `ScrollInViewProps` carries `delta` for the same reason — a hook damping a value of its own needs the number this layer used.

- **`spring()` and `smoothTo()` are ported, and both needed a different fix from the coast.** They were held out of the inertia work because neither could take its trick, and the reasons are worth keeping.

  `spring()` is second order, so there is no single exponential to integrate exactly across a step. Measured on the v3 helper, `dt` appeared nowhere in it, which made it a pure step recurrence: the trajectory's _shape_ survived — an identical `104.24` overshoot at both rates — while its _rate_ was whatever the display was, settling in 56 real frames at 60 Hz and 28 at 120 Hz. The v4 one integrates on a fixed `SPRING_STEP` of a quarter frame however long the frame was, which keeps `stiffness`, `damping` and `mass` meaning exactly what they meant while making the duration real. A quarter frame rather than a whole one so that a 120 Hz display advances the spring twice per frame instead of every second frame, which would be visible as judder.

  A fixed step turned out to be most of the stability answer and not all of it, which a test caught: semi-implicit Euler holds only while `√(stiffness / mass)` times the step stays under `2`, so a stiff enough spring diverges at _any_ fixed step. v3 had no guard at all and paid for it — `stiffness: 1.9` overshot to `190`, `stiffness: 4` ran away to `-1.6e15`. `stiffness / mass` is now clamped to `MAX_SPRING_RATIO`, which the step derives, and the clamp costs nothing perceptible because a spring at that ratio already arrives inside a frame.

  `smoothTo()` needed rewriting rather than porting, and for a bug rather than a preference. `update()` called `tick()` synchronously and `tick()` re-scheduled itself through `requestAnimationFrame` with nothing cancelling or de-duplicating, so **every** call while the value was still settling started another self-perpetuating chain: five updates in one frame measured five chains, five subscriber notifications per frame, and five more frames queued. The value then converged N times faster than asked, where N was however many times the caller set it — so a `smoothTo` driven from a scroll handler, which is what it is for, sped up with the scrolling. It also owned a `requestAnimationFrame` loop, which this section forbids, and had no teardown at all.

  The v4 one is a `toggle()` over `useRaf()`: one subscription however many times the target is set, started when the value has somewhere to go, released the moment it arrives, and `destroy()` for the case where the component goes first. Reference counting does the rest — the last one to stop stops the frame loop with it.

- **A gesture the browser can steal is not a gesture.** Without `touch-action: none` a native pan wins on touch, the browser fires `pointercancel`, and the drag service used to turn that into an inertia fling from a half-finished drag. `useDrag` sets it, but only when the computed value is `auto`, and restores the inline value on teardown: consumer CSS is deliberate and wins. The click that ends a drag is suppressed from a flag armed by the drag itself and disarmed by the next `pointerdown`, and only for a trusted click with a non-zero `detail` — reading the persistent `distance*` instead made every later click on the target unreachable, keyboard activation of a link inside it included.
- **Errors are reported, not logged.** A subscriber that throws is skipped so it cannot starve the others, and the error goes through `reportError()` — the platform's error channel, which `window.onerror` and every reporter built on it observes. `console.error()` reaches nobody but an open console.

## 9. Animation — what v4 ships, and what it does not

**Decided (2026-08-12): v4 does not ship `tween` or `animate`.**

The usage data across `@studiometa/ui` is one-sided:

| utility            | real consumers in ui                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `animate` (719 ln) | **1** — `AbstractScrollAnimation`, which never plays it, only calls `.progress()` |
| `tween`            | **0**                                                                             |
| `transition`       | **5** — `Modal`, `Tabs`, `Panel`, `AccordionItem`, `withTransition`               |

The player is the part nobody uses. The 719 lines exist to own a rAF loop, a per-element registry of running animations and a `start`/`pause`/`play`/`finish` surface, and ui's only consumer scrubs a progress value instead. Meanwhile the most-used utility of the three is not an animation engine at all — `transition` is a CSS-class state machine.

This is already the de facto state: `src/` contains no animation utility of any kind. The decision is therefore about what gets **promoted**, not what gets deleted.

**Survives, to be promoted from `migration/utils/` into `src/`:**

- the keyframes interpolator — `compile(keyframes, { easing }) => (progress, size) => styles`, pure, no DOM writes and no scheduling of its own, so the caller hands the write to the scheduler. ~150 lines including `cubicBezier`, replacing the `@motionone/easing` dependency.
- `transition` — both the class form and the inline-style form, since `AccordionItem` animates a measured pixel height.

**Out of core, into a separate `ui-animation` package:** time-based playback, stagger, sequencing, morphing and text splitting. Springs were on this list and came off it (2026-08-12): `spring()` is forty lines of pure maths with no player, no registry and no scheduling of its own, and `smoothTo()` is the one primitive the ported components need to smooth a value towards a target. What belongs outside is the _engine_ — a timeline, playback controls, a per-element registry — not a function that advances one number by one step. Two entry points over one package — Motion as declarative components (`data-component="Motion"`, its own props as `data-option-*`), GSAP as a lifecycle/scoping decorator (`gsap.context()` bound to the mount cycle) plus thin `Gsap`/`GsapTimeline` components. Engine-specific vocabulary in both cases: Motion's props are its API and port faithfully, GSAP's API is code and only ever maps lossily onto attributes.

**Not the engine's job:** `exit` and `layout`/`layoutId` need framework-owned rendering, which the DOM does not give us — a MutationObserver fires after the element is gone and after layout changed. Native View Transitions already solve both, and are in core (section 7).

## 10. DOM content swapping — `swap()`, one primitive in core

**Implemented.** @studiometa/ui writes the same swap twice: `Fetch.__updateDOM` matches elements from a fetched document by `id` and applies one of four modes, and `FrameTarget.updateContent` does the same job between its leave and enter transitions. Both then call `adoptNewScripts(getScripts(el), oldScripts)`. Two copies of a swap is tolerable; two copies of the script rule is not, because the rule is not obvious in either direction — a `<script>` produced by the fragment parser is flagged _already started_ by the HTML specification and stays inert wherever it is moved, so it only runs if it is recreated, and recreating one that was already in the page runs it twice.

```js
swap(target, content, { mode, wrap }): Promise<void>
```

- `target` is an element whose **content** changes. It is never itself replaced, so the caller's reference, its `id` and any component instance living on it survive.
- `content` is a markup string parsed in the target's own parsing context — `<tr>`, `<li>` and `<option>` survive, which no `<div>` or `DOMParser` context gives you — or an `Element`/`DocumentFragment` read as the incoming counterpart of the target, whose children become the new content. That is already what both ui call sites mean when they pass an element matched out of a fetched document.
- The returned promise resolves after `whenDOMSettled()`, so awaiting `swap()` means the mutation is applied _and_ swapped-in components are mounted and swapped-out ones destroyed.

### Why v4 makes it small

Under v3 each family had to re-mount components inside the new markup and refresh stale refs. v4 removes both jobs: the registry mounts and destroys purely on DOM insertion and ejection (§3), and `$refs` re-read on access (§1). What is left of a swap is one mutation plus one script-adoption pass — roughly forty lines against ui's two implementations, with no `$update()`, no child teardown and no `settle()` helper for the caller. The browser suite asserts exactly that: components inside swapped-in markup mount, components swapped out are destroyed, and a component morphdom preserves is neither destroyed nor re-mounted, all with the `swap()` promise as the only synchronisation point.

### The mode cut

`SWAP_MODES` keeps the four positions ui uses — `replace`, `prepend`, `append`, `morph` — as a frozen object with a derived type, the framework-wide convention for a named constant.

Keeping `prepend`/`append` in core is deliberate even though each is a one-line DOM call. What makes them worth hoisting is not the insertion, it is that they need the same before/after script diff as the other two. Cutting them would force core to export the script-adoption helper instead, which means hoisting two primitives where one will do, and leaving the subtle one in the caller's hands.

Three things ui does around a swap are **not** in core:

- **Element-level replace.** `Fetch`'s `replace` calls `oldElement.replaceWith(newElement)`, discarding the element the caller just found and, with it, its `id`, its instance and any live reference to it. Core's `replace` is `replaceChildren`. In v3 the element-level form bought a guaranteed-fresh subtree; in v4 refs are live and the registry re-mounts on insertion, so it buys nothing and costs identity. `FrameTarget` already used the content-level form.
- **Attribute syncing in `morph`.** ui morphs the target itself, so the incoming element's attributes land on it. Core passes `childrenOnly: true`: on a v4 element, `data-component` and `data-mount` are lifecycle declarations, and rewriting them as a side effect of a content update would terminate and recreate instances. A caller wanting attributes synced is asking for something else than a content swap.
- **Transitions, view transitions, history, `id` matching and response parsing.** All caller policy. `Fetch`'s `selector` loop is routing, not swapping.

Two consequences of `morph` are morphdom policy, not swap policy, and the specs record them so callers stop rediscovering them: an element the incoming markup does not contain is discarded even from a preserved parent, and morphdom syncs an input's `value` from the incoming markup. Identity survives a morph — nodes, focus, expandos, component instances — unsent DOM does not.

### The `morphdom` dependency

Approved by the user, and taken as a real dependency rather than reimplemented. A DOM-diffing algorithm is not something to write again for fun: morphdom is ~800 lines of special-cased element handlers accumulated over ten years, ui has already shipped it in production, and reimplementing it would be exactly the "common functionality written again without a clear reason" this project avoids.

Measured with esbuild (minify + gzip -9):

| artifact                                         |    min | min+gzip |
| ------------------------------------------------ | -----: | -------: |
| `morphdom` 2.7.8, its own esm bundle             | 5203 B |   2199 B |
| `dist/swap.js`, the emitted module alone         |  910 B |    529 B |
| `./swap` subpath, whole graph, morphdom external | 3845 B |   1737 B |
| `./swap` subpath, whole graph, morphdom included | 9058 B |   3781 B |

So the primitive itself costs about half a kilobyte and the dependency costs about two, roughly doubling the flattened `./swap` graph. The import is static: a dynamic `import('morphdom')` would keep `replace` mode free, at the price of a CDN round-trip precisely when `morph` is used, and 2 kB is not worth buying that with a second network hop. The cost is contained instead by the subpath layout — `morphdom` is reachable only through `swap()`, so a page which never swaps never downloads it. `src/index.ts` says so in place of its former "Zero dependencies."

### The seam for the negotiable event

`swap()` announces nothing on its own. The `wrap` option is the whole seam: it receives the swap's single mutation and decides when it runs.

```js
await swap(el, html, { mode, wrap: (mutate) => viewTransition(mutate) });
```

The negotiable `$domUpdate` event (a separate piece of work) slots in as the producer of that wrapper and nothing else. Its `waitUntil`/`wrap` negotiation returns a runner; the caller passes that runner as `wrap` and the swap is delayed, wrapped or transitioned by whoever listened, exactly as ui's `Fetch.update` does today with `emitDomUpdate` + `runWrapped`. Resilience policy — what happens when a negotiated runner rejects, whether the update is applied anyway — stays with the negotiator, where ui already keeps it (`runWrapped` lives next to `emitDomUpdate`, not next to the swap). The swap stays a pure DOM operation with one hole in it.

`swap()` is a free function, not a `Base` method: a swap target is frequently an element found by `id` with no component on it, and the primitive has no use for `this`.

## 11. Autoload — measured against the registry, and mostly absorbed

v3 ships **1033 source lines** of autoload across seven modules, plus 1419 lines of spec (`packages/js-toolkit/src/autoload/`). §2 promised the layer would stay and "its loader, observers, and scheduler become the registry's own". Measured against what the registry and the mount strategies now do, that promise is generous: what is left after the absorption is **one map and one trigger**, and the trigger is not a new one.

### 11a. What the registry already does

**Absorbed — deleted, not rewritten.**

- **The discovery observer.** `ComponentLoader.start()` creates a second `MutationObserver` on the root and `__scan`s added subtrees for `[data-component]` (`loader.ts:147-199`). v4 has exactly one document observer with a precise `attributeFilter` (`dom-mutations.ts:52-68`), and `registry.ts` already reads the token set from each inserted subtree in one pass. A lazy entry is a lookup in the same map, in the same `reconcileElement()` walk. **~90 lines gone**, and with them the second observer §2 called out as one of the three mounting systems.
- **The four load triggers.** `__schedule()` re-implements `visible` (an `IntersectionObserver` with a 200 px `rootMargin`), `idle` (`requestIdleCallback` with a 2 s timeout and a `setTimeout` fallback) and `interaction` (`pointerover`/`pointerdown`/`focusin`, once) — `loader.ts:270-337`. `mount-strategies.ts:64-126` is the same code, already written, already specced, and richer: it adds `in-view` and `media:<query>`, and it distinguishes one-shot from reversible, which v3's loader never had to because importing is never reversible. **~70 lines gone.**
- **The per-element and per-record cleanup bookkeeping.** `__addCleanup`, `__cleanSubtree`, `__clean`, `__elementCleanups`, `__elementSchedules` — `loader.ts:434-480`, ~50 lines whose whole job is "dispose the trigger when the element leaves". `registry.ts` already owns that shape for mount strategies (`disposeController`, `destroyWithin`, the removed-subtree snapshot), so the lazy half reuses it: `disposeLoader()` is 11 lines and hangs off the same three call sites.
- **Recursive registration of configured children.** `__registerConfiguredChildren` + `__registerConfiguredChild` + the manifest's `children: string[]` field — `loader.ts:381-432`, ~50 lines and a cycle-guard `visited` set, because v3's `registerComponent(Ctor, token)` did not walk `config.components`. v4's `registerComponent()` does, in one `registerFamily()` loop — which is also where a `() => import(…)` child is deferred rather than resolved (§11d). The 15 `children` arrays in ui's generated manifest are dead data on v4.
- **Component-state bookkeeping.** `ComponentRecord` with `scheduled | loading | registered | failed`, `scheduledStrategies`, and the `record.state !== 'scheduled'` guards threaded through every branch (`loader.ts:37-45, 256-337`). One `Map<string, Promise<void>>` keyed by name replaces it: an import happens once, whichever element triggered it, and the promise is the state.
- **`readEagerTokens` and `<meta name="js-toolkit:eager">`** (`runtime.ts:88-98`). A per-page escape hatch to force tokens eager, bypassing both the manifest strategy and `data-load`. `data-mount` on the element is the same override, in the place the decision belongs, and it is already live. Grepped across `@studiometa/ui`: the meta appears in the changelog and the docs, and **in no page and no template**. Not ported.

**Still needed, and much smaller.**

- **The token → importer map.** Genuinely new information: no amount of DOM observation tells you where `data-component="Slider"` is published. This is the irreducible core of autoload, and it is a `Map`.
- **Import-error reporting.** `__reportError` is 12 lines plus a `js-toolkit:error` `CustomEvent` (`loader.ts:488-500`). v4 keeps the existing `[registry] Failed to load "X":` and `[registry] Failed to mount "X":` diagnostics and announces both through the framework error event in 11e.
- **Resolving the class out of the imported module.** v3 splits it: generated manifests write `.then(({ Slider }) => Slider)` once per entry (80 times in ui's manifest) and `defineManifest` does `module[exportName] ?? module.default` for hand-built ones. v4 does it once, in six lines, so a hand-written entry is `Slider: () => import('./Slider.js')` with no unwrapping.

**Still needed, unchanged: nothing.** Every remaining piece is either smaller or gone. The one v3 concept kept verbatim is the _shape_ of the manifest value, and even that is loosened to accept a bare importer.

### 11b. The knob that did not survive: `data-load`

v3 has two orthogonal knobs — `ComponentLoadStrategy` (`eager | visible | idle | interaction`, per manifest entry, overridable per element with `data-load`) and, in v4, `MountStrategy`. §2's `RegistryEntry` sketch keeps both. It should not.

They are the same decision asked twice. Deferring the _import_ until visible and deferring the _mount_ until visible have one trigger and one answer; the only case where they differ is "download it now but do not mount it yet", which buys a page nothing it could not get by making the import eager, and costs it a second vocabulary in the markup. So v4 has **one** knob, and it is the one that already exists:

```
data-mount  >  manifest entry mountStrategy  >  'eager'
```

which is precisely `resolveStrategy()`'s chain (`registry.ts:228-234`) with the manifest entry standing in for the class's `config.mountStrategy` — _because the class is not there to be read yet_. That is the entry's whole justification, and it is the honest one: a lazy entry needs a strategy field for exactly as long as the class it names is undownloaded. Once the class registers, `resolveStrategy()` reads `config.mountStrategy` and the entry is deleted from the map.

The evidence says the same. Across `@studiometa/ui`'s three generated manifests: 80 `@studiometa/ui` entries all `strategy: 'eager'`, all 14 `ui-mapbox` entries and all 4 `ui-motion` entries `strategy: 'visible'` — a **per-package family policy**, never a per-component one. And `data-load`, the per-element override the four-value vocabulary exists to serve, appears in the ui repository **once, in a documentation page**. The knob nobody turns is the one dropped.

### 11c. The layer that was built

`registerManifest(entries)` in `registry.ts` — **+245 / −18 lines in one file**, comments included, sharing the registry's map, its scan, its element bookkeeping and its mount strategies. No new module, no new observer, no new dependency.

```js
import { registerManifest } from '@studiometa/js-toolkit-v4';

registerManifest({
  Accordion: () => import('./Accordion.js'),
  Map: { load: () => import('./Map.js'), mountStrategy: 'visible' },
});
```

- **One name, one entry**, across both halves: a token an eager class or an earlier manifest already owns warns and is ignored, like `customElements.define` and like `registerComponent()`.
- **Zero dependencies, zero bundler knowledge.** The value is a function returning a promise. `import.meta.glob`, `import.meta.webpackContext` and a generated manifest all produce that shape; none of them is named in core.
- **The registry stays the only constructor.** The import ends in `registerComponent(ComponentClass)`, which schedules the pair exactly as a hand-registered class is scheduled. Autoload never touches `new`, `el.__base__`, or a mount hook.
- **An unloaded declaration is invisible.** Nothing is constructed at discovery — the trigger imports, and construction happens on first mount as always. So `$query`, `$closest`, `$watchChildren` and `getInstances()` miss it for the same reason they miss a component waiting on `data-mount="visible"`, and by the same mechanism: no instance on the element. §2's rule needed no exception written for it.
- **`whenDOMSettled()` covers an eager lazy component.** The import promise joins the lifecycle-work set only when the trigger was the eager one (`applied.eagerWork` is defined for `eager` alone, `mount-strategies.ts:122-125`), so `swap()` waits for download → registration → mount, and still never waits on a viewport, an idle callback, an interaction or a media query. That is the existing rule, extended one step earlier in the pipeline rather than a new one.
- **One import per name, one failure report per name.** Failures are logged and never retried: the trigger is spent, and a retry loop against a 404'd chunk is worse than a quiet page.
- **A class whose `config.name` differs from the token warns** instead of failing silently, since v4 registers by `config.name` and v3 registered by token.

Cost: **+245 lines in `registry.ts` and +18 specs in `src/autoload.spec.ts`**, against v3's 1033 source lines across seven modules — which collapse to one exported function and three exported types.

### 11d. The parent's own map: `config.components` takes a dynamic import

`config.components` keeps its name and its object shape, and a value may now be a thunk beside a class:

```js
static config = {
  name: 'Parent',
  components: {
    Child: () => import('./Child.js'),
    Other: OtherClass,
  },
};
```

`registerComponent()` already walked the map — the merged one, so a subclass registers its base's family — to register it. It now **defers** a thunk instead of resolving it: the value becomes a lazy entry of the same registry, under its key, and every step after that is the one 11c already built — `scheduleFor()` finds the name, the element's `data-mount` decides when, `importComponent()` imports once per name whichever element triggered it, `registerComponent()` takes over when the class arrives. Nothing new observes, schedules or imports.

**Why the object shape is what makes this work.** The key supplies the component name, and a thunk cannot until it resolves. So a lazy child is a name the registry knows with nothing downloaded — the same knowledge a manifest entry carries, read out of the parent's own source instead of a separate file. The name set `on<Child><Event>` resolution reads is `Object.keys()`, so a lazy value changes nothing there either.

**Telling a class from a thunk** is the one real trap, because a class _is_ a function. The test is `isComponentClass()` — the prototype chain — which is what `resolveComponentClass()` already uses on whatever an importer resolved, so the two halves agree by construction. It is the definition of a component class rather than a proxy for it: a `config` static can be forgotten, and `fn.toString()` reads source text. Anything else callable is a thunk, with one exception worth catching early: a value written with `class` and not extending `Base` would be called as an importer and throw "cannot be invoked without 'new'", on an element, long after the mistake. A class's `prototype` own property is non-writable and an arrow's does not exist, so that shape is reported where it is declared.

**What it buys.** A manifest may declare **only the parent**, and the parent owns when its children load. It is also the answer to the gap 11c left open: a lazy component no longer drags its declared family into one chunk, because a child behind a thunk is its own chunk — the family splits where the author says it splits.

**First wins, quietly** — unlike `registerManifest()`, which warns. Several parents declaring the same lazy child is the normal case rather than a collision, and two thunks importing one module are two different function objects, so there is nothing to compare a real conflict against. A token two components genuinely claim still reports itself one step later, through the class-name check when the import lands.

The entry gets **no `mountStrategy` field**. A manifest entry needs one because the class it names cannot be read; a `config.components` thunk is declared beside a class which carries its `config.mountStrategy` the moment it registers, so a second place to say the same thing would put back the knob 11b dropped. Until the class arrives the chain is `data-mount > eager`; after it, the usual three-step one, reading the **merged** config — so a lazy child which is a subclass inherits the strategy its base declared, and the deferral never becomes the way to lose it.

Cost: ~35 lines in `registry.ts` and one union in `BaseConfig`; `ComponentImporter` moves next to `BaseConstructor` in `Base.ts` and is re-exported where it was.

### 11e. One framework error event

Caught framework failures use one observable contract: `JS_TOOLKIT_ERROR_EVENT` is `'js-toolkit:error'`, and its `CustomEvent<ToolkitErrorDetail>` carries the original caught value with `stage: 'load' | 'mount' | 'lifecycle'` and the component config or manifest name when known. Lazy import failures are `load`; registry construction and mount failures are `mount`; caught `Base` hook, mounted-cleanup and option-effect failures are `lifecycle`. The existing `console.error` calls stay in place, with their existing text, and each catch dispatches exactly one event. In particular, a rejected async `mounted()` is reported by the promise rejection handler only: it does not escape to the registry and become a second mount report.

The event starts on the connected component element when that catch has one, with `bubbles: true` and `composed: true`, so an element listener and page-level `document` or `window` reporters observe the same event and the same error object. A catch without an element, or with one already detached from the event path, dispatches on `document`. It is explicitly not cancelable. A listener observes recovery rather than deciding it: `preventDefault()` has no effect, dispatch does not change control flow, and the catch continues with the same isolation it had before.

This channel is deliberately narrower than every caught callback in the package. Scheduler tasks and service subscribers already use the platform `reportError()` channel and are not component lifecycle failures, so they do not dispatch `js-toolkit:error`. The small internal `reportToolkitError()` helper only centralises the event construction and target fallback; it is not an error service, bus, handler registry, retry policy or recovery mechanism. The public surface is the event constant and its detail/stage types, from the root entry and the constant's generated symbol subpath.

### 11f. Layers deliberately not built, and what each costs

1. **Manifest generation from a bundler glob** — `defineManifest`, `fromMetaGlob`, `fromWebpackContext` (v3: 173 lines across two modules). It is path→token derivation (`index.ts` falls back to the parent directory) plus a lazy/eager glob guard. **Cost: ~40 lines, no dependency**, and it is where the duplicate-token warning belongs. This is the obvious next layer: without it a 200-component design system writes 200 map entries, which is exactly what ui's `scripts/generate-manifests.ts` exists to avoid.
2. **A cross-copy shared runtime** — v3's `runtime.ts`, 215 lines: a `Symbol.for` slot on `globalThis`, a version-conflict guard, microtask coalescing of several manifest registrations into one loader start, and a stop/restart when a manifest arrives late. **v4 needs almost none of it**: there is one registry module, registration is idempotent, and a late `registerManifest()` scans only its own tokens, so nothing has to be coalesced or restarted. What survives the reduction is the _duplicated package copy_ problem — two bundled copies of v4 mean two `Map`s and two observers. **Cost: ~25 lines** for a `Symbol.for`-keyed module singleton, and it is a v4-wide question (the scheduler and the services have it too), not an autoload one. Worth doing once, at that level.
3. **Composing and overriding manifests** — v3's `composeManifests` is later-wins, so an app can shadow a packaged component by re-declaring its token last (`autoload.ts:32-40`). v4 is first-wins-and-warn, following `customElements.define`. **Cost: an `{ override: true }` option, ~5 lines** — but the decision is the expensive part, not the code, and first-wins is the safer default to start from.
4. **A scoped `root`.** v3 takes `root?: Document | Element` and scans only within it. v4's registry is document-wide by construction, so this is not an autoload feature but a registry one. **Cost: unknown and not small** — it would change `scanName()`, `scan()` and the observer's target. No consumer has asked.
5. **Informational manifest metadata** — `packageName`, `subpath`, `exportName`, `group`, `styles`, `integrations`. The loader reads none of them (`types.ts:16-49` says so six times); they exist for tooling around the manifest. **Cost: zero code, and they belong in the generator's output type, not in core's.**
6. **A `data-load` compatibility shim.** Explicitly not built — see 11b. A page that used `data-load` migrates to `data-mount`, one attribute rename, and the strategy vocabulary is a superset except for the meaningless "load now, mount later".

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
- `<ui-lazy>` component → covered by registry `mountStrategy` + manifests (`data-mount`); the separate `loadStrategy`/`data-load` knob is itself superseded by §11b.

## Open questions

1. Naming: ~~`config.components` successor (`uses`?)~~ — **decided (2026-08-14): the name and the object shape stay**, and the value gains v3's dynamic-import form (§11d). `$watchChildren` vs `$children(name, callbacks)`, announcement event names, `config.use` vs `config.siblings` for #697 remain open.
2. Does `$emit` cancelation gate anything framework-side, or is `defaultPrevented` purely userland?
3. Exact `mountStrategy` vocabulary and its interaction with existing `withMountWhen*` decorators (#751 semantics: one-shot `visible` vs reversible `in-view`).
4. ~~Migration phases~~ **Decided (2026-08-11): no bridge release.** Backporting the new primitives into a v3.x minor could itself destabilize ui components, so nothing v4 ships in 3.x. `@studiometa/js-toolkit` 4.0 and `@studiometa/ui` 2.0 ship as full breaking majors, in lockstep. Migration helpers are tooling, not runtime: lint rules in the existing eslint plugins flagging `$children`/`$parent`/`updated()`/old handler signatures, and codemods only for the mechanical renames. The `$children` coordinator components (13 files in ui) are rewritten on `$watchChildren`/provide-inject — several disappear into the platform instead (Accordion → `<details>`, Modal/Panel → Dialog).
