---
outline: deep
---

# withScrolledInView

Use this decorator to create a component with a hook to easily create animation based on the vertical scroll position.

## Usage

```js {1,3,11-13} twoslash
// @twoslash-cache: {"v":1,"hash":"65369f09048783f2db1b24fc47055b63c398c784647105a107f4280bee52e4df","data":"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"}
import { Base, withScrolledInView } from '@studiometa/js-toolkit';

class Component extends withScrolledInView(Base, { rootMargin: '100%' }) {
  static config = {
    name: 'Component',
  };

  /**
   * @param {import('@studiometa/js-toolkit').ScrollInViewProps} props
   */
  scrolledInView(props) {
    console.log(props.progress.y);
  }
}
```

:::tip Info
This decorator uses the [`withMountWhenInView`](./withMountWhenInView.html) decorator under the hood.
:::

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `options` (`IntersectionObserverInit & { useOffsetSizes?: boolean }`):
  - `options[key:string]`: Options for the `IntersectionObserver` used by the `withMountWhenInView` decorator
  - `options.useOffsetSizes` (`boolean`): when `true`, uses the [`getOffsetSizes(el)` function](/utils/css/getOffsetSizes.html) instead of the `el.getBoundingClientRect()` to get the element sizes

### Return value

- `BaseConstructor`: A child class of the given class which will be mounted when visible and destroyed when invisible and trigger a `scrolledInView` hook

## API

### Options

Options available through the HTML API with `data-option-*` attributes.

#### `dampFactor`

- Type: `number`
- Default: `0.1`

