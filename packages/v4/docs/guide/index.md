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
// @twoslash-cache: {"v":1,"hash":"86f6818915718fe0cdc37e165a573c233dc11c9314fc6e282145b60d787b2b73","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvADyYPzxzuHRAKwA7N6+AUGIodRukdEgTS1OHElIAEzpmaTZuUgAbEUlOHiEJORh8kxsnDwCQnDKEjJy9L5KDuqa2rx6cYbaZhbWtvZxTi5u0S6aRAPn8gRCYRGUTwvwSM0Q8xAGSyOUqiAAjIVitRStsKntqAcYowsI8yJg+BMYAA6fgQMAAM3YfkQvGA5l4nN4YGYlhgrJcpESfgA3OYCn92kgAByrXpggZy4YRaExOmM5lTRLJADMCxRK3yGxxWxiO0q+xqxNJWnJGD4PL5ArQQv8koBnh6IL64MGkJVY0drWmuv1S1ReVmKWNmFN5V2VSJIBJZLs9sazRpmTgABkIMxYFBWQAjCAQHzMMDu9wY9FK0H9Tz+0bbLh5gswKBa+EdMPLNGzGO4s34xNW5N8wLQSmZ6mWCAAVzANCgjG4rKIEHYXaoUAg/AQMRz7AZMH4GEEMF4hAgAGsKLw+ZX7GgILxi1f8UKoLAwNTeAAsswGC8KQUQLqQYC8MwpwwJWC5YLwDJLjk7D0uYjC2NBUFuEsIEQAyvCBDAlh8IEzD2KQS4iPSRH4FeST0LwAAGAAkS7zkuaBrsxvCACgEvBwBgzS8LY5hcMJ/CIOYHJchJImccunZrmyslcgI9IuIJzI8qwzzQQA7sw7Avvg7BwNSrGJAAVme3EAMoQHyADC9LVGg3BilB6mgeBkHaX4unUnAC7FnA/BCh+jCMEQbALjAfA6MYbK8IAZAS8AUnlqRlMlgAAghpXxJMu1wKFAwrQY+7C0IkvloBBYAiAZmT2CZpW3CIbD0n4vAGSZ+C8CZcDmBABlgA+tWViBSQuMK0lgNlikrip7LeepYH1f5yAhTgpBzouSmrtwD4qUlKXpQUAC6XnqRKVD/DW6I6tK8qNogXrhC2MRLZ23bJF6yLhoag7YrGZTmgS7lMDau0UhmLTUtm7aFiWZYVlW91Shiqx6t6CpNsqX0EG2+aFn9Mp9hGSBPUOcYQ2OYwpraaYzgjSOk52qPlnBGNtB6CLBMCDa+l4hOqsTuYczuILatTwKA/2eSFJd6TQGUVg2HYKVxBlSGaJYvAAOQAAIuAu5VOVEzAAPTWXAAC0r7lreJn20QwSG155h1Oc8NXvIHX3Kp3n/Gg7D8BpGo9XowDcry/JG1ShsZV73nsx2UD6QybCqKnnI/UdwfqSevCMIE5mIyTGd8BtDU3Vy1vW2ldFXgZti3nRFGPguWlUVB9ItLwu1yD4fLLtl5cWenhb6S68X1wU4pOJOzBIKAAeNWhVYxHbIAFAUQA=="}
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
// @twoslash-cache: {"v":1,"hash":"3662c501912992fb99c20b5d8cfaf38e717057cf3d48f585e5ad76abf211c18a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvAAy7C5OLm7RAKwA7N6+AUGIodRukdEgTS0JSUgATOmZpNm5SABsRSU4eIQk5GHyTGycPAJCcMoSMnL0vkoO6pravHpxhtpmFta29nGt4dFdaRAPn8gRCYRGUTwPymyTmIAyWRylUQAEZCsVqKUthVdtR9jFGFgHmRMHwJmgAHT8CBgABm7D8iF4wHMvDZvDAzEsMCZLlIiT8AG5WezSDBaXBeWh+f5kABdYVgAq/dpIAAcK16IIGmuGEUhMWpdIZTg400QAGZ5ojlvl1pjNjFtpU9jUCUStCSMHxOdypTK/Cr3KiUiitf0wXrRnhffEgYlkkMEYskXlgvbMI7yjsqviQITiXZvbwxRL/QL5UHoii0eHQYNwfqxqWEDCkB1rSnbemMZmys7cdUxoxuYFoGTmpSaQBJGiWOAAYQ4/AA1oxgLxErBaLwCkyWWB2ZvFHQmcwwBhFQVuEyiBB2FAq7MUlagX16yi4eFozEZ3PF8uK6mgm6qdksyIzBmWJOjiuZuvmWBZKOZB8Fup68OeGBPogMwomqdYDB2UYGiAaG0MB5r4fCCzgXkKJdFBWYDnBYxEG4Ag0nAEA+EyC6cdxcZtMGMwWq+wIRogPTEWMRpcT4FHJF41E2siPYbP2sGusOo6EFAfB8WAckwBSrAQH4jAUpZUDMK4Z4XvKN68HeD5OFAED8AgMTSPgMC8AAVH5AAGskCSZZmMNwgUBbwbRoOw/C8Dp0C8BAACuaBYOlIjMIl8BwMwkS8GgEBFT5HGGaF5jmMgACyAAiAByvAAErimQvj8DAcqMPgaAZZKAD0A2wCQpk4KQFKWBAABe7CsEIFK2H4w3uXAA0AOowAARgNACCajTgNIU+ANpl+AA+rF8XcNhMzBGGb7akgr7fiRZ0KZ4YGpkgn6MRpOZaUwiGLMhpCoSetB2VhVBCdEMwrA94n1kRr1jGRH35F9toWpBcrpNAZRWDYdjMncu68LSmiWLwADkAACLipVA7AQKOzADQAVnAAC0xXcSu7BoNzRDBDTirmHUZyNJOVwKLccTMiKV0JUa9J+E8iuHuysZMjT5I0xQIpsi2TLIDTgswPO8o03jvBDaVvmBfKgWbiIwP2BAtIOxhfX8lt6U8rw1muNzpY6KYpH/vKEcigU4ta3+lsAfFa4bmRu58AeR7HcZZ2MMFgEwFAm5zrwAAkwBkQUgXcIqbIFOYypUGzSCgPIvhwCzYB4FzIAFAUQA==="}
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
// @twoslash-cache: {"v":1,"hash":"48617f7733c4b0cbaa2d8f62ee1b4f0df2732b519cd6bc1e96e572535e308305","data":"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="}
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
