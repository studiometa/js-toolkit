# Easings

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4faaa0eaf7cd779d4b98f1b3419e26c3c7d0098369b41580dd1e780ff577e458","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeMLjACSYAPIBXNAGE5AI3b9EvAKJd2YAOYAxOWH5p2QgDph2AWywRSo8XCmyFytf0ogRzJ0gAnFSsMAZo+EgAjAAsVGj++jAMiCAubvJKquo+HGC4iAAMVPz4/sxmZEEAvhTo2AUExFXxdCkgLBxcfILCzhKZAIpyzFCaOnB6RiZmFmDWdg5OYgMKw6M+fgGIAEwArCFh+hHRUfGJyXjpQyNQuXoFxSCl5ZXku3u19Th4hCTkrXoTDYnB4K1cN1GjCwpAg+lI8DgmjAclsKjI3GRqPRpAW9kc/Qha1umwS2wAHE9QuFIogomdqBd2tdiRsQg8kDsSmVSBUaO9CtUALolaCNRYE3jAcEZDzZfgUGWQqC8aq8ABmsNsvAA5AABERyKAWWzJZgAegAVnAALRoCAQVgAa3YaBtRBi5oU7FYcB1AG5rNYWWh1lBGIUAHR7bj+3jm828KMAdj2PlNCSQoDaYUmQjw1pA1WqQA=="}
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
// @twoslash-cache: {"v":1,"hash":"4fd2d6ab33cceb88582a68fc5579c9dc9d596963987bc25c8e3bf2fe1b06b67a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAUS4wAkmADygtIzlxVYRLyVx2YAOYAxYWIlhuh46cvXxkgDph2AWywRSaaVl5GGN9TQYqKAgRBEQQACkIU15mKV0YAFpkoVFXKQB3djR8XiK4Xi92UlI/Cl45ERLiMl58Nn5eYpheLBqzWTg4ADpKEDg0Zn8kAEZpqlYYc2KZgFYqCdIzGAY4mTlFZTVw0Y4wXEQ5kEbJ5jEyJAAmAF8KdGxzgmbydbodkBYOFw+DkbJJAvsQspwjpDgYjFwnFZcrZ7PCTOYkaCwB5vL5/ODgqFjpForEQABZKo1UgpNLKLJSEF5UpgNAQUpocrpDIQLTSXmsshYSZoEZUcYipAAZgADPNFmZlhcpetJls/ntCVCtCdTOcHlRrqRbjRyIhnq9qO88IQSN9qL8mGxODxOu80YiXLZeABeXiMXoQfrwOCGMCCLwAIzIfB9AD5eOGo2QcT4/AFHBivZJRlEYngACrMADW8BSPT6A3K0bQ+Rgi14AAMZY3aVAm9NG3VUnA66Ryql6sp20Q2IJuslivJeMbzDAxWMNjsVgaQAslvgZgAWVWbbZ4TPOZE5+Z66WGtrGu5mgDsLzeOBtX1GNHoeBEknGQ70agAQrdiwcBEs2PMBRglKYLmmG95Q3GY5WoNV9zidI/wA3UziQAA2C8bmvbD7ytR84lte4fjfOIARdPhMBwD0QKxX1/UDYNBjDCNo1IWMEyTTjUzxDNgKPLFc1JQsSzLZgKyDKteBrOsG2bVtUnbRtO27MBezIAc6T0EcxwnKQpwCWctgXCCdmmB4AE5YMVTcLh3RC9z+Q9MTyDDzhwq5LxNe4LgADkI2iPlI+1Xz+AMbi8bYY2k1jQ0TDiyMXSVHJgtcFSVALd3VPAWKrTzsNwq9TWlLDgutEjn3IyLhWNGLTT4AqQ3Y5N7QsmYsIQ9d7KQHLnLyuIWsGIrEG8o0/LNLdrMq4jPjtF9HUo+rmEauKRsS3iUs6i4b0uXrsty5CQE2saJt8/DxplObQpqh0KP+Vb1q4+KqzazjwKXGYAtszK4MQAaNiG07KxDc6SqmpAbyCy0QqfRbavfT8AnScJ/xEQD6OEjzxW+81phVf6+qg46/jRrQMeLMaBsmq6KrhqqFpSiKnUBV1NQOPRoVQuE3OzOwgPRHHbH49MCS5mBiRAPMyUpao/Fpb9MmyAWWTZDkuXpXkAg/YRTXq0UvrSh4Hgyw6HMJsn3yCSXpdOc5acusrzRuxn5rCpbHo/TTUdhKmhc9UDjcgh4twOrLLYQ4GTt5qmachq6pS3W6EZZ5arhR5WjkpgDA4Y3HUtD7q7KVK3Btj2F0fQ09MMQP66ZdhmHzuxGHsi50gQlyEfw0LQYV7/ORckVF+dAsX8U5nuwh1El8ziRJkkHblVdA3hCmKTWKipWoh0aXgvladpOnwbpNvM/Gze8i3Vmt3ZbennOIjXM968Tl3TdT6q29Z3Ys7jvO2N3K2BDjsGyq4b4XGjkhcm/sa4vzrg3Z2/kpRBQALqGmgB8XE4tgAeF4N3UIT8KD4MIdqNAJCpBujomPLElCngCBqF4XgAByAAAuMQQUAJCNWYAAegAFZwAyGyCArBixFAyEQLcfCtDsFYHAFhABuDwHgfZfgAZjIewCwR+gDGDQY3E3ohl4AAKmMYMMx/oHhDBvFYzavAMi8GmLY7gKjsSiH/uQqmTEp5En7po4sbi1FeN7tXTGviH5EL7toQJbjRi8KQKAX4iwTA5jiJyEATwnhAA="}
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
// @twoslash-cache: {"v":1,"hash":"09933edf6d2a922b7f27e4d7327afd8598ff86255acb641b0754c36ba307675c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeMLjADyAVzQBhaQCN2/RLwCiXdmADmAMWlh+adkIA6YdgFssEUqPFwpshcv6UQI5vaQBOKqwwumj4SACMAExUaN46MAyIII7O8koqHhxguIgADFT8+N7MxmR+AL4U6NjZBMSl0XQJICwcXHwAZobGpmC8gaRYjFbaamDSVopkFLxWzLSj45Ok06TMJhALE2Tcm0sW1rb2fWRYHlAQ/AiJAJJgNAMQrGswvMy8q+u8k2gA7jBBvF+EC+EEMUDgADoPF4fIgIgBmAJBHQhJAAFmisXieH6pwC2myeRABSKJXIcPhFSqODwhBI5Aa9DwnSM616tjg7DZAEE0IwsKQIDpSPA4GpmGAMDteGMtgzPDFYQAOImBYKhRBhImKuJNDlcnq8jIEpBRYmFVZk8qVajVWl1eU0JmJflFKzxba8AVCkVwMWvSXQxUJXxhJHqpBKzGkXV4b3C0XGrKm/IW4r3U05Km2mmJOn1aiNJhsTg8Y4DIYjGWLKYzOa7WsfUwN0jS2V7Sw2OyiXFnC5XEC3e62J40V7vNamL7xP4AoEgsGQoPeBJhSLhlEajHULFNXv45OIRHm0kZxC+bOYXO1ekeJ1NFqlvjJGSpNz8wUJv0tts10j7LsjhfFw0ncKgYVXCIAFYN1RTUzR1bFEmAt90gPbJjxJS0zwiCJLztPMHTvIsXSwN0PVbL1P19f0JQwZdYTCeEoxANVN0jaNY0SeMaKTDDU1PUojygsoAF18mgGoDm7XhgDECRX1cFRplxXgyl4dpBSsXgAHIAAERGkKBTHdGIAHoACs4AAWjQCBHgAay5ayiDRMzZHYVg4B0gBuCwLBZbohC9CBOR5PkeNFPhgAsXh3niaRSF6XFGDyXg0RyNKUKU/gPx9KLuD8sAyg8UzmCQUBGiCTkhDwKyQDKMogA="}
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