See the [`dampFactor`](#dampFactor-1) instance property below.

#### `dampPrecision`

- Type: `number`
- Default: `0.001`

See the [`dampPrecision`](#dampPrecision-1) instance property below.

#### `offset`

- Type: `string`
- Default: `start end / end start`

Defines the limits used to calculate the progress of the scroll. The value is a string composed of two parts separated by a slash (`/`). Each part defines the point on which the progress calculation should be based.

```
<targetStart> <viewportStart> / <targetEnd> <viewportEnd>
```

The default value `start end / end start` could be read as : calculate the progress of the target from when the **start** of the target crosses the **end** of the viewport to when the **end** of the target crosses the **start** of the viewport.

Each point accepts the following values:

- A **number** between `0` and `1`
- A **named string**, either `start`, `end` or `center` which will be mapped to values between `0` and `1`
- A **string** representing a CSS value with one of the following unit: `%`, `px`, `vw`, `vh`, `vmin`, `vmax`

<PreviewIframe src="./withScrolledInView/demo.html" />

### Instance properties

#### `dampFactor`

- Type `number`
- Default `0.1`

The factor used by the [`damp` function](/utils/math/damp.md) for the `dampedProgress` values. It can be configured by defining a `dampFactor` property in the class using this decorator:

```js {8} twoslash
// @twoslash-cache: {"v":1,"hash":"5444eca893699ff6493eeaa052ad320e39fce3776aebcb4c2aaef1887b98be3f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4AMr8TSsYZQACSYAAauwYF9JH85PQRkoHN49F5JF5DNpjMZGF4AMK+OCIXiYHAQJ4oii8LRoD5wAD8JIA6r8AUCQeCoTCAPJYOkQMA8EleAAiMH4tmYuVIklZ43Z+U5kOhX3B+yeuxg1L+1Pl/0BSpgYJVMKxJnMVhsdm+bMNwONXNVThcbjwAEEoFBeHB7SDeOxPkRVQJmswAEbsDh0+CkiC8ZgCao2MAjYpBULhSLROJUBJJYlpTI5PIFIolcqVaq1Zj1GCNZqtWCS0jS2xwFI/BV+x2mr7+BKWVgdLogHp9RAARgArEMRmMJlOABwzXrzBgeLsGjm97lfZaB1YbEBbHZ7a5T6cnM44PCEEjkGa3DyCYS8fHJwVppzjjcAdmmKJ53GAZVzmBYPA/awvzABghkPJAACZNm2VtzwOAA2a9qHOO8rkfahnxAFgOC4Pgt0VB0TT3DEJFo1RzRxPEJEJYQSTJGAKSpGl+XpJleH1SjlT3PkBSFbgRQkcUWzbWVBJ7ajVXVMhNX4bUUXo9RNGxPU7R3RSzW0i0LGgm0KIUp0YRdVx3BAT1vV9fSAyDEN+DDSNo2hERcgTJNoNTWDAlXMIkAiKJA1zAhEmSItslyfJCmKUoKiqGo6gaJoWhSZspRlDtzP0yz+0HYdOm6WYN36ZCgNGEDlzA9c8AKo0DP3eDUyQlCz32JDJmwji8IfG56DuUjHlfPwNNkeQkWUAwjN4NF5qMMwTOtewlioV1bK8HxhCC6hM1C7MIviaLCwyOLS0SisUurdL60y1oR3K3oN0nD651qxdANmRqPE28KOsQarTzQnrEEmABmfrcI8e9rifEaPEYLBtLITA+CglM038SUwCedgQhJYBzF4cneDAZgahJUpSEDEIAG5zCOH8KqQSdEJXGqFyQDCGogk9BUJkID2BqGuvBi9jlOHDb3h/Dho3Yi0a0DGMD4KmaZ9NB6dGNm3o56Gvt5yGBeVrXcHa1ZALB3YIb62WBoVoakeV1H0bsDX30/ALiigamsAAMXt2wSTAMpLHDRGx3Zqc/2PYZvo548/sFgPrBDvZbDF1Y/0l+2L0Qo5R0lWA8CtWx7GAbjmqooreCOZ5NEsXgAHIAAFkqrNLmEuksEqKNvmbAcwJpEbGYPsGbFBEOvhNVZjVD4UnPh16V2H4JMCaJxbeFXinKepmASTbye/bbigycbkfr4z4PQ9IPe1n8ScR9Zqhe6QUAZ7gD48EyCAI4RwgA=="}
import { Base, withScrolledInView } from '@studiometa/js-toolkit';

class Component extends withScrolledInView(Base) {
  static config = {
    name: 'Component',
  };

  dampFactor = 0.1;
}
```

#### `dampPrecision`

- Type `number`
- Default `0.001`

The precision used by the [`damp` function](/utils/math/damp.md) for the `dampedProgress` values.

```js {8} twoslash
// @twoslash-cache: {"v":1,"hash":"bd248c2469bedc3a99cade415a6b818b6b17dccbcf148f5cfd8993d9e2261eb9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4AMr8TSsYZQACSYAAauwYF9JH85PQRkoHN49F5JF5DNpjMZGF4AMK+OCIXiYHAQJ4oii8LRoD5wAD8JIA6r8AUCQeCoTCAPJYOkQMA8EleAAiMH4tmYuVIklZ43Z+U5kOhX3B+yeuxg1L+1Pl/0BSpgYJVMKxJnMVhsdm+bMNwONXNVThcbjwAEEoFBeHB7SDeOxPkRVQJmswAEbsDh0+CkiC8ZgCao2MAjYpBULhSLROJUBJJYlpTI5PIFIolcqVaq1Zj1GCNZqtWCS0jS2xwFI/BV+x2mr7+BKWVgdLogHp9RAARgArEMRmMJlOABwzXrzBgeLsGjm97lfZaB1YbEBbHZ7a5T6cnM44PCEEjkGa3DyCYS8fHJwVppzjjcAdmmKJ53GAZVzmBYPA/awvzABghkPJAACZNm2VtzwOAA2a9qHOO8rkfahnxAFgOC4Pgt0VB0TT3DEJFo1RzRxPEJEJYQSTJGAKSpGl+XpJleH1SjlT3PkBSFbgRQkcUWzbWVBJ7ajVXVMhNX4bUUXo9RNGxPU7R3RSzW0i0LGgm0KIUp0YRdVx3BAT1vV9fSAyDEN+DDSNo2hERcgTJNoNTWDAlXMIkAiKJA1zAhEmSItslyfJCmKUoKiqGo6gaJoWhSZspRlDtzP0yz+0HYdOm6WYN36ZCgNGEDlzA9c8AKo0DP3eDUyQlCz32JDJmwji8IfG56DuUjHlfPwNNkeQkWUAwjN4NF5qMMwTOtewlioV1bK8HxhCC6hM1C7MIviaLCwyOLS0SisUurdL60y1oR3K3oN0nD651qxdANmRqPE28KOsQarTzQnrEEmABmfrcI8e9rifEaPEYLBtLITA+CglM038SUwCedgQhJYBzF4cneDAZgahJUpSEDEIAG5zCOH8KqQSdEJXGqFyQDCGogk9BUJkID2BqGuvBi9jlOHDb3h/Dho3Yi0a0DGMD4KmaZ9NB6dGNm3o56Gvt5yGBeVrXcHa1ZALB3YIb62WBoVoakeV1H0bsDX30/ALiigamsA0CV2DgD4STAMpLHDRGx3Zqc/2PYZvo5iXDvA5WA+sYP+FDj4xdWP9Jfti9EKOUdJVgPArVsexgG45qqKK3gjmeTRLF4AByAABZKqzS5hLpLBKik75mwHMCaRGxmD7BmxQREb4TVWY1Q+FJz4deldh+CTAmicW3gN4pynqZgElO5nv3O4oMmW/Hu+s6D0gQ7DwVD7Wfw1jWSdx9ZqgB5IFAPPN+YA8CZBAEcI4QA="}
import { Base, withScrolledInView } from '@studiometa/js-toolkit';

class Component extends withScrolledInView(Base) {
  static config = {
    name: 'Component',
  };

  dampPrecision = 0.001;
}
```

### Custom hooks

#### `scrolledInView`

The `scrolledInView` class method will be triggered for each frame of the component being in the viewport.

**Arguments**

- `props` (`{ start: Point, end: Point, current: Point, progress: Point }`): Values corresponding to the progress of the component's root element in the viewport.
  - `props.start` (`{ x: number, y: number }`): The scroll position were the element starts to be visible.
  - `props.end` (`{ x: number, y: number }`): The scroll position were the element is not visible anymore.
  - `props.current` (`{ x: number, y: number }`): The current scroll position, clamped in the `props.start` and `props.end` range.
  - `props.dampedCurrent` (`{ x: number, y: number }`): The current values smoothed with the [`damp` function](/utils/math/damp.md)
  - `props.progress` (`{ x: number, y: number }`): The progress of the element between `props.start` and `props.end` mapped to a `0–1` range.
  - `props.dampedProgress` (`{ x: number, y: number }`): The progress values smoothed with the [`damp` function](/utils/math/damp.md).

## Examples

### Implement parallax

```js {16-19} twoslash
// @twoslash-cache: {"v":1,"hash":"550db0f3fc4f3e9fa80973a64c621231eeabe7b192af7820d4c3a1e0e202095e","data":"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"}
import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import { map, transform } from '@studiometa/js-toolkit/utils';

export default class Parallax extends withScrolledInView(Base) {
  static config = {
    name: 'Component',
    options: {
      speed: Number,
    },
    refs: ['target'],
  };

  /**
   * @param {import('@studiometa/js-toolkit').ScrollInViewProps} props
   */
  scrolledInView({ progress }) {
    const y = map(progress.y, 0, 1, -100, 100) * this.$options.speed;
    transform(this.$refs.target, { y });
  }
}
```

:::tip Info
Apply transformations to refs instead of the root element. The decorator uses the [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) function to calculate the props values and it does not reverse any transform applied.
:::
