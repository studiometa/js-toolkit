# useMediaQuery

```ts
useMediaQuery(query: string): Service<{ readonly matches: boolean }>
```

The `matchMedia` engine, exposed. One instance per query string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4dc32fe162b384acc6ee614612cc9df7bb1a73ab99a8d96b7dd12698b4603022","data":"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="}
import { useMediaQuery } from '@studiometa/js-toolkit';

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
