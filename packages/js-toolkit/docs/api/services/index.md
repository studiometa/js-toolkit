# Services

A service is a shared source of props that components subscribe to. Every one of them is **lazy and reference-counted**.

[[toc]]

## The sources

| Service                                                           | Hook             | Target                             |
| ----------------------------------------------------------------- | ---------------- | ---------------------------------- |
| [`useRaf()`](./useRaf.html)                                       | `ticked`         | —                                  |
| [`useScroll(target?)`](./useScroll.html)                          | `scrolled`       | an element or the window           |
| [`useWindowScroll()`](./useWindowScroll.html)                     | `scrolled`       | the named default                  |
| [`useScrollProgress(target, options?)`](./useScrollProgress.html) | `scrolledInView` | an element                         |
| [`useResize(target?)`](./useResize.html)                          | `resized`        | an element                         |
| [`useWindowSize()`](./useWindowSize.html)                         | `resized`        | the named default                  |
| [`usePointer(target?)`](./usePointer.html)                        | `moved`          | an element, or the viewport        |
| [`useDrag(target, options?)`](./useDrag.html)                     | `dragged`        | an `HTMLElement` or `SVGElement`   |
| [`useKey(target?)`](./useKey.html)                                | `keyed`          | the document, an element or window |
| [`useInView(target, init?)`](./useInView.html)                    | `intersected`    | an element                         |
| [`useMutation(target, init?)`](./useMutation.html)                | `mutated`        | any node                           |
| [`useBreakpoint()`](./useBreakpoint.html)                         | —                | —                                  |
| [`useMediaQuery(query)`](./useMediaQuery.html)                    | —                | —                                  |
| [`usePrefersReducedMotion()`](./usePrefersReducedMotion.html)     | —                | the named case                     |

`LoadService` is not ported.

## The mixins

[`withRaf`, `withScroll`, `withResize`, `withScrollProgress`, `withPointer`, `withDrag`, `withInView`, `withMutation` and `withKey`](./mixins.html) bind one subscription per mount cycle under the one method name the service owns.

## The combinators

- [`toggle(subscribe)`](./toggle.html) — a subscription you can switch on and off
- [`until(service, predicate)`](./until.html) — a one-shot wait

## Writing your own

- [`createService(definition)`](./createService.html) — the primitive
- [`perTarget(create, keyOf?)`](./perTarget.html) — one instance per target and per options
- [`createServiceMixin(definition)`](./createServiceMixin.html) — the mixin over it

## The service surface

```ts
interface Service<T, R = void> {
  subscribe(callback: (props: T) => R, options?: { immediate?: boolean }): () => void;
  props(): T;
}
```

`subscribe()` returns the unsubscribe function. **Lazy and reference-counted**: the source starts on the first subscriber and stops on the last, so with no subscriber there is no listener, no observer and no frame.

**Every prop field is `readonly`, and the props object belongs to its service.** It is valid for the duration of the call that received it — use `{ ...props }` to keep one.

## Asking for the first delivery

```js
useScroll().subscribe(callback, { immediate: true });
```

The sources that have a current value honour it. The ones that do not, do nothing, and each service states which it is through `hasProps()`:

| Has a current value between deliveries                   | Does not                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| scroll, resize, breakpoint, media query, scroll progress | the frame tick, the pointer before it is seen, a drag outside a gesture, a mutation batch |

Only the new subscriber is called, and the first props of a run carry no movement.

## One instance per target and per options

Keyed in a `WeakMap` by [`perTarget()`](./perTarget.html). **The options are read by meaning, not by spelling**: object keys are sorted at every depth and the keys holding `undefined` are dropped, while arrays keep their order.

```js
// The same service.
useInView(el, { threshold: 0.5, rootMargin: '0px' });
useInView(el, { rootMargin: '0px', threshold: 0.5 });
```

Only what the platform owns needs a key of its own: `useInView()` gives its root a weak id, and `useMutation()` keeps a canonical init for the DOM contract. **Nothing groups observers across targets.**

## Props are flat

**One field per axis, and nothing derivable is a field.** `lastX` is `x - deltaX`; `changedX` is `deltaX !== 0`. The grouped objects of v3 — `last`, `delta`, `max`, `progress`, `direction`, `changed` — are removed.

`directionX` and `directionY` are `-1 | 0 | 1`: one signed value that multiplies.

## No service owns a loop

The raf service and an active drag inertia subscribe to `scheduler.tick()`. The scroll service coalesces its events into one `read` per frame. The resize service is a `ResizeObserver`. See [The scheduler](/guide/going-further/scheduling-work.html).

## Failures

A subscriber that throws is skipped and reported as `callback.service-failed`. Core dispatches the diagnostic first and calls `reportError()` only when no listener cancelled the event.

Publishing is **re-entrant**, so any code that changes state after a publication checks first that the service is still alive.
