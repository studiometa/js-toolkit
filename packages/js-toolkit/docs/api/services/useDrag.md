# useDrag

```ts
useDrag(target: HTMLElement | SVGElement, options?: DragOptions): Service<DragProps>
```

A drag gesture, with an optional inertia phase.

## Props

```ts
interface DragProps {
  readonly mode: DragMode;
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly originX: number;
  readonly originY: number;
  readonly distanceX: number;
  readonly distanceY: number;
  readonly finalX: number;
  readonly finalY: number;
}
```

`isGrabbing`, `hasInertia` and `target` are removed, and `props.MODES` with them.

## The modes

```js twoslash
// @twoslash-cache: {"v":1,"hash":"530c18c5343950bfaf49f9af5a199e9be81729721cb4e0407c1f0b3b9a3efabe","data":"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"}
import { DRAG_MODES } from '@studiometa/js-toolkit';

DRAG_MODES.IDLE; // 'idle'
DRAG_MODES.START; // 'start'
DRAG_MODES.DRAG; // 'drag'
DRAG_MODES.DROP; // 'drop'
DRAG_MODES.INERTIA; // 'inertia'
DRAG_MODES.STOP; // 'stop'
```

`idle` is new in v4. `DragMode` is derived from the frozen object — that is the pattern for every closed set of strings in the framework.

## Options

```ts
interface DragOptions {
  axis?: 'x' | 'y' | 'both';
  dampFactor?: number;
  dragThreshold?: number;
  inertia?: boolean;
}
```

The v3 spelling `dragTreshold` is fixed.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f0440041444cbb3b0499235959176c72c8c9170ab54e36c0da271a7fb36882a8","data":"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="}
import { Base, DRAG_MODES, useDrag } from '@studiometa/js-toolkit';

class Slide extends Base {
  static config = { name: 'Slide' };

  mounted() {
    return useDrag(this.$el, { axis: 'x' }).subscribe(({ mode, x, finalX }) => {
      if (mode === DRAG_MODES.DROP) {
        this.settle(finalX);
        return;
      }
      this.$el.style.transform = `translateX(${x}px)`;
    });
  }

  settle(x) {}
}
```

## A gesture the browser can steal is not a gesture

`useDrag` owns both axes by default and writes `touch-action: none`.

| `axis`   | writes  | and                           |
| -------- | ------- | ----------------------------- |
| `'both'` | `none`  | —                             |
| `'x'`    | `pan-y` | every Y movement prop is zero |
| `'y'`    | `pan-x` | every X movement prop is zero |

It writes **only when the computed value is `auto`**, and it restores the previous inline value when the last service of those options leaves. Services on one target share that ownership.

The click that ends a drag is suppressed from a flag that movement on the owned axis arms and the next `pointerdown` disarms — and only for a **trusted** click with a non-zero `detail`.

## Inertia

With `{ inertia: false }` a drag publishes the **exact projected destination** at `drop`, then goes through `stop` to `idle` with no tick subscription at all.

With inertia, the coast subscribes to `scheduler.tick()`. Decay is expressed in time, not in frames:

- `INERTIA_FRAME` (16.67 ms) is the reference of every factor;
- `inertiaStep()` integrates the decay across the step, so any sequence of frames sums to `velocity · τ` exactly;
- the settle position is `value + velocity · τ` with `τ = INERTIA_FRAME / ln(1 / damp)`.

The velocity is sampled as a distance over the interval between events, smoothed, with the interval clamped at both ends. **At the drop, the velocity is decayed by the idle time through the same law** — so a pointer that stopped moving before release does not fling.

## Keying

`useDrag()` keys its axis, inertia, damping and threshold, so two callers asking for the same gesture on the same element share one service. See [`perTarget()`](./perTarget.html).

## `{ immediate: true }`

Does nothing outside a gesture: there is no current value between gestures.

## Mixin

```js
class Slide extends withDrag(Base, { axis: 'x', inertia: false }) {
  dragged({ mode, x }) {}
}
```
