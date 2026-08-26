# Motion

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7dfd1a05eb5698a9a8fba2050d2a4f9971d4091113e32177f0d0b8aa9d4b115f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvKMwC2WRmmakA5jDQA1NoJiJeYQbIBGZCrxGDSpGGE3bd+wydJn+zMRFJ6Dx07xiszFhwMFDeTn5Y1iLscBJgAPzhvqTcyc4AOmDs8p5o0nJYlCBQECIIiCAASuqWUmj4MPp0+eKyMAC0RlyhBfK9RPa8zGBQvHBgQbwA7uwN7FIABlEwMXGSiwB0xUoqFcjIIBxgANbF+GhowYgA9DcAVnAdaBAQrCdzHUQALJtwaIIoBJ2kpNrAiDdBOJWHAbrIIOJJJsLrJWABiGTyEAAXWxVH+ygYiAAnFRWDYVA0kN8qEpVOo8JiimSFrhEAAGKgifDKdw0cgkgC+FHQ2DZBGIZB2LSYbE4PAEwjE8XG8IR+AAKhBGATSGgko4UmYIFhEWA4AaAMpqhpagDypviPD01tetogvEYAGoAIy8SWkVgQZhQbhZHJYPKqt2aiDFUrlPCu9XDXiDVg6XgvabKMbMLPKNT5WYNf1gJpwHnWMb8UhyCuCIxwESkdiOpE7Zh7JAHI4LM5UC5XOC3B5PF5vD5oL6/f6A4HqZhgmAQqHsGFwhHxZFoVFouA2i5x3H4ulEn0AVjJFKpiAAHLTCwzKgeY1risc2ZyQNzeWIpYgl7CqKOB4IQJDkLSMqVCwHBcHwQiiGa4xRAsKiKE+dgZg4PjOGYFhWDYWE6OkfgEdYtgaAEZRzBgpEuP4gTBKE9HGu25pWqhYAqA6ZrOrwyDpiRhp4Wm1ExJg9HYuGuR6ihrbcfGZQVCAACCUCDKITT5nAXEqLwRgYIxQQhGMsjrhwIQiJIUBwDMcz4AI7C0KEZhGBAwiwGMcCNv8MDBJsvCWuI/D8OWcDjhAHSyFwdl1oivCxOYgT9DWnjjEoRjrrRmxZFkNQAqQ5pZo0/i0HyBb0vkIxjAAXmQHokEGElGSW+ALLwyzRLE8RbJ23YoIcxwDgQlzXHcjzPK87yfD8fwAkCEAgku4KQtCsLwmaO57rpCkqDieIgLqRIAExXkcN74EgABsj5VXgu1oR+rJIN+v51v+ApnYKh3WbAeARlGwB9FgZivuqWpg3pvCCgIpBLbwADkAACc6LctY5TZOcxreucCIwA3MUy1IKALQ2OsYB4I8ICCoKQA=="}
import { damp, smoothTo, spring } from '@studiometa/js-toolkit/utils';
```

Everything here takes a **time**, not a frame count.

> **Decay is expressed in time, not in frames.** `INERTIA_FRAME` (16.67 ms) is the reference of every factor.

That is what makes a factor mean the same thing at 60 Hz and at 120 Hz, and it is why `damp()` takes the elapsed time as a **required** argument.

[[toc]]

## Damping

### damp

```ts
damp(targetValue: number, currentValue: number, factor: number, elapsed: number, precision?: number): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"fdfed9474c81158c6038fad9525451015c205578da91903bc5bc72ae0ea2925c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AbGNAAgGMBXU0mMNRKzCcAtgCMylEHDQBDUg0QAWKszABzNPiQB2KnNLqWeLjz4NVASzC5EABirt882exrllAXwrpstgsSS+nSKIMxsBkYCQqIS5FQy8ooATACMqnya2ogAbPryUXiRxlY2SOkgTi5ukl4+1H54hCTx1CF4ABSyjJaycACUrJxwMABKsgBmHf2C4xMAymREluwwADpgliJYEApDI3NSUBDsCIggAKojrFowrHBOMFCczKQAtGKuANZPrBOkshEdxGpGWqwAdKxRixuDYoH9OGA3JYIGA4KxSIjWNYbvg7gB3UiWGisLDOEbgqRydRnZDIMLWL5SfBoNBYOCIAD0nIAVnA3mgIBBGF9iW8iEpwTJOFAUUC5ODYERObIsJZOSCwfBOcMxpNwSyRIwQABdE0JAyKADMeTCmS0SFtxVCusOpVsVsczgBNQ8dm8vhwTUCrRo9E68sIUEGi1BKxgAB4ACorL4ABVIEHZFFYRAglnhAB8oZNoWBYKQAHxSzhiB5EiQddjdRifdhfQSxrUAYRbba+ydTGazcBzeYLrGLczLFcrOazaBRaIA/J3a/XLBIAPJYReogaCC5o9fsBu4KjHU54eYns83CC44FLeM5xIKazqbFsSwTL+sfF9EIEBsJiYCbBolL5DSSB0iAvBoLCCBUEecC3puMCQkmeL3M+qz3IK7L/sS+BfuijB9GwqF1qe6GkJSZoWkkSBKAArBkGgOogACc+SGMY5xURuEhSD0ZSIJ6lTeq47hIFxAYNEG5zNEEbThucHRYC48pkIMsCMHIgjCOIKlvooLEABzsVkSBsdQBT8SAelyCJ1gel61QyYgyTJPJmCKQELRUu05zhBw3C8PwhmxCZlq6Codocdkeh2XxoSmBFFgMmJ8VVD6nk+fUfn+MpobBSAXQ9H0umAlgHTOgAat0nAwFFxmkDm6XmI1jDNa1cQ5hM0m7H1ZA5jA5Hsk8I3taSvDsJYcBLquMRtTMK1xBsWw7HsUA1UcJxnCA0IIaQYCPkIIQ3FsMAfH0vy7dsvxEE1dyyOW9xgKqRFaDiAAGWBzQtS6/ZBdnQSg9KiUyVAsmyHLcnyApCiKYoSlKCGyhA8qyIqMDKpwi6MHAnIiMBS4GmgRoAMQPVgprmtIsWIOZ8VqNZyi8YU5y0y52XuXltSpAVgbFSGQVqXaET2dERlxFIplIOZPEJezTrS0U6vusx/PSYLOi+Y0Sli8EEuhZ1kXrTFTHcclbOcclzomOF5i87YOVSb6SDJCxBv+SV4uhBpWksDprBObI03y0zqQx1ZnG2Y73Pjc5Wsc5JHm1FackM+w0D+Gbzv8KwAC8rB2AA3BsoXOiXrCpHYFcbBsrqTNMNbUWeHQdMAYfJ7IrCeIMxeVqwwAbKwYVmEXpe03V0sdYXaA5nY4LpL3+myP0ldgIP5dSNjSCgCEfCLaieB8iAnieEAA="}
import { useRaf } from '@studiometa/js-toolkit';
import { damp } from '@studiometa/js-toolkit/utils';
// ---cut---
let current = 0;
let target = 100;

