# Services

A service is a shared source of props that components subscribe to. It is **lazy and reference-counted**: the source starts on the first subscriber and stops on the last, so with no subscriber there is no listener, no observer and no frame.

[[toc]]

## The sources

| Service                                                                       | Hook             | Props                                                                        |
| ----------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| [`useRaf()`](/api/services/useRaf.html)                                       | `ticked`         | `time`, `delta`                                                              |
| [`useScroll(target?)`](/api/services/useScroll.html)                          | `scrolled`       | `x`, `y`, `deltaX/Y`, `maxX/Y`, `progressX/Y`, `directionX/Y`, `isScrolling` |
| [`useResize(target?)`](/api/services/useResize.html)                          | `resized`        | `width`, `height`, `ratio`, `orientation`                                    |
| [`usePointer(target?)`](/api/services/usePointer.html)                        | `moved`          | `event`, `isDown`, `x`, `y`, `deltaX/Y`, `maxX/Y`, `progressX/Y`             |
| [`useDrag(target, options?)`](/api/services/useDrag.html)                     | `dragged`        | `mode`, `x`, `y`, `deltaX/Y`, `originX/Y`, `distanceX/Y`, `finalX/Y`         |
| [`useKey(target?)`](/api/services/useKey.html)                                | `keyed`          | `event`, `triggered`, `isDown`, `isUp`, plus one boolean per named key       |
| [`useInView(target, init?)`](/api/services/useInView.html)                    | `intersected`    | `isInView`, `entry`                                                          |
| [`useMutation(target, init?)`](/api/services/useMutation.html)                | `mutated`        | `records`                                                                    |
| [`useScrollProgress(target, options?)`](/api/services/useScrollProgress.html) | `scrolledInView` | `startX/Y`, `endX/Y`, `currentX/Y`, `progressX/Y`                            |
| [`useBreakpoint()`](/api/services/useBreakpoint.html)                         | —                | `name`                                                                       |
| [`useMediaQuery(query)`](/api/services/useMediaQuery.html)                    | —                | `matches`                                                                    |

`useWindowScroll()` and `useWindowSize()` name the default cases. `usePrefersReducedMotion()` is the named media query.

## Subscribing by hand

Every service has the same two-method surface, so subscribing is one line and the release is what `mounted()` returns:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5ea3433084a63dd8488c57a8b4f52672a02d69bae833ead64ab922d282e447ba","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    return useScroll().subscribe(({ directionY, y }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
    });
  }
}
```

`subscribe(callback, options?)` returns the unsubscribe function. `props()` reads the current props with no subscription.

### Asking for the first delivery

```js
useScroll().subscribe(callback, { immediate: true });
```

The sources that have a current value honour it; the ones that do not, do nothing. The frame tick has no current value between two frames, the pointer has none before it is seen, and a drag has none outside a gesture. Only the new subscriber is called, and the first props of a run carry no movement.

## Mixins — the declarative form

A mixin binds one subscription per mount cycle, under the one method name the service owns:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1283cff7395b87a275f88f37ec7b04f92c72568d939c7aeb23b471a3d45c248f","data":"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"}
import { Base, withScroll } from '@studiometa/js-toolkit-v4';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ directionY }) {
    this.$el.classList.toggle('is-hidden', directionY > 0);
  }
}
```

The mixins are `withRaf`, `withScroll`, `withResize`, `withScrollProgress`, `withPointer`, `withDrag`, `withInView`, `withMutation` and `withKey`.

::: tip A mixin never occupies a lifecycle hook
`mounted()` and `unmounted()` belong to the component author. The subscription rides on the framework's own `$mount()`/`$unmount()` pair, so a class that mixes a service in and writes its own `mounted()` **without** `super.mounted()` still subscribes.
:::

The subscription therefore starts once the whole of `mounted()` has run — including an `immediate` first delivery, which reaches a component that is fully set up — and is released before `unmounted()`.

### Scoping a mixin to a ref

```js
import { Base, withResize } from '@studiometa/js-toolkit';

class Panel extends withResize(Base, { target: (instance) => instance.$refs.inner }) {
  static config = { name: 'Panel' };

  resized({ width }) {
    console.log(width);
  }
}
```

A resolver that comes back with `undefined` or `null` reports `service.missing-target` and starts **no** subscription — because a renamed ref arrives here as nothing, and a service with a default target would otherwise observe the wrong thing and look like it worked.

### Suspending a hook

`{ manual: true }` declares the hook without running it. `$services.<hook>` is the switch:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2f7ca64f84e3f5c07aff443c0900718929470fa0a4e58b230a33cc208ea93d48","data":"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="}
import { Base, withRaf } from '@studiometa/js-toolkit-v4';

