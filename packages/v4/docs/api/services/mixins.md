# Service mixins

A mixin binds one subscription per mount cycle, under the **one method name the service owns**.

| Mixin                | Hook             | Service                                           |
| -------------------- | ---------------- | ------------------------------------------------- |
| `withRaf`            | `ticked`         | [`useRaf()`](./useRaf.html)                       |
| `withScroll`         | `scrolled`       | [`useScroll()`](./useScroll.html)                 |
| `withResize`         | `resized`        | [`useResize()`](./useResize.html)                 |
| `withPointer`        | `moved`          | [`usePointer()`](./usePointer.html)               |
| `withDrag`           | `dragged`        | [`useDrag()`](./useDrag.html)                     |
| `withKey`            | `keyed`          | [`useKey()`](./useKey.html)                       |
| `withInView`         | `intersected`    | [`useInView()`](./useInView.html)                 |
| `withMutation`       | `mutated`        | [`useMutation()`](./useMutation.html)             |
| `withScrollProgress` | `scrolledInView` | [`useScrollProgress()`](./useScrollProgress.html) |

[[toc]]

## Two call forms

```ts
withScroll(BaseClass, options?)   // a mixin
withScroll(options?)              // a class decorator
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e02e2d01c367b61f8d78501f6cd2b4a329ca5166d7bf339b4371d2cc565c46db","data":"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"}
import { Base, withScroll } from '@studiometa/js-toolkit-v4';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ y, directionY }) {
    this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
  }
}
```

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"7dae950726f7a74a22ada827c1954464f93f4e4425e11e383c737575d3b1957a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8bEuenM/AI/iaViscZI0hEdj8GAAWXYtESkgdTtYAAkIBAANa8ABkvDdHq9IYJUB8cEkpmcjogzpgQJAxlOQezrGk0qipwgACMAFaPNBmCy9MF0u1F53Q2HwkAI5qVuCO9iVtEAA37wdzjG4w6atjk2XwvEsEFaWIwghgXN40iptsUEDpvFZqLZMEazGarHs4RlPKofPciAATAA2UX+QJIAVq69RPAtwJtqwSqJMkaoZFkWp5C+erUKUhoVCa1BmjELAWg08oYv0gwzGMqw4XMvALPIyzKBIawbFsrykLs+ysIcxynNiFxXDc9yPLYLxvJ0HzSF8vA/H8AJAo2oJYj0mFQlQMJwngSJXjuGF9OcZy4vihLEqS5KkJS1KsfSjKHiyIjsiB3K8uE0QAOwiiAPjvhKXjUGWsqKZiwEqk+6QatkuSfjBmAGjERqVKaNQoVgmg4HYGB8HEay4lyYDMJYRy8BsiR+OZ/JIAAHJZb7iiEUoRL+MRJSl7nJI+XkQb5OoAMz+XBQUIVUyEgKh9R8P+9pZs6jBaGgHTrAA/OMA01nWMZxmQCY+n6iQAPJYENnRpoBpYlWgpxxJIcSGNoxh8QAPrwrQmZyBGfHsBypScZzMbw1zCA8TycaQ7zyJ83y/L6tC5s9twyIWfWhuGUaxvGnowEmiipummbjnmR28IwADUAq8AhrAQMwUDcMCTb2D1gEdjJiK9mOg4jmOxYTlOM7aTA86Lsuyn8GuPibtuaItnuB5Hju7LnpeKLObezgWZ+KSvrZYofjq37OX+rag5VSD1TVmp1QKTWBeUxptWFcp6SGzOwIh96Co+Nl2YViCyz+spm3jIW2SBRXqrV2rPnrZTBYhFzml1Ah6btsjEYopGqAdugTLHDYgrY9hxFlD4CsEap2wroROVteCpwkHm5+B2vao+uvFLB+sB0bsqMClgTQHwLsW1ytM5lAk7jP8gJp4KwSOdnEo5cVMp4B3PhQOriA2aXPnlwUAC66TQGUSdgsAEyMeJSnbbaAGg7wBRNJoli8AA5AAAi4zRQB0jfMAA9NWcAALSvNmEbMm/RDBBfABucw5gr6uSwlvcqqUL6tzIBfY+BMwBXxJqDSc5gaS3F4DApmSwo4TF4MAcwvA0qg3pvggo5gChOEfkgUAkc4DDTwGgBABQChAA=="}
import { Base, component, withScroll } from '@studiometa/js-toolkit-v4';

