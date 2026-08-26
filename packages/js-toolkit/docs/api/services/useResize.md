# useResize

```ts
useResize(target?: Element): Service<ResizeProps>
```

The size of one element. With no target it is the document element, which reports the viewport.

## Props

```ts
interface ResizeProps {
  readonly width: number;
  readonly height: number;
  readonly ratio: number;
  readonly orientation: 'square' | 'landscape' | 'portrait';
}
```

`breakpoints` and `activeBreakpoints` are removed — [`useBreakpoint()`](./useBreakpoint.html) is their own source now.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"58148f60104eaea14d2f88f3d94336981e94e3ecd0655693e29afcacd36f7a1b","data":"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"}
import { Base, useResize } from '@studiometa/js-toolkit';

class Grid extends Base {
  static config = { name: 'Grid' };

  mounted() {
    return useResize(this.$el).subscribe(({ width, orientation }) => {
      this.$el.classList.toggle('is-narrow', width < 480);
    });
  }
}
```

## A `ResizeObserver` does not see the viewport

It reports the **box of the observed element**, which is what catches a zoom or a scrollbar. For the root element, `clientWidth` and `clientHeight` report the viewport and are decoupled from the observed box — so the viewport service keeps a `resize` listener as well.

That is why `useResize()` with no target and `useResize(someElement)` are not the same kind of measurement, even though they share a props shape.

## `{ immediate: true }` works here

An element has a current size between deliveries.

## Mixin

```js
class Grid extends withResize(Base) {
  resized({ width }) {}
}
```

`withResize` defaults to the page-wide source, as `withScroll` does. Scope it with `{ target: (instance) => instance.$el }`.

## See also

[`useWindowSize()`](./useWindowSize.html) — the named default case.
