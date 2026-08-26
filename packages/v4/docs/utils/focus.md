# Focus

```js twoslash
// @twoslash-cache: {"v":1,"hash":"63d5ccad211f0a57d36404d60063bd9b66ecb86d7ebd80bac34a068a9ed758c9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvOMxIBBMexIBRVjAC2MMGkbdEvIhHZQAOmHbqsEUmmmyYC8SrWbtlEFAgiEiEACUNDQAjMl4Ad3xmW0ioXjR8GAEvQTgKOIheUng0a0T2W1YosgA6dzg0ZhskAE4qNTAAc3ikAEYAdioK0gaYBl8ZeUVnQLc69jBcRAAGKhFI0mYxMhqAXwp0bEmCYmXOuj6QFg4uPiFRcUk4hawAMWS4RhhWfQAJABUAWQAZVRG0NJgJG0+gA0jAMEEIJUoMogWg9AYjKZzJZrLY0Nc7iIUu5PN48GCYFg4swgrwwLJ2A0ohIpOM4MZEswpE8/qUqOVKn0AEwADjqWia+BqnUqPQOGOYt3u7g4EyQMxAc0qixo5EQfLWGxweEIJHIe3oTDYnB4AmEikuwkl0uxDwRhmMZgsVhsvGtmJlVDxPhAAHElIl4ol+PdeEFFgBrdLhSI0fW8GK8fLhmChrJxBJXKXskCcqqIADMtRA9SFrRaou6vTwHqlWJxY3l01m81VyyL1RWAF1ZtAti60bxgHZBk4YL9XP9s7aUmk67O4LwVgJSBB1LwAOQAAXKgigEk0FQA9AArOAAWhyEFYkfyF6IABZj4JxKw4JuANzuI/MJCgfYtAZSQ8HPEAVhWIA=="}
import { saveActiveElement, trapFocus, untrapFocus } from '@studiometa/js-toolkit-v4/utils';
```

The three calls a modal surface needs.

## The three

```ts
saveActiveElement(): void
trapFocus(el: HTMLElement, event: KeyboardEvent): void
untrapFocus(): void
```

| Function               | Does                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `saveActiveElement()`  | remembers what had focus, so `untrapFocus()` can give it back |
| `trapFocus(el, event)` | keeps `Tab` and `Shift+Tab` inside `el`                       |
| `untrapFocus()`        | releases the trap and restores focus to the saved element     |

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

## The saved element is shared across copies

Through the shared runtime, for the same reason the scroll lock counts: **there is one focus per document**. Two independently evaluated copies of the package must not each think they own it.

## `<dialog>` already does some of this

`showModal()` gives the top layer, the backdrop, a focus trap and `Escape`. What it does **not** do is stop the page behind it from scrolling — see [`lockScroll()`](./scroll.html#lockscroll).

Reach for these three when the surface is not a native `<dialog>`.
