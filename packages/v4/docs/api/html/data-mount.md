# `data-mount`

Overrides, for one element, **when** its components mount.

```html
<div data-component="Map" data-mount="visible"></div>
```

[[toc]]

## The values

| Value                    | Mounts when                            | Reversible |
| ------------------------ | -------------------------------------- | ---------- |
| `eager`                  | the element enters the document        | no         |
| `visible[:<rootMargin>]` | it first intersects the viewport       | no         |
| `in-view[:<rootMargin>]` | it intersects the viewport             | **yes**    |
| `idle`                   | the main thread becomes idle           | no         |
| `interaction`            | the user first aims at **it**          | no         |
| `interaction:page`       | the user first interacts with the page | no         |
| `media:<query>`          | the query is not empty and it matches  | **yes**    |

```html
<div data-component="Hero" data-mount="eager"></div>
<div data-component="Gallery" data-mount="visible:200px"></div>
<div data-component="Video" data-mount="in-view:-10% 0px"></div>
<div data-component="Analytics" data-mount="idle"></div>
<div data-component="Tooltip" data-mount="interaction"></div>
<div data-component="Chat" data-mount="interaction:page"></div>
<div data-component="Parallax" data-mount="media:(min-width: 64rem)"></div>
```

## The grammar

The accepted values are exactly `eager`, `visible`, `visible:`, `visible:<rootMargin>`, `in-view`, `in-view:`, `in-view:<rootMargin>`, `idle`, `interaction`, `interaction:`, `interaction:page` and `media:<non-empty query>`.

- A viewport suffix is passed straight through as `IntersectionObserverInit.rootMargin`.
- The empty suffix behaves as the bare strategy.
- `page` is the only scope the interaction strategy takes.
- There is **no** threshold, no root element, no JSON options and no second attribute.

## Precedence

```
data-mount  >  manifest entry mountStrategy  >  config.mountStrategy  >  'eager'
```

**Several components on one element share that element's `data-mount`.** A component that needs its own policy declares `config.mountStrategy` instead.

## Invalid values

An unknown value, an empty media query, or a `rootMargin` the browser refuses leaves the component **unmounted** and dispatches one cancelable `js-toolkit:diagnostic` with the code `component.invalid-mount-strategy`, the severity `error`, the component name and the original error.

The inert controller stays current while the declaration does not change, so it is not reported again; a corrected attribute replaces it. A failed strategy cannot stop the rest of a reconciliation.

## It is live

A change to `data-mount` disposes the old strategy and applies the final one. Controller identity guards a queued callback of a disposed strategy.

```js
el.dataset.mount = 'eager';
await whenDOMSettled();
```

## A waiting component has no instance

It is invisible to `$query()`, `$closest()`, `$watchChildren()` and `getInstances()`, and it announces nothing. There is nothing to guard against.

Once it has mounted and been stood down again — which only `in-view` and `media:` do — the instance exists and is unmounted, which is what [`getUnmountedInstances()`](/api/registry/getUnmountedInstances.html) answers.

See [Mount strategies](/guide/going-further/mount-strategies.html) for the full behaviour of each value.
