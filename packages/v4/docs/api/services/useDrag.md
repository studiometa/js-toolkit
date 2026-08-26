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
// @twoslash-cache: {"v":1,"hash":"46ee4ee599b103c47b188cfbd0f2fadcca505aafce4e0879b86904ed35192cb9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAEQBKAQQDiAfQCyAeTEBRAMqJewADpheB3qRjMoQ1hl4BJMQBlVWnSHZRWMJwG49hoybNgLXnUAFSkJYMcQEWZSNE9vQ2NTc0tJWUioUmYAc3j9RL8U8QklAAUM0ggsPJ8k/0CrADlVcKspSPYwMjROGoLkgMsQssiRKryAXz12AFssCFji2UUVDUoQM34ERBAxLOzeDgAzGH4MfjdeGeh4LQADF0vAJMJeaMWXzJzeD8qsb95Ot1OP8xn8Xo8YHcAHTrNA5bbIZAgDhgADW63waDQWDgiAA9HiAFZwAC0aAgEFYqPYaBJRAALFCRABXKDsCAzGBwqGwIh45hYdh4uBkIjsfjwPHMkV7HJQzEzVggAC6yqobwYiAAnFQ3GBsmh8EgAIwABiocNI2S5eDS8mUanU6xRuEQ5pA/HwMWY/Bo5G1Ewo6GwroIxDIsLompALA4XD4gmEojtK0dWl0+QMdSKNnsHVc7hAXkzvgGgRCYQivCcGr6WcKgyWMgqOTrpfqqRK5WrG1+bezjaaLWCbQ6XVivSLCXrZaGwRGPdBk2mcwWyek9tWTqom22u32h3YJzOFxgVxuuN4DwLIMtoh+Xx+VX+gInzFvz/BBehsPhSERyKdOiVCYtiuIEsSZIUlSNJ0oyLJshyXLMDyMB8gKQoiqQYoSnAUoyvs8poIqKpqlEd5IAArAA7LqMD6oaJrupa1rRimDprLqgJIAATFQnrer6EZuoGwY4HghAkOQFpRkwWC/N0GB8LmDg9hCTjrBqSAAGwABx0QxRqIPSFoxKxeAqc63GIHxHpelkQn+saxqidQIYSeG0nULJOyxpwPACEIIhNqmGjptO7Y5nYqlOOpU4lgO5ahOEox3v2DaBHaLa5PFtQZZ2C5OJk4y5f0HbWM0rTtGp449Mw6WzkE87djW5LVPFUxgLM8yLOxW7rLutoHscpznJc1ywJe17PK8d7/J8BxPmCAK1cCLygi+34wqZ2QIkiKLAQQWI4viRKkuSlLUrSDJMmgrLspy3K8vygrCqK4qStKMCytkREkaq6oUYgukmci9EGkZZqmVaNo7H1jpWV0SAAMz8fZPp+kgpquZg4k7JJEYyfQckKbESlNZWqUxHEICaUDWqUQZENUdD5k7BW4SI66qN2YJmOIM5OPufjnmRsTvlsP5CZBeuywcZo2gRYllgqfmbgNeVHNVq11Ma0UWU9gteuNpIhW9iVxZ5Y1Q5VWOQL1aVM6a81qUW3onXdWuIXywNEBbENXwjSe40XvcEK3tT80HktL6re+61tZtbg/jte2AWiGLHeBZ1QZdsE3QhD3Iah6GvVhOGfQRcoKkqAPkdTJrGjzerMwLzFmbDuwbqF27p66oMCQ5/PY0Gbl42GUli9GjDyVUil8AbRX7BpgMNwLPGgy3jHGaznd2lzSAD+jjmN0L48E15NDizGkvxoFSbe1u4UJfl1jRWrhaW2VRRa1TsTG5lDc2UAEFRaubdqX8nY5kqiOaqsU44gKambJcHUVw9VlpuBGO4/Z7h+oeY8Y0zwTVuFecOCdI4PkWrwYqy1Xx1Q/LQrav5dr/n2kBTOYFTqQQujBa68E7qIUeihZ6GE3rYQ+nhL6P0/q1zIlpAW9J3Rb0hu3GGbFu4+y4kjRAjNeZD2EiPMSoYL5TxJnPMmC8uwVBKnTNexpKLGiZtvUGLE95dgPjotGfNhKC1HrjYxosibT1vgFRMwV4ZhUVi/a2781IFkQb/RcaVHaRRNkAw2y8UnK2KGbGhiCbawLtm+BJLskluzAB7VcvUNH9Wwf7OGw0jyjVPOeSaYcbzkPeNQ6O3TPwrXtgwpOkJtrUD/CgNhGcQJZy4edaCV04K3XukhJ6aEXqYXerhfC31CI11IqvWIJptK0TBoZJiu91Fy1qX3HSXj9H+kMWPAJk8glmJwBYiqw5Rw1XtiveuByBbUX0ic1uxzXHRgKW0Dx2lbkYx8S5PxwsJ6E28tfPyd8wkYJ7s/K25VVZxPVlk1+iSdb/0JY1RevZWxkvKqbMBeTqXQM+XA5wCCGWNmGGAlBxZKnoMflgjYOCA4HCDoQ1pJDppnk6febpj5em0LjoMr8ycRlwhYeM9Oh1QInQgrMvOfDFmCOLiIsuGzK7bOrsRWR+zNQ8VNEo8G28oajLUbaGp/KXRIGOYPWF9yz5PORVfaes83mYD4By127VbH/J4s5JxRkXEd2jByjxXrj780FmRQQsA8Ce0WMAPlGheATF4EcSoMxeAAHIAAChdlnMBzjw+ZDIK3Fj0BE9QUIVIeF4ASStEIK1trdRoKEWtu29orRqAdYB21QjtGOvElaFpTpnbS+di7fjLqHR2iFUg10VroZwTdlzHQjuanu0EFb1hCKQKAKM9E4DsjAHgYkIAJgTCAA="}
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
