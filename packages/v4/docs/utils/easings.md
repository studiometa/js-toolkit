# Easings

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4faaa0eaf7cd779d4b98f1b3419e26c3c7d0098369b41580dd1e780ff577e458","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeMLjACSYAPIBXNAGE5AI3b9EvAKJd2YAOYAxOWH5p2QgDph2AWywRSo8XCmyFytf0ogoEfgiIIJ7qYhIAtHrhEAoAdD5ozPqByMggHGAA1j74aGhYcIgA9EUAVnDhaBAQrJnsaOFEACyxInJQFrYwibGwREUK7KxwRS56ybG5tqwAxC4wejFo/KrqIAC661QizE5IAJxUrDAGaPhIAIxNVImk+t1489LySqveR3q4iAAMVPz4u2YZjIBwAvhR0NgvgRiCCbnQGEEWBwuHxBMJnBIXgBFOTMKCaHRwcbGUzmKw2eyOTGuHF4qA+PwBPC4/GkZjmfhhVzROIJJIpNIZbJUXL5QolcqVaq1eqNFptDoQLo9PoDczDUa6AxwSZoaZzCRLACO9I2WxAOz2iAATABWI4nfRnS4XG67e6IkDzOn4nwZL6/ED/QHA8i2u3gyE4PCEEjkeH0JhsTg8bkwX1QRhYUgQfSkeCFXhgOS2FRkbiaEtlsjWOwOJzpzOM/yBECsqDsznp3loeLu5JIVLpPQigh5ArFMoVKo1OoNZqtNDtTrdZi9GD9QaasY6vUG+Yms2bba3READiDx1O50QFzd1A9DyCPoUHf9nyQNr+APZYaQ3yghagiwHg9bUrwwDps8HhvBQTZvvSvCgrwABmua2LwADkAACiqrok07SnOcrNOqQxwFhADc1jWK+aAdow3yxHa3BUbwJS8MxADsdo+CqzBIKACInMSQh4OUICgqCQA=="}
import { easeInOutCubic, easeOutQuad } from '@studiometa/js-toolkit-v4/utils';

easeOutQuad(0.5); // 0.75
```

An `EasingFunction` takes a `0 → 1` progress and returns a shaped `0 → 1` value.

[[toc]]

## Choosing one

Eight curves, three directions each. Every `out` and `in-out` is derived from its `in`.

| Curve  | In                            | Out                             | In-out                              |
| ------ | ----------------------------- | ------------------------------- | ----------------------------------- |
| linear | [`easeLinear`](#easelinear)   | —                               | —                                   |
| quad   | [`easeInQuad`](#easeinquad)   | [`easeOutQuad`](#easeoutquad)   | [`easeInOutQuad`](#easeinoutquad)   |
| cubic  | [`easeInCubic`](#easeincubic) | [`easeOutCubic`](#easeoutcubic) | [`easeInOutCubic`](#easeinoutcubic) |
| quart  | [`easeInQuart`](#easeinquart) | [`easeOutQuart`](#easeoutquart) | [`easeInOutQuart`](#easeinoutquart) |
| quint  | [`easeInQuint`](#easeinquint) | [`easeOutQuint`](#easeoutquint) | [`easeInOutQuint`](#easeinoutquint) |
| sine   | [`easeInSine`](#easeinsine)   | [`easeOutSine`](#easeoutsine)   | [`easeInOutSine`](#easeinoutsine)   |
| circ   | [`easeInCirc`](#easeincirc)   | [`easeOutCirc`](#easeoutcirc)   | [`easeInOutCirc`](#easeinoutcirc)   |
| expo   | [`easeInExpo`](#easeinexpo)   | [`easeOutExpo`](#easeoutexpo)   | [`easeInOutExpo`](#easeinoutexpo)   |

## Deriving one

```ts
createEaseOut(easeIn: EasingFunction): EasingFunction
createEaseInOut(easeIn: EasingFunction): EasingFunction
```

Every `out` and `in-out` above is one of these applied to its `in`. Which means a custom curve gets its whole family for two lines:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4fd2d6ab33cceb88582a68fc5579c9dc9d596963987bc25c8e3bf2fe1b06b67a","data":"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"}
import {
  createEaseInOut,
  createEaseOut,
  type EasingFunction,
} from '@studiometa/js-toolkit-v4/utils';

const easeInBack: EasingFunction = (progress) => progress * progress * (2.7 * progress - 1.7);

const easeOutBack = createEaseOut(easeInBack);
const easeInOutBack = createEaseInOut(easeInBack);
```

That is why only the eight `in` functions are written out and the other sixteen are derived: an `out` is an `in` run backwards, and writing it twice is how the two drift apart.

### createEaseOut

```ts
createEaseOut(easeIn: EasingFunction): EasingFunction
```

Mirror an `in` curve into its `out`.

### createEaseInOut

```ts
createEaseInOut(easeIn: EasingFunction): EasingFunction
```

Compose an `in` curve into its symmetric `in-out`.

## Using one

