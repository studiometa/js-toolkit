# Getting Started

`@studiometa/js-toolkit` v4 is a data-attributes driven micro-framework. You write classes, you add `data-*` attributes to your HTML, and one registry mounts the two together.

One sentence carries the whole design:

> **The registry is the framework. The DOM is the component tree.**

An instance exists because its element is in the document **and** its class is registered. Nothing else creates or unmounts an instance.

## Installation

```bash
npm install @studiometa/js-toolkit@next
```

## Hello world

Declare the component in the markup with `data-component`, and expose the elements it needs with `data-ref`:

```html
<div data-component="Hello">
  <button data-ref="btn">Say hello</button>
</div>
<script type="module" src="./main.js"></script>
```

Write the class, and register it:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4f272d9eb668a2e5a4b5ff441ee160a6cc605e60ccc990e71d92e9e92a6853ca","data":"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"}
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Hello extends Base {
  static config = {
    name: 'Hello',
    refs: ['btn'],
  };

  onBtnClick() {
    alert('Hello, world!');
  }
}

registerComponent(Hello);
```

That is the whole setup. `registerComponent()` puts the name in the registry, and every `[data-component="Hello"]` element in the document gets an instance — including the elements added to the page afterwards, by a template, a `fetch` or another component.

## The four things to know

### 1. Mount and unmount follow the element

The element enters the document, the instance mounts. The element leaves, the instance unmounts and stays on its element, ready for a re-insertion. A **move** is one unmount and one mount of the same instance, exactly like `disconnectedCallback` and `connectedCallback` on a custom element.

There is no third state. A component never declares that its work is over.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"0051d8ff6f45f4c1c3f297af3abc7559d82e1827464b43739eef9b69595bc487","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADyYH4JxA80WiAArDssutNttdgsDgwPKDwU5sl8AEzXW6ke6PJAANjeHxweB+ZD+9CYbE4PF8QOOMjk9DiygMmm0vD0x0M2jMFnCdgcEJcbjwXh8gP8ciCIX4YRskWiHIUCSSqXSmWyeSoBSKcFKFWqtXqjWabQ63V6/UGw1G40mMzme3RpIA7KtEVtEPC9mijhJsWc8QS7g9aYgAIyvd7UT7U4i03b/DyMLC8siYPiYmDxFVgABm7BSiF4wHMvDrvDAzEsMCrnVIZxSAG5zC8nFD0QAOADMfrAGwDpJR+0OHhL5ZS4fOiBHIBu0ZJzwpyap3zT5Az9KzOa0eYwfEbzdbaHbY77nuW8LWY6RganIY8F4hOKQK7XRJjTy4hcW6YDuBB7nS6IgNmuZ2GeIJgkWtxwAAMhAzCwFAVYAEZ1GszBgHeCzonGcYrk+47LG+M4EFwaEYTAUCLl8MJRv+G64iBKa7r8B5QYwzabNABaIfElgQF00SMYw3BVkQEDsExVBSu4IAoewpYwPwGCCD4hAQDkFC8M2BH2LUvDYT4e7tlAsBgPEvAALLMCEpADF0pBgLwzC+DABFdFgvClpJDx9GA5iMLY3leQsRIhBApa8JsMCWHwmzMPYpCSSIERJd4DbyLwAAGAAkkniZJaAyUVvCACgEvBwBgYK8LY5hcE1/CIOYtb1u1zUVVJUAydWPX1qEYCdA1FaNqw/LeQA7swTR5ewcDxCVZzlFpVUAMr9AAwhEND0Nw3ZeWNvBud0nlTSkM0dF02FwPw7aWYwjBEGwXQwHwOjGNWvCAGQEvAvKdo0g91YAAIKhOE6oxJyigdt5xnsLQZyXe5nkiPNtz2MtsSKCIbARCkvDzU0+C8E0cDmBA81gEZGMESEkSdB2XXheddYDTQQ18DW3P1ldHlecgcABWQYkSYNMlGcNf0A8DLxTGdY29h6xFIGRrEIs+Aa+tQqI0bzjHMUght/sSsacUmoFfOBvHUJm0HHjgcEieC8TIfRmE4XhfmEZr0JxqSVx65RzzUVBPvoZh5uIAObHW08ZFcWBNL7s7h6u7B+YIV7scMVhFkBwRRHQriQ6GxRL4rEb04x3Rcdm6cS5xuHVsAcsKvXNADtWDY4rABKINBZoli8AA5AAAp0PR9IJzDmjUeHWlPZ3mPKIiFpqXKj4LdbzGg7D8ON85zSPn5VlPhZTyDm/nUXmFzaWbCqI/PMy3zw2H/WGm8EYJsVa3tm7Fz4CLTyat6xlCBnlHw81bA5DyhlYyXRJpZS8hEcEvB3ZyDWM2aI4NgFrWfoxOa15vrQJeD2JwS8kCgEJnAMKeBKggBeC8IAA==="}
import { Base } from '@studiometa/js-toolkit';

class Once extends Base {
  static config = { name: 'Once' };

  hasLoaded = false;

  mounted() {
    if (this.hasLoaded) return;
    // … the work that must run once per element
    this.hasLoaded = true;
  }
}
```

Read more in [Lifecycle](/guide/introduction/lifecycle-hooks.html).

### 2. Refs are live, and handlers are delegated

