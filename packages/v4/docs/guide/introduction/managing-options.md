# Options

An option is a value a component reads from its element. It is declared in `config.options` and written in the markup as `data-option-<name>`.

Two rules carry everything else on this page:

> **An option is an input, never a store.**
>
> **Every option is responsive. There is nothing to declare for it.**

[[toc]]

## Declaring options

```js twoslash
// @twoslash-cache: {"v":1,"hash":"6c26e72ec97cc8674223234108f831631735925710d4e17208a97842588beec8","data":"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="}
import { Base } from '@studiometa/js-toolkit-v4';

class Slider extends Base {
  static config = {
    name: 'Slider',
    options: {
      // The short form: just the type.
      label: String,
      // The long form: a type and a default.
      speed: { type: Number, default: 1 },
      loop: { type: Boolean, default: true },
      // Array and Object defaults must be factory functions.
      tween: { type: Object, default: () => ({ ease: 'linear' }) },
    },
  };

  mounted() {
    console.log(this.$options.speed);
  }
}
```

```html
<div data-component="Slider" data-option-speed="2" data-option-label="Gallery"></div>
```

The attribute name is the option name in kebab case: `dragThreshold` is `data-option-drag-threshold`.

## `$options` is a read-only view

`buildOptions()` defines every property with a **getter and no setter**. The value is derived from the element and the viewport on each access, and nothing is written in. An assignment throws, because a module is strict code:

```js
this.$options.open = true;
// TypeError: Cannot set property open of #<Object> which has only a getter
```

Two idioms replace the write, and which one you want depends on what the value is.

**The DOM is meant to change** — write the attribute. It is the same statement the markup makes:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4a78617aa0813650525b03674cb60ddb007bcdbe07fa5915df932c116e55e183","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Panel extends Base {
  static config = { name: 'Panel', options: { disabled: Boolean } };

  enable() {
    this.$el.removeAttribute('data-option-disabled');
  }

  disable() {
    this.$el.setAttribute('data-option-disabled', '');
  }
}
```

The next read gives the new value, and [`option<Name>Changed()`](#live-effects) announces it to anyone listening.

**The value was never an input** — keep a private field seeded from the option. The attribute says where the component starts; the field carries where it has got to:

```js
import { Base } from '@studiometa/js-toolkit';

class Carousel extends Base {
  static config = { name: 'Carousel', options: { start: { type: Number, default: 0 } } };

  #index = this.$options.start;

