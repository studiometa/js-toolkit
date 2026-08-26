# Philosophy

> **The registry is the framework. The DOM is the component tree.**

An instance exists because its element is in the document and its class is registered. Nothing else creates or unmounts an instance. Parent and child are DOM ancestry only, never ownership. Components find each other through queries and events.

[[toc]]

## Five objectives

1. **Components are independent.** No component constructs another.
2. **One registry.** One map from name to source, and one scheduling algorithm.
3. **The DOM drives mount and unmount.** One MutationObserver, and the element is the truth.
4. **Parents listen to child events.** A bubbling `CustomEvent` is the upward channel.
5. **Children announce their existence to parents.** A mount is an announcement, not a registration.

## The three forks

| Fork                | Decision                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mount primitive** | `data-component` and one record-based MutationObserver. No tag names, no arbitrary selectors, no custom elements, no directive system.          |
| **Shared state**    | provide/inject in core, with the shape of Vue and the mechanics of the WICG context protocol. `provideRootContext()` covers the page-wide case. |
| **Child events**    | The `on<Child><Event>` method names stay. Delegation resolves them against the names in `config.components`.                                    |

Custom elements were considered as the mount and lifecycle primitive and refused. So was a separate directive registry: a behaviour is a component on the one registry, so nothing more is needed.

## What was removed, and what replaces it

| Removed                                                        | Replacement                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `$parent`, `$children`, `$root`, `createApp()`                 | `$query()`, `$closest()`, `$watchChildren()`, `registerComponent()`       |
| `$update()`                                                    | nothing — refs are live                                                   |
| `config.emits`                                                 | the `$emits` props type, which leaves no runtime trace                    |
| `withExtraConfig()`                                            | a class, since `$config` merges along the prototype chain                 |
| `withMountWhenInView` and friends                              | [mount strategies](/guide/going-further/mount-strategies.html)            |
| `data-load` and `loadStrategy`                                 | one knob: `data-mount`                                                    |
| `withGroup`                                                    | `provideRootContext()` and `createGroup()`                                |
| `LoadService`                                                  | nothing — it was not ported                                               |
| `domScheduler`, `SmartQueue`, the `RafService` loop            | [one scheduler](/guide/going-further/scheduling-work.html)                |
| `EVENTS.error` and its detail types                            | [one diagnostic protocol](/guide/going-further/handling-diagnostics.html) |
| `tween` and `animate`                                          | not shipped — a separate `ui-animation` package                           |
| the `<tk-name>` tag sugar and arbitrary-selector registrations | `data-component` only                                                     |

`config.use` and `config.siblings` are not planned.

## Why "one" keeps recurring

Three subsystems of v3 each had their own copy of the same work. v4 replaces each set with one.

**One registry** replaces three mounting systems: the global registry observer, `ChildrenManager` and the autoload loader. A name resolves to one source, and one controller holds the current decision for an element/component pair. The arrival of a lazy class is a _change of source_, which is why an import trigger and a mount trigger are the same code.

**One mutation engine** owns one MutationObserver for component discovery, lifecycle, mount strategies, ref invalidation and declared options. Its `attributeFilter` and its relevance test are the same set, so a record is relevant if and only if it names an attribute the observer holds.

**One scheduler** is the clock. `RafService` subscribes to the tick instead of owning a loop; the scroll service coalesces into one `read` per frame; the view-transition helper batches within a flush. No service owns a loop.

## Sugar is never a requirement

Every decorator is a thin wrapper over a function API that works without it, because no engine ships stage-3 decorators. A page loaded from an ESM CDN with no build step keeps `registerComponent`, `$provide`, `$watchChildren`, `$read`, `$write` and the `on<Child><Event>` names.

The same principle sets the limit of the sugar. A mixin names **one** hook per class; `on<Event>` names one handler per class. A component whose subscriptions are one per markup declaration has no method to name and no fixed count, so it subscribes itself and returns the release from `mounted()`. Reaching for that deliberately is cheaper than discovering that a hook cannot be dynamic.

## Inputs and state are different things

An option is an **input**. `$options` is a read-only view whose every property derives its value from the element and the viewport on access. Refs are live for the same reason: the DOM is the source, so reading it is the honest implementation and a cache that has to be refreshed is not.

What follows from that: to change what the DOM says, write the attribute — the same statement the markup makes. To keep what the component has worked out, keep a field. The two are never the same value.

## Failures are a channel, not a print

Everything the framework recovers from is dispatched as one cancelable event before any console output, and nothing in core calls `console.warn()` or `console.error()` directly. Monitoring can read every code and suppress the noise without changing a single framework decision.

Failures a **caller** owns stay throws and rejections: decorator misuse, a manifest adapter given the wrong shape, `swap()`, `viewTransition()`. A channel is for what the framework decided to survive.

## Read next

- [The registry](/guide/concepts/the-registry.html) — how one map and one controller cover eager, lazy and conditional mounting.
- [The attribute grammar](/guide/concepts/attribute-grammar.html) — one shape for every attribute the framework reads.
- [The mutation engine](/guide/concepts/mutation-engine.html) — the fixed order of one batch.

The full design document and the decision record live in the repository: [DESIGN.md](https://github.com/studiometa/js-toolkit/blob/main/packages/v4/DESIGN.md) states what v4 does, [RATIONALE.md](https://github.com/studiometa/js-toolkit/blob/main/packages/v4/RATIONALE.md) states why, which options were refused, and what the measurements are.
