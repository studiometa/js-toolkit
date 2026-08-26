# Focus

```js twoslash
// @twoslash-cache: {"v":1,"hash":"63d5ccad211f0a57d36404d60063bd9b66ecb86d7ebd80bac34a068a9ed758c9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvOMxIBBMexIBRVjAC2MMGkbdEvIhHZQAOmHbqsEUmmmyYC8SrWbtlEFAgiEiEACUNDQAjMl4Ad3xmW0ioXjR8GAEvQTgKOIheUng0a0T2W1YosgA6dzRmAHMfZGQQDjAAa3d8NDQsOEQAek6AKzgAWhyIVgb8/qIAFmK4NEEoCU1y4tgiTsFxVjhO/mS4Ypb1VgBiGRJmRRIYFy0GAF1bqhnmGyQATio1MAr4pABGAHYqOVSBUYAxfKcHBcYKpAm4PuwwLhEAAGKgiSKkc40ciIV4AXwo6GwyIIxDIZTo4JALA4XD4QlE4kkcSxWAAYrtGFd9AAJAAqAFkADKw1xoNIwEjafQAaRgGCCEGeUGU0rQegMRlM5ks1lsaDZnJEKXcnm8eHlMCwcWYQV4YFk7AqUQkUkRcGMiWYUiucLQpSBlWqtXqTSoLTaHW6fUGEGGozQ4ymMzmCzBzGWUrWGy2OxNewOx0NzCw+dN90ewPBACYABwfLTffBvIMgsF4Esc3buerItEgDHPbEUxD1wnEnB4QgkchAqlMNicHgCYSKFnCLvGlK6fSGYxmCxWGy8TdGntUc0+EAAcSUiXiiXLcF4QXODXS4UiNFnvBivHyV8YB2LI4gSVlS0DahgyQGo6kRcMCFadoul6AYhhGMZJmmWZ5ggRZMxWHN2E2bZdn2NBDiOM9S2fEBKxAJ4XkQABmd46ibH5EF+X421BakaO7Ate0Rft0UxEdcTY/EHkHaBSSPfVeGAOx5GhMUbjSLddjSQTtxffEBFIfDeAAcgAAVTPCCLQuMEywiZiM2UyAG53AIpBQCpLRPUkPA+hAfF8SAA==="}
import { saveActiveElement, trapFocus, untrapFocus } from '@studiometa/js-toolkit-v4/utils';
```

The three calls a modal surface needs.

[[toc]]

## Usage

`trapFocus()` takes **the keyboard event**, so it is called from a key handler rather than installing a listener of its own:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f20cbc6510599b419650c9f3fc3a02fa59b69694462180a51f2467d3fc3c2f10","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';
import { saveActiveElement, trapFocus, untrapFocus } from '@studiometa/js-toolkit-v4/utils';

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
