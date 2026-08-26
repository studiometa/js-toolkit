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
// @twoslash-cache: {"v":1,"hash":"4c4d1a9259d8f2ca798ab8efcf24e44e01f412dfd2ddd33d41e328ce9487b985","data":"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="}
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
