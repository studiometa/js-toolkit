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
// @twoslash-cache: {"v":1,"hash":"4c4d1a9259d8f2ca798ab8efcf24e44e01f412dfd2ddd33d41e328ce9487b985","data":"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"}
import { Base, useResize } from '@studiometa/js-toolkit-v4';

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
