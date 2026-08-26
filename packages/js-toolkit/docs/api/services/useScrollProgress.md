# useScrollProgress

```ts
useScrollProgress(target: Element, options?: { offset?: string }): Service<ScrollProgressProps>
```

An element's progress through the viewport as it scrolls.

## Props

```ts
interface ScrollProgressProps {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly currentX: number;
  readonly currentY: number;
  readonly progressX: number;
  readonly progressY: number;
}
```

`start` and `end` are the scroll positions at which the progress is `0` and `1`; `current` is where the scroller is now.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"760e13318819b040e5d7888c32ab6a60eba9ea202594d25f02c8467f562618a9","data":"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"}
import { Base, useScrollProgress } from '@studiometa/js-toolkit';

class Parallax extends Base {
  static config = { name: 'Parallax' };

  mounted() {
    return useScrollProgress(this.$el).subscribe(({ progressY }) => {
      this.$el.style.setProperty('--progress', String(progressY));
    });
  }
}
```

## The `offset` option

One string holding **two edge pairs**, separated by a `/`:

```
"<target> <viewport> / <target> <viewport>"
```

The first pair is where the progress is `0`, the second where it is `1`. In each pair, the first token is an edge of the **target** and the second an edge of the **viewport**.

The default is:

```js
useScrollProgress(el, { offset: 'start end / end start' });
```

which reads as "0 when the target's start meets the viewport's end, 1 when the target's end meets the viewport's start" — the element travelling the full height of the viewport.

Each token is one of:

| Token                            | Means                            |
| -------------------------------- | -------------------------------- |
| `start`                          | the leading edge                 |
| `center`                         | the middle                       |
| `end`                            | the trailing edge                |
| `50%`                            | a fraction of the box            |
| `120px`                          | an absolute offset from the edge |
| `20vh`, `10vw`, `5vmin`, `5vmax` | a viewport unit                  |
| a number                         | a fraction, as `0.5`             |

A token that parses as nothing falls back to the edge.

The **resolved** offset is part of the service's key, so two callers asking for the same range on the same element share one service.

## Mixin

```js
class Parallax extends withScrollProgress(Base, { offset: 'center end / center start' }) {
  scrolledInView({ progressY }) {}
}
```

The hook is named `scrolledInView`.

## Smoothing a progress value

Progress props carry no frame delta, and [`damp()`](/utils/math.html) takes the elapsed time as a required argument — decay is expressed in time, not in frames. So either take the delta from a [`useRaf()`](./useRaf.html) tick, or use [`smoothTo()`](/utils/motion.html), which owns its own frame subscription and releases it when the value arrives.
