# Component Tree

## How the tree is built

The component tree in js-toolkit is determined by the DOM structure and the `components` configuration. When a component mounts, it scans its root element for child components declared in `config.components`.

```js
class App extends Base {
  static config = {
    name: 'App',
    components: { Header, Sidebar, Content },
  };
}
```

```html
<body data-component="App">
  <header data-component="Header">
    <nav data-component="Nav">...</nav>
  </header>
  <aside data-component="Sidebar">...</aside>
  <main data-component="Content">...</main>
</body>
```

In this example, `App` is the parent of `Header`, `Sidebar`, and `Content`. But `Nav` is only a child of `Header` if `Header` declares it in its own `config.components`.

## Element resolution

Child components are found using two selector strategies:

1. **Attribute selector**: `[data-component="<KEY>"]` — matches elements with the exact component name
2. **Tag selector**: `<prefix>-<dash-case-name>` — matches custom element tags (e.g. `<my-component>`)

If no matching element is found, the child is not instantiated — no errors, no empty instances.

Multiple instances of the same child component are supported:

```html
<div data-component="List">
  <div data-component="ListItem">Item 1</div>
  <div data-component="ListItem">Item 2</div>
  <div data-component="ListItem">Item 3</div>
</div>
```

## Mounting order

Components mount **depth-first, children before parents**. This guarantees that when a parent's `mounted()` hook runs, all its children are already mounted.

```
1. App starts mounting
2.   Header starts mounting
3.     Nav mounts → Nav.mounted()
4.   Header.mounted()
5.   Sidebar.mounted()
6.   Content.mounted()
7. App.mounted()
```

js-toolkit uses a queue internally to batch DOM reads and writes, avoiding layout thrashing during mount.

::: warning Do not assume an ancestor exists while mounting
The children-before-parents guarantee runs **one way**: it covers the children a parent mounts through its own `ChildrenManager` (declared in `config.components` and DOM-contained). Whether the **reverse** works — a child resolving its parent from its own `mounted()` — depends on **how the child was mounted**:

