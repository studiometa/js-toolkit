# useBreakpoint

```ts
useBreakpoint(): Service<{ readonly name: string }>
```

The active breakpoint name, as a service. It is its **own source** — it is not derived from a resize.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3b628ff64da8e60d0e7f9aaf72590f8724102ea6dfcd782f275280a984d42f6b","data":"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"}
import { useBreakpoint } from '@studiometa/js-toolkit-v4';

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
