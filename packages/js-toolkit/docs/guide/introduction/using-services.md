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
// @twoslash-cache: {"v":1,"hash":"923359e6343938fddc006331eae7126521e7108ffddce8c663fc2b41ca35a403","data":"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="}
import { Base, useScroll } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"498fa073efd17e4c3d4a63ed1b0e8e72856e5faa7dbfd3e4f07f30a2c354a36c","data":"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"}
import { Base, withScroll } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"c421bfd1e7c1ae9cb138030583fb4236dcc8fb93eefa73bb003e00f8c6c5968d","data":"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"}
import { Base, withRaf } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"4f1188eb6a844e1130ff7a6f863ba4035165b9264387bc12e58335d6d8019f18","data":"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="}
import { Base, toggle, useRaf } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"b90e9241232e4155c3412309a3074e936bbd544865a57a609c57a88fdd2b4225","data":"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"}
import { until, useScroll } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"109a156c43e0ed15891de4e8887b369e35064e89ade01a4f1f66179621f70e1a","data":"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"}
import { useInView } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"1e19dcabd68c7f3f9ae72e14c41b23ba5b90227e7c3f8307d003ebe5deedb70e","data":"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"}
import { createService, perTarget } from '@studiometa/js-toolkit';

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
