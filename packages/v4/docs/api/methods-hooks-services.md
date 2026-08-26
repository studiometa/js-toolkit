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
// @twoslash-cache: {"v":1,"hash":"64c89e49d80c8cb85db59b0a4e59916c6df867a60f54e603478c4f20d4023ddb","data":"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="}
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
// @twoslash-cache: {"v":1,"hash":"dfe98904ecb06805774c21e4b8f5ebf8743ccc1c267141f79afc36c740b0ae22","data":"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"}
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
