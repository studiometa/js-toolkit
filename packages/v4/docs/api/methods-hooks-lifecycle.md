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
// @twoslash-cache: {"v":1,"hash":"c73d87c823884887b52b87e2568efcd1bbd548ab0ff4aac6e130a265e01ca58d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvGpCGJVULm7RAKwA7N6+AUGIAGxhbpHRII3MzeQJSUgATOmZpNm5SINFJTh4hCQz1PJMbJw8AkJwyhIycvS+Sg7qmtq8enGG2mYW1rb2cU5t7kQXUWIB8/kCIRGESieD+s2SIIyWRylUQ8wAjJtqKUdhV9tVxowsE8yJg+JNpgA6fgQMAAM3YfkQvGA5l47N4YGYlhgzJcpESfgA3OYCv9wtEAByS3rggbDaijGExGn0xlODhzRAAZiWyLW+SxmG2MV2LQONRiRJJdgwfC5PL5aAF/nF7U8XlBfQhiFCiuh4wd8VBiWSupASJWKLy8xSRpxprxVUOVp5gWg5KaZEplggAFcwDQoIxuMyiBB2FAnFAIPwEDEADLsOkwfgYQQwXiECAAawovB5zELvDQEF4ACNO3iBVBYGBKbwALJTXikKJ50hgXjMM4wId5rC8OkFnLsWnmRi2bdbtwrDC8CB0kf4GCWPiBZj2UgFkS05+dpJ6F4AADAASAtcwLNAS2A3hABQCXg4AwMB+AfUhzC4ZD+EQcw2Q5TCUIHfNCxgYs+FZLcOXZVUXEQxkuVYF5twAd2Ydh7ECdg4EpUDEgAK1baCAGUIB5ABhWkCW4EVKKotc0A3Lc4HothKTgPNxzgfgBUnRhGCINg8xgPgdGMFleEAMgJeAKaS8PZApcLAABBARRJsJJh3kO5BW3Ad2FoRJV3XTcRGYzJ7HYm4FHuNhaT8XhmPY/BeHYuBzAgZiwH7QKh3vJIXEFHCwDsoioNIksWRK9l5MU3hkHUnBSBzYiixLfsKtM8yrIKABdGSqLFVoJSQdFY1lfokB6f0xjwSCSKreEkA6PUowNeZ4xNco9mTS0QGtLRSTtB5JDeJ4TB4mBWGZAAJaRFwbABRHweULN1AXRYJ0XGn1w3CGaYlAy6NVDdYVtWVFCmKbFNrNfEUz2tNCCgPgntfXw0DUqInLQZ12HHPMaEYABHPNjgZUiADluV5RDcf8fsDNYIynRdPxS14ctK2rWt6xAaQX14AAqQXgNUNBsdx/HCe4YDhYHKIkYfJ9Ak7VGXoikjSDpbJOzFkQVY5wypyfIdtxxnSCanLcDbgHB+GbdhSLkZ70YXABJZWBc/SXLe3Vg12YKB7zoLi0DgfsDcZoyUpEA8oE/UihQfFXSES1RfKSZizZ9mgY+3WcncSwJ/0Qu2HadoNrygQ2mZgSlHOQRcABEKd4AAlGAWzXFCYB6xh8Bx7REAAemH2ASFYA6mtzAAvdhWCESlbD8MeeeHgB1GBx2Hpy1Dd4e1fR4exYli2aG4N7og+5avTlEaQT+5VnCx828ct4GtQVSNwbydFtV69I0AyhWBsHYcycRrJHk0JYXgAByAAAi4PMUAzxpmYMPPicAAC0o4ICsB7OxLBRBgiwJkuYOoFwGhZlIFFO4lx04UXZG0NA7BUKqgZPFPQwBOTU2ZLAikZBYHWTIZROarVyIlU4txQGrBMbi1flLGAjBYFuE4FgjgJBYH9lgTYDgNBYG2Uog5MAg0QBoKQKALyYBlK0jwJgkABQChAA==="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"65c97bb3e072f561f3f82e0efa745ba727394588f4aeb9192836987a68682ef7","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"bcb99a06ee028ded48090efd63d787ab29c27f71ced2d96f4a38eec5f6969e24","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvGpCGJVULm7RAKwA7N6+AUGIAGxhbpHRII3MzeQJSUgATOmZpNm5SINFJTh4hCQz1PJMbJw8AkJwyhIycvS+Sg7qmtq8enGG2mYW1rb2cU5t7kQXUWIB8/kCIRGESieD+s2SIIyWRylUQ8wAjJtqKUdhV9tVxowsE8yJg+JNpgA6fgQMAAM3YfkQvGA5l47N4YGYlhgzJcpESfgA3OYCv9wtEAByS3rggbDaijGExGn0xlODhzRAAZiWyLW+SxmG2MV2LQONRiRJJdgwfC5PL5aAF/nF7U8XlBfQhiFCiuh4wd8VBiWSupASJWKLy8xSRpxprxVUOVp5gWg5KaZEpAFcwJYIHmaFBGNxmUQIOwoE4oBB+AgYgAZdh0mD8DCCGC8QgQADWFF4POYYHsaAgvAARl28QKoLAwJTeAAlPMiZij/Bdu68CB03gAAwAJHmC0XS/uKOZmHTcrxAl396eRzAS9x92cYMOc9oB8OoLxSCiHNSDAERIECQVmWYO9P1IWsAHcwDvTI0HMKdWFpPwRDHXhoLgHB+Bbdh+F4LB2Dbac91UNBv14dgRCnNBb3ggUmN8XDsM3D8vywcxH0LZ9X3fQCaJAuABySeg73He9eGo2j2HsPNa3gSk3UBdFY1lfpPChMY8BPATiw1UMkA6PUowNeZ4xNco9mTS0QGtLRSTtB5JDeJ4TEpQ8YFYZkAAlpAAWUbABRHweRHdTonRYJwzBHSdT05UQF81gTK1BVI1WVFCmKbFbLNfEUyctNCCgPgIpgKK0EpQCCxIABBJiBQnHMaEYABHHNjgZF8ADluV5OTnUFMteArKsazrBsQGkLjqtqwcogq3gACp1v3BqKhasb2s6t9NoAmqKk4rt132jqu3gxT8GQrt8LbIiX05YbeDpTRLAeuRIt8OrzHMZBgoAEQG5cYFbQCwH4GAAF1GHwJjtEQAB6VHYBIDCcFISkCwAL3YVghEpWw/Ax2bUYAdRgCdUaatQAElUaW/7UZ25rWvYA6YG4GKkDinovTlAXzP9fSYg5mA9ra67MuSbLllyvJ0W1Ao4fSaAyisGw7BZB5eAKD6vt4AByAABFwcygdgIDTZhUYAKzgABaMcIFYXtFJdohglNkUwHMOoLgaLNSBuBR7jiFk2VG9diIEWkGT8F59aDZlTYpMhTcNgPY8MosX1LGOkI5CC4B8vz6tOzmrs6023E4F2OBIU3uAD9kClFJx7aQUB5F8OBbbAPBnZAAoCiAA"}
import { Base } from '@studiometa/js-toolkit-v4';

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
