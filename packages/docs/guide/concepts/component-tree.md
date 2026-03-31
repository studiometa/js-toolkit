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

If no matching element is found, the child is simply not instantiated — no errors, no empty instances.

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

The framework uses a queue internally to batch DOM reads and writes, avoiding layout thrashing during mount.

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

## Dynamic updates

When the DOM changes (elements added or removed), call `$update()` on the parent to re-evaluate the tree:

```js
this.$el.insertAdjacentHTML('beforeend', '<div data-component="Child"></div>');
this.$update(); // Re-scans children, mounts new ones
```

If you use `registerComponent`, a global `MutationObserver` handles this automatically for top-level registered components.
