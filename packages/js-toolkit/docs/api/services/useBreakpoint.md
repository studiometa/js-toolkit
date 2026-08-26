# useBreakpoint

```ts
useBreakpoint(): Service<{ readonly name: string }>
```

The active breakpoint name, as a service. It is its **own source** — it is not derived from a resize.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"849a11acfbb081ca1fb8d01184b38b6d57bfebd431b9e2fea29a0bcdd2d92b22","data":"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"}
import { useBreakpoint } from '@studiometa/js-toolkit';

const unsubscribe = useBreakpoint().subscribe(({ name }) => {
  document.documentElement.dataset.breakpoint = name;
});
```

## Why it is not part of the resize service

It is backed by `matchMedia` `change` listeners, so it emits **on crossings** and it reports a change of the reader's font size — which a `ResizeObserver` on a box cannot see.

The values are in `rem`, and in a media query `rem` resolves against the **initial** font size, not against the root element.

`ResizeProps` therefore dropped `breakpoints` and `activeBreakpoints`: they were a different measurement wearing the same shape.

## The named set

See [Breakpoints](/api/dom/breakpoints.html) for `BREAKPOINTS`, `getBreakpoints()` and `setBreakpoints()`.

`setBreakpoints()` replaces the set and emits at once. The `MediaQueryList` objects are built once, and the active name is memoised for the length of one task — `setBreakpoints()` and the `change` handler of a running service clear that memo immediately.

## Who else uses it

- Every responsive **option** resolves through the same active-name read, but a `matchMedia` subscription only opens for a component that declares [`option<Name>Changed()`](/api/methods-hooks-options.html).
- Connected elements with a scoped `data-component` declaration share **one** reference-counted subscription to this service. A page with plain declarations opens none.

The breakpoint service is part of the core graph on every page. What it costs is a subscription, and a page that asks for nothing opens none.

## `{ immediate: true }` works here

There is always a current breakpoint.