useRaf().subscribe(({ delta }) => {
  current = damp(target, current, 0.1, delta);
});
```

`factor` is **the fraction of the gap that closes per reference frame**, so it is stable for every value a caller can pass. `precision` defaults to `0.01`: below it, the value snaps to the target.

::: warning v3's `damp()` had no `elapsed`

```js
damp(current, target, 0.1); // [!code --]
damp(target, current, 0.1, delta); // [!code ++]
```

A factor without a time is a factor that means something different on every display.
:::

### clampDampFactor

```ts
clampDampFactor(factor: number): number
```

Keeps a factor in the usable range.

### decayOver

```ts
decayOver(retained: number, elapsed: number): number
```

The decay of an elapsed time.

## Springs

### spring

```ts
spring(
  targetValue: number,
  currentValue: number,
  currentVelocity: number,
  elapsed: number,
  options?: { stiffness?: number; damping?: number; mass?: number; precision?: number },
): [value: number, velocity: number]
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"69d35dcf4195001be6d84c21af3053a5b5b6ff1c0d04f8cb9c6778c273a6b4fd","data":"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"}
import { useRaf } from '@studiometa/js-toolkit';
import { spring } from '@studiometa/js-toolkit/utils';
// ---cut---
let value = 0;
let velocity = 0;

