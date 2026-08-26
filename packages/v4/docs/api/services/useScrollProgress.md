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
// @twoslash-cache: {"v":1,"hash":"d6f20f14251e02fe663d3309648b7c789b79f6f57c06139221f0c5de1d0e501a","data":"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"}
import { Base, useScrollProgress } from '@studiometa/js-toolkit-v4';

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
