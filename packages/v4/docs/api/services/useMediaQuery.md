# useMediaQuery

```ts
useMediaQuery(query: string): Service<{ readonly matches: boolean }>
```

The `matchMedia` engine, exposed. One instance per query string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1707a68e02a4c3c3038de76b7a5f404b5308c3d7c0567f1b73307a3ccd833e31","data":"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="}
import { useMediaQuery } from '@studiometa/js-toolkit-v4';

const wide = useMediaQuery('(min-width: 64rem)');

// `props()` answers with no subscription, because asking a MediaQueryList is a read.
if (wide.props().matches) {
  // …
}

const unsubscribe = wide.subscribe(({ matches }) => {
  console.log(matches);
});
```

**Parameters**

- `query` — any media query string.

## `props()` needs no subscription

Asking a `MediaQueryList` whether it matches **is a read**, so this service can answer without starting anything. Emissions are crossings.

That makes it the one service where `props()` outside a subscription is not a compromise.

## Where it is used

`data-mount="media:<query>"` is this service, which is why that strategy is **reversible**: a crossing out unmounts the instance and a crossing back mounts it again.

See [Mount strategies](/guide/going-further/mount-strategies.html).

## See also

- [`usePrefersReducedMotion()`](./usePrefersReducedMotion.html) — the named case
- [`useBreakpoint()`](./useBreakpoint.html) — the named breakpoint set