```js twoslash
// @twoslash-cache: {"v":1,"hash":"09933edf6d2a922b7f27e4d7327afd8598ff86255acb641b0754c36ba307675c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeMLjADyAVzQBhaQCN2/RLwCiXdmADmAMWlh+adkIA6YdgFssEUqPFwpshcv6UQUCPwSIQrlTEJAFoIWQA6DzRmHV9kZBAOMABrD3w0NCw4RAB6HIArOGC0CAhWZPY0YKIAFnCRaShTKxho8NgiHNl2Vjgcx21Y8PSrVgBiRxgwtH4lFRAAXQWqEWZ7JABOKlYYXTR8JABGACYqaNIdVrxJmXk5923tXEQABip+fDXmYzJNgF8KOhsM8CMRfmc6Aw/CwOFw+AAzQzGUxgXg7UhYRhWbRqMDSKyKMgUXhWZi0XH4wmkYmkZgmCAUglkbiMqkWay2exoshYDxeHx4ACSYBoGLKdJgvGYvFp9N4hLQAHcYLteEqIPKwmAoHBImcYnEEklUlR0plsnlCsVSuVKtU6g0mhAWm0Ol0TL0cqT9sM0KMxujeUsVucoccAMzbXY6fZIGr6i5XPyBjxJZ5vEAfL4/ciICMAoE4PCEEjkCH0PCIoz01G2OCVFEAQTQjCwpAgOlI8GyUrAGBZvDxTLLIFW60QAA4Mzs9gdEIcM+dLlCQHWG0Jm6mnkhTpnPrSc/9AdRgcWwSOaBXoVgvi7mbw2x2u3Ae8w+x4x1CNoco7OkBOE2XPBH07bstzAZ5dyzA9RR3F4CxPIs/BLcFqEhJg2E4HhuQxLEcUHSkiRJMlWSI2VTFI0gByHNlLBsOxRBTKh+V8EBhVFWxWAlKUZTpUx5VaZVVXVTVDB1PVqANJB4kSbQTQIDIslyAoihKMoKiqWp6jQRpmlaZh2hgTpuk9b18F9f0U2DUdQyOE5fxjOd40kxMVyY2SIKQSM92zWDEA2BDMCQ0FSyidDoUwuEgicW4An4Vt21Al9KOowjSHZeiuRuFx7j5bxWLi6KYFCCIoiklAjTktJFItFTrXUu0tMdPTXSM90ej6AZdF1EZxkmaZZjcRZlhstYoROABWBzY3nXclyTEBsruIbHk8xBvOg74/OOY5AtPZDzzCq8QFbW9WnvEDn1fd8QzGo5wwAxJoxmx75pXS6wNW54Nv3LbfnWia/hGwRYDwDkGN4YAiti+5iUDXg/l4eF2ysXgAHIAAFmudfS6rU21NJqdrejRgBuCwLCrZEhAfCB6xrZsEqfbs+GACxeBlVppFIVFA0YN5eBqF4BaWuKmaSnhuHJsA/g8F1mCQUBIV2eshDwQoQD+P4gA=="}
import { easeOutCubic, lerp } from '@studiometa/js-toolkit-v4/utils';

function positionAt(progress) {
  return lerp(0, 400, easeOutCubic(progress));
}
```

An easing shapes a **progress**, so it pairs with a value that already runs `0 → 1`: a [`useScrollProgress()`](/api/services/useScrollProgress.html) subscriber, or a `map()` of anything else.

## They do not animate

There is no clock here — an easing is a pure function of a progress you already have.

- For a value chasing a target frame by frame, use [`damp()` or `smoothTo()`](./motion.html).
- For time-based playback, stagger and sequencing, that is the separate `ui-animation` package. `tween` and `animate` are not shipped.

## The functions

Each takes a `0 → 1` progress and returns the shaped value.

### easeLinear

```ts
easeLinear(progress: number): number
```

The identity. It exists so a call site can name "no easing" rather than branch on `undefined`.

### easeInQuad

```ts
easeInQuad(progress: number): number
```

### easeOutQuad

```ts
easeOutQuad(progress: number): number
```

### easeInOutQuad

```ts
easeInOutQuad(progress: number): number
```

### easeInCubic

```ts
easeInCubic(progress: number): number
```

### easeOutCubic

```ts
easeOutCubic(progress: number): number
```

### easeInOutCubic

```ts
easeInOutCubic(progress: number): number
```

### easeInQuart

```ts
easeInQuart(progress: number): number
```

### easeOutQuart

```ts
easeOutQuart(progress: number): number
```

### easeInOutQuart

```ts
easeInOutQuart(progress: number): number
```

### easeInQuint

```ts
easeInQuint(progress: number): number
```

### easeOutQuint

```ts
easeOutQuint(progress: number): number
```

### easeInOutQuint

```ts
easeInOutQuint(progress: number): number
```

### easeInSine

```ts
easeInSine(progress: number): number
```

### easeOutSine

```ts
easeOutSine(progress: number): number
```

### easeInOutSine

```ts
easeInOutSine(progress: number): number
```

### easeInCirc

```ts
easeInCirc(progress: number): number
```

### easeOutCirc

```ts
easeOutCirc(progress: number): number
```

### easeInOutCirc

```ts
easeInOutCirc(progress: number): number
```

### easeInExpo

```ts
easeInExpo(progress: number): number
```

### easeOutExpo

```ts
easeOutExpo(progress: number): number
```

### easeInOutExpo

```ts
easeInOutExpo(progress: number): number
```
