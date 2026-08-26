# Lifecycle hooks

```ts
mounted(): MountedReturn
unmounted(): void
```

```ts
type MountedReturn = void | (() => void) | MountedReturn[] | Promise<MountedReturn>;
```

Both are meant to be overridden and neither needs a `super` call.

[[toc]]

## `mounted()`

Runs when the element is in the document and the component's mount conditions are met. It runs **after** every `option<Name>Changed()` hook of the same cycle.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4f5adf9b868e45d7ff099381a37cf915b7a9de3c39d50f39e60f8cb7f6cb65fc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8NRCDBkJzzRaIACsOyy602SAAbLsFgcGB4QcwweRTudEAAma63Uj3R7It4fHB4H7g3b/DwsDhcPiA/wOKSyWKKZQGTTaXh6Y6GbRmCzhOwcpwuNx4Lw+NkBIIhfhhGyRaJyehxOCJVFpJAZLJnPJUApFOClCrVWr1RrNNodbq9fqDYajcaTGZzPYYpEreFgDZbRBwvboo4SJzZL5EkA3O4PcGEgCMlOonxpxDp1AZIEYWH5ZEwfCxOPiqrAADN2ClELxgOZeM3eGBmJYYPXOqQzikANzmF4Q31IAAc0NWCJDKOoaMOHkrNZS0bOXwAzMTE+TnunMNTvtncbn6ExC1pixg+G2O120D2g8OFhiljO1kHEaHUft5+B2ydjfiG7xiSZLJgSFy7pmB6/PSJ6Mh2mzQKWoJkPElgQF00QwFAjDcPWRAQOwUDSq47ggAAMuwVYwPwGCCD4hAQDkFC8B2zCarUvAAEY+IePZQLAYDxLwACy2K8KQAxdKQYC8MwvgwOxXRYLwVaYQ8fRgOYjC2HJskLKSIQQFWvCbDAlh8JszD2KQmEiBEpneK28i8AABgAJJh6GYWguGubwgAoBLwcAYGA/C8LY5hcKF/CIOYTYttFYWsRhWE4XwjayS2zaVp0wW1m2rCCnJADuzBNI57C6u5ZzlDRvkAMr9AAwhEND0NwA5ZdlkndDJ+UpIVHRdFxcD8D2PGMIwRBsF0MB8DoxgNrwgBkBLwLydQlzYvPFYAAIKhOEGoxNqii9nJrHsLQZwSVJMkiCVtz2BV3JKHJrARCkvAlU0+C8E0cDmBAJVgCxN3sSEkSdL2cVad1KU+dhuENltLa9dJsnIHAymod5aW4SxyOLcta0vFMXXZUOPpPkgKYpgA7JO74hozs7fhiIB4zQxF4l8E7AVuYGQfuBCHn8cH5meOB2JeHKSMK/ImPE7kwKw9YABLSCJ5EAKJrB20SPlCKZrqOTPBkgQHhj+KusCu+IzgmpJJk8rzvBmIu0ke7Uc4wCGEFAfB6+ZURoB0Ax7YUE1dDQjAAI5dGwVHsNhAByf63veKQsTNrBzZnvZ4bwBFESRsoePKvAAFRV65qhoJHd7sFxMcwH5NesQMAcRSZZm8MHBvPVhpBVvcPj1yIfe53NPd6XJUfN63EWyX3cA4PwyfYXI+uh8JACSvdOdZTctzQ72ScwUAhHQVVoHALFT7NPhVbwylQNZ2F9hFZmkD9qgXZEEq88T5LxfpfWAUBvq/UcuPdem9IHXh8OxSB08YDxF2sgESAARVOvAABKMBqKSTCjAKYjBzTFDKMMVW55SBoQgAAL3YKwIQ8RbApBKDKOAJQADqMAuIlD2moPeJQB6hxKPXRu0caDcCNhiFMrQ4xvgtogFMcZrYc0kQvU+/4YzIk3M7bcJsybXGgF8EAVgbCSmABydaqlNCWF4AAcgAAKdB6H0BCzBrQ1DqA0JoTiurmEVMCFCpAtQKDescFGWV5hoHYOFRctZio2MQfWJxZYyBOPWkErKXMkYZVRpsKqytVbhwbto1ujAnELE4FUDgJAnEsScTYDgNAnGbSyjtMAVNOYDGYEgUA3I4CaTwJUEALwXhAA=="}
import { Base } from '@studiometa/js-toolkit';

class Player extends Base {
  static config = { name: 'Player' };

  mounted() {
    this.$el.setAttribute('aria-live', 'polite');
  }
}
```

### It returns its cleanup

A function, an array of functions, sync or async. They run on the next `$unmount()`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c7e7cdd9e4432a3d96f0a9ca353daee68b2c9efc603770f6fb5b5c591fe8c70f","data":"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="}
import { Base, useScroll } from '@studiometa/js-toolkit';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    return useScroll().subscribe(({ directionY }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0);
    });
  }
}
```

If an async `mounted()` resolves **after** the unmount, the cleanup runs immediately.

## `unmounted()`

