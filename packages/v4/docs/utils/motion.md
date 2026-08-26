# Motion

```js twoslash
// @twoslash-cache: {"v":1,"hash":"46388364b06ff35bde9ebcf15b5694557c7d4f7a169eaed2f92f29f65bc988f2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvKMwC2WRmmakA5jDQA1NoJiJeYQbIBGZCrxGDSpGGE3bd+wydJn+zMRFJ6Dx07xiszFhwMFDeTn5Y1iLscBJgAPzhvqTcyc4AOmDs8p5o0nJYlCBQECIIiCAASuqWUmj4MPp0+eKyMAC0RlyhBfK9RPa8zGBQvHBgQbwA7uwN7FIABlEwMXGSiwB0xUoqFcjIIBxgANbF+GhowYgA9DcAVnAdaBAQrCdzHUQALJtwaIIoBJ2kpNrAiDdBOJWHAbrIIOJJJsLrJWABiGTyEAAXWxVH+ygYiAAnFRWDYVA0kN8qEpVOo8JiimSFrhEAAGKgifDKdw0cgkgC+FHQ2DZBGIZB2LSYbE4PAEwjE8XG8IR+AAKhBGATSGgko4UmYIFhEWA4AaAMpqhpagDypviPD01tetogvEYAGoAIy8SWkVgQZhQbhZHJYPKqt2aiDFUrlPCu9XDXiDVg6XgvabKMbMLPKNT5WYNf1gJpwHnWMb8UhyCuCIxwESkdiOpE7Zh7JAHI4LM5UC5XOC3B5PF5vD5oL6/f6A4HqZhgmAQqHsGFwhHxZFoVFouA2i5x3H4ulEn0AVjJFKpiAAHLTCwzKgeY1risc2ZyQNzeWIpYgl7CqKOB4IQJDkLSMqVCwHBcHwQiiGa4xRAsKiKE+dgZg4PjOGYFhWDYWE6OkfgEdYtgaAEZRzBgpEuP4gTBKE9HGu25pWqhYAqA6ZrOrwyDpiRhp4Wm1ExJg9HYuGuR6ihrbcfGZQVCAACCUCDKITT5nAXEqLwRgYIxQQhGMsjrhwIQiJIUBwDMcz4AI7C0KEZhGBAwiwGMcCNv8MDBJsvCWuI/D8OWcDjhAHSyFwdl1oivCxOYgT9DWnjjEoRjrrRmxZFkNQAqQ5pZo0/i0HyBb0vkIxjAAXmQHokEGElGSW+ALLwyzRLE8RbJ23YoIcxwDgQlzXHcjzPK87yfD8fwAkCEAgku4KQtCsLwmaO57rpCkqDieIgLqRIAExXkcN74EgABsj5VXgu1oR+rJIN+v51v+ApnYKh3WbAeARlGwB9FgZivuqWpg3pvCCgIpBLbwADkAACc6LctY5TZOs3fGt65wIjADcxTLUgoAtDY6xgHgjwgIKgpAA"}
import { damp, smoothTo, spring } from '@studiometa/js-toolkit-v4/utils';
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
// @twoslash-cache: {"v":1,"hash":"3cc3acef13c8ea81f190e30c83581d87c0b15a2e1ae9332de71a048c1e448f71","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AbGNAAgGMBXU0mMNRKzCcAtgCMylEHDQBDUg0QAWKszABzNPiQB2KnNLqWeLjz4NVASzC5EABirt882exrllAXwrpstgsSS+nSKIMxsBkYCQqIS5FQy8ooATACMqnya2ogAbPryUXiRxlY2SOkgTi5ukl4+1H54hCTx1CF4ABSyjJaycACUrJxwMABKsgBmHf2C4xMAymREluwwADpgliJYEApDI3NSUBDsCIggAKojrFowrHBOMFCczKQAtGKuANZPrBOkshEdxGpGWqwAdKxRixuDYoH9OGA3JYIGA4KxSIjWNYbvg7gB3UiWGisLDOEbgqRydRnZDIMLWL5SfBoNBYOCIAD0nIAVnA3mgIBBGF9iW8iEpwTJOFAUUC5ODYERObIsJZOSCwfBOcMxpNwSyRIwQABdE0JAyKADMeTCmS0SFtxVCusOpVsVsczgBNQ8dm8vhwTUCrRo9E68sIUEGi1BKxgAB4ACorL4ABVIEHZFFYRAglnhAB8oZNoWBYKQAHxSzhiB5EiQddjdRifdhfQSxrUAYRbba+ydTGazcBzeYLrGLczLFcrOazaBRaIA/J3a/XLBIAPJYReogaCC5o9fsBu4KjHU54eYns83CC44FLeM5xIKazqbFsSwTL+sfF9EIEBsJiYCbBolL5DSSB0iAvBoLCCBUEecC3puMCQkmeL3M+qz3IK7L/sS+BfuijB9GwqF1qe6GkJSZoWkkSBKAArBkGgOogACc+SGMY5xURuEhSD0ZSIJ6lTeq47hIFxAYNEG5zNEEbThucHRYC48pkIMsCMHIgjCOIKlvooLEABzsVkSBsdQBT8SAelyCJ1gel61QyYgyTJPJmCKQELRUu05zhBw3C8PwhmxCZlq6Codocdkeh2XxoSmBFFgMmJ8VVD6nk+fUfn+MpobBSAXQ9H0umAlgHTOgAat0nAwFFxmkDm6XmI1jDNa1cQ5hM0m7H1ZA5jA5Hsk8I3taSvDsJYcBLquMRtTMK1xBsWw7HsUA1UcJxnCA0IIaQYCPkIIQ3FsMAfH0vy7dsvxEE1dyyOW9xgKqRFaDiAAGWBzQtS6/ZBdnQSg9KiUyVAsmyHLcnyApCiKYoSlKCGyhA8qyIqMDKpwi6MHAnIiMBS4GmgRoAMQPVgprmtIsWIOZ8VqNZyi8YU5y0y52XuXltSpAVgbFSGQVqXaET2dERlxFIplIOZPEJezTrS0U6vusx/PSYLOi+Y0Sli8EEuhZ1kXrTFTHcclbOcclzomOF5i87YOVSb6SDJCxBv+SV4uhBpWksDprBObI03y0zqQx1ZnG2Y73Pjc5Wsc5JHm1FackM+w0D+Gbzv8KwAC8rB2AA3BsoXOiXrCpHYFcbBsrqTNMNbUWeHQdMAYfJ7IrCeIMxeVqwwAbKwYVmEXpe03V0sdYXaA5nY4LpL3+myP0ldgIP5dSNjSCgCEfCLaieB8iAnieEAA="}
import { useRaf } from '@studiometa/js-toolkit-v4';
import { damp } from '@studiometa/js-toolkit-v4/utils';
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
// @twoslash-cache: {"v":1,"hash":"e4c803ade37c64a5ecb84e57a08386d0aecadd696e54e716e93af1e5c115a840","data":"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"}
import { useRaf } from '@studiometa/js-toolkit-v4';
import { spring } from '@studiometa/js-toolkit-v4/utils';
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
// @twoslash-cache: {"v":1,"hash":"46d0ce8153c3f4e1500466cf322c7eeae928220225e6dd0f016aee0c1f4be0ea","data":"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"}
import { smoothTo } from '@studiometa/js-toolkit-v4/utils';

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
// @twoslash-cache: {"v":1,"hash":"acf7aebb5693a43be004080a99d695f571563b20706f70533b70a5c1fda971ac","data":"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"}
import { smoothTo } from '@studiometa/js-toolkit-v4/utils';

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
