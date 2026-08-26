# Easings

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a956aa16cb3fd8352b972adec18a93e580a7ae6d888f1889d826ef650f2d04c3","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeMLjACSYAPIBXNAGE5AI3b9EvAKJd2YAOYAxOWH5p2QgDph2AWywRSo8XCmyFytf0ogoEfgiIIJ7qYhIAtHrhEAoAdD5ozPqByMggHGAA1j74aGhYcIgA9EUAVnDhaBAQrJnsaOFEACyxInJQFrYwibGwREUK7KxwRS56ybG5tqwAxC4wejFo/KrqIAC661QizE5IAJxUrDAGaPhIAIxNVImk+t1489LySqveR3q4iAAMVPz4u2YZjIBwAvhR0NgvgRiCCbnQGEEWBwuHxBMJnBIXgBFOTMKCaHRwcbGUzmKw2eyOTGuHF4qA+PwBPC4/GkZjmfhhVzROIJJIpNIZbJUXL5QolcqVaq1eqNFptDoQLo9PoDczDUa6AxwSZoaZzCRLACO9I2WxAOz2iAATABWI4nfRnS4XG67e6IkDzOn4nwZL6/ED/QHA8i2u3gyE4PCEEjkeH0JhsTg8bkwX1QRhYUgQfSkeCFXhgOS2FRkbiaEtlsjWOwOJzpzOM/yBECsqDsznp3loeLu5JIVLpPQigh5ArFMoVKo1OoNZqtNDtTrdZi9GD9QaasY6vUG+Yms2bba3REAdnPjtO50QFzd1A9DyCPoUHf9nyQNr+APZYaQ3yghagiwHg9bUrwwDps8HhvBQTZvvSvCgrwABmua2LwADkAACiqrok07SnO9TqkMcBYQA3NY1ivmgHaMN8sR2twlG8CUvBMeedo+CqzBIKACInMSQh4OUICgqCQA="}
import { easeInOutCubic, easeOutQuad } from '@studiometa/js-toolkit/utils';

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
// @twoslash-cache: {"v":1,"hash":"59fba6dcb054e125b3c9770644ff139eef059cdeed215cc36173e8051181f189","data":"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"}
import { createEaseInOut, createEaseOut, type EasingFunction } from '@studiometa/js-toolkit/utils';

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
// @twoslash-cache: {"v":1,"hash":"b8a037c46416bb34c24294bbce3764d2264b57b2184fd766128742b9ee4b7670","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeMLjADyAVzQBhaQCN2/RLwCiXdmADmAMWlh+adkIA6YdgFssEUqPFwpshcv6UQUCPwSIQrlTEJAFoIWQA6DzRmHV9kZBAOMABrD3w0NCw4RAB6HIArOGC0CAhWZPY0YKIAFnCRaShTKxho8NgiHNl2Vjgcx21Y8PSrVgBiRxgwtH4lFRAAXQWqEWZ7JABOKlYYXTR8JABGACYqaNIdVrxJmXk5923tXEQABip+fDXmYzJNgF8KOhsM8CMRfmc6Aw/CwOFw+AAzQzGUxgXg7UhYRhWbRqMDSKyKMgUXhWZi0XH4wmkYmkZgmCAUglkbiMqkWay2exoshYDxeHx4ACSYBoGLKdJgvGYvFp9N4hLQAHcYLteEqIPKwmAoHBImcYnEEklUlR0plsnlCsVSuVKtU6g0mhAWm0Ol0TL0cqT9sM0KMxujeUsVucoccAMzbXY6fZIGr6i5XPyBjxJZ5vEAfL4/ciICMAoE4PCEEjkCH0PCIoz01G2OCVFEAQTQjCwpAgOlI8GyUrAGBZvDxTLLIFW60QAHYJ1G9gdEIcM+dLlCQHWG0Jm6mnkhTpnPrSc/9AdRgcWwSOaBXoVgvi7mbw2x2u3Ae8w+x4x1CABxfmcxue/tQazLngj6dt2W5gM8u5Zgeoo7i8BYnkWfgluC1CQkwbCcDw3IYliOKDpSRIkmSrIkbKpjkaQA5Dmylg2HYogplQ/K+CAwqirYrASlKMp0qY8qtMqqrqpqhg6nqQGxEg8SJNoJoEBkWS5AURQlGUFRVLU9RoI0zStMw7QwJ03Set6+C+v6KbBqOoZHC8WyJNGsaIPGQGJiuLHyVBSCRnu2bwYgGxIZgKGgqWUSYdC2FwkETi3AE/Ctu24EvtRtHEaQ7KMVyNwuPcfLeOxSXxTAoQRFEBqyUaClpMpFpqdaml2jpjoGa6Jnuj0fQDLouojOMkzTLMbiLMsdlrFCJy7jss5HLuS5JiA+V3GNjy+Yg/mwd8QXHMcoWnqh55RVeICtrerT3mBz6vu+IZTUc4YAKx/q5gFLSuN0QRtzzbfuu2/Ftz1/BNgiwHgHJMbwwBlYl9zEoGvB/Lw8LtlYvAAOQAALtc6hlNRptpoN1vSYwA3BYFhVsiQgPhA9Y1s2KVPt2fDABYvAyq00ikKigaMG8vA1C8QurUlLNpTw3CU2AfweC6zBIKAkK7PWQh4IUIB/H8QA==="}
import { easeOutCubic, lerp } from '@studiometa/js-toolkit/utils';

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
