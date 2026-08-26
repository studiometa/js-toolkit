# Services hooks

A service mixin binds one subscription per mount cycle, under the **one method name the service owns**. There is no `hook` option.

| Mixin                | Hook             | Props type            |
| -------------------- | ---------------- | --------------------- |
| `withRaf`            | `ticked`         | `RafProps`            |
| `withScroll`         | `scrolled`       | `ScrollProps`         |
| `withResize`         | `resized`        | `ResizeProps`         |
| `withPointer`        | `moved`          | `PointerProps`        |
| `withDrag`           | `dragged`        | `DragProps`           |
| `withKey`            | `keyed`          | `KeyProps`            |
| `withInView`         | `intersected`    | `InViewProps`         |
| `withMutation`       | `mutated`        | `MutationProps`       |
| `withScrollProgress` | `scrolledInView` | `ScrollProgressProps` |

[[toc]]

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b50668dc21360668abae5720fc2ebcb872a893eee9a87537541b244f1a691a85","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8UJgTq8ADuTXwAGV+JpWKxELxoWQiOx+DAALLsWhnSSw+GsAASdRyvAAZMjUeiYETmIo1nBJKYQHA4fU1lAWcYKMj2QjpAsDmheRAAEblGAPMwWcJ2CFQgkcpwuNx4aFdMVs0jsMU+AAG2o5MCgjG4+t4ADNbHJ7vheJYIF1ogIMIIYPFeF4fJDFBBwbx2CJNj5YJbmF1WPY9sLErtUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxiVVKQ0Ri4CVLDiznB4gVLKxprNWXsGIgAIwAVlW602SF7V2oQsOHkhmyVCKc2S+45udweZFH/beHxweB+692/w8gmEvCJMGYsHIc27SAAbLeh2ANltEA+J/spyAzxf91kzl8ACZrluUh7keO8t2oT5d2IX8aHoAEOC4PgZxhflWEkTAcAgS0HBgYxGGOABhPwM14LCYBwvDRSwNA+lBAB+JFGHFSUHgpKlqxpbFcTAAB5Wj6KZOdWEFD8RTwyRjkMbRjGMPgAB9eGdMN/ygbgkR4k0SOETDPio45eREkkIDJSkUS4jE6QZeBmVZdCTW5YxeEYABqXteFg0hWAgC9uHMKwbHlVCRJVVx3BADUtThXUDSNBETTNC1rVIW0bgdJ0XX4N01k9b0FT9AMg3I7xeDDCMo3Iyc0DjCc0iQDI/1yfJCmKMpKhqOoGiaFp2k6Ho+ksAZmCGQJywmKsa3getG1BFs0DbDtrwWHsAA5e0fZ9R3HGNPxC9CF3/JAgJAFdQLXJ4AN7SCKJg34DwQjwWCQ4Fj38STZFiRRlAMTRtF4PRpL+kwArlexjjCtUPHyt6AiCEJ+DCGxIhdL6EiSBMGqTM4UwIVqM3a7MurzXrCwGksRrLMYJiWrsVuWE61ifEdEB2d9hSOCRDvORATrOsD10QABmACbug74vL+R6QEYLA/rITA+G/S94kRsBLXYFIkWAcxeD13gwGYIakU6HUnwAbnMF4nHmRY+wuFYsmHF8312ntToiDWUm5r4heA1dwOeMWdwl+7qEPGW5a0BWMD4Q3jd4U2zm95a7d7ADxyZrbWfjcS8Hjk4mt9/3zsDjPg6+AhJYe93GCGzZoCV88VfizlGGAXgMF5XpSClOiIgATV5IMROT3gXm13X9YwJF6QwS2wH1sr2F7h56IH2ewHnqe9ZH9Dk837ewBeDTeCICB2CgG2bz7VoNqd5mX1W3OOY8VuTR9pBB1OkCBcuiu7pwQjrLO49cyB8BnrwOe196Z9n7IzZ2o4X6fgwJ/RA39+YXVHELABocgHSxAaBMBpA+A9z7uvQ+MC079m/lnFmY5kHuzIWvQeaCMG/ywX2W8uCq5h3grXLAoCBjgMDHAUeT5KGpx7L2W8AB2Ta9D75uzwHvQkyc2Elz/sdVaPC9xXnDgQqOOA7Cx0kkDIwxh4gABIYCIlPNITEAAZAAomsIa0QqHSKWH7B+2cfHKI8DY9spweZvkwYHV47woIh14fggR8sTF8FcTAdxNVYaOKDGgJEAARPimJpCmSiBkzokMIr5V7heKoERWAhAAFS1P1OkzJ+p6m8CMTHTyuEQy8GSakwM0QyDhgxCCZITYoG8A4CQXguT8mFLAMU+wiMEosMXr3OW8Aoh0SfCVHwsMoGFB1GKLoNBOk7LkG4zZeV8DFX4PSHZi89TKVUFAciEAHT0nYFgSMzATndL2RwTo8RzDmGQJibJAA5XgAAlGAloyBRAxFMRgaY2olGGLY6OpB4iOgAF7sARCNWwKQ0XhRKAAdRgGKEoABBNQABJEovTNklCaZ0bgnjRxLHkb4lmjsAmnVIgstBYSOGB17DgqJt08H6P4UweuhB1LTLyQUnIRTMnxFqCkFIaxGC1FVWAE2aAzYpF5ClDETFeBii6ueMAp8rX1BtaUvA+V6n6k1dqmASVWnyugKc7pMyVVqrBGcR4QyfC90dCQEQdy6CZLHnqqIVpNCWDOQC+w9IXm926KQUEVo2CqE9HSrppUE2LxcPAMAAByGIuJg1oErdGqAsAXkZrOZaZ0KzeBZq6Dm4MpAugemBWAUFELoWwvhWARFyL8aZnRT5Yx2KIB4oJfEIlJK3DkspTS+lJQA1zIWSUd1ax2VSOOhcbldCXaMLwEewui47yaM4QBCV25K56KlgIoRjxSEr3IYPSRdM7YAQAhexB9tr0eGYf3MAA9hWPsDq0F90S33VwMZ+ohwiSGdwA7bHsAFWi0LA0o6qeBUEhK+CKgOgtbzXU7IjWAKiwa8A7oZBUs50LjyTWEXglaAAC/Viz12YFmTquYmiVoXuYPZysyByHoHEEQ+1CSEQkHwHWi9E7JDovwEEXsAbMYNkbGASJK0ydIJW8ekmNPv1NB3Luy9V7QaHqI8RKRx5qZ3iVIM1jbGq0Feq29jBK1BiqNcptURK3d1/SsgevBnIXApJSEIzkxwXG4AvPWLwrZOCE0gUAX04D0TwJUEALwXhAA"}
import { Base, withScroll } from '@studiometa/js-toolkit';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ y, directionY, isScrolling }) {
    this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
  }
}
```

Mixins stack, and their `$services` keys accumulate:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a64000f8502f6cbaf7aefa33a42cf4e7b1a204fc7e85ce0d9ee3b9de91d4b76b","data":"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"}
import { Base, withRaf, withResize } from '@studiometa/js-toolkit';

class Parallax extends withRaf(withResize(Base)) {
  static config = { name: 'Parallax' };

  #height = 0;

  resized({ height }) {
    this.#height = height;
  }

  ticked({ delta }) {
    // …
  }
}
```

