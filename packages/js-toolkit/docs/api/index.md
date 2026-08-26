# Base class

Every component extends `Base`. It carries the element, the live views over its markup, the lifecycle, the event conventions and the scheduling handles — and nothing else. `Base` knows nothing about services, view transitions or storage.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8236f1f9a006c6b6a734b7ee2c84b31864bd3b8591483051ff85b8454a8d3b04","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADCYRskWiTnmi0QAFYdll1ptlrsFgcGB5QeEIQxTudEAAma63Uj3R5IABsbw+ODwPzIf3oTDYnB4viBxxkcnocWUBk02l4emOhm0Zgs4TsDhOzlc7k83nZ/jkQRC/DBESiMR5ijgiVRaSQGSyZzyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3Gkxmcz2GIA7ETEWANltEAi9uijhInNkvkGbncHgzCa1qdRPnTiAzdv8PIwsAKyJg+FjwVr4uqwAAzdgpRC8YDmXgt3hgZiWGANzqkM4pADc5heUL9SAAHGPVkiwxTUftDh4q7WUrGzl8AMzEpPk57pzC077Z8i5pn5wtaYsYPjtzvdtC9kMjhYYgCMF03wdD2znUY8N5lcbfiAiaksmTxprMwHQF8IBWDYUrANKvAvLw1aaJYvAAOQAAKdD0fSdskNo1HUDRNJhg5gOYgLKmWmrRNyChKEhTZgC28xoOw/ChDWdZCo2zatv+DaYXROKYRQgkvJRw5UIRzBIKAsRgHAfRgHglQgC8LxAA==="}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

## Sections

- [Configuration](/api/configuration.html) — `static config` and how it merges
- [Lifecycle hooks](/api/methods-hooks-lifecycle.html) — `mounted()` and `unmounted()`
- [Options hooks](/api/methods-hooks-options.html) — `option<Name>Changed()`
- [Events hooks](/api/methods-hooks-events.html) — `on<Event>`, `on<Ref><Event>`, `on<Child><Event>`, `onWindow<Event>`, `onDocument<Event>`
- [Services hooks](/api/methods-hooks-services.html) — `ticked()`, `scrolled()`, `resized()` and the rest
- [Instance properties](/api/instance-properties.html) — `$el`, `$id`, `$refs`, `$options`, `$config`, `$isMounted`
- [Instance methods](/api/instance-methods.html) — `$mount()`, `$emit()`, `$query()`, `$provide()`, `$read()` and the rest
- [Instance events](/api/instance-events.html) — what an instance dispatches

## The constructor

```ts
new Base(el: HTMLElement)
```

**Do not call it.** The registry is the only code that constructs an instance, and an instance built by hand is not in the element's instance map, so nothing finds it and nothing unmounts it.

