# Refs

A ref is an element of a component's own markup, named in the HTML with `data-ref` and declared in `config.refs`.

**Refs are live.** Each `$refs` property reads the DOM on access, so markup put into a component is found with no refresh, and no detached element stays in a list. There is no `$update()`.

[[toc]]

## A single ref

```html
<div data-component="Dialog">
  <button data-ref="close">Close</button>
</div>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f636ef6befbfeb02954943c87cad26626db6fed7829a9acbe83b5f07f5057d07","data":"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="}
import { Base } from '@studiometa/js-toolkit-v4';

class Dialog extends Base {
  static config = {
    name: 'Dialog',
    refs: ['close'],
  };

  mounted() {
    this.$refs.close.focus();
  }

  onCloseClick() {
    this.$el.removeAttribute('data-option-open');
  }
}
```

A plain declaration selects `[data-ref="close"]` and gives the **first** match.

## A list of refs

**A list ref keeps the `[]` in the attribute.** The suffix is part of the name, in the config and in the markup:

```html
<ul data-component="Tabs">
  <li><button data-ref="tabs[]">One</button></li>
  <li><button data-ref="tabs[]">Two</button></li>
</ul>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a8f94bfd1306f7ae3ce767b605343733643dfa65b8763f9fceca912df7f6a763","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aTMABGCDmewYiAArAB2VbrTbbXYLA7QzxgiFZM5fABM11upHujyQADY3h8cHgfmQ/vQmGxODxfEDjjI5PQ4soDJptLw9MdDNozBZwnYHCdnK53J5vKz/HIgiF+GEbJFopyFAkkql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuNJjNIQtoXCrlkkVtEDtqGjDh5jk5svjCXcHnTEABGV7vaifGnEOm7f4eRhYPlkTB8EHg+KqsAAM3YKUQvGA5l49d4YGYlhg1c6pDOKQA3HWG6QYGWzbx253kFMe2AXk55otEAAOMmIsAbAOL4P7UMgUsVlIR3FIADM0eJsaeSapXwI6fImYZ2dzWnzGD4TZbbbQHeX06hSHjF3jS4rii67ongr5SpGwE3DGpKBpSKbUt8170hiOZ5nYz68P2g7vp+KRjt+Xq/omgHIoGqIbhi2HYpBsLHiScatPBmCIVevy3qhLabNAhZYvEERFnAADCHD8DkjDALwZywLQvAvNWtZgA2UmKHQ1bMGAGATi83DVkQEDsFAhGzvGrQwqRAbxgBIGbgJWIiewYl7uc870aeSB4sxqZIex1BZiAOZ3FxZB8NJam8BpGDGdC8YwisfrLmR5k2RiYW0M5Xxzm5sHxhSyYsZetI3n5d4gEQCyhGAcD1K2vBCRE1VrNFv5wkGayJQGCIpQCDU1RlyzZYxXmsUVKFMFxhBQHw9VVTV8SsBAKSMPEK1QMwyTqZpY66bw+mGU4LhuHgXg+AAVKdAAGpaNTA82LYw3AXedw7JGgjm8BN0C8BAXRFL9IjMB98BwKkPi1Lwmw+Ndc3mOYyAALIACIAHK8AASgOZBRPwMBTIwJrFGUwwwAtOCkPElgQAAXuwrBCPx+wlIdcAlAA6jAoIlAAgmoACSJTQ2sJQLSkAD68xvfw3DNQmc4EglQGIEe3UeCL/XPINTzxp5+XeWxGYlahWBBQMIUqTJm1RZ6JlLMr7WK8leygR4aXq/F0EnrBeIHi8sxbtAl5WDYEqScccm8GWmiWLwADkAACnQ9H0XHMBaNR1A0TQtK0McTuYgKKoJWrcpKNa9hL73bpWApl0pDbgdWMeCTHFC9vW1HVsgMfJOCY4x7MvYvHndd2eCDliRJ5t0HJfCKcpgu3SLjAXT3vAACTAGlLy8AA7lwviOTkMBQBd3ATvWLzmFOVAp0goCxFVfRgHglQgC8LxAA="}
import { Base } from '@studiometa/js-toolkit-v4';

class Tabs extends Base {
  static config = {
    name: 'Tabs',
    refs: ['tabs[]'],
  };

  onTabsClick({ index }) {
    console.log(`tab ${index} was clicked`);
  }
}
```

