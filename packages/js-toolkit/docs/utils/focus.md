# Focus

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2a8faa6b99df03c54fa1dc450954e9d76d097ba9c469079ff9e9cac803e24ddc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvOMxIBBMexIBRVjAC2MMGkbdEvIhHZQAOmHbqsEUmmmyYC8SrWbtlEFAgiEiEACUNDQAjMl4Ad3xmW0ioXjR8GAEvQTgKOIheUng0a0T2W1YosgA6dzRmAHMfZGQQDjAAa3d8NDQsOEQAek6AKzgAWhyIVgb8/qIAFmK4NEEoCU1y4tgiTsFxVjhO/mS4Ypb1VgBiGRJmRRIYFy0GAF1bqhnmGyQATio1MAr4pABGAHYqOVSBUYAxfKcHBcYKpAm4PuwwLhEAAGKgiSKkc40ciIV4AXwo6GwyIIxDIZTo4JALA4XD4QlE4kkcSxWAAYrtGFd9AAJAAqAFkADKw1xoNIwEjafQAaRgGCCEGeUGU0rQegMRlM5ks1lsaDZnJEKXcnm8eHlMCwcWYQV4YFk7AqUQkUkRcGMiWYUiucLQpSBlWqtXqTSoLTaHW6fUGEGGozQ4ymMzmCzBzGWUrWGy2OxNewOx0NzCw+dN90ewPBACYABwfLTffBvIMgsF4Esc3buerItEgDHPbEUxD1wnEnB4QgkchAqlMNicHgCYSKFnCLvGlK6fSGYxmCxWGy8TdGntUc0+EAAcSUiXiiXLcF4QXODXS4UiNFnvBivHyV8YB2LI4gSVlS0DahgyQGo6kRcMCFadoul6AYhhGMZJmmWZ5ggRZMxWHN2E2bZdn2NBDiOM9S2fEBKxAJ4XkQABmd46ibH5EF+X421BakaO7Ate0Rft0UxEdcTY/EHkHaBSSPfVeGAOx5GhMUbjSLddjSQTtxffEBFIfDeAAcgAAVTPCCLQuME3yYjNlMgBudwCKQUAqS0T1JDwPoQHxfEgA="}
import { saveActiveElement, trapFocus, untrapFocus } from '@studiometa/js-toolkit/utils';
```

The three calls a modal surface needs.

[[toc]]

## Usage

`trapFocus()` takes **the keyboard event**, so it is called from a key handler rather than installing a listener of its own:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f634edc581d19b5139eed4858bb31d2170a406d046c8359102f8f5bf82eabba9","data":"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"}
import { Base } from '@studiometa/js-toolkit';
import { saveActiveElement, trapFocus, untrapFocus } from '@studiometa/js-toolkit/utils';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  open() {
    saveActiveElement();
    this.$el.removeAttribute('hidden');
  }

  close() {
    this.$el.setAttribute('hidden', '');
    untrapFocus();
  }

  onKeydown(event) {
    trapFocus(this.$el, event);
  }
}
```

With [`useKey()`](/api/services/useKey.html) the event is in the props:

```js
mounted() {
  return useKey(this.$el).subscribe(({ event, TAB, isDown }) => {
    if (TAB && isDown && event) trapFocus(this.$el, event);
  });
}
```

::: tip This is why the key listeners are not passive
`trapFocus()` calls `preventDefault()` on the event it is handed, and a passive listener cannot. See [`useKey()`](/api/services/useKey.html#the-listeners-are-neither-passive-nor-capturing).
:::

## The three

### saveActiveElement

```ts
saveActiveElement(): void
```

Remembers what had focus, so `untrapFocus()` can give it back.

### trapFocus

```ts
trapFocus(el: HTMLElement, event: KeyboardEvent): void
```

Keeps `Tab` and `Shift+Tab` inside `el`.

### untrapFocus

```ts
untrapFocus(): void
```

Releases the trap and restores focus to the saved element.

## The saved element is shared across copies

Through the shared runtime, for the same reason the scroll lock counts: **there is one focus per document**. Two independently evaluated copies of the package must not each think they own it.

## `<dialog>` already does some of this

`showModal()` gives the top layer, the backdrop, a focus trap and `Escape`. What it does **not** do is stop the page behind it from scrolling — see [`lockScroll()`](./scroll.html#lockscroll).

Reach for these three when the surface is not a native `<dialog>`.
