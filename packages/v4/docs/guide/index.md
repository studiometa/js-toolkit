# Getting Started

`@studiometa/js-toolkit` v4 is a data-attributes driven micro-framework. You write classes, you add `data-*` attributes to your HTML, and one registry mounts the two together.

One sentence carries the whole design:

> **The registry is the framework. The DOM is the component tree.**

An instance exists because its element is in the document **and** its class is registered. Nothing else creates or unmounts an instance.

## Installation

```bash
npm install @studiometa/js-toolkit
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
// @twoslash-cache: {"v":1,"hash":"4638826ece87784f934243810e52326fb60d2e995f19e5fa4a73ffeb0705ab46","data":"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"}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"86f6818915718fe0cdc37e165a573c233dc11c9314fc6e282145b60d787b2b73","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADyYH4JxA80WiAArAB2VbrTbbXYLA4MDyg8FObJfABM11upHujyQADY3h8cHgfmQ/vQmGxODxfEDjjI5PQ4soDJptLw9MdDNozBZwnYHBCXG48F4fID/HIgiF+GEbJFopyFAkkql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuNJjM5nsMXCrlkkVtEDtqGjDh5jjizvjCXcHnTEABGV7vaifGnEOm7f4eRhYPlkTB8LEweKqsAAM3YKUQvGA5l49d4YGYlhg1c6pDOKQA3OYXk4oRiABxkxFgDYBkfB/ahkClispCPnRAAZmjxNjTyTVK+BHT5EzDOzua0+YwfCbLbbaA7Y/7XuWCL9Y+RgdR04x4GbENxSFXs6JJJxniFyUim1LfHu9IfjmeZ2GeIJgsWtxwAAMhAzCwFA1YAEZ1GszBgHeCwYvG8aTmsz4BisU7ojSXBoRhMBQIuXwwmugFPHioGYOBu6/Ae0Etps0CFoh8SWBAXTRExjDcNWRAQOwzFUNK7ggCh7BljA/AYIIPiEBAOQULwLYEfYtS8NhPh7h2UCwGA8S8AAsswISkAMXSkGAvDML4MAEV0WC8GWUkPH0YDmIwtg+d5CzEiEEBlrwmwwJYfCbMw9ikFJIgRMl3iNvIvAAAYACRSRJUloLJxW8IAKAS8HAGBgrwtjmFwzX8Ig5h1g2HUtZV0lQLJNa9Q2oRgJ0jWVk2rACj5ADuzBNPl7BwPEpVnOU2nVQAyv0ADCEQ0PQ3A9t5428O53RedNKSzR0XTYXA/AdlZjCMEQbBdDAfA6MYNa8IAZAS8C8Z1jaDPVgAAgqE4QajEXKKJ2PkmewtBnFdHleSIC23PYK2xIoIhsBEKS8AtTT4LwTRwOYEALWAxmYwRISRJ0nbdRFF31oNNDDXwtY8w212ed5yBwIFZDiZJQ2ycZI3/YDIMvFM53jX2nrEUg8bLoOo7jkgj57LRHh80xLFG+xG5IFxyY8TutL7tQWYgDBJ5waJ4LxMhDGYTheH+YRWvQmRf4UYbzxvqbBD0ehmGW4g+v/jGpIJsu3GphB/Eu4ebvHjgnsId7vvx0xAf1EHRHQnirS+hHL7USbM6l4xylZJGOu+jcqdxq8syztAO5WDYErAJKoPBZoli8AA5AAAp0PR9EJzAWjUeE2i0rSz+d5gKiIRZatyE9C/W8xoOw/ATfO83jxerZz0Ws+g3vF2t5h81lmwqhv7zsv8xGmfBsmleCME2GtH2cc258FFl5dWDYyjA3yj4Batgcj5UyiZLoU1sreQiOCXghc5BrBbNECGED1ofyYvNa8P0EEvF7E4VeSBQBEzgOFPAlQQAvBeEAA=="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"3662c501912992fb99c20b5d8cfaf38e717057cf3d48f585e5ad76abf211c18a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8AAy7E6Tnmi0QAFYAOyrdabba7BYHBgeUHg07nRAAJmut1I90eSAAbG8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN4Wf45EEQvwwjZItEOQoEklUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZnM9ujYVcsoitogdtRUYcPMcnNkvviQDc7g9aYgAIyvd7UT7U4i03b/DyMLC8siYPiYtDxFVgABm7BSiF4wHMvAbvDAzEsMBrnVIZxSAG5643SDBy6beB2u8gpr2wC8IZ6kAAOUkIsAbf2LoP7EPRiKVlLhs5fADMBNjJOeFNTVO+GfIWfpObzWgLGD4zdb7bQneXM4W6ITFwTS4rsi65ongr6ShGwExkScZPK056YJeBDXnS6IgLm+Z2M+vADkO76fik47flCCZJoBSIBiiG5obhCDYl80LHjBp7wSmiFfMhvy3mhjCtps0BFmCJYRAAkjQlhwAAwhw/A5IwwC8GcsC0LwLw1nWYCNopih0DWzBgBgk4vNwNZEBA7BQMR6K4hcR6+suFEJlGeygR4oniVJMmGlk+7zkxxLxriCFpleXHUNm6FYHcfFkHwSm6bw+kYFZSC4gmc7kf6jEgZu8W0HuOIZdGhIBU8CawsFSE0je4V3iARALKEYBwPUba8JJEQtWsKV4gedlrA5/rwjlaFll1EG+c8/mwdslUcdVqFMHxhBQHwHXNa18SsBAKSMPE+1QMwyR6QZ44mbwZkWU4LhuHgXg+AAVA9AAGY2bdtu3cM9T0jskaDsPwvDLdAvAQF0RTgyIzBA/AcCpD4tS8JsPhvWs8TmOYyAALIACIAHK8AASoOZBRPwMBTIwxrFGUwwwNtOCkPElgQAAXuwrBCPEtgpCUN1wCUADqMAAEYlAAgmoIklKjMAlB9AD68z/fw3A9birQAfZQGIHZLmbh9BVfCsxUnvGTlzemYU0HVubRQMsXacpJ3JR6P6paSWsDTr2X62heVG8s02ngeQWzFusB4FYNjigpxyqbw5aaJYvAAOQAAKdD0fR8cw5o1HUDRNC0rSp5O5iAgqxaalyEq1n2ysA01O78vXmmNuBNap8WqcUH2Da0TWyCp00MASeOqezLwZRI3Kz3js9ikiFF4oQOWs8+EdH7sCL4NtYdyRVLhOimCAo/j1Mp99i85ft+5Y+eQDckKXlql8BpWmy1tO2MK9XkwFARS4leAABJgB5ReM9bgk4GwvHMNOKguckCgFiM1PoYA8CVBAC8F4QA==="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"c4916b22264c2e24c7aad51a0205edd1dc8b3a6d8e53c987d4e08139dfb6bf47","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"48617f7733c4b0cbaa2d8f62ee1b4f0df2732b519cd6bc1e96e572535e308305","data":"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"}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

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
