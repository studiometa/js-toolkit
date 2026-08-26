# Options

An option is a value a component reads from its element. It is declared in `config.options` and written in the markup as `data-option-<name>`.

Two rules carry everything else on this page:

> **An option is an input, never a store.**
>
> **Every option is responsive. There is nothing to declare for it.**

[[toc]]

## Declaring options

```js twoslash
// @twoslash-cache: {"v":1,"hash":"6c26e72ec97cc8674223234108f831631735925710d4e17208a97842588beec8","data":"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"}
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
// @twoslash-cache: {"v":1,"hash":"a288909ad6af05d934e9113a78f541065bef872ca2659571399d527df6ccc2e2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADKaHY/ByGCc80WiAArAB2VbrTZIABsuwWBwYHlB4MhTmyXwATNdbqR7o90W8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN4Of45EEQvwwjZItEeQoEklUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZnM9jiEaSsiitogdtQsYcPMdCWcSWS7g9GYhiQBGGnUT704iM3b/DyMLCCsiYPh4iEYeIasAAM3YKUQvGA5l4zd4YGYlhg9c6pDOKQA3E2W1owRFLQ3By2h1Wq6o0PXGAA5LqWABGZAAwqO0KQug9bLwAD68ACCpApGE3YG7u9qpG4yCmA7Ak5eT5e0N9SAAHF/kWANsGGJhvsEYgJWNYpNG5yIAAzHGFIJk8rzvOmdLfFm5A5syeYFloRYYHwbYdl2269h+Cw4smFxwYG/6oiGmIgTi4DtrKRLbPBlKJq0aaYGhBAYUyzH5oWdgEbww59Fe9aNs+U4zgM85LquG5bjue6kIeJ5nswF5qTetj3o+5jvj6FFIMmxI0WsdHBkiwHYngkmjlBXxwpxiHbLxGbob8WHCbhOBiXwEDTrOSnLmupCXteGlaae54xduBl3g+5GwsS1F/gB6KMY5HihQpDCnNB9k3PGVKIGi3n8QymHULmIBEAsvDKVF9ZtapV7JRpTguG4eDHs+EAruUMAPLwmzMPYpAwAW8BRGgIjMK2kVkBJVa8MwYAhI0ijxCerCsLwABSzDNcC/A9lg9hgGtpDLbNvBoq0VQrk0vBVqwEDTb2VQ2Gct33XAiRmRllnZfRQF7PlICdfV7GIGV5JcU8yZwjVXwCX5DXYU1LUJbp9aE3p3Xqbe6U4sSmWQ8G7kOaBJOuUgyMVYmVkvLMYHQFjVg2NKwAyrwLyfZoli8AA5AAAp0PR9B2yTWjUdQNE0LStBLT7mICKqlpCup8kLsnNvMYL8KE1a1sK45yc2RGdpLesYBLFAThJN1SWOxuTrwZS8KYIBUQHvCzcwShbctq0qaQfb+yAyBURQvCZVMweh+HXBbc+CznvEbvNoV4W8Mg8NJyTsxu28g6viZTgK8wSCgLEV5SXglQgC8LxAA="}
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
// @twoslash-cache: {"v":1,"hash":"a6d7f732257738fb26e20afe6fdfa8be06469bd52404ef728e4e8c415d73190b","data":"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="}
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