## A mixin never occupies a lifecycle hook

`mounted()` and `unmounted()` belong to the component author, so **nothing has to be chained**. A class that mixes a service in and writes its own `mounted()` without `super.mounted()` still subscribes: the framework's own `$mount()`/`$unmount()` pair carries the subscription.

The consequences are worth knowing:

- The subscription starts **once the whole of `mounted()` has run** — including an `immediate` first delivery, which therefore reaches a component that is fully set up.
- It is released **before `unmounted()`**, exactly where the mount cleanup used to release it.
- `$unmount()` releases unconditionally, so a manual subscription started outside a mount cycle is released too.

::: tip A userland mixin still chains
The rule is about what the mixin **overrides**, not about who wrote it. A mixin that puts its work in `mounted()` needs its subclasses to call `super.mounted()` — and the way not to need that is to override `$mount()`.
:::

## Mixin options

```ts
interface ServiceMixinOptions<Target, Host = Base> {
  target?: (instance: Host) => Target;
  manual?: boolean;
  immediate?: boolean;
}
```

**The options of a mixin are not the options of the service.** `target`, `manual` and `immediate` describe the subscription. They are removed before the underlying `use*()` call and they are absent from its options type.

A service's own options are passed in the same object and forwarded:

```js
class Slide extends withDrag(Base, { axis: 'x', inertia: false, immediate: true }) {}
```

