# Motion

```js twoslash
// @twoslash-cache: {"v":1,"hash":"46388364b06ff35bde9ebcf15b5694557c7d4f7a169eaed2f92f29f65bc988f2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvKMwC2WRmmakA5jDQA1NoJiJeYQbIBGZCrxGDSpGGE3bd+wydJn+zMRFJ6Dx07xiszFhwMFDeTn5Y1iLscBJgAPzhvqTcyc4AOmDs8p5o0nJYlCBQECIIiCAASuqWUmj4MPp0+eKyMAC0RlyhBfK9RPa8zGBQvHBgQbwA7uwN7FIABlEwMXGSiwB0xXBKpAyIAJxUrDYqDUgALFR7agclhcUcYLiIAAxUIvjK7jTkRwBfCjobCvAjEMjFGj0JhsTg8ATCMTxcayCAQBoAFQgjF2yjQSUcKTMECw4kkcEJAGU0Rj8NiAPJk+I8PQ09FYiC8RgAagAjLwIaRWBBmFBuFkclg8qiOfSIMVSuU8Oy6cNeINWDpeGgINNlGNmDrlHcZnN8IKXuNvtYxvxSHImnBBEY4CJSOxmZJtlQ8fskHyAKwnM4XRAADhuJvUeDgtM5TwWrw+IC+PzEkMQQaBIJweEIJHINxasI4XD4QlE5KkcCiCxUimjdi1Dh8zjMFisNmbOnSfk71lsGgCZTmGD7Ln8gWCoQnJK9YEpbLrYBUTOrrN4yE1vaJ7Y1I5imAnAF1Jbl9uMVypFWUKiAAIJQQaiJpG2se1e8IwYKdBEJjLI7CsBwIQiJIUBwGaDQCOwtChGYRgQMIsBjM6ro0MEmy8FS4j8PwLxwHAHS6h0shcFBDrkrwsTmIE/R2p44xKEYwFjpsWRZDUaB1FBDRNHQvzGqo6jDKMvAAF5kFyJAikev6zPMSwrGs8RbDsewHAATMGICnKuYYAGxRiJ9wfvWiYvEgKZpg6Gb/DpAInp80BglKMrAH0WBmHGcrYj5168ACAikBAsi8AA5AAArsghQBI7RKAA9AAVsRuoQKwADWcwdEQlxJYI4isHAEUANzFIlzBIKALQ2OsYB4GlIAAgCQA"}
import { damp, smoothTo, spring } from '@studiometa/js-toolkit-v4/utils';
```

Everything here takes a **time**, not a frame count.

> **Decay is expressed in time, not in frames.** `INERTIA_FRAME` (16.67 ms) is the reference of every factor.

That is what makes a factor mean the same thing at 60 Hz and at 120 Hz, and it is why `damp()` takes the elapsed time as a **required** argument.

[[toc]]

## `damp`

