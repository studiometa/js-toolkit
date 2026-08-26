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
// @twoslash-cache: {"v":1,"hash":"d2c64e07545a4b8f06e52c89c1a92f5bc9c24d0e7a3963fd19bd2c1a1703d731","data":"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"}
import {
  Base,
  component,
  on,
  type DelegatedEvent,
  type GlobalEvent,
  type RefEvent,
} from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"c93cc80fe784caf4f2e67790df945607d0a310a580cf9d48e3b28f269e85ad24","data":"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"}
import { Base, component, on } from '@studiometa/js-toolkit-v4';
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
// @twoslash-cache: {"v":1,"hash":"784034b1113f7c2b39a10e9254a34e39732fd42084dfedd82a6cebbf27e19bb0","data":"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="}
import { Base, component, on, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"4eee4f0dc618b3a9c327431d3bd783baa41dccb3af61458c0b405658df4a4df3","data":"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"}
import { Base, component, on, write } from '@studiometa/js-toolkit-v4';

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
