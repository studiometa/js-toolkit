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
// @twoslash-cache: {"v":1,"hash":"64c89e49d80c8cb85db59b0a4e59916c6df867a60f54e603478c4f20d4023ddb","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8UJgTq8ADuTXwAGV+JpWKxELxoWQiOx+DAALLsWhnSSw+GsAASdRyvAAZMjUeiYETmIo1nBJKYQHA4fU1lAWcYKMj2QjpAsDmheRAAEblGAPMwWcJ2CFQgkcpwuNx4aFdMVs0jsMU+AAG2o5MCgjG4+t4ADNbHJ7vheJYIF1ogIMIIYPFeF4fJDFBBwbx2CJNj5YJbmF1WPY9sLErtUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxiVVKQ0Ri4CVLDiznB4gVLKxprNWXsGIgAIwAVlW602SF7V2oQsOHkhmyVCKc2S+45udweZFH/beHxweB+692/w8gmEvCJMGYsHIc27SAAbCsssOtohb/H9lOQGeL/usmcvgAma5blIe5HjvLdqE+XdiB/Gh6ABDguD4GcYX5VhJEwHAIEtBwYGMRhjgAYT8DNeEwmBsNw0UsDQPpQQAfiRRhxUlB4KSpasaWxXEwAAeRouimTnVhBXfEVcMkY5DG0YxjD4AAfXhnTDP8oG4JFuJNYjhAwz5KOOXlhJJCAyUpFFOIxOkGXgZlWTQk1uWMXhGAAal7XgYNIVgIAvbhzCsGx5RQ4SVVcdwQA1LU4V1A0jQRE0zQta1SFtG4HSdF1+DdNZPW9BU/QDIMyO8XgwwjKMyMnNA4wnNIkAyX9cnyQpijKSoajqBomhadpOh6PpLAGZghkCcsJirGt4HrRtQRbNA2w7a8Fh7AAOHZHzADZnzHN9hTwYK0IXP8kEAkAVxAtcnn/XsIPI6DfgPeCPBYRDgWPfwJNkWJFGUAxNG0Xg9Ck/6TH8uV7GOUK1Q8PL3oCIIQn4MIbEiF1voSJIE3qpMzhTAgWozNrs06vMesLfqS2GssxgmRau2W5ZBw2rbtl2j9IdOc5EFO87QPXRAAGZ/1uqDvk8v4npARgsH+shMD4L9L3iJGwEtdgUiRYBzF4HXeDAZhBqRTodU2gBucwXiceZFj7XtTrWTaRxfNmezOiI1ZSI6uYFoDVzA54RZ3MWHuoQ8pZlrQ5YwPh9cN3hjbOT2lptu2feZp31pjD9Y5ORqvjT3nLpOi5A6+Ahxce13GEGzZoAV88lbizlGGAXgMF5XpSClWiIgATV5INhMT3gXk17XdYwJF6Qwc2wF10r2C7h46N7qewBn8edcHtDE7XjewBedTeCICB2CgK2bz7Vp1odlnEBWl28Cbk0va+JnC/94X3kgoPy5DuCq5YDuDXMgfBJ68GnhfBmfZ+xM1vk7Xsj8PAYFfkgd+wE+ZPF7ALUu91YJh2lsAgYoCF5Lx7mAVeED15QJTv2B+6dtrjizq7Tu3cV6oMQOgv2/Ney3lwcHfBktCEgRAaQPg29CS7yoSg5OPZewAHZxzwO2ogicYk8ASI5InDhXCLqfxWvwv+gjAGyzsNHCSwMjDGHiAAEhgIiU80hMQABkACiaxBrRBoXIpYr4GFIDTswvAdj2ycy+H4j+/NXjfzugIq8ochERxwGYvg7iYCeOqnDZxQY0BIgACK8UxNIEyURsmdChuFPKXcLxVAiKwEIAAqBp+osk5P1E03gSSo4eRwiGXgaSMmBmiGQcMGIQTJCbBA3gHASC8AKUUkpYAyn2CRvFZeEReBdxlvAKItFNrFR8HDCBhQdRii6DQHpBy5AeN2blfARV+D0gOXPPUSlVBQDIhAB09J2BYEjMwC5fSjkcE6PEcw5hkCYjyQAOV4AAJRgJaMgUQMRTEYGmVqJRhj2MjqQeIjoABe7AETDVsCkLFYUSgAHUYBihKAAQTUAASRKAM3ZJRWmdG4N44uSinzLCQWdEiyyOERIwUXPsOCYmiyMfEgBTAa6EDUnMwpxScilJyfEWoKQUhrEYLUdVYAjZoBNikXkyUMSMV4GKTq54wBHxtfUO1FS8B5SafqbVuqYCJQ6Yq6Aly+nzLVRqsEZxHijJ8F3R0JARBPLoDk4eBqohWk0JYK5IL7D0g+V3bopBQRWjYKoT0TLeklSTXPFw8AwAAHIYi4lDWgatsaoCwA+Vmq5lpnTrLnjmroebgykC6B6cFYBIUwvhYi5FYBUXooJpmbF3lkn4ogESkl8QyUUrcNS2lDLmUlCDYs5ZJRPVrG5bIk6O1/HOzUXtDwJ7c6LjvL7PR/N/xSu3GXPccqCFAJEcQsRpC2F9z3jy7mAs+WO0YYK1h3be6iufZg7Y76f6forgkwBRDHhgJA+e7mrR6HKNHIKmRecn1nXFf7W8N1OxI1gBo8GvBW4GQVLONCI8U1hF4NWgAAn1YsNdmBZg6rmbqbRq2z3MEcxWZA5D0DiCIA6hICISD4FrOe8dki0X4CCD2gNGN6wNjAJE1bpOkGrSPCT6nn6mlbu3QDsGB5wCHvsw+jHN7FSDLY+xythWavvYwatQYqj3JbVEatHdF5AYobwJyFwKSUhCE5McFxuCzx1i8C2TgBNIFAN9OAdE8CVBAC8F4QA"}
import { Base, withScroll } from '@studiometa/js-toolkit-v4';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ y, directionY, isScrolling }) {
    this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
  }
}
```

Mixins stack, and their `$services` keys accumulate:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"dfe98904ecb06805774c21e4b8f5ebf8743ccc1c267141f79afc36c740b0ae22","data":"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="}
import { Base, withRaf, withResize } from '@studiometa/js-toolkit-v4';

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

`$services` is declared in the type as `ServiceHandles<'ticked'>`, so the key completes and a wrong name is a type error. Each handle is a [`Toggle`](/api/services/toggle.html).

### `immediate`

Asks for the first delivery at subscribe time. The sources with a current value honour it; the ones without do nothing. `withInView` defaults it to `true`.

## `ticked` can return a render function

`withRaf` is the one hook whose return value is used: return a function and it runs in the `write` phase of the same frame.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"06ded6c215666e858993f51713824658544c409602883b9dcbd6a085fc300ee2","data":"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"}
import { Base, withRaf } from '@studiometa/js-toolkit-v4';

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