```ts
damp(targetValue: number, currentValue: number, factor: number, elapsed: number, precision?: number): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3cc3acef13c8ea81f190e30c83581d87c0b15a2e1ae9332de71a048c1e448f71","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AbGNAAgGMBXU0mMNRKzCcAtgCMylEHDQBDUg0QAWKszABzNPiQB2KnNLqWeLjz4NVASzC5EABirt882exrllAXwrpstgsSS+nSKIMxsBkYCQqIS5FQy8ooATACMqnya2ogAbPryUXiRxlY2SOkgTi5ukl4+1H54hCTx1CF4ABSyjJaycACUrJxwMABKsgBmHf2C4xMAymREluwwADpgliJYEApDI3NSUBDsCIggAKojrFowrHBOMFCczKQAtGKuANZPrBOkshEdxGpGWqwAdKxRixuDYoH9OGA3JYIGA4KxSIjWNYbvg7gB3UiWGisLDOEbgqSJBRIADMeTCmS0SAZxVCwzGkykPTKiFpjmcAJqHjs3l8OCagVaNHonSBWmgg0WoJWMAAPAAVFZfAAKpAgWDgFFYRAglnhAB8oZNoWBYKQAHzguCcMQPIkSDrsbqMT7sL6CZVgmAAYR9fq+mu1eoNRpNZst1omtvtDuNBrQKLRAH5A673ZYJAB5LCZ1EDQQXNH59ge3BUY6nPDzGt1m4QXHApaq43UzMabFsSwTQesfF9IQQNiYsCbDSU/LqM7IZAgXhoWEIKhVl1u2uFmCQjV4+7d1b3NCxsfE/CD9GMPpsXcFuKUgC6b4SBkUSgArBkNGZRAAE58kMYxzmffcJG5axbH5SpBVcdwkGAsUGglc5miCNpZXODosBceUyEGWBGDkQRhHEHC+yQX8AA4AKyOiwMKc4yLkWDeQQqohRQxBkmSdDMEwgIWikGVQnCDhuF4fhKNiGjv10FRGUA7I9GoAoIMqWTzC42xVN45DaiE+oRP8bDpXafDul6AZWCgQEsA6NkADVuk4GAFOo0hjVMOS0A8xgvJ8uJjQmZDdjCshjRgB9DSeGK/NJXh2EsOAs1zGJfJmHK4g2LYdj2JztiOE4zhAaEN1IMBOyEEIbi2GAPj6X5SpweEiE8u5ZDte4wFkLBry0HEAAMsDSjKszGhdpGUxB6NUtRmOUVidI6gykCMpDhXKMzxUsqUJJsxkIm06IqLiKkFvo0C1NW1kLqKZ7SkMgVqn41IdGExosOO4I8LOmSzHk/KlKSVDNJWoDNLZEw9P4La1sQz7TN/X7RKsk6gYIoiWBIxz4oo8HWloxBUkppigP/LTwNCDjZGRna0Y8Wk0M/SpoH8aSAvMVgAF5WDsABuDZpLZQXWFSOxRY2DYOTmaZnVbA8Og6YAifI2RWE8QYBYdVhgA2VgQcCqWOtci7/MRtBjTscF0i1uR+jFsA9ZFqR5SZxBQBCPhMtRPAACsEE8TwgA=="}
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

`DEFAULT_DAMP_FACTOR` is `0.85`. `clampDampFactor(factor)` keeps a factor in the usable range.

::: warning v3's `damp()` had no `elapsed`

```js
damp(current, target, 0.1); // [!code --]
damp(target, current, 0.1, delta); // [!code ++]
```

A factor without a time is a factor that means something different on every display.
:::

## `spring`

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
// @twoslash-cache: {"v":1,"hash":"e4c803ade37c64a5ecb84e57a08386d0aecadd696e54e716e93af1e5c115a840","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AbGNAAiIENGBXGRVsNwC2AIzKUQcNB1INEAFirMwAczT4kAVirTSKlnk49cSgJZhciAAxUAxvhkdbNcgoC+FdNksFi4nXRyIMxsJIwQtqaY/IKi/pK6cgCMAJxKMKrqSAAcOjL6QWERURgSjOaWSXYOpE4uSPIeXjh4hCTkAfR4ABRcphxwAJSs3HAwAEocAGbdg/yTUwDKZESmtjAAOmCmQlgQsiNjCxJQEQiIIACqY6zqMKxw9jBQ3MykALQiTgDWz6xTtSE9zGpFW6wAdKxxixuKQLFB/twwM5TBAwHBWKQkaxzLd8PcAO6kKL3LAOMbgiRSGRyADMimCGTUGkQADY8noDBdRhNpmUKkhadVHM5xNYmtRvK0/B1qIEekD1NBhstQWsYAAeAAqa2+AAVSBAsHAKOwIKYEQAfKHTaFgWCkAB84Lg3BEj2JYm6ti4jC+tm+/FVYJgAGFff7vtrdQajSazRbWNaFnaHY7TUa0Kj0QB+INuj2mMQAeSwWbRQ34l3RBdsnpMIFOtnOIEWtfrtwgeOBK3VpupsnMKhxbFMUxHrAJAwEEDYWLA21UlLyKnOyGQIFIMLhCCo1dd7rrRZgkK1+IevfWDzQccnUXwI4xjAGbAPhbEpEpAF0v1QB3J5CFRlMhZNJqHyLlJHbY9+QsQVhVqUVXBSCVMBaC42niGgugubosEcRUyGGWBGGkGJhA/KlEi0dlgOZLQOQKPASOkWDLCA+wRXqRAACYeNQqUMJlCRsKCEJ2C4XhyLiWV/yQAB2IDlHoxBtHAzlCkkhtyjghQELqMVaQE9DfHaET5QucSikiaIBAo+I5MQbIbDorInMYyDrJKNiGn0pCkCSKxjJ8TDZVEno+gGYY4CwYlVG6XQCgANS06SP1NWxYS3MA0BS4w0rIDKsoyXKYHCGyMAK0hTTKjhjWeKqMzLbM4DzVhFliodS3LdE5lYZAjCkuyZNNLzbNiD8vy2HY9gOGK4pUE4zjwABBKBOGRe4OAeTrVFYEQMFYWr6oRIRTEYcoxlsNEoAxAl73+UxaGeU0RAgJFYARN8aGNSFFizKYpgsOA4HeG93iEAYMVqcscQxWxn12P4pn2a8OBEc6SnBLYtmhNBYXRbsjtoOpbggtgOHtVgAC8yC7MbDvu9RcQAA1imBIjgbMWeXBIaSQFIePSECkFoxLIPmocfL0kBOMQ7i+OC6UzM6MSWAk/Lhsov9qMQQKGWUty1PFzTjGlhk5YM1x6SVoSVblHDGVCMrinG+zZN1pIveFlTcnUpiLgZ82/O4+Qklt0ysIskA8IIlgiNYFiOCqqj+b1niqlclljfJ5iytYsxdItmora0cPPElEzQvMx28MNHBZAwFVdpUbqWpdAGgfgVqqqTEZ7RgKYKigJbmzwPVXkYTsp1IW6iZN00G9YLZgAAAR075l7AABJAA5ABRcYtW3laAH0ADFxhWgBZfetjcLZIQAEUHjhXjQDEb1YFmrHBJIedTrIAKtIXKG1Ah5IIUgxxdxBsHWWJd/JsiChXNCIVhKqx6LFI0ZBMDNwWm3Cs4IoAcF2EONqE0yB9w+oPYeo8WxJRdhVTELAODD1YEvFe69zCby2HvQ+x8z6XxvnfMAD8wCmjuP8YkKI0TP1fu/T+XYf7glZAAnWackjyFomAhSEDmIkKwFLQulhi5cTFPJVkbhfyy2gD4KyWlWAAF5WBWAANxbCsowkoTiXHuLAFsHkCxZgumgl6bowBE7522m4YYjjHSsGAFsVg/VBowFGl4zAX4fGS3ioFGwGteDpPKiUU0SdTQRKgYDYGcB+C/yqInAxQ5angmyKwGJfj2kSEVBwJAoBAgZC5miPAAArBAbg3BAA==="}
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

## `smoothTo`

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

### Several channels on one subscription

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

### `damping` accepts a function

```js
smoothTo({ x: 0, y: 0 }, { damping: (key) => (key === 'x' ? 0.9 : 0.7) });
```

It is read on **every frame and for every channel**, which matters for three reasons:

1. **A component's factor is an option**, and `$options` is a live view over attributes — so a factor captured once would freeze an attribute the framework keeps live.
2. It expresses a factor that depends on the **direction of travel**: read the current value and decide.
3. It gives one channel of a record a different rate from its neighbour.

A number stays a number.

### `precision`

Defaults to the default of the function each mode wraps — `0.01` damping, `1e-4` springing — so converting a raw `damp()` call to the helper does not move where it snaps.

## Inertia

The family a coast is built from, and what [`useDrag()`](/api/services/useDrag.html) uses:

| Function                                         | Does                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| `decayOver(retained, elapsed)`                   | the decay of an elapsed time                       |
| `inertiaDecay(dampFactor, elapsed)`              | the same with the tighter clamp a coast needs      |
| `inertiaTimeConstant(dampFactor)`                | `τ = INERTIA_FRAME / ln(1 / damp)`                 |
| `inertiaStep(velocity, dampFactor, elapsed)`     | the distance travelled across the step             |
| `inertiaFinalValue(value, velocity, dampFactor)` | where it will come to rest: `value + velocity · τ` |

**`inertiaStep()` integrates the decay across the step**, so any sequence of frames sums to `velocity · τ` exactly — a coast lands in the same place whatever the frame rate did on the way.

`inertiaFinalValue()` is what lets a carousel know which slide a fling is heading for **before** the coast starts.

## Constants

| Constant              | Value                                          |
| --------------------- | ---------------------------------------------- |
| `INERTIA_FRAME`       | `16.67` — the reference frame, in milliseconds |
| `DEFAULT_DAMP_FACTOR` | `0.85`                                         |
| `MAX_SPRING_RATIO`    | the clamp on `stiffness / mass`                |
