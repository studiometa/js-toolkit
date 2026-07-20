# Migrating from v3 to v4

Read through the following steps before upgrading from v3 to v4 of this package. The tree-traversal properties deprecated in 3.5.0 are removed in v4.

[[toc]]

## Base framework

### `$children` has been removed — use `$query(name)`

The `$children` getter has been removed. Use [`$query(name)`](/api/instance-methods.html#query-query) instead.

```js
this.$children.SliderItem; // [!code --]
this.$query('SliderItem'); // [!code ++]
```

`$query` does not return a keyed object like `$children` did — it returns a flat `Base[]` of **all** matching descendants, at any depth. It takes a query string in the format `ComponentName(.selector):state`, so update any code that indexed into `$children` by component name:

```js
for (const item of this.$children.SliderItem) { // [!code --]
for (const item of this.$query('SliderItem')) { // [!code ++]
  item.setActive();
}
```

See [Component Tree — Data flow between components](/guide/concepts/component-tree.html#data-flow-between-components) for the sanctioned parent → child pattern.

### `$parent` has been removed — use `$closest(name)`

The `$parent` getter has been removed. Use [`$closest(name)`](/api/instance-methods.html#closest-query) instead, naming the ancestor component you need.

```js
this.$parent.goTo(index); // [!code --]
this.$closest('Parent')?.goTo(index); // [!code ++]
```

::: warning `$closest` is resolved dynamically — always guard it
Like `$parent` since 3.5.0, `$closest` is resolved dynamically on every access and returns `Base | undefined`. Always guard the result (`this.$closest('Parent')?.method()`) and **never dereference it unguarded in `mounted()`**.

`$closest` walks the DOM ancestors and returns `undefined` only when **no matching ancestor instance has been constructed**. Unlike `$parent`, it ignores `config.components` and still returns an ancestor that is not yet, or no longer, mounted (e.g. breakpoint-inactive) — add the `:mounted` state (`$closest('Parent:mounted')`) when you need a mounted one. Whether an ancestor is resolvable from a child's own `mounted()` depends on the mount path: it is resolvable when the child is mounted by its parent, but a child auto-mounted independently (global registry, lazy import) can run before its ancestor exists. `$closest`'s element-correct behavior shipped in 3.6.0 ([#724](https://github.com/studiometa/js-toolkit/pull/724)); the DOM-based `$parent`/`$query` resolution landed in [#730](https://github.com/studiometa/js-toolkit/pull/730). See [Component Tree — Data flow between components](/guide/concepts/component-tree.html#data-flow-between-components).
:::

### `$root` has been removed — use `$closest(name)`

The `$root` getter has been removed. Use [`$closest(name)`](/api/instance-methods.html#closest-query) with the name of your actual root component instead.

```js
this.$root.doSomething(); // [!code --]
this.$closest('App')?.doSomething(); // [!code ++]
```

The old self-reference fallback — `$root` pointing at the current instance when it was stand-alone — is gone. Guard the result: `$closest` returns `undefined` when no matching ancestor has been constructed.

## Patterns

### Replacing parent⇄child coupling

The removed properties encouraged instances to reach across the tree and assume the other side exists. Restructure that coupling through the sanctioned channels, in order of preference:

- **parent → child** — the parent reads or commands children with [`$query(name)`](/api/instance-methods.html#query-query) (the parent is reliably mounted when it queries).
- **child → parent** — children never dereference the parent; they `$emit` and the parent listens via the `on<Child>` convention.
- **dynamic ancestor lookup** — resolve the ancestor lazily with a guarded `$closest(name)?.…`, never unguarded in `mounted()`.
- **shared state** — lift state both sides read and write into a per-instance store built with `createStorage` / `createMemoryStorageProvider` (both require `@studiometa/js-toolkit >= 3.6.0`). Give each parent its own provider instance — the shared `memoryStorageProvider` singleton would sync state across every instance on the page.

| Anti-pattern (v3)                                                                                         | Pattern (v4)                                                           |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `this.$children.Item` (keyed object)                                                                      | `this.$query('Item')` (flat `Base[]`)                                  |
| `this.$parent.method()`                                                                                   | `this.$closest('Parent')?.method()`                                    |
| `this.$root.method()`                                                                                     | `this.$closest('App')?.method()`                                       |
| Child dereferences `$parent` in `mounted()`                                                               | Child `$emit`s; parent listens via `on<Child>`                         |
| Child subscribes via `$closest` in `mounted()` (silently skipped when the ancestor isn't constructed yet) | Two-sided handshake: parent subscribes children in its own `mounted()` |
| State duplicated on parent and children                                                                   | Per-instance `createStorage` store both sides use                      |

A child that only subscribes through a guarded `$closest('Parent')?.subscribe(...)` in `mounted()` is **silently never subscribed** when the ancestor is unresolved (see the guard note above) — no error is thrown. See [Component Tree — Data flow between components](/guide/concepts/component-tree.html#data-flow-between-components) for the full store example, including the two-sided handshake that avoids this pitfall.
