# Base class

Every component extends `Base`. It carries the element, the live views over its markup, the lifecycle, the event conventions and the scheduling handles — and nothing else. `Base` knows nothing about services, view transitions or storage.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7442df960be4d1bcfc22cd4c56eceb3ad039908c68a4583d31cfa02824a283fc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADCYRskWiTnmi0QAFYAOyrdabZa7BYHBgeUHhCEMU7nRAAJmut1I90eSAAbG8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN4Of45EEQvwwREojFeYo4Ik0WkkBksmc8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZnM9pj4bCkWANltEDtqOjDh5jk5sl9iSAbncHoyia0adRPvTiIzdv8PIwsIKyJg+Njwdr4hqwAAzdgpRC8YDmXht3hgZiWGBNzqkM4pADc5heUP9ywAjMHQ1S0fto0mIvWUnGzl8AMwklMU56ZzB07658j55mF4taUsYPid7u9tD9kNjhaYicXSnTlHhucYvA32Xx7YtzJVMngzWZF1gPArBsaVgBlXgXl4WtNEsXgAHIAAFOh6Ppu2SW0ajqBomhaVo0OHMBzEBFUKy1aIeQUJR4JbMA23mNB2H4UI6wbYVm1bds/ybNDaNxNCKAEl4KNHKg8OYJBQFiMA4D6MA8EqEAXheIA="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"1b524557e79d59c491ba72445a2ad3b0f47864b711a5e65cc1b3b33cde5d03d5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+lAQjAiIILH4MCFsHAkkpBghELUQRmBoCfRyKQB0+qLy7cjIBnxgANb6+Gho2YgA9IcAVnAAtGgQEMybfGjnRAAscyIArlB8o5qsc7BEh1YWD4hxAAF0wcJROIkAAmACMMjkimUiCennUmjwBVwMg2xjMIAsVhsekQCMczhweEIg0WiV8WEyOHEGGCOkEc0Y4wAZnx5IhOMBKpxRZwwKxqjBBSJSBt5ABuEVi7ljCZoOCC4D2JVgez6ERiCQAZgA7EiFEoVBjSBotNywHz5PpDMZEUTLKRrLYkABOSnUFw09xCagMjo+JlZMiYYISqUytByhQG6ESJ4ADgtKKQ6LUtqxHXjuPWRiQ7uJXtJdlhJgDmGpHVpHjD3gjUZZsZGarkGq1+qhRpUedkltR8MJ0LtTFGdXVCDxZcQFc93rJxsk9aDTZD9LbIEjzJjbJ4/E5QL4greW0gAHcwKmh8vjcbs1bEK/89OOheXfjc+Yq7VnCW6Nm4dKeOGB5Sko0DBDi0Q4sU2SlHMAAkUZELo0TXpsd5gKUPibDAGCCgAwuMXhoAA0iROE3hA96lBQnBEP4bzSpwuH4YEV4MfezStO0IDFFhsCcKwrHsT0gwAEasGgNScFcyndJwcBvLJSYwD0PL1BJXDMOM8gGapPQwLIUqTJw/AkHAcyVF0PRGGI8BTJhuikJwt4bPZlSOWpHmCOp9xcOMZkJJZvYsZAUzhUoPTVBA15TIwGAsDALFwBAnD3BJYBwLeZBwJUSiZG88j4AMZDDNeSUpflUCcPVkxzJwAByEBKPKnCkBZMBRFweUDaQzCkRJ3Zzr2lS3oQhScLAoReop4V8FwPlKFAXr3pwxEwNknBBT1KV8MwuUapFMBWVM8gQPACyDjCy5PCOyLvlmX6FiAGGZGJJaugBHokj6z6ga4zahlRM4FVMZFoLQ5GUYktEYPReGMQRj5PfCACsn6jjmH42t+IBw7Qf5LnmlZrjWsJg8GEGtloh7RqywS3e1iSCj4wQ5KUrEQAIWMSPCkiEgT76qFOX0cwyi7GFTQEg7C/pOIGYEQ3uzMdse7JnmQcz3FdmqcGR+CnVtcgUcwsg2F8YCIVEjuFMhZSlML5YZvjb2ojjxNfUb1QLqWxh+0DVbK/TO6M1DEYwYQUDwU7SHMmU6G3gpFhmxbfUOwhKclKUhHFomybyCxjD+Mw8mMJscAAPyCgA6pn+DZ8wltgGRVc13XzsxAXKH8wAPlxyQwHyRiJ+R5sd7n1u2ytefJ+kqdF5wPgANTwpwIZGawieCW0eAAEqaG8pBgBNtmZZwAAiADyACy5z1IIMBNdyNswHb4UQDyzVkqTA/gteAjBZisEmH5MAlQACC6kkw9WqK3eAnAAAGDonRzGLGgtq8DQj9H8NlZqKCuAaVkgQwo9kPbLl9KoCW448zSy0GhDOaAs6z07hTUOgFgZklxvYSERJoCuEoaeTy0wkgpEaPNYUV8EEKT4IwEYjp+ScDyMAcUkpOIAHIORkB0RXWc4xewm21JwHU/l5HHA6jAQYvV+pRCgG1cIXUqqfB6BtKqCVLrXQcvIi86jVJrXQkFGAPgyYsU0bLeg3Neb83MfYQIupRSB1yME+yrDW7t07j4PR+tSAAEkaDVB0ckyoA4QAwVYEgUAiQ5BwHtngM4IB7D2CAA=="}
import { Base, createContext } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"580b87b182109f22eac6b6455d27f480242ca11683493ee3894edcf106eb53a2","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
