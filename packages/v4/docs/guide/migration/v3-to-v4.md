# Migrating from v3 to v4

v4 is a full breaking major. There is no bridge release and no compatibility layer: `@studiometa/js-toolkit` 4.0 and `@studiometa/ui` 2.0 ship together.

Migration help is tooling, not runtime shims. Lint rules flag `$children`, `$parent`, `updated()` and the old handler signatures, and codemods cover mechanical renames only.

[[toc]]

## The component tree

### `$parent`, `$children` and `$root` are removed

Parent and child are DOM ancestry, never ownership, so nothing holds a reference in either direction.

```js
this.$children.SliderItem; // [!code --]
this.$query('SliderItem'); // [!code ++]

this.$parent.goTo(index); // [!code --]
this.$closest('Slider')?.goTo(index); // [!code ++]

this.$root.doSomething(); // [!code --]
this.$closest('App')?.doSomething(); // [!code ++]
```

`$query(name)` returns a flat `Base[]` of all matching descendants, at any depth — not the keyed object `$children` was. `$closest(name)` is resolved on every access and returns `Base | null`, so guard it and never dereference it unguarded in `mounted()`.

Better than either: a parent watches its children, and a child emits.

```js
items = this.$watchChildren('SliderItem'); // [!code ++]
```

### `createApp()` is removed

There is no root component and no application object.

```js
createApp(App); // [!code --]
registerComponents(Accordion, Slider, TodoList); // [!code ++]
```

A component is registered, not mounted by a parent, so nothing has to own the page.

### `ChildrenManager` is gone

A nested `data-component` is discovered by the registry on its own. `config.components` still exists, but it now declares a **family** — it registers those names and supplies the name set that `on<Child><Event>` resolution needs. It does not construct anything.

Unmounting a parent no longer unmounts its children.

## Refs

### `$update()` is removed

Refs are live: each `$refs` property reads the DOM on access.

```js
this.$refs.list.append(li);
this.$update(); // [!code --]
console.log(this.$refs.items.length); // already correct
```

### A list ref keeps the `[]` in the attribute

```html
<li data-ref="items"></li>
<!-- [!code --] -->
<li data-ref="items[]"></li>
<!-- [!code ++] -->
```

`config.refs: ['items[]']` matches `data-ref="items[]"` **and nothing else**. The mismatch gives a `ref.mismatch` warning naming both spellings.

The property name never carries the suffix: `$refs.items`, `onItemsClick`, `@on('items[]', 'click')`.

## Options

### `$options` is read-only

Every property is a getter with no setter, so an assignment throws.

```js
this.$options.open = true; // [!code --]
this.$el.setAttribute('data-option-open', ''); // [!code ++]
```

Or keep a private field, when the value was never an input:

```js
#isOpen = this.$options.open; // [!code ++]
```

### A boolean option reads presence

The attribute's value is never read.

```html
<div data-option-open="false"></div>
<!-- v3: false · v4: true -->
```

Turn one off by removing the attribute, or — for an option declared `default: true` — with the negated spelling:

```html
<div data-component="Dialog" data-option-no-trap-focus></div>
```

Templates must write the attribute conditionally rather than interpolate a boolean into it.

### Non-primitive defaults must be factories

```js
options: {
  tween: { type: Object, default: { ease: 'linear' } }, // [!code --]
  tween: { type: Object, default: () => ({ ease: 'linear' }) }, // [!code ++]
}
```

A literal gives an `option.literal-default` warning, and the value is then shared between instances.

### Responsive options lose the list syntax

Every option is responsive with nothing to declare. `withResponsiveOptions` is gone, and so is the set spelling.

```html
<div data-option-columns:xs:s="2"></div>
<!-- [!code --] -->
<div data-option-columns:xs="2"></div>
<!-- [!code ++] -->
```

A suffix names **one** breakpoint and cascades upwards. An unknown suffix warns once per mount.

### `config.emits` is a type now

```js
static config = { name: 'Slider', emits: ['goto'] }; // [!code --]
```

```ts
class Slider extends Base<{ $emits: { goto: { index: number } } }> {} // [!code ++]
```

Nothing of it stays in the bundle.

## Events

### `$emit()` takes one payload object

```js
this.$emit('slide', 1, 'left'); // [!code --]
this.$emit('slide', { index: 1, direction: 'left' }); // [!code ++]
```

`detail` **is** that object, and an omitted payload leaves `detail` at the platform value `null`. A value that is not an object is refused by the type and reported as `event.invalid-emit-payload`.

### Handler payloads are one object

