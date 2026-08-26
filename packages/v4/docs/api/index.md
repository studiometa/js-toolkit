# Base class

Every component extends `Base`. It carries the element, the live views over its markup, the lifecycle, the event conventions and the scheduling handles — and nothing else. `Base` knows nothing about services, view transitions or storage.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7442df960be4d1bcfc22cd4c56eceb3ad039908c68a4583d31cfa02824a283fc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvADCENYQSWAMVC5u0QCsAOzevgFB+WFukdEgTS1tHSAcSUgATOmZpNm5SABsRSU4eIQk5GHyTGycPAJCcMoSMnL0vkoO6pravHpxhtpmFi12LycXXciD6PUG/kCITGESieDiTgWyRWIAyWRylUQS2Cu2opQOFWO1FOMUYWDeZEwfGmNlmADp+K0AGbsPyIXjAcy8bm8MDMSwwdkuUiJPwAbnMBSB4WiHgAjBDhtsYRNaszWYjEskAMyrdGbfK4zD7GKHSonGqk8laSkYPh8gVCtAi/zS7pIOUpLaKqGIULUcZwmIO+LzLXQ1FrDaYnEAXXS0DKVhsAOAL14BV4TM0ll4AHIAAIuACuUHYzSizAA9AArOAAWjQEAgrAA1uw0PWiME8xKwOY6jdGs1ab57PInrdVByubwumh2PwBOq/B8Z2Aebz+YL8zTWmO8xRZwU+1KqALXEhQBOwHBy2A8HWQAUCkA="}
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
// @twoslash-cache: {"v":1,"hash":"1b524557e79d59c491ba72445a2ad3b0f47864b711a5e65cc1b3b33cde5d03d5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+iJiEgBMAIwycorKiAAsnuqaeAW4MnxGSGYgFlY2eoidjs44eIQkQtSJvliZOOIYwTqCAHSMEGAAZnzyiJzAlZzPnGCs1TD3IqST8gDcTxeF1qlzkaDg92A9gBYHszVE4iQAGYAOzdBRKFRDUgaLQXa63fSGYxdWaWUjWWxIACcK2oLnW7i2Xi0Pj2WTImGCbw+XzQPwU8NaSH6AA50b0RdjcXgeeMDJMSeZyZTFm0THTMGtEG5NvoWbt9pyjiEICCjGBwZC4cIERJJIMDD1MYgOjMETKdcC6hbwUTFUhSXMKQs7EjJJqGTqNh5tt4dWyjYdjvwzqwsHx7gBXMAAa0gAHcwELEa6kUiJS6K2ocSMdem+P6pgNlfMqUtI9rdbGDQmPkpoMExtExsVsqVTgASdlEXTRHP5iBF0o+XMwDD3ADClxZAGl1/O84WwKUKJwiP4s59OAvj4Fs0el8WqFAIIwEDrirPYJxWOfLzA55kAARqwaA1JwaAQJB+CAXAWbAfyMCAVc9S/lwzCXPI6EwYBMCyB8lqcPwJBwKclSxLBrwwGI8BoJwM66KQnAFpMZGVBRVGMYInBwHw4KcJcuEJARYJnpA9FCUogHVBAOb0YwGAsDAZ5wNB/G/mAcAFmQcCVEomRZvI+AJJsGA3mAsnyZpUCcFZlqnJwAByEBKL8nCkPhNGFFwGk0aQzAbr+prmmClQFoQhScLAoQUuBQl8FwrFKFAFJFpwa4wNkDGZN+7nyXwzCcPxXBeYR9HyBA8CnCWEgdP0jqyBifTijWnogNOuW6E2xiOsGqp2B0SKdq4MbMjsXqXCInCbmgtBbjuiT7hgh6LsutWBgArNWTWSog1YenWICzbQPVSmSbZqm0I2MnqngTSAiYcsmnCVU5iT3D4wQ5KU54QAIG2upIMy7S6qiHVob07BMzZ9SqoZIG0tJOPSXZjfqD1PQcXI8KmZCnPxMDVBCM34IVqVyNuzCyDYfCXCOUQM4UY5lKUgMdKKO3On0m3SkdhPE2diC8xdIbttdKNaqNTIY/Gj39oQUBDozo77GUU4FmBFibmTzAU2ATMxKrJSlCucp8gK8hnow/jMKBjC5nAAD89wAOpa/gOvk55YCbrb9uO4bhss6bnAAD4WbANxGErW66/rVM0/FBvDsb46/T4ADUHSCZsmGsEr+ivu+eAAEqaFmpBgMFJEqZwAAiADyACyAC09SCDAtkXNTMC00JEBXHZcmWl30XwIwchQKwlrsWAlQAIK8fy7nVB78CcAABviNzyKccqb45S+hBwv7MGpdnr1w8HASfPk1bawqutSqig309V81ok6a2g2vxz7QsRb9QRq6Ta9gAC65hoCuDvrjJiCR6BT1SFFR41dl5gT4IwU0BJsJ5GAK8d414ADkJwyBEOtmaH0YISZQk4NCDiaCAD0jDnIwE2B5LyUQoCOXCK5EyUA+CAWSiZaSIkiZgnImghsnA8huTIp1YgugfAnTPPgqG9BPrfV+rQ+wgQYTPAFrkGCiUNYey9nrH2PgSF41IAASRoNUIhejKg2hAP2VgSBQCJDkHxS4eAABWCB7D2CAA"}
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
