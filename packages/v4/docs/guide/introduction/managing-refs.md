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
// @twoslash-cache: {"v":1,"hash":"f636ef6befbfeb02954943c87cad26626db6fed7829a9acbe83b5f07f5057d07","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvAAinKwQfk4ubtEArADs3r4BQYgAbGFukdEgTWytThxJSABM6Zmk2blIw0UlOHiEJORh8kxsnDwCQnDKEjJy9L5KDuqa2rx6cYbaZhbWtvZx7XC0R6yxAPn8gRCYwiUTwAISC0QoIyWRylSRAEZttRSnsKodqMcYowsC8yJg+NMWn4AHT8CBgABm7D8iF4wHMvC5vDAzEsMDZLlIiT8AG5OdzSDBGXBBWhhf5kABdcVgAqAzpIAAcWv6EKGo2o41hMXpTJZc0SyQAzCtURt8tjMLsYvtKkcasTSVpyRg+Lz+XKFW0qB13IgMSlbWCBpDEKEjTDJgH4mCrVCQCi1mi8sEnbjXfiqkSQCSyXY/bwpTKgyLlRrwxjFtHwYMM+EJnhqwgEckunbsw688UcS7ygdi57S/zAtBKc1WjTLBAAK5gGhQRjcNlECDsKBOKAQfgIGIAGXYjJg/AwghgvEIEAA1hRePzmOveGgILwAEb3/FhSgWAwBpXgAFlmAwKsohXUgwF4ZgLhgD8VywXhGTXHJ2AZcxGFsRCELcNZoIgRkv3wGBLD4QJmHsUg1xEBkKPvJJ6F4AADAASNdlzXNAtw43hABQCXg4AwMB+F4WxzC4CT+EQcwJS5OTJLfVd1xgTc+A5BDuS5M0XDElleVYN5EIAd2Ydh7ECdg4BpLjEgAK2vASAGUIH5ABhBlqjQbhVX0rkpTQOCELgEy2BpOAV1/OB+GFf9GEYIg2BXGA+B0Yx2V4QAyAl4ApAuUwqlLAABBAQvJsJJP3kB4RUQt92FoRIYLC+CRAszJ7Bsu4FEeGZ/F4CybPwXgbLgcwIAssBXzaj9oKSFwRUUsASr4zTtPZEqQtg+DeGQWKcFIJcNI3LdXy3N4cuAfLCpVEr1VDIEkAxYJdRjfUkD6RNOxiTaN0tRFPqzdZ0UWfMxzdAl/KYb0TopJ5JA+F4TEc7s2QAJWvWwoEkIURVfAAJaRwLPABRHx+U/AAfXhSfJqmqN8NBlWMQ9j1PEALxIXgiHYGALOkg4WKq35arQAByEQOKgOjmAAWmrISYGp1nZTkA5oOyfh4CmsApWVlDHkCe8GgAeXA184B/KUsCEPWoDfNwnzQiaRCwdh+CfLTeHd0bAh5CA7OG79zGrKU4HwGkG2iDFhi8L620Qfs/pNEAuO7YHkiTsGc08KGyhhydJkZyn1bphmyYrln13rF7NQjHo09bOM047DPBAgRxe08AdwbyDEuiLvEJw9SZFrjt6tQxPUU4741JkZY8Vx7NNETz1ZB6WLER2dYuiwnpgZ0IKB5xmWkGW8lpVBv72ny3Hc9wPRvGw8X626GJtoX+kBr9vjAe+Psc5vWRNvAuSJR6FnHoSKcZYfQVj4HEFGBg0bGEcmrNk5dmY0wYG/aIixmzzzjNGTukwuJq1ARGaM+cHSFH3gWcc7o4GTEYKfOcvBcGsxpFKZcJBypoHlOwX8K4aCMAAI4rlOMyLSAA5PkAoxLCP8NufmL9OYnjwNISiXDK72A4c7AAVEYjifCKiCOEaI8R3AOImJgvw+AYs6JWLEfeQO40zZiRwPwS8gtnYpgwpoSwYs1Z1zQDSMqyBwINDkbwHGV4pSSRgEqRg+AhHaEQAAeiybAEgLQTpnQAF7sFYEIGktg/C5K5lkgA6jAX8WTypqAAJJZO4euLJ5iBFCKSm47g08kSLE/rGb+i8kxdiohY3pIi3HUIxLQiBDoFkFCVOkaAZQrA2DsLlOIhUgleV4FLAAAi4FcUAcIzmYFk5ycBFbfggKwJ8NlFZEGCFLVU5g6hXEaAuPw/UHjXFUDtPSHQ0Deyquaf5ehdL6RTGyKWVJWhSwoCVTGh0pbd1UFLNZEoCifL0oDLS11YXcjsg5LO0oHJYpgDSFe/A15biCqVdaekAE9yARwH2JKSrkswawXhUyemuPEVLeWrhFZaHBQySVOAwBS2KnpAo5hnogCuUgUA9UwCRQZHgW5IACgFCAA"}
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
// @twoslash-cache: {"v":1,"hash":"a8f94bfd1306f7ae3ce767b605343733643dfa65b8763f9fceca912df7f6a763","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvNLMAEYIVC5u0QCsAOzevgFBiKHUbpHRII0tThxJSABM6Zmk2blIAGxFJTh4hCTkYfJMbJw8AkJwyhIycvS+Sg7qmtq8enGG2mYW1rb2cU7t7kQ3TSIB8/kCITCoyieD+CVmiAWIAyWRylUQAEZCsVqKUdhV9tRDjFGFgnmRMHxJnAAHT8CBgABm7D8iF4wHMvC5vDAzEsMDZLlIiT8AG5OdzSDBGXBBWhhf5kABdcVgAr/cLRAAcaz64MGupGERhMXpTJZ00SyQAzItUat8ptcdsYrtKgcaiSyVoKRg+Lz+XKFX4NR0kBiUhi9QNIUaxngA/FQVbYyjlmi8sEnZgXeU9lViSBSeS7H7eFKZUGRcrQ4CMVjoxChlDjeMK61kwjOnb0w6szic2U3YTquNGPzAtAqc1aQzqQBhDj8ADWjGAvESsFovAKbI5YG5G8UdDZzDAGFVBW4bKIEHYUFr0QxwW7oP6TfrLfjMTnM8X7BXS0ES1HsVnROZszxV0CQLT0iywLIJzIPhNxPXgzwwR9w06Lw331JBX3Cb8QFQ2ggOSEDkSWMC8gxDYBygvN3SJOCiDcAQGTgCAfDZedOO4pMASfbphjBGMgS/E1kX4nxyM8UCMxCSDc2HWCxwnQgoD4PiwC4nwaVYCA/EYGlTKgZhXFPc9lWvXhb3vJwoAgfgEBiaR8BgXgACovIAAzNPSYAMozGG4XyfN4do0AA3gNOgXgIAAVzQLBkpEZhYvgOBmEiXg0AgPKPI43SBJpcxzGQABZAARAA5XgACVpTIXx+BgJVGHwNAUtlAB6XrYBIQycFIGlLAgAAvdhWCEGlbD8AbnLgXqAHUYCaXqAEE1AASV6gKBN6wy/AAfSigDuCwzEtSRMSm1tOMpOOuT8gUh0MQghiVJgj0xwQ5YkNIFDj1oKzMLaTVww8B67sGQjoXGUiXtwtMaPma0CiVdJoDKKwbDsdkHh3XhGU0SxeAAcgAARcRKoHYCAJ2YXqACs4AAWny7jl3YNB2aIYIKdVcw6guBoZxuBR7jidkJXO/hiuZPwXllg9uUTNkKepCmKAlLl2zZZAKdcFplQprGJQKYW1d/Fp/xXNcjy3Hc+H3Q8Dv047GF8k3eAAEmAUiCl4AB3LgzgA5cYCgXzuFVLkCnMdUqCZpBQHkXw4AZsA8DZkACgKIA==="}
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