  next() {
    this.#index += 1;
  }
}
```

An option a component only reads keeps neither: it reads `this.$options.x` where it needs it.

## Defaults

**A primitive can be a default. Every other data type needs a factory function.**

```js
options: {
  speed: { type: Number, default: 1 },                       // fine
  tween: { type: Object, default: () => ({ ease: 'linear' }) }, // required form
  items: { type: Array, default: () => [] },                    // required form
}
```

- `Function` is not an option type, so a `default` that is a function is always a factory.
- A default is built **once per instance** and then kept. Two instances never share one default.
- A factory is **lazy**. Nothing is built for an option nobody reads, and a component whose attribute is present never runs its factory.
- `Array` and `Object` with no declared default get an empty value per instance.
- A literal object or array default gives one `option.literal-default` warning, naming the component, the option and the correction. The value is then used as declared and **shared** between instances.

A default is the one option value that lives on the instance, so mutating the object a factory built sticks — `this.$options.tween.ease = 'ease-out'` is kept, for that instance. Replacing the option itself does not: `this.$options.tween = {}` throws, like every other write to the view.

## Boolean options read presence

`data-option-open` is on, an absent attribute is the declared default, and the string the attribute carries is **never read** — the way `disabled` and `checked` work on the platform:

```html
<div data-component="Panel" data-option-open></div>
<!-- true -->
<div data-component="Panel" data-option-open="false"></div>
<!-- true — the value says nothing -->
<div data-component="Panel"></div>
<!-- the declared default -->
```

Update one from code by adding or removing the attribute:

```js
flag ? el.setAttribute('data-option-open', '') : el.removeAttribute('data-option-open');
```

A template must therefore write the attribute conditionally rather than interpolate a boolean into it:

```html
{# Correct #}
<div data-component="Panel" {% if isOpen %}data-option-open{% endif %}></div>

{# Wrong — always true #}
<div data-component="Panel" data-option-open="{{ isOpen }}"></div>
```

### Turning one off — `data-option-no-<name>`

A boolean option is turned off by an attribute that only has to be there:

```html
<div data-component="Dialog" data-option-no-trap-focus></div>
```

- It is how an option declared `default: true` is turned off, since removing an attribute that is not there says nothing.
- **Only an option that can hold `false` has one** — a declared `Boolean`, or a union containing it. A `String` option has nothing to turn off, so `data-option-no-label` is not an attribute and the observer never watches for it.
- **Presence is the whole statement.** `data-option-no-x="false"` is not a double negative; it is the same flag.
- It is responsive like every other spelling.
- An option whose own name starts with `no` negates independently: `noSort` owns `data-option-no-sort`, and its off spelling doubles the prefix, `data-option-no-no-sort`.

## Several types

An option can accept several types. Declare the constructors in order:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a288909ad6af05d934e9113a78f541065bef872ca2659571399d527df6ccc2e2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvADKaOz8ANYYTi5u0QCsAOzevgFBiABsYW6R0SBNLe1OHElIAEzpmaTZuUijRSU4eIQk5GHyTGycPAJCcMoSMnL0vkoO6pravHpxhtpmFta29jinXC0T6qxAPn8gRCEwiUTwQISS0Q4IyWRylRRAEZdtRSgcKsdqKcYowsG8yJg+LM2hgAHT8CBgABm7D8iF4wHMvB5vDAzEsMA5LlIiT8AG5ubytM0mXAOVywLzlbwIMzmao0BzGAA5ACulgARmQAMJytCkPU5Wy8AA+vAAgqQNhgzWARVa0LZuMgALqSpW8goBgrA7pIAAcEcGUJG42ok3hMUZLLZC0SyQAzGt0Vt8rjMPsYodKicaqTyVpKRg+PzBcKLWKw+5EFiUtmIUNoYhQgm4dM6/EIRmYSA0RsMXlggX8cXCVUSSAyRS7DXVVhZe6FVKeWqNVFtfqjabzZbraQ7Y7ncxXafPd6/SHm9EscsO5DhkgBn2pngZew5XTZEehzCc82nYo8SLcojgXcsl0rHBVz4PdNUPA1jVIN0PXPS8nRdbCLXvUgfV9Z8VnbGNPzGWFfxiVD4SRZJv3HTZMR2SDCzKEsiWqaYiDcXgj0wjlhJPd0iPPJwoAgfgEBiB0lQgQ0ACsYByXhAmYexSBgcl4F8NARGYPkMLIVVmV4ZgwAwXhWkSKA6UdVhWF4AApZgBIafhRQ3Uzj1IYzdN4UZggAWkNdh7GZVgIG0sUwpsRJ7DAMzArpcjsXBD9u3jcI6JAMSiUWZjQLYvIsR6GdoJ4uD+ME/Cbw5Rrbwks8vSJLoW2WZY0k7WMkBAn8kxAFqgNKsd1nKlZMwKX10mgMorBsOxOReXgCl4ZlNEsXgAHIAAEXD1KAAMFVwAHoVLgMKvQgVh7LQMKiGCPaA3MOobkaZpaQeBRnjiTkpS6H6BCZVk/A+IHAx5QcOT2ml2j2igd3XTd5WhlVeAui7eFMEA23x3hdOYZ4uCs/zMPFPGQGQNsKF4XrfSJkmyeMpU3BdOlUd3dU0N4ZAioZlr5tRoopWDcxQyoc7mCQUB5F8OAALAPBrpAAoCiAA="}
import { Base } from '@studiometa/js-toolkit-v4';

class Sticky extends Base {
  static config = {
    name: 'Sticky',
    options: {
      // "10" reads as a number; "[10, 20]" reads as an array.
      offset: [Number, Array],
    },
  };
}
```

Each parser must give a value of its declared type before the next parser runs. An absent union option uses its declared default, or the empty value of its first type.

## Responsive options

Every option takes a breakpoint suffix, with no flag to declare:

```html
<div
  data-component="Grid"
  data-option-columns="1"
  data-option-columns:s="2"
  data-option-columns:l="4"></div>
```

- **The suffix names one breakpoint and it cascades upwards.** `$options.columns` walks from the active breakpoint down to the base value and gives the first attribute present. v3 spelled a set (`:xs:s`); v4 does not.
- **The separator is a colon**, because an option name in kebab case can contain a dash.
- **The value is derived on read.** Nothing is stored and nothing is written.
- A suffix naming no configured breakpoint gives one `responsive.unknown-breakpoint` warning per mount.
- A `matchMedia` subscription opens **only** for a component that declares `option<Name>Changed()`. A page that only reads options holds no listener.

See [`setBreakpoints()`](/api/dom/breakpoints.html) to replace the named set.

## Live effects {#live-effects}

A declared method named `option<Name>Changed()` makes that option a live effect. It is how an option that chooses a resource stays correct:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a6d7f732257738fb26e20afe6fdfa8be06469bd52404ef728e4e8c415d73190b","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

function connect(url) {
  return { dispose() {} };
}

class Feed extends Base {
  static config = { name: 'Feed', options: { source: String } };

  optionSourceChanged({ value, previousValue, initial }) {
    const connection = connect(value);
    // The returned function is the cleanup for *this* value.
    return () => connection.dispose();
  }
}
```

- The hook runs **before `mounted()`** on each mount cycle, with `initial: true`.
- Several writes in one mutation batch give **one** change, from the first old raw value to the final DOM value. A write that ends where it started is not a change.
- The previous cleanup runs before an update. Every active cleanup runs on `$unmount()`.
- Removal of the attribute applies the declared default.
- A breakpoint crossing reports through the same hook. A crossing to the same resolved value announces nothing.
- A component without the convention pays no setup cost.

The payload is an [`OptionChange`](/api/methods-hooks-options.html):

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"0305dc8ea29880eeead2520e98fdd1d06873e6fc21ae84614e1d2ce9d815a362","data":"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="}
import { Base, type OptionChange } from '@studiometa/js-toolkit-v4';

class Feed extends Base {
  static config = { name: 'Feed', options: { source: String } };

  optionSourceChanged({ value, previousValue, rawValue, initial }: OptionChange<string>) {
    console.log(value, previousValue, rawValue, initial);
  }
}
```