```js
onSliderItemClick(event, index) {} // [!code --]
onSliderItemClick({ event, target, index }) {} // [!code ++]
```

- a ref handler receives `{ event, target, index }`, where `target` is the **ref element**, not `event.target`;
- a child handler receives `{ event, target, payload }`, where `target` is the **instance**;
- a global handler receives `{ event, target }`, with no `payload` and no `index`.

### `onWindow<Event>` and `onDocument<Event>` are reserved prefixes

They match before children and refs. To reach a child named `Window`, use `@on('Window', 'resize')`.

## Lifecycle

### `updated()` is removed

There is no third lifecycle notion. Use [`option<Name>Changed()`](/guide/introduction/managing-options.html#live-effects) for an option that chooses a resource, and [`watchAttributes()`](/api/dom/watchAttributes.html) for an attribute the framework does not read.

### `mounted()` can return its cleanup

```js
mounted() {
  this.unsubscribe = useScroll().subscribe(this.onScroll); // [!code --]
  return useScroll().subscribe(this.onScroll); // [!code ++]
}

unmounted() {
  this.unsubscribe(); // [!code --]
}
```

Sync or async, a function or an array of functions. An async `mounted()` that resolves after the unmount runs its cleanup immediately.

### `terminated` and the permanent state are gone

`$unmount()` leaves the instance on its element, so "do this once per element" is a plain field:

```js
mounted() {
  if (this.hasLoaded) return;
  …
  this.hasLoaded = true;
}
```

## Loading and mounting

### `data-load` becomes `data-mount`

Deferring the import and deferring the mount are one decision.

```html
<div data-component="Map" data-load="visible"></div>
<!-- [!code --] -->
<div data-component="Map" data-mount="visible"></div>
<!-- [!code ++] -->
```

### The `withMountWhen*` decorators are deleted

| v3                                                  | v4                                                           |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `withMountWhenInView(Base)`                         | `data-mount="visible"` or `config.mountStrategy`             |
| `withMountOnMediaQuery(Base, '(min-width: 48rem)')` | `data-mount="media:(min-width: 48rem)"`                      |
| `withMountWhenPrefersMotion(Base)`                  | `data-mount="media:(prefers-reduced-motion: no-preference)"` |

A strategy constructs nothing; it decides when the registry calls the mount and unmount hooks. See [Mount strategies](/guide/going-further/mount-strategies.html).

### The lazy import helpers are replaced by the manifest

`importWhenVisible`, `importWhenIdle`, `importOnInteraction`, `importOnMediaQuery` and `importWhenPrefersMotion` are gone. One entry carries both halves:

```js
registerManifest({
  Map: { load: () => import('./Map.js'), mountStrategy: 'visible' },
});
```

`readEagerTokens` and `<meta name="js-toolkit:eager">` are not ported — `data-mount` on the element says the same thing.

### `<tk-name>` and arbitrary selectors are removed

Only plain and configured scoped `data-component` declarations are discovered. `data-component` still works on native elements.

## Configuration and composition

### `withExtraConfig()` is removed

`$config` merges along the prototype chain, so declare a class:

```js
const Compact = withExtraConfig(Vendor, { options: { compact: Boolean } }); // [!code --]
```

```js
registerComponent(
  // [!code ++]
  class extends Vendor {
    // [!code ++]
    static config = { name: 'CompactVendor', options: { compact: Boolean } }; // [!code ++]
  }, // [!code ++]
); // [!code ++]
```

`refs`, `options` and `components` merge; scalar keys stay overridable by the most derived class.

### `withGroup` is removed

Use `provideRootContext()` for page state, and `createGroup()` with provide/inject for a scoped set of peers. See [Shared state](/guide/going-further/sharing-state.html).

### `defineFeatures()` is removed

Breakpoints are set with `setBreakpoints()`. The attribute names and the prefix are not configurable.

## Services

### `LoadService` is not ported

### Props are flat

The grouped objects are gone, and so are the derived fields.

```js
scrolled({ y, changed, direction, max, progress }) {} // [!code --]
scrolled({ y, deltaY, maxY, progressY, directionY, isScrolling }) {} // [!code ++]
```

- `lastX` is `x - deltaX`; `changedX` is `deltaX !== 0`.
- `directionX` and `directionY` are `-1 | 0 | 1`, one signed value that multiplies.
- `ResizeService` keeps `width`, `height`, `ratio` and `orientation`, and drops `breakpoints` and `activeBreakpoints`.
- `DragService` drops `isGrabbing`, `hasInertia`, `target` and `props.MODES`, fixes the `dragTreshold` spelling, and gains an `idle` mode.
- `PointerService` uses pointer events only and follows one `pointerId` at a time.
- **Every prop field is `readonly`, and the props object belongs to its service.** Use `{ ...props }` to keep one.

### Services are scoped to a target

```js
useScroll(); // the document element
useWindowScroll(); // the same, named
useScroll(this.$refs.panel); // a region
```

`useKey()` takes a target too, which is what removes the `hasFocus` bookkeeping a document-only service forced on a consumer. Its named key booleans are resolved from `KeyboardEvent.key` rather than the deprecated `keyCode`, and `triggered` now counts repeats of **one** key.

### A mixin never occupies a lifecycle hook

`withRaf`, `withScroll` and friends override `$mount()`/`$unmount()`, not `mounted()`. A class that mixes a service in and writes its own `mounted()` **without** `super.mounted()` still subscribes.

`hook` options are gone: one method name per mixin, and it is the name of the service. Any other target is an explicit `subscribe()` in `mounted()`.

## Scheduling and animation

### One scheduler replaces three

`domScheduler`, the `RafService` loop, `SmartQueue` and the view-transition scheduler are one frame-aligned scheduler. `this.$read()` and `this.$write()` tie tasks to the instance.

**`afterWrite` is removed.** rAF callbacks run before style, layout and paint, so no phase inside the frame can read post-layout geometry. Measure in the next frame's `read` phase, or use a `ResizeObserver`.

### `tween` and `animate` are not shipped

Time-based playback, stagger, sequencing, morphing and text splitting move to a separate `ui-animation` package, with Motion as declarative components and GSAP as a lifecycle-and-scoping decorator.

`exit`, `layout` and `layoutId` are not an engine's job — native view transitions solve them, and [`viewTransition()`](/api/scheduler/viewTransition.html) is in core.

What was promoted into core instead: `transition` with `enterTransition` and `leaveTransition`, the easing functions, `spring()` and `smoothTo()`.

### `damp()` takes the elapsed time

```js
damp(current, target, 0.1); // [!code --]
damp(current, target, 0.1, delta); // [!code ++]
```

`factor` is the fraction of the gap that closes per reference frame, which makes it stable for every value a caller can pass. Decay is expressed in time, not in frames.

### `scrollTo()` splits in two

`scrollPosition()` measures and returns; `scrollTo()` calls it and moves. A carousel that asks which slide is nearest no longer has to scroll to find out.

## Diagnostics

`EVENTS.error`, `ToolkitErrorDetail` and `ToolkitErrorStage` are removed with **no alias**:

```js
document.addEventListener(EVENTS.error, …); // [!code --]
document.addEventListener(EVENTS.diagnostic, …); // [!code ++]
```

The detail now carries `severity`, `code`, `message`, an optional `component`, and — for an error only — the original caught value as `error`. See [Diagnostics](/guide/going-further/handling-diagnostics.html).

## What is not promoted to core

`Action`, `SafeAction`, `Fetch`, `Transition` and the `Data*` family stay out of core. Core keeps general primitives only; those components belong to `@studiometa/ui`.

## Removal checklist

| Removed                           | Replacement                                    |
| --------------------------------- | ---------------------------------------------- |
| `$parent`, `$children`, `$root`   | `$closest()`, `$query()`, `$watchChildren()`   |
| `createApp()`                     | `registerComponent()` / `registerComponents()` |
| `$update()`                       | nothing — refs are live                        |
| `updated()`                       | `option<Name>Changed()`, `watchAttributes()`   |
| `config.emits`                    | the `$emits` props type                        |
| `withExtraConfig()`               | a subclass                                     |
| `withGroup`                       | `provideRootContext()`, `createGroup()`        |
| `withResponsiveOptions`           | nothing — every option is responsive           |
| `withMountWhenInView` and friends | mount strategies                               |
| `data-load`, `loadStrategy`       | `data-mount`                                   |
| the `importWhen*` helpers         | `registerManifest()` entries                   |
| `defineFeatures()`                | `setBreakpoints()`                             |
| `LoadService`                     | —                                              |
| `domScheduler`, `SmartQueue`      | `defaultScheduler`                             |
| `afterWrite`                      | the next frame's `read`, or a `ResizeObserver` |
| `tween`, `animate`                | the `ui-animation` package                     |
| `EVENTS.error`                    | `EVENTS.diagnostic`                            |
| `<tk-name>`, arbitrary selectors  | `data-component`                               |
