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
// @twoslash-cache: {"v":1,"hash":"c2f06c38a3e9944fa53a6388df639e2fe447067709652bd0d3db4a8cf24490cb","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"5aac95172bd38e24dedcecd58aa2127ed3044b190f2115655455b94eed428b16","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit';

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
