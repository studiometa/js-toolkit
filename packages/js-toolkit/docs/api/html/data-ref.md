# `data-ref`

Marks an element as a named part of a component.

```html
<div data-component="Dialog">
  <button data-ref="close">Close</button>
</div>
```

The name must also be declared in [`config.refs`](/api/configuration.html#config-refs).

[[toc]]

## A single ref

```html
<button data-ref="close"></button>
```

`config.refs: ['close']` gives `$refs.close`, the **first** match.

## A list

**The `[]` is part of the attribute:**

```html
<button data-ref="tabs[]"></button>
<button data-ref="tabs[]"></button>
```

`config.refs: ['tabs[]']` gives `$refs.tabs` as an array.

A list declaration matches the suffixed attribute **and nothing else**. The opposite mistake — the suffix missing from the attribute — gives one `ref.mismatch` warning per instance and per ref, naming the component and both spellings.

## Naming the owner

By default a ref belongs to the **nearest enclosing component**. The prefixed form crosses every boundary except another component of that name:

```html
<div data-component="Slider">
  <div data-component="SliderItem">
    <button data-ref="Slider.next">Slider's, from inside a child</button>
  </div>
</div>
```

The nearest `Slider` wins, and a nested `Slider` shadows its parent.

**The namespace is written in the markup only, never in `config.refs`**, and the name elsewhere never carries it. The namespace goes **before** the suffix:

| Markup                     | `config.refs` | Property     | Handler       | Decorator          |
| -------------------------- | ------------- | ------------ | ------------- | ------------------ |
| `data-ref="next"`          | `'next'`      | `$refs.next` | `onNextClick` | `@on('next', …)`   |
| `data-ref="Slider.next"`   | `'next'`      | `$refs.next` | `onNextClick` | `@on('next', …)`   |
| `data-ref="dots[]"`        | `'dots[]'`    | `$refs.dots` | `onDotsClick` | `@on('dots[]', …)` |
| `data-ref="Slider.dots[]"` | `'dots[]'`    | `$refs.dots` | `onDotsClick` | `@on('dots[]', …)` |

## It is live

`$refs` reads the DOM on access, so a `data-ref` element added later is found with no refresh, and a detached one never stays in a list. There is no `$update()`.

`on<Ref><Event>` handlers are delegated from the component's root element, so a ref that appears later needs no new binding. Events that do not bubble — `focus`, `blur`, `scroll`, `mouseenter`, `mouseleave` — are delegated from the capture phase.

See [Refs](/guide/introduction/managing-refs.html).
