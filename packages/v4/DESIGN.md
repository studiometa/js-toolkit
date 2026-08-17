# v4 architecture design

Status: validated design direction (2026-08-11). Written against v3.9.0 and `@studiometa/ui` 1.10.0.

This file states what v4 does. [RATIONALE.md](./RATIONALE.md) states why, which options were refused, and what the measurements are. Each section here links to its part of that file.

## Core model

**The registry is the framework. The DOM is the component tree.**

An instance exists because its element is in the document and its class is registered. Nothing else creates or destroys an instance. Parent and child are DOM ancestry only, not ownership. Components find each other through queries and events.

Five objectives structure the design:

1. Components are independent.
2. One registry.
3. The DOM drives mount and destroy.
4. Parents listen to child events.
5. Children announce their existence to parents.

| Fork            | Decision                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Mount primitive | `data-component` and one record-based MutationObserver. No tag names, no arbitrary selectors, no custom elements, no directive system.     |
| Shared state    | provide/inject in core, with the shape of Vue and the mechanics of the context protocol. `provideRootContext()` covers the page-wide case. |
| Child events    | The `on<Child><Event>` method names stay. Delegation resolves them against the names in `config.components`.                               |

See [RATIONALE.md — Core model](./RATIONALE.md#core-model).

## 1. Independent components

The registry is the only code that constructs an instance. `ChildrenManager` constructs nothing.

`$parent`, `$children`, `$root` and `createApp` are removed. Use `$query()` and `$closest()`. `config.use` and `config.siblings` are not planned.

### Lifecycle

Three notions stay separate:

| Notion           | What it is                        | Effect                                                                                                                                     |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **disconnected** | The element left the document.    | The registry calls `$destroy()`. The instance stays on its element. A re-inserted element mounts the same instance again.                  |
| **destroy**      | The reversible opposite of mount. | Unbinds the listeners of the cycle, runs the `mounted()` cleanups, cancels the scheduled tasks, calls `destroyed()`, announces the change. |
| **terminate**    | The explicit and permanent end.   | Destroys first, then releases `$provide` and `$watchChildren`, calls `terminated()`, and removes the instance from the element.            |

A parent that destroys does not destroy its children.

A move gives one removal record and one addition record. The instance is destroyed and then mounted again. The identity stays the same and the state of the cycle starts again. This is the behaviour of `disconnectedCallback` and `connectedCallback` for custom elements.

### `mounted()` returns its cleanup

`mounted()` can return a function, or an array of functions, sync or async. The functions run on the next `$destroy()`.

```js
class TodoCount extends Base {
  async mounted() {
    const signal = await this.$inject(CountContext);
    return signal.subscribe((count) => { … }); // released on destroy
  }
}
```

- If an async `mounted()` resolves after the destroy, the cleanup runs immediately.
- Cleanups returned by `mounted()` are destroy-scoped. A pending `$inject()` request is destroy-scoped too.
- Registrations made in the constructor are terminate-scoped: `$provide` and `$watchChildren`.
- `destroyed()` and `terminated()` stay available for the cases that the returned cleanup does not fit.

### `config.components`

`config.components` does two jobs. It registers the declared family when the parent registers, and it gives the name set that `on<Child><Event>` resolution needs. A value is a class or a thunk such as `() => import('./Child.js')`. See §11d.

### Refs are live

Each `$refs` property reads the DOM on access. There is no `$update()`. Markup that is put into a component is found with no refresh, and no detached element stays in a list.

`on<Ref><Event>` handlers are delegated from the root element, so a ref that appears later needs no new binding. Events that do not bubble — `focus`, `blur`, `scroll`, `mouseenter`, `mouseleave` — are delegated from the capture phase.

**A list ref keeps the `[]` in the attribute.** `config.refs: ['dots[]']` selects `[data-ref="dots[]"]` and gives `$refs.dots` as an array. A plain `'dots'` selects `[data-ref="dots"]` and gives the first match. A list declaration matches the suffixed attribute and nothing else. The opposite mistake — the suffix absent from the attribute — gives one warning per instance and per ref, with the name of the component and both spellings.

**A ref can name its owner: `data-ref="Slider.next"`.** By default a ref belongs to the nearest enclosing component. The prefixed form passes every boundary except another component of that name, so the nearest `Slider` wins and a nested `Slider` shadows its parent.

The namespace is written in the markup only, never in `config.refs`. The name of the ref elsewhere never carries the namespace: `Slider.next` gives `$refs.next`, `onNextClick()` and `@on('next', …)`. `Slider.dots[]` gives `$refs.dots`, `onDotsClick()` and `@on('dots[]', …)`. The namespace goes before the suffix: `Component.name[]`.

Ref lookups are cached. The cache is invalidated by a counter that the framework MutationObserver increases. A read of that counter drains the pending records with `takeRecords()`. Detached elements are never cached.

### `config` merges along the prototype chain

`$config` walks the prototype chain and merges every config that it finds. `refs`, `options` and `components` merge. Scalar keys stay overridable by the most derived class. A subclass that states a `components` key again wins for that key only. An intermediate class declares `static config: BaseConfig`, or TypeScript infers a literal type that every subclass must match.

The registry reads the merged config too, before any instance exists, through `resolveConfig()` exported from `Base.ts`. It reads the mount strategy of a pair, the family of `config.components` and the name that a class registers under.

There is no `withExtraConfig()`. To extend a component with a different config, declare a class:

```js
class MapboxNavigationControl extends AbstractMapboxControl {
  static config = {
    name: 'MapboxNavigationControl',
    options: { showCompass: Boolean, showZoom: Boolean },
  };
}
registerComponent(MapboxNavigationControl);
```

Extend a class that you cannot edit in expression position: `registerComponent(class extends Vendor { static config = { name: 'CompactVendor', … } })`.

### The typed surface

Every instance has a readonly `$id` with the form `<ComponentName>-<sequence>`. The name comes from the resolved config. The sequence increases once for each constructed instance. The id exists before the field initializers of derived classes run, and it does not change through destroy and mount cycles. Core never copies it to a DOM `id`.

`Base` takes an optional props type. It types `$refs` and `$options`, and it checks the event names and payloads of `$emit()`. `$emits` maps each name to the payload object, or to `void` for an event with no payload.

```ts
class Slider extends Base<{
  $emits: { goto: { index: number }; stop: void };
}> {}
```

`$emits` replaces the runtime `config.emits` of v3. Nothing of it stays in the bundle.

A component can take a props parameter of its own. This is how one component extends another:

```ts
class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
  mounted() {
    this.$options.target; // string
  }
}
```

Each prop is read as an intersection with its default, such as `T['$options'] & Record<string, unknown>`. Do not read a prop through a conditional type. `$emits` is the one exception and needs a conditional. The price of the intersection is the index signature of the default: an option or a ref that a component does not declare reads as `unknown`, or as `HTMLElement | HTMLElement[]`, and not as an error. Declared props keep their exact types.

`src/props.spec.ts` holds the assertions. `npm run lint:types` enforces them.

### Option defaults

**A primitive can be a default. Every other data type needs a factory function.**

```js
options: {
  speed: { type: Number, default: 1 },
  tween: { type: Object, default: () => ({ ease: 'linear' }) },
}
```

- `Function` is not an `OptionType`, so `typeof definition.default === 'function'` means a factory.
- `TypedOptionDefinition` requires the factory form for `Array` and `Object`.
- A default is built once per instance and then kept. Two instances never share one default. `Array` and `Object` with no declared default get an empty value per instance.
- A factory is lazy. Nothing is built for an option that nobody reads. A component whose attribute is present never runs its factory.
- A literal object or array default gives one warning per declaration, with the component, the option and the correction. The value is then used as declared and shared between instances.
- `$options` reads its `data-option-*` attribute on each access, so a change to a value that comes from an attribute is not kept.

**An option can accept several types.** Declare the constructors in order: `offset: [Number, Array]` reads `"10"` as a number and `"[10, 20]"` as an array. Each parser must give a value of its declared type before the next parser runs. An absent union option uses its declared default, or the empty value of its first type.

### Options that choose a resource are live effects

A declared method with the name `option<Name>Changed()` makes that option a live effect:

```js
optionTargetChanged({ value, previousValue, initial }) {
  const connection = connect(value);
  return () => connection.dispose();
}
```

- The hook runs before `mounted()` on each mount cycle.
- Several writes in one mutation batch give one change, from the first old raw value to the final DOM value.
- The previous cleanup runs before an update. Every active cleanup runs on `$destroy()`. A new mount starts each effect again with `initial: true`.
- Removal of the attribute applies the declared default.
- A component without the convention pays no setup cost and reads its options directly.

### Responsive options

**Every option is responsive. There is nothing to declare for it.** There is no `responsive: true` flag.

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

- **The suffix names one breakpoint and it cascades upwards.** `$options.columns` walks from the active breakpoint down to the base value and gives the first attribute that is present. v3 spelled a set (`:xs:s`); v4 does not. A suffix that names no configured breakpoint gives one warning per mount.
- **The separator is a colon**, because an option name in kebab case can contain a dash.
- **The value is derived on read.** Nothing is stored and nothing is written. `$options` is read-only.
- **A crossing reports through `option<Name>Changed()`**, with the payload of an attribute change. A change is a change of the resolved raw value: a crossing to the same resolved value announces nothing, and a write to `data-option-columns:s` while the viewport is at `l` announces nothing.
- **A `matchMedia` subscription opens only for a component that declares `option<Name>Changed()`.** `$destroy()` releases it. A page that only reads options holds no listener.
- `setBreakpoints()` is the single source of breakpoint truth. It rebuilds the scoped attribute names and the slice of them that the observer filters for.
- The active breakpoint name is memoised for the length of one task, through `utils/memo.js`. `setBreakpoints()` and the `change` handler of a running service clear it at once.
- The breakpoint service is part of the core graph on every page.

See [RATIONALE.md — 1. Independent components](./RATIONALE.md#1-independent-components).

## 2. One registry

One registry replaces the three mounting systems of v3.9: the global registry observer, `ChildrenManager` and the autoload loader.

```
RegistryEntry = {
  name,
  source: constructor | lazy loader (manifest entry),
  mountStrategy,  // when to mount each instance (data-mount, #751)
}
```

- `registerComponent(Ctor)` registers an eager entry. `registerManifest(…)` registers lazy entries in the same map.
- One name gives one entry, as with `customElements.define`. A collision gives a warning and the entry is ignored.
- One element and component pair gives one controller. The controller holds the strategy of the pair and the source that it was scheduled against.
- There is no `loadStrategy` and no `data-load`. See §11b.

### Responsive component declarations

The plain `data-component` token set is always active. One responsive token set is added with the spelling of responsive options:

```html
<div
  data-component="Action Analytics"
  data-component:xxs="MobileMenu MobileSearch"
  data-component:m="DesktopMenu DesktopSearch"></div>
```

- At the active breakpoint the registry walks from the widest active suffix down and takes the first attribute that is present.
- That value is the complete responsive set. A wider value replaces every lower value; it does not merge with it. An empty value is a stop: `data-component:s="TabletFeature" data-component:l=""` runs `TabletFeature` at `s` and `m`, and removes it at `l`.
- The effective declaration is the union of the unconditional set and the selected responsive set, without duplicates.
- A crossing compares that effective set against the current state of the element. A shared name keeps its controller and its instance. A name that is no longer declared is terminated; a crossing back gives a new identity. A new name enters the normal pipeline, so mount strategies, `data-mount`, lazy entries and lifecycle events keep their meaning. An inactive lazy declaration imports nothing.
- The document observer registers the exact `data-component:<breakpoint>` names and replaces that slice of the filter after `setBreakpoints()`.
- Connected elements with a scoped declaration share one reference-counted `useBreakpoint()` subscription. A page with plain declarations opens none.
- Breakpoint work runs through the background lane, so `whenDOMSettled()` includes the teardown, import and mount work of a crossing.
- A suffix that names no configured breakpoint is ignored with one warning. This includes the v3 list syntax `data-component:xxs:xs:s`. There is no range form and no breakpoint-list form.

### Mount strategies (#751)

| strategy                 | mounts when                           | reversible |
| ------------------------ | ------------------------------------- | ---------- |
| `eager` (default)        | the element enters the document       | no         |
| `visible[:<rootMargin>]` | it first intersects the viewport      | no         |
| `in-view[:<rootMargin>]` | it intersects the viewport            | yes        |
| `idle`                   | the main thread becomes idle          | no         |
| `interaction`            | the user first aims at it             | no         |
| `media:<query>`          | the query is not empty and it matches | yes        |

A component declares its default with `config.mountStrategy`. Any element overrides it with `data-mount`.

The accepted values are exactly `eager`, `visible`, `visible:`, `visible:<rootMargin>`, `in-view`, `in-view:`, `in-view:<rootMargin>`, `idle`, `interaction` and `media:<non-empty query>`. A viewport suffix is passed as `IntersectionObserverInit.rootMargin`. The empty suffix behaves as the bare strategy. There is no threshold, no root element, no JSON options and no second attribute.

An unknown value, an empty media query, or a `rootMargin` that the browser refuses leaves the component unmounted. The registry dispatches one cancelable `js-toolkit:diagnostic` event with the code `DIAGNOSTICS.component.invalidMountStrategy`, the severity `error`, the name of the component and the original error. Cancellation suppresses the default `reportError()` output only. The inert controller stays current while the declaration does not change, so the registry does not report it again. A corrected attribute replaces that controller. A failed strategy cannot stop the rest of a reconciliation.

- **A strategy constructs nothing.** It decides when the registry calls the mount and destroy hooks. `withMountWhenInView` is deleted.
- **One-shot and reversible are separate values.** `visible` mounts once and stays. `in-view` mounts and unmounts on each crossing. `mountStrategyBehaviour()` reads those two facts from the grammar.
- **`interaction` uses intent**: `pointerenter`, `pointerdown` and `focusin`, so the component mounts before the click arrives.
- **Several components on one element share the `data-mount` of that element.** A component that needs its own policy declares it in its config.
- **A component that waits has no instance.** It is invisible to `$query`, `$closest`, `$watchChildren` and `getInstances()`, and it announces nothing.
- **Teardown follows the element.** A strategy is disposed when its element leaves the document. A move ends as a destroy and a mount of the same instance.
- **The attribute is live.** A change to `data-mount` disposes the old strategy and applies the final strategy. Controller identity guards a queued callback of a disposed strategy.

See [RATIONALE.md — 2. One registry](./RATIONALE.md#2-one-registry).

## 3. One mutation engine drives the DOM

One internal engine owns one MutationObserver for component discovery, lifecycle, mount strategies, ref invalidation and declared options.

Its `attributeFilter` holds the fixed framework attributes, the exact responsive component spellings of the configured breakpoints, and the option names of every registered config. Writes to `class`, `style` and ARIA attributes create no record.

The engine snapshots the membership of a removed subtree when the records enter its queue. It processes each batch in a fixed order:

1. destroy removed subtrees and dispose their strategies;
2. reconcile the final plain and scoped `data-component` attributes and `data-mount`;
3. deliver coalesced declared-option changes to the mounted instances that stay;
4. scan added subtrees once and schedule their registered component tokens;
5. report coalesced attribute changes to the elements that asked to watch them.

A disconnected element receives `$destroy()` and keeps its instance for a later insertion. Removal of one component token from a connected element — by an attribute change or by a breakpoint crossing — calls `$terminate()`, because the DOM no longer declares that identity. The same token later gives a new instance. A moved node completes a destroy and mount cycle with the same identity.

`whenDOMSettled()` is the completion boundary for morphing, fetch updates and breakpoint crossings. It drains the pending records, follows the mutation chains of eager lifecycle work, and resolves after the eager mounts and the teardown. It does not wait for visibility, interaction, idle or media conditions, and it does not await the promises returned by `mounted()`.

`attributes.ts` owns every name in the filter and every test against one: `data-component`, `data-mount`, `data-ref`, the `data-option-` prefix with `optionAttributeFor()` and `isOptionAttribute()`, the responsive separator, and the coalescing rule. It imports nothing from core. `component-declarations.ts` consumes that vocabulary and reads the DOM through the responsive cascade.

**The `attributeFilter` and the relevance test of the engine are one set.** A record is relevant if and only if it names an attribute in the set that the observer holds. A change to that set drains the records of the previous filter first.

**The coalescing rule is written once.** Several writes to one attribute in a batch give one change, from the value before the first write to the value at the end of the batch. A write that ends where it started is not a change. `rememberPreviousValue()` and `isNetChange()` hold the rule. The comparison uses raw strings, so a breakpoint crossing and an attribute write are the same kind of event.

### `watchAttributes()`

`attributeFilter` takes exact names and the DOM has no wildcard, so the engine cannot see an attribute that the framework cannot name. `data-on:<event>` is that case.

`watchAttributes(element, callback)` is the opt-in. It observes every attribute of that element through a second, unfiltered observer. The page pays for the elements that ask.

- **The caller owns it.** The helper returns one idempotent cleanup and knows nothing about `Base`. A component calls it from `mounted()` and runs the cleanup from the returned mount cleanup.
- **The records join the shared queue.** They are drained wherever the engine drains its own, `whenDOMSettled()` included, and they are reported from the same background task, as step 5 above.
- **A callback runs after the framework work of the batch.** A component that stops its watcher during the same batch as its own termination hears nothing about the attribute change.
- **Changes are coalesced**, with the rule of `option<Name>Changed()`.
- **The payload is one object**: `{ name, value, previousValue }`, with raw attribute strings and `null` for an absent attribute. It covers the whole attribute set of the element, framework names included. A caller narrows by prefix.
- A failed callback reports `EVENTS.diagnostic` with the code `DIAGNOSTICS.callback.attributeWatcherFailed`, so one watcher cannot stop another.
- To watch a subtree, character data, or a node that the framework does not know, use `useMutation()` from §8.

The matching surface is smaller than in v3. Only plain and configured scoped `data-component` declarations are discovered, with tokens separated by whitespace for several components on one element. The `<tk-name>` tag sugar, the breakpoint-list suffixes and the lowercase arbitrary-selector registrations are removed. `data-component` still improves native elements such as `<form>`, `<a>`, `<details>` and table markup.

See [RATIONALE.md — 3. One mutation engine](./RATIONALE.md#3-one-mutation-engine).

## 4. Parents listen to child events

### Event convention

- Public framework events use the deeply frozen `EVENTS` object and strings with the `js-toolkit:` namespace.
- Private framework transports use module-local namespaced constants and do not join `EVENTS`.
- Component events use typed lower-kebab string literals declared through `BaseProps['$emits']`.
- A payload is one object in `CustomEvent.detail`, or the platform value `null`.
- `$emit()` bubbles, is cancelable, returns the dispatched event, and reports cancellation through `event.defaultPrevented`.
- Diagnostic events are cancelable, so monitoring can suppress the default output only.

### `$emit` is a native event (#630)

```js
$emit(event, payload) {
  return this.#dispatch(event, payload); // detail = payload
}

#dispatch(event, detail) {
  const e = new CustomEvent(event, { bubbles: true, cancelable: true, detail });
  this.$el.dispatchEvent(e);
  return e;
}
```

`$emit(name, payload?)` takes one optional object, and `detail` is that object. An omitted payload leaves `detail` at the platform value `null`.

```js
this.$emit('open');
this.$emit('slide', { direction: 1 });
```

A delegated `on<Child><Event>()` handler receives `{ event, target, payload }`, where `payload` is `event.detail`. A value that is not an object is not accepted: the type refuses it, and `DIAGNOSTICS.event.invalidEmitPayload` reports it at runtime. The event still dispatches.

### Delegation

`EventsManager` delegates on `this.$el`:

- One listener per event type on the root element of the parent.
- The handler walks from `event.target` up to `this.$el`, reads the instance map of each element, and calls `on<Name><Event>` for the first mounted instance that matches.
- A child that is inserted later needs no new binding.
- `config.components` gives the name set, because a method name alone is ambiguous: `onSliderDragStart` is `SliderDrag` plus `start`, or `Slider` plus `drag-start`.
- Events that do not bubble, `mouseenter` and `mouseleave` included, are delegated from the capture phase.
- `$on`, `$off` and `Action`-style directives work unchanged.

### Global handlers — `onWindow<Event>` and `onDocument<Event>`

```js
class ClickOutside extends Base {
  onDocumentClick({ event }) {
    if (!event.composedPath().includes(this.$el)) this.$emit('click-outside', { event });
  }
}
```

- **Scope: the mount cycle.** The listener goes in the same `#listeners` array, so `$destroy()` removes it and a new mount binds it again.
- **Phase: bubble, always.** `onDocumentClick` hears what `document.addEventListener('click', …)` hears. To hear an event of a descendant that does not bubble, use `on<Ref><Event>`.
- **The two prefixes are reserved**, and they match before children and refs. `onWindowResize` binds to `window` even in a component whose `config.components` holds a `Window`. To reach a child with that name, use `@on('Window', 'resize')`. This rule is about method names only. `onClick` and `onDocumentClick` are different names and both can exist on one component; a click on the element fires both.
- **Payload: `{ event, target }`**, where `target` is the global that the handler names. There is no `payload` and no `index`.
- Listener options such as `once` and `passive` are not part of this.

### Negotiated events — `domUpdate()` and `emitExtendable()`

A component announces a step before it happens, and anything above it in the tree can take part. There are two modes of one mechanism:

| mode          | asks for   | registers with | keeps                 | on failure                     |
| ------------- | ---------- | -------------- | --------------------- | ------------------------------ |
| **take over** | the action | `wrap(runner)` | one runner, last wins | the mutation is applied anyway |
| **delay**     | the moment | `waitUntil(x)` | many, all are awaited | the step happens anyway        |

```js
// Take over: the code that mutates announces instead of mutating.
await domUpdate(this.$el, () => this.$el.replaceChildren(fragment));
this.$on(EVENTS.dom.update, ({ detail }) => detail.wrap(viewTransition));

// Delay: the choreography announces its step and waits.
async close() {
  await emitExtendable(this.$el, 'close');
  this.$el.close();
}
this.$on('close', ({ detail }) => detail.waitUntil(this.leave()));
```

- **The detail is one object.** A negotiated event has the shape of every other v4 event. A decorated handler reads `{ payload: { wrap } }` for what a raw listener reads as `event.detail`.
- **The protocol events have no `Base` path.** They are absent from `$emits`. Each helper dispatches its own bubbling, non-cancelable `CustomEvent` on the given node, so the negotiation code and the optional view-transition import stay out of the `Base` graph. Plain DOM code uses the same function with no instance.
- **`defaultPrevented` is ignored.** The step is announced, not proposed.
- **A registration is valid only while the event dispatches.** A listener that keeps the function and calls it later is warned and ignored.
- **The duck-typed method has the name of the event**: `update(mutate)` for a DOM change, `close()` for the `close` step of a dialog. `waitUntil()` also accepts a thenable and a plain function, so `waitUntil(() => this.enter())` covers any pair of method names.
- **The work of the emitter always completes.** A runner that throws, rejects, or resolves without a call to `apply` loses the animation, never the change. An extension that rejects is swallowed. Failures use the diagnostic protocol of §11e.
- **The last claim wins in take-over mode.** Delay mode keeps every registration, because two components that animate out must both be awaited.
- **An unclaimed `domUpdate()` is synchronous.** With no listener, the mutation runs before the returned promise exists.

A `DomUpdateRunner` is `(apply) => void | Promise<unknown>`, so a claim composes with what core already ships:

| claim                                         | effect                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| `wrap(viewTransition)`                        | the change plays as one batched native view transition (§7)                    |
| `wrap((apply) => this.$write(apply).promise)` | the change lands in the `write` phase, batched and cancelled with the instance |
| `wrap(motionView)`                            | any object with `update(mutate)`, which `MotionView` already is                |

Neither runner is the default. The ancestor chooses the lane, because it knows whether the region animates.

See [RATIONALE.md — 4. Parents listen to child events](./RATIONALE.md#4-parents-listen-to-child-events).

## 5. Children advertise their existence

### Layer 1 — bubbling lifecycle announcements

Every instance dispatches a framework event from `EVENTS.component` on mount and on terminate, with the instance in the payload. The mount event bubbles from the element. The terminate event dispatches from `document`, because the element can already be detached. Any ancestor can follow its descendants with no declaration. An instance that is scheduled but not mounted announces nothing.

### Layer 2 — `$watchChildren()`

```js
class Slider extends Base {
  items = this.$watchChildren('SliderItem', {
    added(item) { … },
    removed(item) { … },
  });
  specialItems = this.$watchChildren(SliderItem);
  // `items` matches the exact config.name.
  // `specialItems` also holds every named subclass, through instanceof.
  // Both are live collections in document order, whatever the mount order is.
}
```

- The initial sweep is deferred to a microtask, because `$watchChildren` is usually called in a field initializer. The announcement listeners attach at once, so nothing is missed. An internal `Set` removes duplicates.
- The string overload looks up the exact `config.name`.
- The constructor overload walks the descendant elements in document order and reads their instance maps. It keeps the instances where `instance instanceof ComponentClass`, excludes the watching instance, and removes duplicates.
- No global instance registry is added. The subscription stays active through destroy and mount cycles, until the watcher terminates.

### The page-wide lookup — `getInstances()`

```js
getInstances('Dialog').forEach((dialog) => dialog.close()); // page-wide
getInstances('Dialog', section); // one region
getInstances(el); // everything mounted on one element
```

It derives the answer from the DOM. It keeps no registry of instances.

- A matching element with no instance is skipped.
- The filter is `$isMounted`, so a destroyed or terminated instance is never returned.
- `root` is a `ParentNode` and the call is `querySelectorAll`, so an element root searches its descendants and never matches itself.
- `selectorFor(name)` on `/utils` is the one place that writes the name-to-selector contract.

### Where the instances live

An element publishes its instances under `Symbol.for('@studiometa/js-toolkit-v4/instances')`. It is not public API; `getInstances()` is. In a console, read them with one line:

```js
$0[Symbol.for('@studiometa/js-toolkit-v4/instances')];
```

The element overload `getInstances(el)` answers "what is mounted here", in mount order and with the `$isMounted` filter.

### Shared state — provide/inject

```ts
// The coordinator exposes what a control can ask for.
api = this.$provide(SliderContext, {
  state: signal({ index: 0, total: 0 }), // what changes
  goNext: () => this.goNext(), // what a control can command
});
```

- The injection key is typed, so strings cannot collide.
- The scope is the subtree, and the nearest provider wins.
- **The value is provided as it is.** Nothing is wrapped, so the type of the key is the contract from end to end. A reactive value is a provided `Signal`. A command surface is a provided object.

| form               | resolves                          | when nothing provides                                 |
| ------------------ | --------------------------------- | ----------------------------------------------------- |
| `$inject(key)`     | a promise, awaited in `mounted()` | it never settles: a missing provider means "not yet". |
| `$injectSync(key)` | the value, synchronously          | `undefined`: the caller falls back or does nothing.   |

The pending request of the async form is destroy-scoped. A new mount runs `mounted()` again and asks again. The `@inject` field decorator asks once, at construction; a consumer that can wait through several cycles calls `$inject()` from `mounted()`.

The mechanics follow the WICG context protocol. The consumer dispatches the bubbling, module-private `js-toolkit:context:request` event with a key, a callback and a subscription marker. It is not part of public `EVENTS`. The nearest mounted provider answers. `provideContext()` replays the requests that have no first answer yet. `injectContext()` and `$inject()` are one-shot.

#### `provideRootContext()`

`provideRootContext(key, create)` makes the page-wide case the outermost scope of the same mechanism. The value is provided on `document.documentElement`, so a request from anywhere reaches it by bubbling and a nearer provider still wins through `stopPropagation`. `create` runs at most once per key. Nothing is created at import time.

```js
// Scoped or page-wide, resolved the same way, nearest first.
const channels =
  injectContextSync(el, DataChannels) ?? provideRootContext(DataChannels, () => new Map());
```

A root provider cannot be disposed and it outlives the instance that asked first, because it is page state. `withGroup` is not ported.

#### `subscribeContext()`

`subscribeContext(el, key, onProvide)` gives the subscription behaviour of the WICG protocol. The required callback runs synchronously for each answer and receives the value and the same unsubscribe function that the helper returns. A component calls it from `mounted()` and returns the unsubscribe function, which gives it a destroy-scoped lifetime.

- **The trigger is the mount announcement**, not a broadcast from the provider. The optional `context-subscription.ts` module keeps one listener on the document, attached on the first subscription and never at import time. It runs after `mounted()`.
- Two `contains()` calls bound the cost per mount: the new provider must contain the consumer, and it must sit inside the provider that answers it now. A mount that changes nothing checks nothing.
- **The registry holds nothing.** A subscription is anchored on its consumer element through a `WeakMap`, and the iterable index holds `WeakRef`s that the sweep prunes.
- **A new answer replaces; it never accumulates.** The callback can return a teardown for the value that it received. The teardown runs before the next different value and on unsubscribe. An identical value is not an answer.
- Callback and teardown failures are isolated, so one consumer cannot stop the shared sweep.
- `context.ts` and the `Base` graph import none of this optional state.

Duplicate bundles share the basic provider and pending-request state through the `context` slot at schema revision 2. The optional owner map, weak index and listener flag use the `context-subscription` slot at revision 1.

#### `Signal`

`signal(initialValue)` is a factory over a closure. The accessor is `.value`.

**A write settles synchronously and the newest value wins.** The delivery loop re-reads the value after each callback. If the value moved, the loop abandons the round and starts again on the new value. A subscriber that was not reached yet skips the old value. Delivery stays in the same task. A subscriber that writes on every delivery live-locks the loop.

#### `createGroup()`

```js
// The coordinator owns the membership and gives out the ways in.
const peers = createGroup();
api = this.$provide(DisclosureGroupContext, {
  members: peers.members, // the members to read, in document order
  join: (peer) => peers.join(peer), // returns the leave function
  open: (peer) => this.open(peer), // the invariant stays here
});
```

```js
// A member joins the nearest group, whenever that group appears.
mounted() {
  return subscribeContext(this.$el, DisclosureGroupContext, (group) => {
    this.group = group;
    const leave = group.join(this);
    return () => { leave(); this.group = undefined; };
  });
}
```

- `join()` returns its own `leave`, so a member that moves to a nearer group leaves the old one first.
- Scope comes from nearest-provider-wins, so a nested group takes its own members only.
- **The membership is a value.** A coordinator subscribes to it and re-checks its invariant on each change.
- **Document order is the tie-breaker**, so the markup decides which peer keeps its state.
- Nothing sweeps disconnected members. The teardown of the member removes it.
- The helper holds a `Set` and a `Signal`. `createGroup()` names no group and resolves no scope.

See [RATIONALE.md — 5. Children advertise their existence](./RATIONALE.md#5-children-advertise-their-existence).

## 6. Decorators — sugar, never a requirement

No engine ships stage-3 decorators, so **every decorator is a thin wrapper over a function API that works without it.** A page that loads the package from an ESM CDN keeps `registerComponent`, `$provide`, `$watchChildren`, `$read`, `$write` and the `on<Child><Event>` method names.

| Decorator                           | Wraps                                   | Notes                                                                          |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| `@component({ name })`              | `static config` + `registerComponent()` | Registers as soon as the class is defined.                                     |
| `@on(target, type)` / `@on(type)`   | the `on<Child><Event>` names            | The target is a name or a value.                                               |
| `@provide(key)` / `@inject(key)`    | `$provide()` / `$inject()`              | The shape of Lit's `@provide` and `@consume`.                                  |
| `@children(nameOrClass, callbacks)` | `$watchChildren()`                      | Exact name or constructor and subclasses. Callbacks are bound to the instance. |
| `@read` / `@write`                  | `$read()` / `$write()`                  | Runs the method body in that phase, cancelled on destroy.                      |

**`@component` and a `static config` on one class merge, and the decorator is applied last.** They merge in a class initializer, which runs after the fields and inside the class definition, so `registerComponent()` on the next line reads the finished config. The rules are the rules of `resolveConfig()`: refs union, `options` and `components` merge entry by entry, a declared value overrides. A key that both sides declare differently is reported as `component.config-conflict`.

`@on` accepts a name or a value: `@on('click')`, `@on('AccordionItem', 'open')`, `@on(AccordionItem, 'open')`, `@on(window, 'load')`, `@on(document, 'click')`. Nothing is reserved in its string space: `'Window'` means the child and `window` means the global.

- **The one-argument form types its event from `HTMLElementEventMap`**, so `@on('click')` hands over a `MouseEvent` and `@on('submit')` a `SubmitEvent`. A name outside that map is a component event, whose detail only its emitter knows, so the handler declares the type it expects — `@on('content') inject(event: CustomEvent<{ content: string }>)`.
- **A class resolves to its merged `config.name`** and lands on the same delegated entry as the string form. The class is the type, so `target` is the component and `payload` comes from its `$emits`. `@on(window, 'click')` types the event from `WindowEventMap` and falls back to `Event`.
- **A lazy child needs the string form.** `@on('Child', 'open')` imports nothing. A thunk is not a target; the overloads and the runtime refuse it.
- **A name is a child or a ref**, resolved children-first, so the handler is typed as `DelegatedEvent` or `RefEvent`.
- **A ref is named as it is declared**: `@on('dots[]', 'click')` for `config.refs: ['dots[]']`. The rule is one rule: the declaration spelling refers to the entry, and the property spelling is used where a name is derived from it. A mismatched `@on('dots', 'click')` gives a warning at bind time when the other spelling is declared. A name that matches nothing stays silent.
- **A global target goes through `bindGlobal()`**, the binding that `onWindow<Event>` uses: bubble phase, one listener per mount cycle, removed by `$destroy()`.
- **Any other `EventTarget` is refused**, by the overloads and by a `TypeError`. A decorator is evaluated once, at class definition, so an arbitrary target can only be a module-scope value.

**The skip is keyed by the method name, so `@on` and `@read`/`@write` stack in either order.** The order decides what the listener calls: a phase decorator written below the `@on`, nearest the method, schedules the body of the handler; one written above it schedules direct calls only. Write `@read` and `@write` closest to the method body.

Each value decorator works on a plain field and on an `accessor` field.

**Build setup.** Vite 8 transforms TypeScript with Oxc, which passes decorators through untouched. The package compiles them with `@rollup/plugin-swc` (`decoratorVersion: '2023-11'`), filtered to the files that contain a decorator.

See [RATIONALE.md — 6. Decorators](./RATIONALE.md#6-decorators).

## 7. One scheduler

One frame-aligned scheduler is the clock of the framework. It replaces `domScheduler`, the `RafService` loop, `SmartQueue` and the `viewTransition` scheduler of `@studiometa/ui`.

```
frame start (rAF)
  1. tick        — fan out to the subscribers of the clock
  2. read        — measure: layout reads only
  3. write       — mutate: DOM writes only
style / layout / paint

between frames, on its own turns
  background     — time-sliced lane: mount and update lifecycle work,
                   mutation-record processing, manifest loading
```

`frame(callback)` is `tick(callback)`, with `TickProps` and `TickCallback`. `nextFrame()` keeps its name. `afterWrite` is removed: rAF callbacks run before style, layout and paint, so no phase inside the frame can read post-layout geometry. Measure in the `read` phase of the next frame, or use a `ResizeObserver`.

- **Frame alignment.** One flush per frame, at rAF. Every read runs before every write, once, before paint. `RafService` subscribes to the tick instead of owning a loop.
- **No thrashing.** A `read` scheduled from a `write` runs in the next frame. A `write` scheduled from a `read` runs in the same frame.
- **Bounded phases.** Each queue array is swapped for an empty one when its phase starts, so a task scheduled into the running phase lands in the batch of the next frame. The `write` batch is taken after the reads run.
- **Task handles.** Scheduling returns a cancelable handle whose promise resolves with the return value of the task: `const box = await scheduler.read(() => el.getBoundingClientRect())`.
- **Instance ownership.** `this.$read(fn)` and `this.$write(fn)` tie tasks to the instance. Terminate cancels the pending tasks of that instance.
- **The background lane runs outside the frame.** It posts its own turns through `scheduler.postTask({ priority: 'background' })`, and falls back to a `MessageChannel` message. Each turn runs a 5 ms slice measured from the start of the drain, then gives the thread back and posts the next turn. Background work alone never requests an animation frame. `whenIdle()` counts background tasks and resolves at the end of a background drain as well as at the end of a flush.
- **Clamped tick delta.** `TickProps.delta` is clamped to `[1, 40]` ms, and the first tick after the loop wakes reports `1000/60`. `TickProps.time` stays the raw rAF timestamp.
- **Error isolation.** One try/catch per task. A task that throws is reported and dropped. The flush continues and the scheduler never deadlocks.
- **Queued execution only.** There is no synchronous escape.

### `scheduler.tick(callback)`

```js
const unsubscribe = scheduler.tick(({ time, delta }) => { … });
```

- Tick callbacks run at the start of the flush, before `read`, so what they schedule belongs to the same frame. A callback measures in `read` and the render function that it returns mutates in `write`.
- The subscription is the only handle, and it keeps the loop alive. The scheduler requests the next frame when a queue inside the frame is not empty, or when a tick subscriber stays. There is no permanent rAF loop. Pending background work never holds a frame open.
- A component that needs the loop for part of a cycle uses `toggle()` (§8).
- Tick subscribers are not queued work, so `whenIdle()` ignores them.
- A tick callback that throws is reported and skipped, never unsubscribed.

### Native view transitions

Core exports `viewTransition(update): Promise<void>`, with the progressive-enhancement contract of the current `@studiometa/ui` helper.

- Updates queued in the same flush batch into one `startViewTransition()` call, so a backdrop and a panel animate as one transition. Each later batch is appended to one promise tail, so several flushes during one transition stay serialized.
- The scheduler flushes the pending `write` tasks before the snapshot. Writes scheduled inside the update callback run within the transition.
- The helper is standalone. `Base` has no view-transition method and no import of one.
- `@studiometa/ui` keeps the declarative `ViewTransition` component, rebuilt on this helper.

**Open point:** whether the frame loop keeps ticking during a running view transition.

See [RATIONALE.md — 7. One scheduler](./RATIONALE.md#7-one-scheduler).

## 8. Services — lazy and reference-counted

A service is a shared source of props that components subscribe to: `ticked`, `scrolled`, `resized`, `moved`, `dragged`, `intersected`, `mutated`, `keyed`. `LoadService` is not ported.

- **Lazy and reference-counted.** `createService()` starts the definition on the first subscriber and stops it on the last. With no subscriber there is no listener, no observer and no frame. Publishing is re-entrant, so any code that changes state after a publication checks first that the service is still alive.
- **Symmetric subscriptions.** `subscribe(callback)` returns the unsubscribe function. A subscription is a record, not a key in a set, so two holders of one function are two subscribers. The fan-out walks a snapshot, and each record carries an `isActive` flag.
- **The first delivery is asked for**: `subscribe(callback, { immediate: true })`. The sources with a current value honour it; the sources without one do nothing, which each service states through `hasProps()`. The frame tick has no current value between two frames, the pointer has none before it is seen, and a drag has none outside a gesture. Only the new subscriber is called. The mixins take the same option, and `withInView` defaults it to `true`. The first props of a run carry no movement.
- **Scoped to a target.** `useScroll(target?)` takes an element or the window. `useResize(target?)`, `useScrollProgress(target, options?)` and `useInView(target, init?)` take an element. `useMutation(target, init?)` takes any node. `useKey(target?)` takes the document, an element or the window. `useDrag(el)` takes an `HTMLElement` or an `SVGElement`. `usePointer(target?)` takes an element and answers about the viewport without one. `useWindowScroll()` and `useWindowSize()` name the default cases. `useRaf()` and `useBreakpoint()` have nothing to scope. `useScroll(document.documentElement)` is the window service.
- **One instance per target and per service options**, keyed in a `WeakMap` by `perTarget()`. `useDrag()` keys its axis, inertia, damping and threshold. `useInView()` keys every `IntersectionObserverInit` field and gives object roots a stable weak identity. `useScrollProgress()` keys its resolved offset. Nothing groups observers across targets.
- **The options are read by meaning, not by spelling.** `perTarget()` sorts object keys at every depth and drops the keys that hold `undefined`. Arrays keep their order. Only what the platform owns needs a `keyOf` of its own: `useInView()` gives its root a weak id, and `useMutation()` keeps `resolveInit()` for the DOM contract.
- **The options of a mixin are not the options of the service.** `target`, `manual` and `immediate` describe the subscription. They are removed before `use()` is called and they are absent from its `Options` type, so `use: (target, options) => useDrag(target, options)` is correct.
- **A mixin binds per mount cycle.** `withRaf`, `withScroll`, `withResize`, `withScrollProgress`, `withPointer`, `withDrag`, `withInView`, `withMutation` and `withKey` override `mounted()`, subscribe the `ticked`, `scrolled`, `resized`, `scrolledInView`, `moved`, `dragged`, `intersected`, `mutated` or `keyed` method of the component, and return the unsubscribe function as a cleanup. `Base` knows nothing about services. The mixin is the primitive, because it needs no build step; `@withScroll()` is the decorator sugar. `withInView` observes a component that is already mounted; it does not replace the `visible` or `in-view` mount strategy.
- **One method name per mixin, and it is the name of the service.** There is no `hook` option. Any other target is an explicit subscription in `mounted()`:

  ```js
  mounted() {
    return useScroll(this.$refs.panel).subscribe((props) => { … });
  }
  ```

- **`useMutation(node, init?)`** is a general MutationObserver as a service, for "tell me when anything under this node changes". Reach for `watchAttributes()` first for one attribute, and for the observer of the registry for what the framework already reconciles. This service delivers on the timing of the platform; a subscriber that needs the order of the framework awaits `whenDOMSettled()` in its callback. Its props are `{ records }` and it keeps nothing after the delivery, so `props()` is empty between deliveries and `{ immediate: true }` waits for a real batch. Its key is a canonical init. The default observation is `{ childList: true, subtree: true }`.
- **`useKey(target?)`** is the keyboard as a service, one instance per target, defaulting to the document. `withKey` takes the same default, as `withScroll` and `withResize` do for their own page-wide source; a region is `withKey(Base, { target: (instance) => instance.$refs.wrapper })`, and an element target is what removes the `hasFocus` bookkeeping that a document-only service forces on a consumer. Its props are `{ event, triggered, isDown, isUp }` plus one boolean per named key. The eight names of v3 are kept, resolved from `KeyboardEvent.key` rather than from the deprecated `keyCode`. The constant that maps them is module-internal: the names reach a consumer as props, so nothing is left to compare against.
- **The key listeners are neither passive nor capturing.** Not passive, because `trapFocus()` and every keyboard shortcut call `preventDefault()` on the event the subscriber is handed, and a passive listener cannot. No capture, unlike the pointer service, because a descendant that handles its own keys and stops the propagation is respected rather than overheard.
- **`triggered` counts repeats of one key.** A keydown whose key matches the previous event's while that key is still down increments it; a different key, or any keyup, sets it back to `1`. v3 incremented on any two consecutive keydowns, so holding `A` and then pressing `B` reported `2`.
- **The eight named key booleans are a deliberate exception to the flat-props rule below** — each one compares `event.key` against a named value, so nothing about them is unavailable from `event`. They are kept for call-site parity with v3, where `keyed({ ESC })` is how components read the keyboard, and they are a mapped type over the internal constant so the props cannot drift from it.
- **`toggle(subscribe)`** returns `{ isActive, start, stop }` over anything that returns its own unsubscribe function. `start` and `stop` are bound:

  ```js
  class SliderItem extends Base {
    #frame = toggle(() => useRaf().subscribe(({ delta }) => this.follow(delta)));

    mounted() {
      return this.#frame.stop; // `stop` is bound, so it is a cleanup as it is
    }

    onIndexChange() {
      this.#frame.start();
    }

    onSettled() {
      this.#frame.stop();
    }
  }
  ```

  `start()` is idempotent and `stop()` is safe to repeat. It works on a `Signal`, on a bare listener, and outside a component.

- **`until(service, predicate)`** is a one-shot wait: `await until(useScroll(), ({ isScrolling }) => !isScrolling)`. It resolves on the first update that matches, releases the subscription before it resolves, and resolves with a copy of the props. It resolves on the current props when they already match. It consumes a `Service<T>` and nothing else.
- **A hook can be suspended too**, with `{ manual: true }` and `$services.<hook>`:

  ```js
  class SliderItem extends withRaf(Base, { manual: true }) {
    ticked({ delta }) { … }                        // declared, not running
    onIndexChange() { this.$services.ticked.start(); }
    onSettled() { this.$services.ticked.stop(); }
  }
  ```

  The property is declared in the type as `ServiceHandles<'ticked'>`, so `$services.ticked` completes and a wrong name is a type error. Intersections merge, so stacked mixins accumulate their keys.

- **No service owns a loop.** The raf service and an active drag inertia subscribe to `scheduler.tick()`. With `{ inertia: false }` a drag publishes the exact projected destination at `drop`, then goes through `stop` to `idle` with no tick subscription. The scroll service coalesces its events into one `read` per frame. The resize service is a `ResizeObserver`. The raf service collects the render functions of its callbacks and cancels a render whose subscriber left between the two phases.
- **A `ResizeObserver` does not see the viewport.** It reports the box of the observed element, which catches a zoom or a scrollbar. For the root element, `clientWidth` and `clientHeight` report the viewport and are decoupled from the observed box, so the viewport service keeps a `resize` listener as well.
- **Extents are observed, not sampled once.** The scroll service watches the scroller and its element children with a `ResizeObserver`, plus a `childList` MutationObserver to keep that set correct: `1 + n` observed boxes per scroller, lazy and released with the last subscriber.
- **Props are flat, one field per axis, and nothing derivable is a field.** `ScrollProps` is `x`, `y`, `deltaX`, `deltaY`, `maxX`, `maxY`, `progressX`, `progressY`, `directionX`, `directionY` and `isScrolling`. The grouped objects `last`, `delta`, `max`, `progress`, `direction` and `changed` are removed, and so are the derived fields: `lastX` is `x - deltaX`, and `changedX` is `deltaX !== 0`. `directionX` and `directionY` are `-1 | 0 | 1`, one signed value that multiplies. `PointerProps` and `DragProps` follow the same convention. Drag drops `isGrabbing`, `hasInertia` and `target`, and `DragMode` gains `idle`.
- **Every prop field is `readonly`, and the props object belongs to its service.** It is valid for the duration of the call that received it. Use `{ ...props }` to keep one. What a callback can return is a type parameter too, so `RafRender` is enforced.
- **The pointer can be placed in a box.** `usePointer()` is the viewport singleton. `usePointer(el)` is one lazy service per target, and `ElementPointerProps extends PointerProps` with `relativeX`, `relativeY`, `relativeProgressX` and `relativeProgressY` beside the viewport fields. The targeted service subscribes to the singleton, so one set of document listeners serves every target. `withPointer` defaults its target to `$el`. The box is measured on demand and kept until a `scroll` (captured at the document), a `resize`, or the `ResizeObserver` of the target can have moved it. The layout box is the frame of reference, so a transform that the consumer applies from `moved()` does not invalidate it.
- **What the simplification dropped.** `PointerService` uses pointer events only and follows one `pointerId` at a time. `ResizeService` keeps `width`, `height`, `ratio` and `orientation`, and drops `breakpoints` and `activeBreakpoints`. `DragService` drops `props.MODES` and fixes the `dragTreshold` spelling.
- **A closed set of strings is named, and the type is derived from the name.** `DRAG_MODES` is a module-level `as const` object, and `DragMode = (typeof DRAG_MODES)[keyof typeof DRAG_MODES]`. This is the pattern for every closed set of strings in the framework.
- **Breakpoints are their own source — `useBreakpoint()`.** It is backed by `matchMedia` `change` listeners, so it emits on crossings and it reports a change of the font size of the reader. `setBreakpoints()` replaces the named set and emits at once. The `MediaQueryList` objects are built once. The values are in `rem`, and in a media query `rem` resolves against the initial font size, not against the root element.
- **The `matchMedia` engine is exposed — `useMediaQuery(query)`.** One instance per query string. Its `props()` answers with no subscription, because asking a `MediaQueryList` is a read. Emissions are crossings.
- **`usePrefersReducedMotion()`** is the named case. It is a service and not a read at load time, because the preference changes while the page is open.
- **Decay is expressed in time, not in frames.** `INERTIA_FRAME` (16.67 ms) is the reference of every factor. `decayOver(retained, elapsed)` converts an elapsed time into the decay of that time. `inertiaDecay()` is the same with the tighter clamp that a coast needs. `inertiaStep()` integrates the decay across the step, so any sequence of frames sums to `velocity · τ` exactly. The settle position is `value + velocity · τ` with `τ = INERTIA_FRAME / ln(1 / damp)`. The velocity is sampled as a distance over the interval between events, smoothed, with the interval clamped at both ends. At the drop, the velocity is decayed by the idle time through the same law.
- **`damp(…, elapsed)` takes the elapsed time as a required argument.** `factor` is the fraction of the gap that closes per reference frame. It is stable for every value that a caller can pass. `ScrollInViewProps` carries `delta` for the same reason.
- **`spring()` integrates on a fixed `SPRING_STEP` of a quarter frame**, however long the frame is, so `stiffness`, `damping` and `mass` keep their meaning and the duration is real. `stiffness / mass` is clamped to `MAX_SPRING_RATIO`, from which the step is derived.
- **`smoothTo()` is a `toggle()` over `useRaf()`**: one subscription however many times the target is set, started when the value has somewhere to go, released when it arrives, plus `destroy()` for the case where the component goes first.
- **A gesture that the browser can steal is not a gesture.** `useDrag` owns both axes by default and writes `touch-action: none`. `{ axis: 'x' }` writes `pan-y` and sets every Y movement prop to zero; `{ axis: 'y' }` writes `pan-x` and sets X to zero. It writes only when the computed value is `auto`, and it restores the previous inline value when the last service of those options leaves. Services on one target share that ownership. The click that ends a drag is suppressed from a flag that movement on the owned axis arms and the next `pointerdown` disarms, and only for a trusted click with a non-zero `detail`.
- **Errors use the diagnostic protocol.** A subscriber that throws is skipped. Core dispatches `EVENTS.diagnostic` first, and calls `reportError()` with the original value only when no listener cancelled the event.

Two questions of the services review stay open on purpose (`SERVICES-SURFACE.md`, 2026-08-13): whether every source emits in one frame-aligned phase, and whether one `Service<T>` with an honest `props()` can cover a gesture.

See [RATIONALE.md — 8. Services](./RATIONALE.md#8-services).

## 9. Animation

**v4 does not ship `tween` or `animate`** (decided 2026-08-12).

Promoted from `migration/utils/` into `src/`:

- `transition` — the class form and the inline-style form, with `enterTransition` and `leaveTransition` beside them.
- The easing functions, on `utils/easings.ts`.
- `spring()` and `smoothTo()`.

The keyframes interpolator and its `cubicBezier` stay in `migration/ScrollAnimation/`, beside the only family that calls them, so they leave with it in one deletion.

Out of core, in a separate `ui-animation` package: time-based playback, stagger, sequencing, morphing and text splitting. Two entry points over one package — Motion as declarative components (`data-component="Motion"`, its props as `data-option-*`), and GSAP as a lifecycle and scoping decorator (`gsap.context()` bound to the mount cycle) with thin `Gsap` and `GsapTimeline` components. Both keep the vocabulary of their engine.

`exit`, `layout` and `layoutId` are not the job of an engine. Native view transitions solve them, and they are in core (§7).

See [RATIONALE.md — 9. Animation](./RATIONALE.md#9-animation).

## 10. DOM content swapping — `swap()`

```js
swap(target, content, { mode, wrap, self }): Promise<void>
```

- `target` is an element whose **content** changes. By default the element itself is never replaced, so the reference of the caller, its `id` and any instance on it survive.
- `content` is a markup string, parsed in the parsing context of the target, so `<tr>`, `<li>` and `<option>` survive. It can also be an `Element` or a `DocumentFragment`, read as the incoming counterpart of the target, whose children become the new content.
- The returned promise resolves after `whenDOMSettled()`, so an awaited `swap()` means that the mutation is applied, the new components are mounted and the old ones are destroyed.

`SWAP_MODES` holds four positions — `replace`, `prepend`, `append` and `morph` — as a frozen object with a derived type. `prepend` and `append` stay in core because they need the same before-and-after script diff as the other two.

A `<script>` produced by the fragment parser is flagged as already started by the HTML specification and stays inert wherever it is moved. It runs only if it is recreated, and a script that was already in the page runs twice if it is recreated. `swap()` owns that rule, once.

**`self` replaces the target element itself**, attributes included, instead of its children. It is the axis a caller that matches an element of a response to an element of the page needs: an id-matched section otherwise keeps the classes of the element it replaces.

- With `self`, an `Element` content **is** the replacement rather than a container — that is the only way its own attributes reach the page. A string or a `DocumentFragment` contributes its first top-level element.
- `replace` puts the replacement in the place of the target, so the target leaves the document. `morph` morphs the target from the replacement without `childrenOnly`, so the element and its identity survive while its attributes are updated.
- `append` and `prepend` add to the children by definition. `self` with either is a `swap.self-ignored` warning, as is a content that holds no element.
- Script adoption follows whatever ends up in the document, so a replacement carrying a script still runs it exactly once.

Two things are not in core:

- **Attribute syncing in a default `morph`.** Core passes `childrenOnly: true` without `self`, because `data-component` and `data-mount` are lifecycle declarations of the target.
- **Transitions, view transitions, history, `id` matching and response parsing.** All of these are caller policy.

Two consequences of `morph` are policy of morphdom, not of `swap()`: an element that the incoming markup does not contain is discarded even from a preserved parent, and morphdom syncs the `value` of an input from the incoming markup. Identity survives a morph — nodes, focus, expandos, instances — but markup that is not sent does not.

`morphdom` is a real dependency, approved by the user. The import is static. The subpath layout contains the cost: `morphdom` is reachable through `swap()` only, so a page that never swaps never downloads it.

The `wrap` option is the whole seam for a negotiated event. It receives the single mutation of the swap and decides when it runs:

```js
await swap(el, html, { mode, wrap: (mutate) => viewTransition(mutate) });
```

`domUpdate()` produces that wrapper and nothing else. Resilience policy stays with `domUpdate()`.

`swap()` is a free function, not a `Base` method.

See [RATIONALE.md — 10. DOM content swapping](./RATIONALE.md#10-dom-content-swapping).

## 11. Autoload

v3 ships 1033 source lines of autoload across seven modules. The registry and the mount strategies absorb almost all of it. What stays is one map and one trigger, and the trigger already exists.

### 11a. Absorbed

- The discovery observer of `ComponentLoader.start()`. v4 has one document observer, and a lazy entry is a lookup in the same map, in the same `reconcileElement()` walk.
- The four load triggers of `__schedule()`. `mount-strategies.ts` is that code, richer and already specced.
- The per-element and per-record cleanup bookkeeping. One controller map holds both halves, so an import trigger is disposed where a mount strategy is disposed.
- Recursive registration of configured children. `registerComponent()` walks `config.components` in one `registerFamily()` loop. The `children` arrays of a v3 manifest are dead data.
- The `ComponentRecord` state machine. One `Map<string, Promise<void>>` keyed by name replaces it: the promise is the state.
- `readEagerTokens` and `<meta name="js-toolkit:eager">`. `data-mount` on the element is the same override. Not ported.

Still needed: the token-to-importer map, import-error reporting through the diagnostic protocol, and resolution of the class out of the imported module, which v4 does once so that a hand-written entry is `Slider: () => import('./Slider.js')` with nothing to unwrap.

### 11b. One knob, not two

Deferring the import and deferring the mount are one decision:

```
data-mount  >  manifest entry mountStrategy  >  'eager'
```

This is the chain of `resolveStrategy()`. The manifest entry stands in the middle slot for the `config.mountStrategy` of a class that cannot be read yet. Once the class registers, `resolveStrategy()` reads `config.mountStrategy` and the entry is deleted from the map. There is no `data-load` and no compatibility shim for it.

### 11c. `registerManifest()`

```js
import { registerManifest } from '@studiometa/js-toolkit-v4';

registerManifest({
  Accordion: () => import('./Accordion.js'),
  Map: { load: () => import('./Map.js'), mountStrategy: 'visible' },
});
```

- **One name, one entry**, across both halves. A token that an eager class or an earlier manifest owns gives a warning and is ignored.
- **No dependency and no bundler knowledge.** The value is a function that returns a promise. `import.meta.glob`, `import.meta.webpackContext` and a generated manifest all produce that shape. Core names none of them.
- **The registry stays the only constructor.** The import ends in `registerComponent(ComponentClass)`. Autoload never touches `new`, the instance map, or a mount hook.
- **One scheduling algorithm.** A name resolves to one source, and one controller holds the current decision of the pair. The arrival of the class is a change of source, so the pass that replaces a controller turns a spent import trigger into a mount. A one-shot trigger mounts on the import that proves its condition; a reversible one is observed again. Both facts come from `mountStrategyBehaviour()`.
- **A trigger stands down without a teardown of its own.** A controller marks itself spent. A spent controller is not the current pair, so a second trigger is inert. The teardown runs from the ordinary controller replacement.
- **An unloaded declaration is invisible** to `$query`, `$closest`, `$watchChildren` and `getInstances()`, because nothing is constructed at discovery.
- **`whenDOMSettled()` covers an eager lazy component.** The import promise joins the lifecycle-work set only for the eager trigger, so `swap()` waits for download, registration and mount, and still never waits on a viewport, an idle callback, an interaction or a media query.
- **One import per name, one failure report per name.** A failure emits one diagnostic and is never retried.
- **A class whose `config.name` differs from its token gives a warning.**

### 11d. `config.components` takes a dynamic import

```js
static config = {
  name: 'Parent',
  components: {
    Child: () => import('./Child.js'),
    Other: OtherClass,
  },
};
```

`registerComponent()` defers a thunk instead of resolving it. The value becomes a lazy entry of the same registry, under its key. Every step after that is the step of 11c.

- **The key supplies the name**, so a lazy child is a name that the registry knows with nothing downloaded. The name set for `on<Child><Event>` resolution is `Object.keys()`.
- **`isComponentClass()` tells a class from a thunk**, through the prototype chain, which is the test that `resolveComponentClass()` already uses. A value written with `class` that does not extend `Base` is reported where it is declared, because the `prototype` own property of a class is not writable and an arrow function has none.
- **A manifest can declare the parent only.** A child behind a thunk is its own chunk, so a family splits where the author splits it.
- **First wins, quietly**, unlike `registerManifest()`. Several parents that declare the same lazy child is the normal case. A token that two components genuinely claim is reported by the class-name check when the import lands.
- **The entry gets no `mountStrategy` field.** Until the class arrives the chain is `data-mount > eager`. After it, the usual three steps read the merged config, so a lazy child that is a subclass inherits the strategy of its base.

### 11e. One diagnostic protocol

`EVENTS.diagnostic` is `'js-toolkit:diagnostic'`. `CustomEvent<ToolkitDiagnosticDetail>` carries readonly `severity`, `code` and `message` fields, and an optional `component`. An error detail also requires the original caught value as readonly `error`; a warning carries none. `ToolkitDiagnosticSeverity` is `'warning' | 'error'`. `ToolkitDiagnosticCode` is the exact union of the namespaced strings in the deeply frozen `DIAGNOSTICS` object, such as `DIAGNOSTICS.component.loadFailed`, `DIAGNOSTICS.callback.serviceFailed` and `DIAGNOSTICS.protocol.lateRegistration`.

Every diagnostic starts on its relevant connected element, or on `document` when there is none. It is dispatched with `{ bubbles: true, composed: true, cancelable: true }`. Dispatch always happens before the default output. An uncancelled warning calls `console.warn()` once with exactly `[js-toolkit:<code>] <message>`. An uncancelled error calls `reportError(detail.error)` with the original value. `preventDefault()` suppresses that output only. It changes no framework decision.

The internal diagnostics module owns the dispatch and the `warn()` and `warnOnce()` helpers. The reporting functions are not public. Warning deduplication is stored in a revisioned shared-runtime slot, keyed by weak owner plus a misuse key, so it works across independently evaluated copies without retaining instances, elements, declarations, runners or manifest inputs. There is no direct `console.warn()` or `console.error()` call elsewhere in core.

Recovered load, mount, invalid-strategy and `Base` lifecycle failures report exactly once. Isolated signal, context subscription and teardown, attribute watcher, service, scheduler tick and task, DOM-update runner and extendable-event callbacks report and continue. A scheduled task also rejects its own promise with the same value. Direct caller-owned failures stay throws or rejections: decorator and manifest-adapter misuse, shared-runtime incompatibility, service startup rollback, caller-owned teardown, `viewTransition()` and `swap()`.

```ts
import { DIAGNOSTICS, EVENTS, type ToolkitDiagnosticDetail } from '@studiometa/js-toolkit-v4';

document.addEventListener(EVENTS.diagnostic, (rawEvent) => {
  const event = rawEvent as CustomEvent<ToolkitDiagnosticDetail>;
  monitor(event.detail.code, event.detail);

  if (event.detail.code === DIAGNOSTICS.responsive.unknownBreakpoint) {
    event.preventDefault();
  }
});
```

`EVENTS.error`, `ToolkitErrorDetail` and `ToolkitErrorStage` are removed with no alias. `DIAGNOSTICS`, `ToolkitDiagnosticSeverity`, `ToolkitDiagnosticCode` and `ToolkitDiagnosticDetail` are added. Generated `./EVENTS` and `./DIAGNOSTICS` subpaths keep both frozen objects importable on their own.

### 11f. Further layers

1. **Manifest generation from a bundler glob — built.** `defineManifest({ modules, mountStrategy? })`, `fromMetaGlob()` and `fromWebpackContext()` add path-to-token derivation (`index.ts` falls back to the parent directory), a lazy and eager Vite glob guard, and a deferred webpack adapter with no bundler dependency. The package-wide `mountStrategy` emits entry wrappers only when it is not `eager`. Duplicate tokens give a warning and keep the first path.
2. **A cross-copy shared runtime — built.** `shared-runtime.ts` owns `globalThis[Symbol.for('@studiometa/js-toolkit-v4/runtime')]` and gives each subsystem a typed slot with a revision. Duplicate copies reuse the canonical `defaultScheduler`, the registry maps and controllers, the DOM mutation observer and queue, the root-context state, the breakpoint state and every built-in service cache. `Base` carries a separate inherited `Symbol.for` brand on its constructor, so family and imported-module resolution recognise a component from another copy. The slots stay lazy and keep the reference-counted teardown. An incompatible root or slot revision throws. This is same-realm coordination only. A `createService()` or `perTarget()` call of a consumer stays owned by that consumer.
3. **Composing and overriding manifests.** v4 is first-wins-and-warn, as `customElements.define` is. An `{ override: true }` option is about five lines, but the decision is the expensive part.
4. **A scoped `root`.** The registry is document-wide by construction. This would change `scanName()`, `scan()` and the target of the observer. No consumer has asked.
5. **Informational manifest metadata** (`packageName`, `subpath`, `exportName`, `group`, `styles`, `integrations`). It belongs in the output type of the generator, not in core.
6. **A `data-load` compatibility shim.** Not built. A page that used `data-load` renames one attribute.

See [RATIONALE.md — 11. Autoload](./RATIONALE.md#11-autoload).

## 12. Storage — one seam, six adapters

`createStorage(options?)` is a typed, observable key-value store over a `StorageProvider`: six synchronous string methods — `get`, `set`, `remove`, `has`, `keys`, `clear` — plus an optional `syncEvents`.

- **`createStorage()` owns everything that a consumer thinks of as storage**: key namespacing through `prefix`, serialization in both directions, a `Signal` per key created on the first subscription, and the reference-counted wiring to `useStorageSync()`. A provider moves strings only. A custom backend is six small methods, and one storage instance runs in Node over the memory provider (`test/package-node-consumer.js`).
- **A built-in provider reports its own failures and never throws.** `guard()` turns a full quota or a refused area into a `storage.access-failed` diagnostic and returns the fallback of the method: `null`, `false`, `[]` or `undefined`. It reports once per operation, not once per area. The area is resolved per call, inside the guard, because the getter itself throws when storage is denied. `types.ts` states the same contract for custom providers.
- The failures of the storage have their own codes: `storage.serialize-failed`, after which nothing is written, and `storage.deserialize-failed`, after which the default is returned.
- **The six adapters.** `localStorageProvider` and `sessionStorageProvider` over the web storage areas. `memoryStorageProvider` and `createMemoryStorageProvider()` over a `Map`. `createFallbackProvider(...providers)`, which reads from the first provider that holds the key and writes to all of them. `urlSearchParamsProvider` over `location.search`. `urlSearchParamsInHashProvider` over `location.hash` read as search params. The two URL adapters rebuild the whole location on each write, so a search write keeps the hash and a hash write keeps the query string. They take one option, `push`, which chooses `history.pushState` over the default `replaceState`.
- **`syncEvents` is a list of window event names and nothing more.** A provider declares how a change made outside this instance announces itself: `storage` for another tab, `popstate` and `hashchange` for a navigation. `createStorage()` subscribes one shared, reference-counted listener per name while at least one key is observed, and re-reads every observed key when it fires. The event carries no usable state, so the subscriber re-reads. A provider whose changes arrive on a `BroadcastChannel` or through an observer has no way to announce them yet. This is a known gap.
- **A factory exists only where its product has state.** `createMemoryStorageProvider()` holds a `Map`. `createFallbackProvider()` and the two URL factories take arguments. `createLocalStorageProvider()` and `createSessionStorageProvider()` are removed; the instances stay. The presets `createLocalStorage()`, `createSessionStorage()`, `createUrlSearchParamsStorage()` and `createUrlSearchParamsInHashStorage()` stay, because each removes an argument from every call site.
- **The adapters are tested at the seam, against the platform.** `providers.spec.ts` drives each adapter through the six methods for real, including a `setItem` that throws, an area getter that throws, `push` against `history.length`, and the `syncEvents` names of each adapter.

See [RATIONALE.md — 12. Storage](./RATIONALE.md#12-storage).

## Status for #694

- `LoadService` is removed. `KeyService` is ported, with a target and a fixed repeat counter (§8). Mutation handling is internal to the registry. See §8.
- `refs` and `components` merge by default. This resolves #627.
- Several option types are implemented (§1). #651 tracked this.
- Every option is responsive by default. The current default breakpoints are not aligned with `@studiometa/tailwind-config`. That alignment is a separate product decision.
- `Action`, `SafeAction`, `Fetch`, `Transition` and the `Data*` family are not promoted to core. The files under `migration/` are feasibility ports for a future `@studiometa/ui`. Core keeps general primitives only.

## Superseded parts of the spec draft

- Custom elements as the mount and lifecycle primitive. Replaced by the observer decision.
- A separate directive registry in core. Not needed: a behaviour is a component on the one registry.
- The `cdn.studiometa.dev` delivery. `@studiometa/ui` 1.10.0 already uses esm.sh with `/autoload` side-effect entries, and v4 keeps that path.
- The `<ui-lazy>` component. Covered by `mountStrategy`, manifests and `data-mount`.

## Resolved questions

1. **Naming and composition APIs** (2026-08-14): `config.components` keeps its name and object shape, with the dynamic-import form of §11d. `$watchChildren` stays. `config.use` and `config.siblings` are not planned (#697).
2. **Does `$emit` cancellation gate anything in the framework?** No. Component code reads `defaultPrevented`. Framework notifications follow their own protocol, and a cancelled diagnostic suppresses its default output only.
3. **The `mountStrategy` vocabulary and the `withMountWhen*` decorators**: `visible[:<rootMargin>]` is one-shot, `in-view[:<rootMargin>]` is reversible, and the registry replaces the decorators that wrap a constructor (#751).
4. **Migration phases** (2026-08-11): no further bridge and no backport release. `@studiometa/js-toolkit` 4.0 and `@studiometa/ui` 2.0 ship as full breaking majors, together. Further migration help is tooling: lint rules flag `$children`, `$parent`, `updated()` and the old handler signatures, and codemods cover mechanical renames only.
