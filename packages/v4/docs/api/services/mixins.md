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
// @twoslash-cache: {"v":1,"hash":"e02e2d01c367b61f8d78501f6cd2b4a329ca5166d7bf339b4371d2cc565c46db","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8UJgTq8ADuTXwAGV+JpWKxELxoWQiOx+DAALLsWhnSSw+GsAASdRyvAAZMjUeiYETmIo1nBJKYQHA4fU1lAWcYKMj2QjpAsDmheRAAEblGAPMwWcJ2CFQgkcpwuNx4aFdMVs0jsMU+AAG2o5MCgjG4+t4ADNbHJ7vheJYIF1ogIMIIYPFeF4fJDFBBwbx2CJNj5YJbmF1WPY9sLErtUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxiVVKQ0Ri4CVLDiznB4gVLKxprNWXsGIgAIwAVlW602SF7V2oQsOHkhmyVCKc2S+45udweZFH/beHxweB+692/w8gmEvCJMGYsHIc27SAAbCsssOtohb/H9lOQGeL/usmcvgAma5blIe5HjvLdqE+XdiB/Gh6ABDguD4GcYX5VhJEwHAIEtBwYGMRhjgAYT8DNeEwmBsNw0UsDQPpQQAfiRRhxUlB4KSpasaWxXEwAAeRouimTnVhBXfEVcMkY5DG0YxjD4AAfXhnTDP8oG4JFuJNYjhAwz5KOOXlhJJCAyUpFFOIxOkGXgZlWTQk1uWMXhGAAal7XgYNIVgIAvbhzCsGx5RQ4SVVcdwQA1LU4V1A0jQRE0zQta1SFtG4HSdF1+DdNZPW9BU/QDIMyO8XgwwjKMyMnNA4wnNIkAyX9cnyQpijKSoajqBomhadpOh6PpLAGZghkCcsJirGt4HrRtQRbNA2w7a8Fh7AAOHZHzADZnzHN9hTwYK0IXP8kEAkAVxAtcnn/XsIPI6DfgPeCPBYRDgWPfwJNkWJFGUAxNG0Xg9Ck/6TH8uV7GOUK1Q8PL3oCIIQn4MIbEiF1voSJIE3qpMzhTAgWozNrs06vMesLfqS2GssxgmRau2W5ZBw2rbtl2j9IdOc5EFO87QPXRAAGZ/1uqDvk8v4npARgsH+shMD4L9L3iJGwEtdgUiRYBzF4HXeDAZhBqRTodU2gBucwXiceZFj7XtTrWTaRxfNmezOiI1ZSI6uYFoDVzA54RZ3MWHuoQ8pZlrQ5YwPh9cN3hjbOT2lptu2feZp31pjD9Y5ORqvjT3nLpOi5A6+Ahxce13GEGzZoAV88lbizlGGAXgMF5XpSClWiIgATV4F5Ne13WMCRekMHNsBddK9gu4eOje7HsAJ4t9TeCICB2CgK2bz7Vp1odlnEBWl28Cbk0va+JnC/94X3kgoPy5DuCq6wO4a7IPhR94ced4Zvt+xM0Pk7Xsp8PAYEvkga+wE+ZPF7ALUu91YJh2lu/AYn8Z5zx7mAReP9l5/xTv2E+6dtrjizq7Tu3cF6QMQNAv2/Ney3kQcHZBktpayzsNHCSwMjDGHiAAEhgIiU80hMQABkACiaxBrRAIT2XsK007AOfGncheBBHtk5l8V8Z0YFFwDvfO6LCryhzYRHHAnC+BSJgDI6qcMxFBjQEiAAIrxTE0gTJRAcZ0KG4U8pdwvFUCIrAQgACpQn6nsY4/U4TeDmKjh5HCIZeDWNsYGaIZBwwYhBMkJsP9eAcBILwVx7jPFgG8fYJG8V54RF4F3GW8Aoi0U2sVHwcMf6FB1GKLoNBEmtLkNIppuV8BFX4PSVpU89RKVUFAMiEAHT0nYFgSMzBenJPaRwTo8RzDmGQJiZxAA5XgAAlGAloyBRAxFMRgaZWolGGEIyOpB4iOgAF7sARMNWwKR7lhRKAAdRgGKEoABBNQABJEoqSmklCiZ0bgcjRwrQAOxDkds+B8aijwkQqTQnRN8GEIMMaLJ+rCq410IGpYpbiPE5C8Y4+ItQUgpDWIwWodKwBGzQCbFIvJkoYkYrwMUnVzxgDXsK+oorfF4DyuE/UTKWUwESrEil0A+nJJKbS+lYIziPCyT4LujoSAiHGXQRxic5kcqtJoSw/TNn2HpLMru3RSCgitGwVQnpwVJJKuyqIpUIDwDAAAchiLiHVaBg0mqgLAWZjr+mWmdDUqezquiuuDKQLoHodlgD2Yck5ZyLlgCuTcgmmYHneQsS8iA7zPnxG+b8twAKgWgohSUTVZSKklAVWsBFyd5FLFRSQu8YDqAQGZWsPFvsLq3yJduMue4TEvyYG/ECH9SB8Eocm3Bv9+0nV7EO5Ro4yFVTwFu7Bvcp26PoU8Voc6H4LorqY1+aDHhfyXhAvd3MBZAKfKOUdn684juvTO/mt4bqdiRrAPAAVbD2FbgZBUs40ID2tWEXgwaAACfViw12YFmDquZuptGDZPcw7TFZkDkPQOIIgDqEgIhIPgWsp7x2SLRfgIIPaA14K3HOSJg2UdIMGgeZHWPn1NK3dumCqF9wHsx4eOtNhBgEUI5WOKGU9qVcGoMVQRkxqiMGjus9ZM4N4E5C4FJKQhCcmOC43BJ46xeBbJweGkCgG+nAOieBKggBeC8IAA==="}
import { Base, withScroll } from '@studiometa/js-toolkit-v4';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ y, directionY }) {
    this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
  }
}
```

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"7dae950726f7a74a22ada827c1954464f93f4e4425e11e383c737575d3b1957a","data":"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="}
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
// @twoslash-cache: {"v":1,"hash":"8cf8a2ad730441535369b8ba284a53d538cf5a074c8f8dde4a668a33cb1a7edb","data":"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"}
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
