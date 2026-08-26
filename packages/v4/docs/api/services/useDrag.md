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
// @twoslash-cache: {"v":1,"hash":"46ee4ee599b103c47b188cfbd0f2fadcca505aafce4e0879b86904ed35192cb9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAEQBKAQQDiAfQCyAeTEBRAMqJewADpheB3qRjMoQ1hl4BJMQBlVWnSHZRWMJwG49hoybNgLXnUAFSkJYMcQEWZSNE9vQ2NTc0tJWUioUmYAc3j9RL8U8QklAAUM0ggsPJ8k/0CrADlVcKspSPYwMjROGoLkgMsQssiRKryAXz12AFssCFji2UUVDUoQM34ERBAxLOzeDgAzGH4MfjdeGeh4LQADF0vAJMJeaMWXzJzeD8qsb95Ot1OP8xn8Xo8YHcAHTrN4MRAATiobjA2TQ+CQAEYAAxUNAxbIweG7aTyZRqdTrDhdJC4kD8fAxZj8GjkRETCjobC4HaEEjkPF0YksDhcPiCYSiNJk1aabQJAx1Io2ewdVzuEBefKKwqDIKhcKjfGxPo6gaBaUVHKm3zm1Ilcq8JyZcaahW2+qWJotYJtDpdWK9N3aj1FYaOpygybTOYLKWklYU9abba7faHdgnM4XGBXG5we4QkHG0Q/L4/Kr/QGB5jFyvg9XQ2ElpAAVgA7MiYKj0Vi6cbCcTpYm1sjAUgAExUBlMllkWkcrk4PB8+eC+hMLC/boYPgqhxO5zqpzNmLwgBsAA4uz2MYgACx4glEvD7qnjxBT+mMrJztmYzFF2obkV2INdqCFJg2E4HgBCEEQlhlCktF0EMlT1fc1TcG10MCEIwgiQ84Rw3ULVJK1cmDWpSPtEZDxdaoqP6T1rGaVp2kPasemYEi7X1OjIzQV0tSmMBZnmRZh3JUcNggLY8D2L5jlOc5LmuWAC14B51WLM9/k+A4KzBAEA24utjIhJsqDhJBL0fEAUTRO8cSfUhBwUhNpMpMcaUQABmacf2ZVkF05YDl15MCBQgjcdkYLcqh3Ph8MNIiSxPayW0RVsbycttXPcnYUuCd9fIC79ZxCxAAKAzAIoIKL1hoWKQBFGDxXg+Nli8lD3Vwr07APJwIV4ljiqNM9RqKS16P2Ka9UkASNl+eaGjY30OOG0ygy1ai+PDI1hL0UTxLjRCR282T5J2RSDmU7M1PzQsdJeOF9PTIyq222tXqEizGxhTKzyxTFysc3tqv7Z8h082VSp5eyZ1/KrsVqkDIv5JrILihKcFiXdEIojKoiyzEJ3s8G73sgcXxu0l4aQRGgr/EG0fq1doua4VoLFODJXOnr5TQmjrEGrCNV25iwwNQjBMmpizRYmbnTmhXQwWh0KiO4W+O9dj/SBHi1f6/iIxJ7WTtjSTYaTKgUwU9N7tU3N1NuLSi1+vSy0M3gGK+w3zKrAHT1iLF7zpSm+wK2mSW6uGfJ5HKKuR+dEFRsK6p5BrMfXYVcaS4oloY4mbOq1tMVyiHqehjyygZxAk6R4LU5qjP0ez8Cuag0VYIlBCpNlXqdZYzDOOPY2RfGtL5clxXpvI2brQnvjFrN4vl5H9a/U477VqGYIlqjYNLYkrqkJk+2bsdzMVJzPMNOe55XhLd7y1935/ZrQOGzcKySeB6q55OwOW7HlSG0cYZx1tg5D855AqVVTunJcWcOZYxavFbc+M9xb02s4XeIAQ7wkxO2a8IDbxIGATTYkesNr1zgcnZu/5AJt3Zo1XO3d2p837jbDQQ89ojzFmPbCG9pYEQmiaERGt0iL0orPdWZEi4rUkWtH028tqGz3qbQ6jERIxlPgLeOV1Uy3QzFmZ2983baSfm9b2716wmQDr9exllAb/1Dp+bEEdQEQxctQGudMoEyWpDyYBTcWZpzZigthMU86YMwMlA+Zsj6EMnABSuVMIF4HDPXUJzMqo1QALrThuHgU6ixgAGIpLwCYvAjiVBmLwAA5AAAREAAVygOwCAMwiTMAAPQACs4AAFohIQFYAAa3YGgYZRB7yNK1HoAeFIoT7g8LwPpfSmkQkaUsnh6goTFXWZsppcJdlgGWRoKE0pjlbMaQZc5lyDmr1uU0hijz9mrJwa8xpXFOAfMCQc8MPzQSNPWD0/ESBQBCm7HALpYA8BDJABMCYQA="}
import { DRAG_MODES } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"98bf5813c744a05f19d3a34872de50609f5c0f3ab205cef0703317d5c836be7f","data":"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"}
import { Base, DRAG_MODES, useDrag } from '@studiometa/js-toolkit-v4';

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
