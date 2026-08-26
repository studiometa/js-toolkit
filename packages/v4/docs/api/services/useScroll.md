# useScroll

```ts
useScroll(target?: Element | Window): Service<ScrollProps>
```

Scroll position, movement and direction for one scroller. With no target it is the document element; `useScroll(document.documentElement)` is the window service.

## Props

```ts
interface ScrollProps {
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly progressX: number;
  readonly progressY: number;
  readonly directionX: -1 | 0 | 1;
  readonly directionY: -1 | 0 | 1;
  readonly isScrolling: boolean;
}
```

Nothing derivable is a field: `lastX` is `x - deltaX`, and `changedX` is `deltaX !== 0`.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5d0c1d0a7964d233cdf422707f2496b6ef193e82a43baf1257abb47d4ef47e53","data":"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="}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    return useScroll().subscribe(({ y, directionY }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
    });
  }
}
```

A region rather than the page:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c1a236f4e0360b84c7c3fc73509eb78eaff7453c07d0cd6df85b0bf109e999d7","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Panel extends Base {
  static config = { name: 'Panel', refs: ['scroller'] };

  mounted() {
    return useScroll(this.$refs.scroller).subscribe(({ progressY }) => {
      this.$el.style.setProperty('--progress', String(progressY));
    });
  }
}
```

## One `read` per frame

The service **coalesces its scroll events into one `read` per frame**, so a page scrolling at speed measures once per frame rather than once per event.

## Extents are observed, not sampled once

The service watches the scroller **and its element children** with a `ResizeObserver`, plus a `childList` MutationObserver to keep that set correct: `1 + n` observed boxes per scroller, lazy and released with the last subscriber.

That is what keeps `maxY` and `progressY` correct when content is added, removed or resized.

## `{ immediate: true }` works here

A scroller has a current position between deliveries, so the first delivery is honoured. The first props of a run carry **no movement**: the deltas are zero and `directionX`/`directionY` are `0`.

## Mixin

```js
class Header extends withScroll(Base) {
  scrolled({ y, directionY }) {}
}
```

`withScroll` defaults to the page-wide source. A region is `withScroll(Base, { target: (instance) => instance.$refs.scroller })`.

## See also

- [`useWindowScroll()`](./useWindowScroll.html) — the named default case
- [`useScrollProgress()`](./useScrollProgress.html) — an element's progress through the viewport
