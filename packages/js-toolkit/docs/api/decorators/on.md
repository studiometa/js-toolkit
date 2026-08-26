# @on

```ts
on(type: string)
on(target: typeof window | typeof document, type: string)
on(child: BaseConstructor | string, type: string)
```

Binds a method to an event source, in place of the `on<X><Event>` naming convention.

[[toc]]

## Every form

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"49ec32f4a578086565ecf9b6d9fc58c96e042655389db718540a2fd2861c2394","data":"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"}
import {
  Base,
  component,
  on,
  type DelegatedEvent,
  type GlobalEvent,
  type RefEvent,
} from '@studiometa/js-toolkit';

class AccordionItem extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'AccordionItem' };
}
// ---cut---
@component({ name: 'Demo', components: { AccordionItem }, refs: ['dots[]'] })
class Demo extends Base {
  // The component's own element, typed from HTMLElementEventMap.
  @on('click') a(event: MouseEvent) {}
  @on('submit') b(event: SubmitEvent) {}

  // A ref, named as it is declared.
  @on('dots[]', 'click') c({ index }: RefEvent) {}

  // A child, by name — imports nothing, and the payload stays `unknown`.
  @on('AccordionItem', 'open') d({ payload }: DelegatedEvent<AccordionItem>) {}

  // A child, by class — the class is the type, so the payload is typed.
  @on(AccordionItem, 'open') e({ payload }: DelegatedEvent<AccordionItem, 'open'>) {}

  // A global.
  @on(window, 'resize') f({ event }: GlobalEvent<UIEvent>) {}
  @on(document, 'click') g({ event }: GlobalEvent<MouseEvent>) {}
}
```

## The one-argument form

It types its event from `HTMLElementEventMap`, so `@on('click')` hands over a `MouseEvent` and `@on('submit')` a `SubmitEvent`.

A name **outside** that map is a component event, whose detail only its emitter knows, so the handler declares the type it expects:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2a206f4b93525a5a4ee5978ad8d9311de12dd10f41cd3e01d28eb67da75cc57e","data":"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="}
import { Base, component, on } from '@studiometa/js-toolkit';
// ---cut---
@component({ name: 'Slot' })
class Slot extends Base {
  @on('content')
  inject(event: CustomEvent<{ content: string }>) {
    this.$el.innerHTML = event.detail.content;
  }
}
```

## A name is a child or a ref

Resolved **children-first**, so the handler is typed as `DelegatedEvent` or `RefEvent`.

A **ref is named as it is declared**: `@on('dots[]', 'click')` for `config.refs: ['dots[]']`. The rule is one rule — the declaration spelling refers to the entry, and the property spelling is used where a name is derived from it.

A mismatched `@on('dots', 'click')` gives a warning at bind time when the other spelling is declared. A name that matches nothing stays **silent**.

## A class resolves to its merged `config.name`

It lands on the same delegated entry as the string form, so the two behave identically **at runtime**. They differ in what they can type:

| Form                           | `target`        | `payload`               |
| ------------------------------ | --------------- | ----------------------- |
| `@on(AccordionItem, 'open')`   | `AccordionItem` | typed from its `$emits` |
| `@on('AccordionItem', 'open')` | the annotation  | `unknown`               |

**Only the class form carries the payload type**, because only it has the class to read `$emits` from. The string form's event name is a plain `string` as far as the type system is concerned, so annotate it as `DelegatedEvent<AccordionItem>` and narrow the payload yourself:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"a9be3b39d290d487d2c6b907ee64801e4d2150446a5c037d4bb6d10d69d1918d","data":"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"}
import { Base, component, on, type DelegatedEvent } from '@studiometa/js-toolkit';

class AccordionItem extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'AccordionItem' };
}
// ---cut---
@component({ name: 'Accordion', components: { AccordionItem } })
class Accordion extends Base {
  @on('AccordionItem', 'open')
  byName({ payload }: DelegatedEvent<AccordionItem>) {
    (payload as { height: number }).height;
  }

  @on(AccordionItem, 'open')
  byClass({ payload }: DelegatedEvent<AccordionItem, 'open'>) {
    payload.height; // number, with no cast
  }
}
```

::: warning A lazy child needs the string form
`@on('Child', 'open')` imports nothing. **A thunk is not a target**, and both the overloads and the runtime refuse it — so a lazy child is exactly the case that trades the typed payload for the deferred import.
:::

## Globals

`@on(window, 'click')` types the event from `WindowEventMap` and falls back to `Event`. It goes through the same binding `onWindow<Event>` uses: **bubble phase, one listener per mount cycle, removed by `$unmount()`**.

**Nothing is reserved in its string space.** `@on('Window', 'resize')` means the child named `Window`; `@on(window, 'resize')` means the global. That is the escape from the reserved `onWindow` prefix.

## Any other `EventTarget` is refused

By the overloads, and by a `TypeError` at runtime. A decorator is evaluated once, at class definition, so an arbitrary target could only ever be a module-scope value — and binding a component's lifetime to one would be a leak with no way to see it.

## It checks the annotation; it does not replace it

A decorator cannot infer a method's own parameters: the method signature is checked **against** what the decorator expects. So annotate the payload either way — with `@on`, the annotation is verified against a real target instead of being taken on trust.

## Stacking

The skip is keyed by the **method name**, so `@on` stacks with itself and with `@read`/`@write` in either order:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"60d2288e43480be04acd3c4f9e39ce2cbea2f2304c73c303cd302ee6a4f95706","data":"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"}
import { Base, component, on, write } from '@studiometa/js-toolkit';

class Child extends Base {
  static config = { name: 'Child' };
}
// ---cut---
@component({ name: 'Demo', components: { Child } })
class Demo extends Base {
  // One method, two events.
  @on('Child', 'open')
  @on('Child', 'close')
  track() {}

  // A phase decorator nearest the method schedules the handler's body.
  @on('click')
  @write
  paint() {}
}
```

See [`@read` / `@write`](./read-write.html).

## The function form

The `on<X><Event>` method names. Identical behaviour, no build step. See [Events hooks](/api/methods-hooks-events.html).
