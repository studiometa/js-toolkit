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
