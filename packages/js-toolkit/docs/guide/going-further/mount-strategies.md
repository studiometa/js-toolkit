# Mount strategies

A mount strategy decides **when** the registry mounts an instance. It constructs nothing and it wraps nothing.

[[toc]]

## The seven values

| Strategy                 | Mounts when                            | Reversible |
| ------------------------ | -------------------------------------- | ---------- |
| `eager` (default)        | the element enters the document        | no         |
| `visible[:<rootMargin>]` | it first intersects the viewport       | no         |
| `in-view[:<rootMargin>]` | it intersects the viewport             | **yes**    |
| `idle`                   | the main thread becomes idle           | no         |
| `interaction`            | the user first aims at **it**          | no         |
| `interaction:page`       | the user first interacts with the page | no         |
| `media:<query>`          | the query is not empty and it matches  | **yes**    |

**One-shot and reversible are separate values.** `visible` mounts once and stays. `in-view` mounts and unmounts on each crossing.

## Declaring one

A component declares its default in its config; any element overrides it with `data-mount`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"367227f42554a5f27eb23a78c054bbd99a936bdce820711d0ea83a87ae8043b2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ACyYyc80WiAArDssutNkgAMy7BYHBgeUFYJzZL4AJmut1I90eSAAbG8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN4Wf45EEQvwwjZItEOQoEklUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZnM9ujSaTVvCtohYXs0UcJNizniCXcHrTEABGAAcFOon2pxFpu3+HkYWF5ZEwfEx8RVYAAZuwUoheMBzLxa7wwMxLDBK51SGcUgBuGt1ywQLrRADKaCJNBSGBbw/bXbAL3BnqQ8fxcLAG39PuoqMOHmLZZSYfOiGRIBuUZJzyTmCp3zT5Az9KzOa0eYwfAbTYnbZXc4W6KWAHZfRXBEAxRfYt3ARtJRxbZIyJaMnlaC8U2vX473REBs1zOwX14Xt+zQIcRxgMcP3bb9IVjWNYTWID/VjI8g3AvDB2HZhRwwfcvihWDiRjRDZmPaAvhAKwbHFYAJV4F5eBLTRLF4AByAABToej6JtknNGo6gaJoFOncxAQVTFNS5STqzAWt5jQdh+FCUty35Ktu1rN9m0UzEFIoFzcL7FiiJIxSiHYOB2AAIzWLzuxeadZyoDTmCQUBYjAUKIjwSoQBeF4gA="}
import { Base } from '@studiometa/js-toolkit';

class Map extends Base {
  static config = {
    name: 'Map',
    mountStrategy: 'visible',
  };
}
```

```html
<!-- uses the component default -->
<div data-component="Map"></div>

<!-- overridden per element -->
<div data-component="Map" data-mount="eager"></div>
<div data-component="Map" data-mount="visible:200px"></div>
<div data-component="Chat" data-mount="interaction:page"></div>
<div data-component="Parallax" data-mount="media:(prefers-reduced-motion: no-preference)"></div>
```

The resolution chain is:

```
data-mount  >  manifest entry mountStrategy  >  config.mountStrategy  >  'eager'
```

## The grammar

The accepted values are exactly `eager`, `visible`, `visible:`, `visible:<rootMargin>`, `in-view`, `in-view:`, `in-view:<rootMargin>`, `idle`, `interaction`, `interaction:`, `interaction:page` and `media:<non-empty query>`.

- A viewport suffix is passed straight through as `IntersectionObserverInit.rootMargin`.
- The empty suffix behaves as the bare strategy.
- `page` is the only scope the interaction strategy takes.
- There is **no** threshold, no root element, no JSON options and no second attribute.

An unknown value, an empty media query, or a `rootMargin` the browser refuses leaves the component **unmounted** and reports `component.invalid-mount-strategy` once. The inert controller stays current while the declaration does not change, so it is not reported again; a corrected attribute replaces it. A failed strategy cannot stop the rest of a reconciliation.

## `interaction` — intent on the element

`pointerenter`, `pointerdown` and `focusin`, bound to the element itself, so the component mounts **before** the click arrives. Two of the three bubble, so an interaction anywhere inside the subtree counts; `pointerenter` fires for the root element only.

## `interaction:page` — the visit, not the element

This is the deferred-widget case: a chat panel, an embed, a third-party script, where nothing about the element predicts the moment and any sign of a live user does.

- The events are the deliberate ones: `pointerdown`, `keydown` and `focusin`. Hovering is deliberately **not** one of them — aiming is intent for one element and noise for a document.
- **One listener set for the page**, in the shared runtime, not one per waiting element. They attach with the first waiting element and release on the first interaction.
- **They are captured**, so a handler that stops propagation cannot hide the visit.
- **The signal is a fact about the visit.** An element that arrives after the interaction mounts at once — but only when the strategy was already listening, since nothing observes a page that has asked for nothing.

## What a waiting component is

**A component that waits has no instance.** It is invisible to `$query()`, `$closest()`, `$watchChildren()` and `getInstances()`, and it announces nothing. There is nothing to guard against and nothing to check.

Once it has mounted and been stood down again — which only `in-view` and `media:` do — the instance exists and is unmounted, so it is what [`getUnmountedInstances()`](/api/registry/getUnmountedInstances.html) answers.

## Lifetime

- **Several components on one element share that element's `data-mount`.** A component that needs its own policy declares it in its config.
- **Teardown follows the element.** A strategy is disposed when its element leaves the document. A move ends as an unmount and a mount of the same instance.
- **The attribute is live.** A change to `data-mount` disposes the old strategy and applies the final one. Controller identity guards a queued callback of a disposed strategy.

## What this replaces

The `withMountWhenInView`, `withMountOnMediaQuery` and `withMountWhenPrefersMotion` decorators of v3 are **deleted**. A decorator that wraps a constructor to decide whether to mount is the registry's job, and the registry does it without touching the class.

`data-load` and `loadStrategy` are gone too: deferring the import and deferring the mount are one decision. See [Autoloading](/guide/going-further/autoloading.html).

::: tip `withInView` is a different thing
[`withInView`](/api/services/mixins.html) observes a component that is **already mounted** and calls `intersected()`. It does not replace the `visible` or `in-view` mount strategy.
:::