Runs at the end of `$unmount()`, after the cycle's listeners are unbound, the `mounted()` cleanups have run and the scheduled tasks are cancelled.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"82cd62aa4df0c90b1fdda4c05108738e5a898813e9b6f1e51a21950f9b354eba","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8NRCDBkJzzRaIACsOyy602SAAbLsFgcGB4QcwweRTudEAAma63Uj3R7It4fHB4H7g3b/DwsDhcPiA/wOKSyWKKZQGTTaXh6Y6GbRmCzhOwcpwuNx4Lw+NkBIIhfhhGyRaJyehxOCJVFpJAZLJnPJUApFOClCrVWr1RrNNodbq9fqDYajcaTGZzPYYpEreFgDZbRBwvboo4SJzZL5EkA3O4PcGEgCMlOonxpxDp1AZIEYWH5ZEwfCxOPiqrAADN2ClELxgOZeM3eGBmJYYPXOqQzikANzmF4Q31IAAc0NWCJDKOoaMOHkrNZS0bOXwAzMTE+TnunMNTvtncbn6ExC1pixg+G2O120D2g8OFhiljO1kHEaHUft5+B2ydjfiG7xiSZLJgSFy7pmB6/PSJ6Mh2mzQKWoJkPEXRgJYEDoTQUCMNw9ZEBA7BQNKrjuCAAAy7BVjA/AYIIPiEBAOQULwHbMJqtS8AARj4h49lAsBgPEvAAEroSIzD2JsPhxLwEBVrwAAGAAk6GYdheFKRQ5jMFWjy8DJykadEMC4dwSm+DAHFdNorEcVAvCkAMXSkGAIiQJsvb1swhnWaQLgAO5gIZtxoOYvGsBEaSGRAvC+XAOD8NR7D8Lw4y0XximqN0WC8OwIi8YUZC8IFPbFSFXChQqaw2Vg5hKSZOFaU5LluXArGRPQsXVbwOW2fl9joS48B6iAkIYimKYAOyTu+IYBuGP7qVhpkkXiXwTsBW5gZB+4EIefxwfmZ44HYl4cpIwr8iY8QqTArD1gAEtIACyFEAKJrB20SPlCKatFcgbBkgQFLRiID3awK74jOCakkmTyvO8Gb7bSR40MdjAIYQUB8F9MA/Wg8TOZhJAAIKFD23FdDQjAAI5dGwKVmQAcn+t73ik+G8IRxGkbKHjyrwBNE2xAy47wABUUtKaT2aU3e7A03TFky61ZPwL1UlKyrPiBU0+C9YltEs4514+FWmiWL1D2E1ExPmOYyCvQAIqzYkwDRzlgPwMBTIw5rFGUwwPeepDxJhABe7CsEI8S2CkJQynAJQAOowNxJTk2oACSJSiw7JTyxTVPK7TMDcH9k2tHCb4g4gKZbeDeAlzAivUxXMNfHDIGI0gKZri8szxtAXwgFYNiSsAHK8C8vBW2EvAAOQAAKdD0fQIcw1o1HUDRNMvA5gOYirAihpBagoSiz42IV9ckaCpaE1a1oKDathzK9lmQy9z8fTZeArWwmZPCDZAHNi8rqKGJNCYKzLnrRgy8FicCqBwEgy9uDH2bC8QcTht5IFANyOAfQwB4EqCAF4LwgA=="}
import { Base } from '@studiometa/js-toolkit';

class Player extends Base {
  static config = { name: 'Player' };

  unmounted() {
    this.$el.removeAttribute('aria-live');
  }
}
```

It stays available for the cases the returned cleanup does not fit. When both exist, the returned cleanup runs first.

## What triggers each

| Cause                                       | Calls                                         |
| ------------------------------------------- | --------------------------------------------- |
| the element enters the document             | `mounted()`                                   |
| a mount strategy's condition becomes true   | `mounted()`                                   |
| the element leaves the document             | `unmounted()`                                 |
| the component token leaves `data-component` | `unmounted()`, then the instance is dropped   |
| a breakpoint withdraws the declaration      | `unmounted()`, then the instance is dropped   |
| a reversible strategy's condition ends      | `unmounted()`                                 |
| the node is **moved**                       | `unmounted()` then `mounted()`, same identity |

**Unmounting a parent does not unmount its children.**

## What is not a lifecycle hook

- **`updated()` does not exist.** For an option that chooses a resource, use [`option<Name>Changed()`](/api/methods-hooks-options.html). For an attribute the framework does not read, use [`watchAttributes()`](/api/dom/watchAttributes.html).
- **There is no permanent state.** A component never declares that its work is over. "Once per element" is a plain field — see [Lifecycle](/guide/introduction/lifecycle-hooks.html#do-this-once-per-element).
- **A service mixin never occupies either hook.** It overrides `$mount()`/`$unmount()`, so a class that writes its own `mounted()` without `super.mounted()` still subscribes.

## Failures

A hook that throws is reported once as `component.lifecycle-failed` and the cycle continues. It does not stop the other instances in the same batch.