`$refs.tabs` is an array. The property name never carries the suffix — `tabs[]` in the declaration, `$refs.tabs` everywhere else.

::: warning The two spellings must agree
`config.refs: ['tabs[]']` matches `data-ref="tabs[]"` and nothing else. The opposite mistake — the suffix missing from the attribute — gives one `ref.mismatch` warning per instance and per ref, naming the component and both spellings.
:::

## Ref boundaries

By default a ref belongs to the **nearest enclosing component**. A ref inside a nested component is that component's, not yours:

```html
<div data-component="Slider">
  <button data-ref="next">Slider's own</button>
  <div data-component="SliderItem">
    <button data-ref="next">SliderItem's, not Slider's</button>
  </div>
</div>
```

### Naming the owner

A ref can name the component it belongs to, and then it crosses boundaries:

```html
<div data-component="Slider">
  <div data-component="SliderItem">
    <button data-ref="Slider.next">Slider's, from inside a child</button>
  </div>
</div>
```

`Slider.next` passes every boundary **except** another `Slider`, so the nearest `Slider` wins and a nested `Slider` shadows its parent.

The namespace is written in the markup only, never in `config.refs`, and the name elsewhere never carries it:

| markup                     | `config.refs` | property     | handler       | decorator          |
| -------------------------- | ------------- | ------------ | ------------- | ------------------ |
| `data-ref="next"`          | `'next'`      | `$refs.next` | `onNextClick` | `@on('next', …)`   |
| `data-ref="Slider.next"`   | `'next'`      | `$refs.next` | `onNextClick` | `@on('next', …)`   |
| `data-ref="dots[]"`        | `'dots[]'`    | `$refs.dots` | `onDotsClick` | `@on('dots[]', …)` |
| `data-ref="Slider.dots[]"` | `'dots[]'`    | `$refs.dots` | `onDotsClick` | `@on('dots[]', …)` |

The namespace goes **before** the suffix: `Component.name[]`.

## Event handlers

`on<Ref><Event>` handlers are **delegated from the root element**, so a ref that appears later needs no new binding:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b50d8fe8cb8ec284502fe7f97b2ed5b9b6672827e193f5124721e61cca1e22cc","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Todo extends Base {
  static config = {
    name: 'Todo',
    refs: ['items[]', 'input'],
  };

  // Fires for any `items[]` ref, including the ones added after mount.
  onItemsClick({ event, target, index }) {
    console.log(index, target);
  }

  onInputInput({ target }) {
    console.log(target.value);
  }
}
```

The payload is `{ event, target, index }`:

- `event` — the DOM event.
- `target` — the ref element the handler matched, **not** `event.target`.
- `index` — the position in the list, or `0` for a single ref.

Events that do not bubble — `focus`, `blur`, `scroll`, `mouseenter`, `mouseleave` — are delegated from the **capture** phase, so they are heard all the same.

In TypeScript, annotate the payload with `RefEvent`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"bc122b16524b00aa57d40bbb64c386baf777920ee6b5383d5cc1235c0196607c","data":"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"}
import { Base, type RefEvent } from '@studiometa/js-toolkit-v4';

class Todo extends Base {
  static config = { name: 'Todo', refs: ['input'] };

  onInputInput({ target }: RefEvent<HTMLInputElement>) {
    console.log(target.value);
  }
}
```

## How the live read works

Ref lookups are cached, and the cache is invalidated by a counter that the framework's own MutationObserver increases. Reading that counter drains the pending records with `takeRecords()`, so the read is current even inside the same task as the mutation. Detached elements are never cached.

The practical consequence: you never refresh anything.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2b360151956817f15fe59880dc7e805572cbc76ccb0470f1953f993c6cc76c81","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Todo extends Base {
  static config = { name: 'Todo', refs: ['list', 'items[]'] };

  add(title) {
    const li = document.createElement('li');
    li.dataset.ref = 'items[]';
    li.textContent = title;
    this.$refs.list.append(li);

    // Already there. No `$update()`, no re-query.
    console.log(this.$refs.items.length);
  }
}
```