- **Mounted by its parent** — the ancestor is already constructed and registered (from its `before-mounted`, before `mountAll()` runs), so [`$closest`](/api/instance-methods.html#closest-query) and `$parent` resolve, even though the parent is not yet `$isMounted`.
- **Mounted independently** — globally registered components (`registerComponent` recursively registers declared children) are auto-mounted by a document-wide `MutationObserver`. Lazy and async children mount on their own schedule. On that path the ancestor may not exist yet and `$closest` returns `undefined`.

Application code cannot tell which path mounted a given instance, so never rely on an ancestor in `mounted()`. Route communication through the channels in [Data flow between components](#data-flow-between-components).
:::

## Scoping

Each component's scope is bounded by its root element (the `data-component` element). This scoping affects:

- **Refs** — `this.$refs` only finds refs within the component's own scope, not inside nested child components
- **Children** — only direct children declared in `config.components` are managed
- **Events** — event handler methods like `onBtnClick` only bind to refs within scope

```html
<div data-component="Parent">
  <button data-ref="btn">Parent's button</button>
  <div data-component="Child">
    <button data-ref="btn">Child's button</button>
  </div>
</div>
```

Here, `Parent`'s `this.$refs.btn` is only the first button. The second button belongs to `Child`'s scope.

## Querying components

You can traverse the tree at runtime:

- **`$query(name)`** — find all descendant instances matching a component name (replaces the deprecated `$children`)
- **`$closest(name)`** — find the nearest ancestor instance (replaces the deprecated `$parent` / `$root`)

```js
class Child extends Base {
  static config = { name: 'Child' };

  mounted() {
    const app = this.$closest('App');
    const siblings = app.$query('Child');
  }
}
```

::: tip API Reference
See [Instance methods — $query](/api/instance-methods.html#query-query) and [Instance methods — $closest](/api/instance-methods.html#closest-query).
:::

## Data flow between components

A component can't assume its parent exists while it is mounting (see [Mounting order](#mounting-order)). Both ancestor lookups are resolved dynamically — by walking the DOM ancestors on every access — but they differ:

- **`$parent`** (deprecated) returns `null` unless a live ancestor both declares this component in its `config.components` and DOM-contains it.
- **`$closest(name)`** returns any constructed ancestor with that name, including one not yet, or no longer, mounted (e.g. breakpoint-inactive). It is `undefined` only when no such ancestor has been constructed. Add the `:mounted` state (`$closest('Slider:mounted')`) to require a mounted one, and always guard with `?.`.

Structure communication through the sanctioned channels below. `$closest` element-correctness and the store utilities below require `@studiometa/js-toolkit >= 3.6.0`.

### Parent → child: `$query`

The parent is always mounted when it queries, so reading or commanding children is safe:

```js
class Slider extends Base {
  static config = { name: 'Slider', components: { SliderBtn } };

  goTo(index) {
    this.$query('SliderBtn').forEach((btn) => btn.setActive(index));
  }
}
```

### Child → parent: `$emit`

Children never dereference the parent — they emit, and the parent listens via the `on<Child>` convention:

```js
class SliderBtn extends Base {
  // The emitted event name must differ from the DOM event (`click`), otherwise
  // `$emit` re-dispatches on `$el` and re-triggers `onClick` in a loop.
  static config = { name: 'SliderBtn', emits: ['go-to-index'] };

  onClick() {
    this.$emit('go-to-index', this.index);
  }
}

class Slider extends Base {
  static config = { name: 'Slider', components: { SliderBtn } };

  // Child-event handlers receive a single params object; `args` holds the payload.
  onSliderBtnGoToIndex({ args: [index] }) {
    this.goTo(index);
  }
}
```

### Dynamic ancestor lookup: `$closest`

When a child genuinely needs the ancestor, resolve it lazily and guard the result with `?.` — never at construction, and **never unguarded in `mounted()`**:

```js
class SliderBtn extends Base {
  static config = { name: 'SliderBtn' };

  onClick() {
    this.$closest('Slider')?.goTo(this.index); // undefined-safe
  }
}
```

### Shared state: a per-instance store

When both sides read and write the same state (e.g. the active `index`), lift it into a store and drop the parent⇄child runtime dependency. Give **each** parent its own store instance so multiple sliders on a page don't share state:

```js
// Slider/Slider.js
import { Base } from '@studiometa/js-toolkit';
import {
  createStorage,
  createMemoryStorageProvider,
} from '@studiometa/js-toolkit/utils';
import { SliderChild } from './SliderChild.js';

export class Slider extends Base {
  static config = { name: 'Slider', components: { SliderChild } };

  // One store per Slider instance — the shared `memoryStorageProvider`
  // singleton would sync every Slider on the page.
  store = createStorage({ provider: createMemoryStorageProvider() });

  index = 0;

  mounted() {
    // Runs after `__children.mountAll()`, so every SliderChild is mounted. The
    // parent reaches its children deterministically regardless of how they were
    // mounted, so subscribe them from here, then push the current state so every
    // subscriber receives its initial value. `$query` matches descendants at any
    // depth; with nested Sliders the idempotent `subscribe()` keeps each child on
    // the innermost store it already joined.
    for (const child of this.$query('SliderChild')) {
      child.subscribe(this.store);
    }
    this.store.set('index', this.index);
  }

  goTo(index) {
    this.index = index;
    this.store.set('index', index);
  }
}
```

```js
// Slider/SliderChild.js
import { Base } from '@studiometa/js-toolkit';
import { isFunction } from '@studiometa/js-toolkit/utils';

export class SliderChild extends Base {
  static config = { name: 'SliderChild' };

  index = 0;

  // Idempotent: safe to call from the parent's handshake and from a late mount.
  subscribe(store) {
    if (isFunction(this.unsubscribe)) return;
    this.index = store.get('index') ?? this.index;
    this.unsubscribe = store.subscribe('index', (index) => {
      this.index = index;
    });
  }

  mounted() {
    // A child mounted *after* its Slider (e.g. through `$update()`) can resolve
    // it here; guard because `$closest` is undefined when it cannot.
    const slider = this.$closest('Slider');
    if (slider) this.subscribe(slider.store);
  }

  destroyed() {
    if (isFunction(this.unsubscribe)) this.unsubscribe();
    // Clear it so a destroy → remount cycle can subscribe again.
    this.unsubscribe = undefined;
  }
}
```

::: warning Two-sided handshake
Whether a `SliderChild` can resolve its `Slider` from its own `mounted()` depends on the mount path (see [Mounting order](#mounting-order)): when the `Slider` mounts its children, the ancestor is already resolvable; but a child auto-mounted independently (global registry, lazy import) can run `mounted()` before its `Slider` exists, where `$closest('Slider')` is `undefined`. A child that only subscribed through a guarded `$closest('Slider')?.store.subscribe(...)` would then be **silently never subscribed** and would never sync, with no error.

The handshake closes the gap from both sides: the child subscribes itself whenever it _can_ reach the Slider, and the `Slider` subscribes every child from its **own** `mounted()`, which runs after `__children.mountAll()` and reaches them deterministically before pushing the current state. Making `subscribe()` idempotent lets both paths run without double-subscribing.
:::

For state shared across unrelated components or persisted across reloads, use a module-level store with [`createLocalStorage`/`createSessionStorage`](/utils/storage/createStorage.html) instead of a per-instance memory provider.

## Dynamic updates

When the DOM changes (elements added or removed), call `$update()` on the parent to re-evaluate the tree:

```js
this.$el.insertAdjacentHTML(
  'beforeend',
  '<div data-component="Child"></div>',
);
this.$update(); // Re-scans children, mounts new ones
```

If you use `registerComponent`, a global `MutationObserver` handles this automatically for top-level registered components.