A component's own constructor is a legitimate place for field initializers, and two registrations belong there because they are **instance-scoped** rather than unmount-scoped:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"58586394b5cc2c1d8220378349a88c4dd711a7c71afeaa314aef2f7c90468510","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+lAQjAiIILH4MCFsHAkkpBghELUQRmBoCfRyKQB0+qLy7cjIBnxgANb6+Gho2YgA9IcAVnAAtGgQEMybfGjnRAAscyIArlB8o5qsc7BEh1YWD4hxAAF0wcJROIkAAmACMMjkimUiCennUmjwBVwMg2xjMIAsVhsekQCMczhweEIg0WiV8WEyOHEGGCOkEc0Y4wAZnx5IhOMBKpxRZwwKxqjBBSJSBt5ABuEVi7ljCZoOCC4D2JVgez6ERiCQAZgA7EiFEoVBjSBotNywHz5PpDMZEUTLKRrLYkABOSnUFw09xCagMjo+JlZMiYYISqUytByhQG6ESJ4ADgtKKQ6LUtqxHXjuPWRiQ7uJXtJdlhJgDmGpHVpHjD3gjUZZsZGarkGq1+qhRpUedkltR8MJ0LtTFGdXVCDxZcQFc93rJxsk9aDTZD9LbIEjzJjbJ4/E5QL4greW0gAHcwKmh8vjcbs1bEK/89OOheXfjc+Yq7VnCW6Nm4dKeOGB5Sko0DBDi0Q4sU2SlHMAAkUZELo0TXpsd5gKUPibDAGCCgAwuMXhoAA0iROE3hA96lBQnBEP4bzSpwuH4YEV4MfezStO0IDFFhsCcKwrHsT0gwAEasGgNScFcyndJwcBvLJSYwD0PL1BJXDMOM8gGapPQwLIUqTJw/AkHAcyVF0PRGGI8BTJhuikJwt4bPZlSOWpHmCOp9xcOMZkJJZvYsZAUzhUoPTVBA15TIwGAsDALFwBAnD3BJYBwLeZBwJUSiZG88j4AMZDDNeSUpflUCcPVkxzJwAByEBKPKnCkBZMBRFweUDaQzCkRJ3Zzr2lS3oQhScLAoReop4V8FwPlKFAXr3pwxEwNknBBT1KV8MwuUapFMBWVM8gQPACyDjCy5PCOyLvlmX6FiAGGZGJJaugBHokj6z6ga4zahlRM4FVMZFoLQ5GUYktEYPReGMQRj5PfCACsn6jjmH42t+IBw7Qf5LnmlZrjWsJg8GEGtloh7RqywS3e1iSCj4wQ5KUrEQAIWMSPCkiEgT76qFOX0cwyi7GFTQEg7C/pOIGYEQ3uzMdse7JnmQcz3FdmqcGR+CnVtcgUcwsg2F8YCIVEjuFMhZSlML5YZvjb2ojjxNfUb1QLqWxh+0DVbK/TO6M1DEYwYQUDwU7SHMmU6G3gpFhmxbfUOwhKclKUhHFomybyCxjD+Mw8mMJscAAPyCgA6pn+DZ8wltgGRVc13XzsxAXKH8wAPlxyQwHyRiJ+R5sd7n1u2ytefJ+kqdF5wPgANTwpwIZGawieCW0eAAEqaG8pBgBNtmZZwAAiADyACy5z1IIMBNdyNswHb4UQDyzVkqTA/gteAjBZisEmH5MAlQACC6kkw9WqK3eAnAAAGDonRzGLGgtq8DQj9H8NlZqKCuAaVkgQwo9kPbLl9KoCW448zSy0GhDOaAs6z07hTUOgFgZklxvYSERJoCuEoaeTy0wkgpEaPNYUV8EEKT4IwEYjp+ScDyMAcUkpOIAHIORkB0RXWc4xewm21JwHU/l5HHA6jAQYvV+pRCgG1cIXUqqfB6BtKqCVLrXQcvIi86jVJrXQkFGAPgyYsU0bLeg3Neb83MfYQIupRSB1yME+yrDW7t07j4PR+tSAAEkaDVB0ckyoA4QAwVYEgUAiQ5BwHtngM4IB7D2CAA=="}
import { Base, createContext } from '@studiometa/js-toolkit';

const Ctx = createContext('ctx');
// ---cut---
class Slider extends Base {
  static config = { name: 'Slider', components: {} };

  // Never released. Both die with the element.
  api = this.$provide(Ctx, { goNext: () => {} });
  items = this.$watchChildren('SliderItem');
}
```

## Fixed properties

`$el`, `$id`, `$options` and `$refs` are **fixed properties of the instance**, not fields it happens to hold. They are defined non-writable in the constructor, so an assignment throws in a module rather than replacing what every other part of the framework reads.

`readonly` states it for a reader with a build step; the property descriptor states it for everyone else. They stay enumerable, so an instance still reads as one.

## The typed surface

`Base` takes an optional props type with four optional keys — `$el`, `$refs`, `$options` and `$emits`. See [TypeScript](/guide/going-further/typing-components.html).

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"99fc40b9c6e77c8061d592bf1791a8270cf2159c55dae4d708fc2e406396a39d","data":"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"}
import { Base } from '@studiometa/js-toolkit';

class Slider extends Base<{
  $refs: { next: HTMLButtonElement };
  $options: { speed: number };
  $emits: { goto: { index: number }; stop: void };
}> {
  static config = {
    name: 'Slider',
    refs: ['next'],
    options: { speed: { type: Number, default: 1 } },
  };
}
```
