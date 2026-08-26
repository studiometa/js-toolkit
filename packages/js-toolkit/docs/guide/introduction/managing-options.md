# Options

An option is a value a component reads from its element. It is declared in `config.options` and written in the markup as `data-option-<name>`.

Two rules carry everything else on this page:

> **An option is an input, never a store.**
>
> **Every option is responsive. There is nothing to declare for it.**

[[toc]]

## Declaring options

```js twoslash
// @twoslash-cache: {"v":1,"hash":"14f372d9a634de58b3385eef92689ae2db11ca9dca3ea681680df1826ffd8c61","data":"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="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"e7f2f19f9bda95b6d2dbf512bfd53dadbb0f1a99d56e81a48d53ed1b2e681984","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8NTMSKsJzzRaIACsOyy602SGhuwWBwYHhBYKc2S+ACZrrdSPdHkgAGxvD44PA/Mh/ehMNicHi+IHHGRyehxZQGTTaXh6Y6GbRmCzhOwOE7OVzuTzeFn+ORBEL8MI2SLRDkKBJJVLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcaTGZzPbo0kADlWCK2iDhezRRwk2LOeIJdwetMQuIuFOon2pxFpu3+HkYWF5ZEwfExMFY8RVYAAZuwUoheMBzLw67wwMxLDAq51SGcUgBuWv1rRoPpgU3Vnv1+u9ODMABGaygVdEdTWoIAwhE210HrZu2BRy8ty8IZ6kN64WswBsA6SUftDh4S+WUuHzogAMxRokxp6vd5JqnfVPkdN6UzbMtFzDA+EbZtWzQdszwPBZ0SWZF4TPRFAyvEMPEgyUcSQV8QBuaMSTjBNv0wX8CH/Ol0RALMczscDeD7Achxrbcx3YCdpxgWcxAXGBl1XGD11qUg93gqEAEZJKuFDzyQAB2DCbxAZjV0fL58MI99iOfaFE3Ir5KN+QCaLo0CGL4ccpxnOd+MEwdhI3ACQEhdFJNxSS/VQgNfWoVEVOs7ioA0vC32JWNWnJMjkz/EzqAzEAiAWPj6gEsA7LShy12ciT3OfLy5LQpT/OvGj5yysBQpfcKPyRaLKSMmkXJoIDaObTZoHzUFC3iKIbJgRhuCrIgIHYEKPQQpBJNaErT3kxBL1KzCQH67jquQ7SIqeXEDNi4y0wStrzJwSyJUkQVeRMeIABJCyrAAJaQAFkABkAFE1mbaI8um0k5v9MLlpUu7wVOJ8lq2urnj2ijmuopgOsIKA+E+mBvrQeJSHR1MAEFCnbScuhoRgAEcukZcseIAOSbFteDbDtht4UbxqcFw3DwLwfDRjHeCR6BeAAKiFgADbHLDxgn2CJknuFFkXeAl1MRE2HxmGl2WfAAdyafBeDVhmcH4dgqagBs6d4UtNEsA25ULdGokx8xzGQZ6ABFqd4AAlGBSzIKJ+BgKZGGNYoymGQsLPiSWAC92FYIR4lsFISg5uASgAdRgScSlxtQAEkSl5p2SmVkh8ZgmXiZgbhfsQSSFMK+a0Mk5DgxU8uYErwma+qyHCW26bn1hpqqNMxGBmR7qwSGTiBqGkaxom1zDzjSSViKgMSo7migrWarN6h4jdpiuHx6OsyQNOvNzsuoxjFu+7eCet6S5+yaoVxVpZJbgN8N3ngUG1UZK1WIl+RqKZ4qtTMgLFGvB36Y1UGgHu1cSbk0puwGmdNoKwRSBQFmbAuj00ZmeZmrMV7py5nKEWotkGoK1kNBWQt+ZT0FhAUsdseZfSdrwM4jxSz3B8Mg1WcpkqsGIUxThoJeAayrlrJi25DZwGNqbLB5sHYY3iLwAunDDZyN7jQWRrBsbMCgCEOgnE0BwAIYbcRkjOK8C6FgKAGseKdiYmrUgutVCyIbDAbWsjNY1z4SIMxsBza602Fwo2MATZmwts2WRihCESJgPEF2YA3aex9n7AOYAg4hzDqaCOgQo6nRjhAeOidmDJ32GnaUWcc550LsXHh0QSj0OCTQOun90TfxPIDBu+JgY0S6fIvu4MvigIIoPaGkkR6zAItAIyVgbDimABKXgLwrY214AAcgAAKdB6H0DqzBzQ1AXNafZW5zCAgVAWVgmouRbLYnWeY/Z+ChDLBWfk1ZEn032U8/ZBC1KDirJs/ePFMqLm3Ds3cmS6xrTWENYc7E6ybE4k/IsXcGE10YPs1xyQqjgqqNCqA+zuBbjrC8JFvBoVovefWLFcAcUdAGPikmRKNbMFJVgfsERyXz2CqCg5VKaXbPMPuKg5ykCgFiIOAceBKggBeC8IAA=="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"9cc83265309fc99482b2ce73137b4ab52ab174e3e577f09daa5d363ded85cf26","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADKaHY/ByGCc80WiAArDssutNkgAGy7BYHBgeUHgyFObJfABM11upHujzRbw+ODwPzIf3oTDYnB4viBxxkcnocWUBk02l4emOhm0Zgs4TsDhOzlc7k83nZ/jkQRC/DCNki0W5CgSSVS6Uy2TyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3Gkxmcz22NRKyRYA2W0QiL2WKOEgJZ2JpLuDwZiCJAEZqdRPnTiAzdv8PIwsAKyJg+LiIRh4uqwAAzdgpRC8YDmXhN3hgZiWGB1zqkM4pADcjebWjBEQt9YHzcHlcrqjQdcYADkupYAEZkADCI7QpC6D1svAAPrwAIKkckYDdgLs72qkbjIKb9sATl6Pl7Qn1IAAccNWyOD6OoTFDg8CtqxSKNzkQABmWNyXjJ5XneNNaW+TNyGzJlc3zLRCwwPhW3bTstx7d8FmxJMLiuAMg22DF9mA8A2xlQlaJAG440pENU0wFCCDQxlsRAPMCzsPDeCHPpLzrBsn0nacBjnRcV3XTdt13UgD2PU9mHPVTr1sO8H3MN9vTIpAkyJKi1kDFFEAAdjo8MPAkkcIK+H82LJCkE1abj01Q34MME4ScNEvgICnGdFKXVdSAvK91M0k8z3ird9Nve9SNhSyrL/NFHIYiL5IYU5IIczyOITVE/N4+l0OoHMQCIBZeCU2K6zalTLzS9SnBcNw8CPJ8IGXcoYAeXhNmYexSBgfN4CiNARGYFsYrIcTK14ZgwBCRpFHiY9WFYXgAClmGa4F+G7LB7DANbSGW2beFRVoqmXJpeErVgIGmnsqhsM5bvuuBElM7KLn9ayaMQACwwYzr6pY+zYO8p4kzhGqvj4wKGswpqWuSnS60J3TurUm8suxZNyqh2yPLhwSSbcpByvYuDOKJKCXlmNjoCxqwbClYBpV4F5Ps0SxeAAcgAAU6Ho+nbZIrRqOoGiaKXH3MQFlRLSEdV5EWZKbeYwX4UIqxrIUx1kpsCI7aW9YwKWKHHcSbsk0djYnXgyl4UwQAogPeFm5glC25bVuU0he39kBkAoiheEsqZg9D8OuC2p8FjPeI3abIqot4ZAEaTknZjdt4BxfYynCV5gkFAWJL0kvBKhAF4XiAA="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"e4274cefcf8790524934869f40c7d48d8ed46c0a4709cc5357be8085bd0dc2d7","data":"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="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"39cdb1c0b8379b2bab663de947bb002a2839987739584b6eabd834e6be70056d","data":"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"}
import { Base, type OptionChange } from '@studiometa/js-toolkit';

class Feed extends Base {
  static config = { name: 'Feed', options: { source: String } };

  optionSourceChanged({ value, previousValue, rawValue, initial }: OptionChange<string>) {
    console.log(value, previousValue, rawValue, initial);
  }
}
```