### `target`

```js
withResize(Base, { target: (instance) => instance.$refs.inner });
```

A resolver that comes back with `undefined` or `null` reports `service.missing-target` and starts **no** subscription — because a renamed ref arrives here as nothing, and a service with a default target would otherwise observe the wrong thing and look like it worked.

A service whose **own** default target is nothing, like `withRaf`, is untouched.

::: warning The resolver is typed against the host as declared
A mixin is applied while the extends clause of its class is still being evaluated, so `withDrag(Base, …)` types its resolver against `Base`. A component reaching further names the shape it needs — `(instance as Base & { readonly target: HTMLElement }).target` — which is an assertion rather than a check. That is why core checks the result at runtime.
:::

### `manual`

Declares the hook without running it. `$services.<hook>` is the switch:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3c9539c5761bd3c284afb45c1df5c18b6d7e9495e0b4e7f0895157c2fe86c714","data":"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"}
import { Base, withRaf } from '@studiometa/js-toolkit';

class SliderItem extends withRaf(Base, { manual: true }) {
  static config = { name: 'SliderItem' };

  ticked({ delta }) {}

  onSelected() {
    this.$services.ticked.start();
  }

  onSettled() {
    this.$services.ticked.stop();
  }
}
```

`$services` is declared in the type as `ServiceHandles<'ticked'>`, so the key completes and a wrong name is a type error. Each handle is a [`Toggle`](/api/services/toggle.html).

### `immediate`

Asks for the first delivery at subscribe time. The sources with a current value honour it; the ones without do nothing. `withInView` defaults it to `true`.

## `ticked` can return a render function

`withRaf` is the one hook whose return value is used: return a function and it runs in the `write` phase of the same frame.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"cf6428e4d4514093d0c29b070db03d6d793b3cd76a97c550e73803551739fc96","data":"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="}
import { Base, withRaf } from '@studiometa/js-toolkit';

class Follower extends withRaf(Base) {
  static config = { name: 'Follower' };

  ticked({ delta }) {
    const x = this.measure(delta);
    return () => {
      this.$el.style.transform = `translateX(${x}px)`;
    };
  }

  measure(delta) {
    return delta;
  }
}
```

The raf service collects the render functions of its callbacks and cancels a render whose subscriber left between the two phases.

## One hook per class, and that is the limit

A mixin binds one subscription, under one name, for each mount cycle. A component whose subscriptions are **one per markup declaration** — one per attribute, with its own modifiers and its own threshold, known only when the element is read — has no method to name and no fixed count. It calls `subscribe()` itself:

```js
mounted() {
  return useScroll(this.$refs.panel).subscribe((props) => {});
}
```

`on<Event>` has the same shape: a handler name belongs to the class, while a set of events can be data. Neither limit is about a build step — `withRaf(Base)` is an ordinary call, and the name is fixed by how the class is written.

## Failures

A subscriber that throws is skipped and reported as `callback.service-failed`. Core dispatches the diagnostic first and calls `reportError()` only when no listener cancelled the event.