useRaf().subscribe(({ delta }) => {
  [value, velocity] = spring(100, value, velocity, delta, { stiffness: 0.1, damping: 0.8 });
});
```

It returns the pair, because a spring's state **is** the value and its velocity — hiding the velocity would make the next step wrong.

**It integrates on a fixed step of a quarter frame**, however long the real frame is, so `stiffness`, `damping` and `mass` keep their meaning and the duration is real. `stiffness / mass` is clamped to `MAX_SPRING_RATIO`, from which that step is derived.

`precision` defaults to `1e-4`.

## Smoothing

### smoothTo

```ts
smoothTo(start?: number, options?: SmoothToOptions): SmoothTo
smoothTo<K extends string>(start: Record<K, number>, options?: SmoothToOptions): SmoothToRecord<K>
```

**A `toggle()` over `useRaf()`**: one subscription however many times the target is set, started when the value has somewhere to go, released when it arrives.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7597d7fc13630b2a6ba0fb1d9ca50a423642a666025f9e92bce725222b0d280e","data":"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"}
import { smoothTo } from '@studiometa/js-toolkit/utils';

const x = smoothTo(0, { damping: 0.85 });

x(400); // set a target, read the smoothed value
x(); // read it
x.raw(); // the target, unsmoothed
x.add(50); // move the target
x.jump(0); // set value and target at once — no travel, no frame
x.isMoving; // still travelling?

const unsubscribe = x.subscribe((value) => {
  document.body.style.setProperty('--x', `${value}px`);
});

x.destroy(); // release the frame subscription and every subscriber
```

#### Several channels on one subscription

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d45e1634d1cc0f8bd6fcbe7814fa411af1a71634aa674bae43ee0de644b0f1fb","data":"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"}
import { smoothTo } from '@studiometa/js-toolkit/utils';

const view = smoothTo({ x: 0, y: 0, scale: 1 });

view({ x: 100, y: 50 }); // only these two are re-aimed; `scale` keeps travelling
view.jump({ scale: 1 }); // reset one channel with no travel
view.isMoving; // true while *any* channel moves
```

**The keys are the consumer's own** — a scale, an opacity or a progress as readily as a coordinate. One frame subscription, one settled state (the loop stops when the **last** channel arrives), and one subscriber call per frame carrying the whole record.

::: tip The record handed out is the same object every frame
As a service hands the same props. Treat it as read-only, and copy it with `{ ...values }` to keep one.
:::

The mode — `spring`, `stiffness`, `mass` — belongs to the **instance**, not the channel.

#### `damping` accepts a function

```js
smoothTo({ x: 0, y: 0 }, { damping: (key) => (key === 'x' ? 0.9 : 0.7) });
```

It is read on **every frame and for every channel**, which matters for three reasons:

1. **A component's factor is an option**, and `$options` is a live view over attributes — so a factor captured once would freeze an attribute the framework keeps live.
2. It expresses a factor that depends on the **direction of travel**: read the current value and decide.
3. It gives one channel of a record a different rate from its neighbour.

A number stays a number.

#### `precision`

Defaults to the default of the function each mode wraps — `0.01` damping, `1e-4` springing — so converting a raw `damp()` call to the helper does not move where it snaps.

## Inertia

The family a coast is built from, and what [`useDrag()`](/api/services/useDrag.html) uses.

**`inertiaStep()` integrates the decay across the step**, so any sequence of frames sums to `velocity · τ` exactly — a coast lands in the same place whatever the frame rate did on the way. `inertiaFinalValue()` is what lets a carousel know which slide a fling is heading for **before** the coast starts.

### inertiaDecay

```ts
inertiaDecay(dampFactor: number, elapsed: number): number
```

`decayOver` with the tighter clamp a coast needs.

### inertiaTimeConstant

```ts
inertiaTimeConstant(dampFactor: number): number
```

`τ = INERTIA_FRAME / ln(1 / damp)`.

### inertiaStep

```ts
inertiaStep(velocity: number, dampFactor: number, elapsed: number): number
```

The distance travelled across the step.

### inertiaFinalValue

```ts
inertiaFinalValue(value: number, velocity: number, dampFactor: number): number
```

Where it will come to rest: `value + velocity · τ`.

## Constants

### INERTIA_FRAME

```ts
const INERTIA_FRAME: number;
```

`16.67` — the reference frame, in milliseconds.

### DEFAULT_DAMP_FACTOR

```ts
const DEFAULT_DAMP_FACTOR = 0.85;
```

### MAX_SPRING_RATIO

```ts
const MAX_SPRING_RATIO: number;
```

The clamp on `stiffness / mass`.
