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
// @twoslash-cache: {"v":1,"hash":"d6f20f14251e02fe663d3309648b7c789b79f6f57c06139221f0c5de1d0e501a","data":"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="}
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