@component({ name: 'Header' })
@withScroll()
class Header extends Base {
  scrolled() {}
}
```

**The mixin is the primitive**, because it needs no build step. The decorator is sugar over it.

## Stacking

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8cf8a2ad730441535369b8ba284a53d538cf5a074c8f8dde4a668a33cb1a7edb","data":"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="}
import { Base, withRaf, withResize } from '@studiometa/js-toolkit-v4';

class Parallax extends withRaf(withResize(Base)) {
  static config = { name: 'Parallax' };

  resized({ height }) {}

  ticked({ delta }) {}
}
```

`$services` keys accumulate through the intersection, so `$services.ticked` and `$services.resized` both complete.

## Options

```ts
interface ServiceMixinOptions<Target, Host = Base> {
  target?: (instance: Host) => Target;
  manual?: boolean;
  immediate?: boolean;
}
```

**The options of a mixin are not the options of the service.** `target`, `manual` and `immediate` describe the subscription; they are removed before the `use*()` call and they are absent from its options type. A service's own options go in the same object and are forwarded:

```js
withDrag(Base, { axis: 'x', inertia: false, immediate: true, manual: true });
```

### `target`

```js
withScroll(Base, { target: (instance) => instance.$refs.scroller });
```

A resolver that comes back with `undefined` or `null` reports `service.missing-target` and starts **no** subscription — because a renamed ref arrives here as nothing, and a service with a default target would otherwise observe the wrong thing and look like it worked.

A service whose **own** default target is nothing, like `withRaf`, is untouched: that is its contract, and only a caller's resolver can be wrong about it.

::: warning The resolver is typed against the host as declared
A mixin is applied while the extends clause of its class is still being evaluated, so `withDrag(Base, …)` types its resolver against `Base`. A component reaching further names the shape it needs — `(instance as Base & { readonly target: HTMLElement }).target` — which is an assertion rather than a check. v3 wrote the same line as an `@ts-expect-error`. That is why core checks the result at runtime.
:::

### `manual`

Declares the hook without running it, and `$services.<hook>` becomes the switch:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7719f9673cd85a5073b9643937f127218f6ed8e1f865838133df95fd9f0c49ba","data":"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"}
import { Base, withRaf } from '@studiometa/js-toolkit-v4';

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

Each handle is a [`Toggle`](./toggle.html): `start()` is idempotent and `stop()` is safe to repeat.

### `immediate`

Asks for the first delivery at subscribe time. `withInView` defaults it to `true`.

## It never occupies a lifecycle hook

`mounted()` and `unmounted()` belong to the component author, so **nothing has to be chained**. A class that mixes a service in and writes its own `mounted()` without `super.mounted()` still subscribes: the framework's own `$mount()`/`$unmount()` pair carries the subscription.

- The subscription starts **once the whole of `mounted()` has run** — including an `immediate` first delivery, which therefore reaches a component that is fully set up.
- It is released **before `unmounted()`**, exactly where the mount cleanup used to release it.
- `$unmount()` releases unconditionally, so a manual subscription started outside a mount cycle is released too.

::: tip A userland mixin still chains
The rule is about what the mixin **overrides**, not who wrote it. A mixin that puts its work in `mounted()` needs its subclasses to call `super.mounted()` — and the way not to need that is to override `$mount()`. See [`createServiceMixin()`](./createServiceMixin.html).
:::

## One hook per class, and that is the limit

A mixin binds one subscription, under one name, for each mount cycle. There is **no `hook` option**.

A component whose subscriptions are **one per markup declaration** — one per attribute, with its own modifiers and its own threshold, known only when the element is read — has no method to name and no fixed count. It subscribes itself:

```js
mounted() {
  return useScroll(this.$refs.panel).subscribe((props) => {});
}
```

`on<Event>` has the same shape: a handler name belongs to the class, while a set of events can be data. Both sugars are keyed on a name a class declares, and both leave the same escape open — bind it yourself, own the cleanup.

Neither limit is about a build step: `withRaf(Base)` is an ordinary call, and the name is fixed by how the class is written.