class SliderItem extends withRaf(Base, { manual: true }) {
  static config = { name: 'SliderItem' };

  ticked({ delta }) {
    // declared, not running
  }

  start() {
    this.$services.ticked.start();
  }

  stop() {
    this.$services.ticked.stop();
  }
}
```

### One hook per class, and that is the limit

A mixin binds **one** subscription, under one name, per mount cycle. A component whose subscriptions are one per markup declaration — an attribute-driven set, with its own modifiers and its own threshold, known only when the element is read — has no method to name and no fixed count. It calls `subscribe()` itself and returns the release from `mounted()`. That is the intended path, not a workaround.

`on<Event>` has the same shape: a handler name belongs to the class, while a set of events can be data.

## Two combinators

### `toggle()` — a subscription you can switch

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b52dfb62357981016ccb9e58eb953d48488a60ae96d48434585ed02ecbd52a67","data":"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"}
import { Base, toggle, useRaf } from '@studiometa/js-toolkit-v4';

class SliderItem extends Base {
  static config = { name: 'SliderItem' };

  #frame = toggle(() => useRaf().subscribe(({ delta }) => this.follow(delta)));

  mounted() {
    // `stop` is bound, so it is a cleanup as it is.
    return this.#frame.stop;
  }

  follow(delta) {}

  onSelected() {
    this.#frame.start();
  }

  onSettled() {
    this.#frame.stop();
  }
}
```

`start()` is idempotent and `stop()` is safe to repeat. It works on a `Signal`, on a bare listener, and outside a component.

### `until()` — a one-shot wait

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4b26b0180519477dfa48ba232d3edb5750858986f84cd686f312915b165ca2ba","data":"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"}
import { until, useScroll } from '@studiometa/js-toolkit-v4';

async function afterScroll() {
  const props = await until(useScroll(), ({ isScrolling }) => !isScrolling);
  console.log(props.y);
}
```

It resolves on the first update that matches, releases the subscription **before** it resolves, and resolves with a copy of the props. It resolves at once when the current props already match.

## The props contract

- **Props are flat, one field per axis, and nothing derivable is a field.** `lastX` is `x - deltaX`; `changedX` is `deltaX !== 0`. The grouped objects of v3 (`last`, `delta`, `max`, `progress`, `direction`, `changed`) are gone.
- **`directionX` and `directionY` are `-1 | 0 | 1`** — one signed value that multiplies.
- **Every field is `readonly`, and the props object belongs to its service.** It is valid for the duration of the call that received it. Use `{ ...props }` to keep one.

## One instance per target and per options

Services are keyed in a `WeakMap` by target **and** by the meaning of their options, so two callers asking for the same thing share one source:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4805eefd72c0ddc09b4a8a467692fd0750852015588ebb459aa85adbf8d72058","data":"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"}
import { useInView } from '@studiometa/js-toolkit-v4';

const el = document.body;

// The same service — the key is read by meaning, not by spelling.
useInView(el, { threshold: 0.5, rootMargin: '0px' });
useInView(el, { rootMargin: '0px', threshold: 0.5 });
```

Nothing groups observers across targets.

## No service owns a loop

The raf service and an active drag inertia subscribe to `scheduler.tick()`. The scroll service coalesces its events into one `read` per frame. The resize service is a `ResizeObserver`. See [The scheduler](/guide/going-further/scheduling-work.html).

## Writing your own

`createService()` is the whole primitive. Give it a `props` reader and a `start` function that returns its teardown:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"434d7febdbb1a7f3943d418ee74ccf445d4fe74fd95f6870ab5fe6d4133d9d04","data":"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"}
import { createService, perTarget } from '@studiometa/js-toolkit-v4';

interface FocusProps {
  readonly hasFocus: boolean;
}

const useFocus = perTarget((target: Element) =>
  createService<FocusProps>({
    props: () => ({ hasFocus: target.contains(document.activeElement) }),
    start(emit) {
      const onChange = () => emit({ hasFocus: target.contains(document.activeElement) });
      document.addEventListener('focusin', onChange);
      document.addEventListener('focusout', onChange);
      return () => {
        document.removeEventListener('focusin', onChange);
        document.removeEventListener('focusout', onChange);
      };
    },
  }),
);
```

`perTarget()` gives it the one-instance-per-target caching every built-in service has. See [`createService()`](/api/services/createService.html) and [`createServiceMixin()`](/api/services/createServiceMixin.html).