Each `$refs` property reads the DOM on access, so markup that arrives later is found with no refresh and no `$update()`. `on<Ref><Event>` handlers are delegated from the root element, so a ref that appears later needs no new binding.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b302cf57c1d43962fe801961c7e4d742f9cdccb9af822e3d47307ddc6193de22","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8AAy7E6Tnmi0QAFYdll1pttrsFgcGB5QeDTudEAAma63Uj3R5IABsbw+ODwPzIf3oTDYnB4viBxxkcnocWUBk02l4emOhm0Zgs4TsDhOzlc7k83mZ/jkQRC/DCNki0XZCgSSVS6Uy2TyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3Gkxmcz2aJJAHZVgitog4XtUUcJE5sl88SAbncHjTEABGV7vaifKnEGm7f4eRhYHlkTB8DFoeLKsAAM3YKUQvGA5l49d4YGYlhg1c6pDOKQA3HWG6QYGWTbx253kFMe2AXhCPUgABwAZl9YA2/pJyP2hw8pYrKTDZy+i6jBKJcaTFK+BHT5EzdOzua0+YwfCbLbbaA7y+nCzRS1nS5XSLUCim7gM2ErhoB0aErGTytOSKaUt8V60miIA5nmdhPrw/aDm+H4pGOX5QvG8ZrvCy6IgG67Bh4OEIFiXzQviMbEgG8GYIhl6/DeqGMC2mzQIWYLFhEACSNCWHAADCHD8DkjDALwZywLQvAvNWtZgA2SmKHQ1bMGAGATi83DVkQEDsFARFojiFxXORAEJpGQYgWJEnSbJBpZPuc7MdBrE4uxqZIdx1BZmhWB3PxZB8Mpem8AZGDWUgOLxkxDmUelLmoXFtB7tif5Hixcbxl6QWcdS15hbeIBEAsoRgHA9StrwUkRE1azJbi872WsFH+j6QEbqhpYdeBPnPH5J6weVF6VShTD8YQUB8G1jXNfErAQCkjDxHtUDMMk+mGWOpm8OZllOC4bh4F4PgAFT3QABqNG1bTt3BPY9w7JGg7D8LwS3QLwEBdEUYMiMwgPwHAqQ+LUvCbD4r1rPE5jmMgACyAAiAByvAAEoDmQUT8DAUyMEaxRlMMMBbTgpDxJYEAAF7sKwQjxLYKQlNdcAlAA6jAABGJQAIJqKJJQozAJTvQA+vMf38NwXU4vOhV9Y5h7ZXg735V8KxFf5JWBcmHFzchPFMJFhLRaQsW6bQx1Je634pdCmt+kgWXATlTsG8sU0wUg86BbMUbQBeVg2GKinHGpvBlpoli8AA5AAAp0PR9PxzBmjUdQNE0acTuYgLykWGqcuKNa9kr/0NTufJ11pDYvi1adFmnFC9vWdHVsgadNDAkljmnsy8GUiOyk9Y5PUpIi2/YEBljPPiHe+7DC2DLUHckVQ4TopggCPY9TCfvYvGXbduaPHn/fJim5WpfCadpMubdtjAvZ5MBQEpCSvAAAkwBcovCetwCc9YXjmCnFQPOSBQCxEan0MAeBKggBeC8IAA"}
import { Base } from '@studiometa/js-toolkit';

class List extends Base {
  static config = {
    name: 'List',
    refs: ['items[]'], // the `[]` is part of the attribute: data-ref="items[]"
  };

  onItemsClick({ index }) {
    console.log(`clicked item ${index}`);
  }
}
```

Read more in [Refs](/guide/introduction/managing-refs.html).

### 3. Options are a read-only view over the attributes

An option is an **input**, never a store. Every property of `$options` is a getter that derives its value from the element and the viewport on each access.

```html
<div data-component="Grid" data-option-columns="1" data-option-columns:l="4"></div>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"28f6b127d8a5806775c302289187078ba149445b2e7ae14f701f8ba6848b97cd","data":"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"}
import { Base } from '@studiometa/js-toolkit';

class Grid extends Base {
  static config = {
    name: 'Grid',
    options: {
      columns: { type: Number, default: 1 },
    },
  };

  mounted() {
    console.log(this.$options.columns); // 1, or 4 from the `l` breakpoint up
  }
}
```

Every option is responsive with no flag to declare, and to change one you write the attribute. Read more in [Options](/guide/introduction/managing-options.html).

### 4. Children announce themselves, parents listen

A child never reaches for its parent. It emits, and the parent hears it through the `on<Child><Event>` convention, resolved against the names in `config.components`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"665df98a7ed69c47a6df93b9d64111ca11fa6a5a094bd33ae071012c3efb4588","data":"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"}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit';

class SliderItem extends Base<{ $emits: { select: { index: number } } }> {
  static config = { name: 'SliderItem' };

  onClick() {
    this.$emit('select', { index: 0 });
  }
}

class Slider extends Base {
  static config = {
    name: 'Slider',
    components: { SliderItem },
  };

  onSliderItemSelect({ payload }: DelegatedEvent<SliderItem, 'select'>) {
    console.log(payload.index);
  }
}
```

`$emit()` dispatches a real, bubbling `CustomEvent`, so a plain listener hears it too.

::: tip A handler named by convention is not typed by convention
The `on<Child><Event>` name is resolved at runtime, so TypeScript cannot infer the parameter for you. Annotate it with `DelegatedEvent`, `RefEvent` or `GlobalEvent`. The [`@on` decorator](/api/decorators/on.html) does not remove the annotation either — it checks it against a real target.
:::

Read more in [Events](/guide/introduction/working-with-events.html).

## Where to go next

- [Installation](/guide/introduction/installation.html) — build tools, CDN and the subpath layout.
- [Components](/guide/introduction/managing-components.html) — declaring, registering and nesting components.
- [Philosophy](/guide/concepts/philosophy.html) — why one registry, and what was removed to get it.
- [Migrating from v3](/guide/migration/v3-to-v4.html) — every breaking change, with the replacement for each.
