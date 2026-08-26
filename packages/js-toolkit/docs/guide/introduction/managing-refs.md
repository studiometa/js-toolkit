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
// @twoslash-cache: {"v":1,"hash":"ef8d0f941128be49ce25737b940cf58fdce4cb82bae0d147a6eee603a9d9b6a6","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"16a120ca6a47e7c3288a89dddfead26686a1d56bf501ed440bb8493b03b62824","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aTMABGCDmewYiAArDssutNttdgsDtDPGCIVkzl8AEzXW6ke6PJAANjeHxweB+ZD+9CYbE4PF8QOOMjk9DiygMmm0vD0x0M2jMFnCdgcJ2crncnm8LP8ciCIX4YRskWiHIUCSSqXSmWyeSoBSKcFKFWqtXqjWabQ63V6/UGw1G40mM0hC2hpIA7KtEVtEPC9mijhInNk8QS7g9aYgAIyvd7UT7U4i03b/DyMLC8siYPgg8HxFVgABm7BSiF4wHMvDrvDAzEsMCrnVIZxSAG5a/XSDBS6beG2O8gpt2wC8nPNFogABwAZj9YA2AdJKP2hw8JfLKXDOKQi5AN2jJOeFOTVO+afIGfpWZzWjzGD4jebrbQ7eXU6hy1nS5XyLUKim7gE2koRoBx5EjGTytOemCXgQ150ui2a5nYz68H2A7vp+KSjt+npIHGcZrgiy5IoG64hh42FYhBsJRtBp5wUmCFfEhvy3qhzabNABaYvEESFnAADCHD8DkjDALwZywLQvAvFWNZgPWsmKHQVbMGAGDji83BVkQEDsFAhEznGrT4uRAHxnG1EgcJmLiewkl7ucc5McSsa4vBKZXlx1CZiA2Z3LxZB8HJmm8NpGBmdCcYwmRawUQGML2eikW0G5Xx/kehJeU8pG+YhNI3oFd4gEQCyhGAcD1C2vCiREdVrHFxHenZ1mUb6QEbuiJYteB+7PJ5MHbMVHGlShTC8YQUB8E1tX1fErAQCkjDxJtUDMMkWk6aOBm8EZJlOC4bh4F4PgAFRXQABgNy2ret3C3TdQ7JGgLm8LN0C8BAXRFADIjMN98BwKkPi1Lwmw+A9azxOY5jIAAsgAIgAcrwABK/ZkFE/AwFMjDGsUZTDDAq04KQ8SWBAABe7CsEIQn7CUZ1wCUADqMCgiUACCagAJIlHDMAlE9AD68yffw3BtfG3orF1AaHsGIFPdlyyjaecY+Wxfmcem5WoVgoUDOF6nyXtsUeuZSxXMrSBpb1NEgJlmsjXlJ7efOLyzEe0AcVYNjijJxyKbwpaaJYvAAOQAAKdD0fS8cw5o1HUDRNLH47mICCoiZqXIStWPbS1924VvypeqfWr4NbHImxxQPZ1nRVbILHyTgqOsezD2Ly57Xjngs5knSZbdCKXwKlqaLK1rYwt3d7wAAkwCZS8vAAO5cL4Lk5DAUC3dw451i85iTlQqdIKAsS1X0YB4JUIAvC8QA==="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"3bdf67c303849c2f465f2537139ede3e8782b487dacf2038abac5c39ddcade53","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aTQCBOeaLRAAVh2WXWm22uwWBwYHhBLic2S+ACZrrdSPdHkgAGxvD44PA/Mh/ehMNicHi+IHHGRyehxZQGTTaXh6Y6GbRmCzhOwOE7OVzuTzeJn+ORBEL8MI2SLRNkKBJJVLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcaTGZzPao4kAdlW8K2iFhexRRwkmLOOLxdwe1MQAEZXu9qJ9KcRqbt/h5GFhuWRMHx0RB4kqwAAzdgpRC8YDmXg13hgZiWGAVzqkM4pADc1drpBgxeNvBbbeQU07YBe4PdSAAHABmH1gDZ+4lI/aHDxF0spUPnRBzkA3SNE55kxMU74p8hp2kZrNaHMYPj1xvNtCthcThaopZT+eLxHUZE13ABtxSxf8DwJKMnlaE9MDPAgLxpVEQEzbM7AfXgez7F83xSYcP0hGMY2XOEFwRf0VyDDwsIQU4dyhCNIKPGCEzgr4EN+K9kMYRtNmgPNQXiCIAEkaEsOAAGEOH4HJGGAeUojQCheEDAZlLOWBaF4F4KyrMBawU6IK2YMAMFHAzVLQYzTPM2sNLoayzPMF5uArIgIHYKACNRbFsVhNYyL9GNcQA1dkJEsTJOk/UsjDZZGMJaNsVgpNz046h0xQrA7l4sg+ECRTHO8pBsRnFZSL/aFKKAgrom3L5yogxKnhjT0UvgqlLwy68spygY8pUwCrN4EyMGKxA/JIgLKpIyy8DmuiGoSqCSpY8l2M6pCmGyglctIPh7NoIq3U/EqYV/ciGNCqiQEO+r4v3fFmqQGdktY1KONTbrkKIBZQjAOB6ibXgJIiQG1nG7FiXK6byO9a6gKLcHQLi2Mrkew9ozW08NsQrimF4wgoD4UGAaB+JWAgFJGHiWmoGYZJHOHVzeHczynBcNw8C8HwACpeYAAyR8nKep7gBf5gdkjQdh+F4QnoF4CAuiKFWRGYeX4DgVIfFqFSZWFtZ4nMcxkAAWQAEQAOV4AAlXsyCifgYCmRhDWKMphhgSmcFIeJLAgAAvdhWCEIT9hKTm4BKAB1GAACMSgAQTUYSSkNmASlFgB9eYZf4bhIc9eHYb9Pc5o8UX7rR5aj2C9rcfSmgeszPrHgOxQHJG0zIanGMLr9K6K9uzvaGrmN0aalbY1Jd6Orx77trbgbLOOkAIR8qcfwq8jZqG+b98WpAJ9rpKZwb5Mm8yniBiJgSXCEsBhLALAVef1+0Dkwawu03SuxrVe3cnJjhZmzLyJ1IQzguP5X0x8QrDxEi/N+SCGBH1jHuKeR43rrUvl9Zu3EdogXbt/FEa8N4vTjAPEk1VkILVijuGMGCnrT1ahfNKeDMq/VIP9ZGFZSbI3GjOGcV1S5IHhsPDO49YSYKxmwz6XV8EE1vvxEGYMRZUxpnTBmzAmZTFAR5cBEouZohlPzIWaijai0YOLSWedZaaz4lAJWKsP7q01v4HWKkID6x8BnY2YBTaWxtvbYsjswDO1du7Y0nsCo+zIP7IOIcw62BSJHSUscE7J1TunCxmcc52ILoI1oe5RG7hoXgKuaCYzSOYXXbBONcEKOvoQvafBAGjSKSXWBiA95hQPn0qpNTMYtVnjg9hTSeodIgaiYRMDApICHvvDwv1WBdBRgwoZTEz4vFmPuaA7ErA2FFPJY42leDFk0JYXgAByAAAp0HofReLMFNDUOoDQmjXNHOYQEcp8zqg5GKSsXYCn/U3LyYF+laxPmBtc/M1yKD/0wr2fsyBrlNBgOJYcCKblnA/tc2YXYXjfKhWUXgAAxdgPYRDFlsEA3gAsMVYqmALZFxZ1LhNWb0BcPilaRHVlAWATjmDFkePLZW0R/E1gipiqKstZLyVqkpEhaleCHW0nwPSBk/FWMOspSy3BbIvBNlCxBH934qy/pZDVkLtW5Iphoyy8QVlrMNUS5yThnlIFALEAGfQwB4EqCAF4LwgA==="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"ff7770e73d390dced5a0fbae1ffedcd785b0633b47fcff06cb3b2e577ae765a0","data":"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"}
import { Base, type RefEvent } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"8aa8822094fa4da01d7a21a5dc227ad5005ef74bdc819d801656fa8a091ce10d","data":"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="}
import { Base } from '@studiometa/js-toolkit';

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
