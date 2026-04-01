# wrap

Wrap a value within a specified range, creating a repeating cycle.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"cefdfaa43313d713b5d91cc42520dc61e6890b4bab7b26ebdc1bf3f8156c1e10","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO6lmWRkTaCYiXmEEBbAEZkKvTezBqNOvQea0TW3aW7WzpADph2mrBFJoZcrJRBQECIIiCAA6r68zLxKrCq8Rrxo+DAGicxgUBa0vHJgAOYwAHT+aMz5IcjIIBxgANb++GhoWHCIAPTtAFZwALRoEBCsdexoRXBoglASmjBlRbBE7YLirHDtmszJ7bLyRU2arCAAusdUE8xeSACcVKwwBclIACxUZaSFDKG7fndGuIgAAxUET4S7MMRkG4AXwo6GwAIIxChbzoXxALA4XD4P0UylU6hs5kMxkJjn0mysZNs9mpZBcbg8Xh88n8gWCeAi8iiMXxCSkyVSJKimWyuQyhRKb3KlWqtQaVCaLTanR6/UGw1G40m0wgs3mi2Wq3Wm22P32aEOJzOIAuV0QAFZXjUHvknohne9Pngfv5agCAEwgsFySHkIGw+E4PCEEjkVH0JhsTg8FkKWIqBy2ClGLPEyx5uyFhnuTzeX1UdkhcKRaIZ1KJQVpKQZLKU8UFYqlGVIKo1IwKgjNVodbp9AZDEZjCZTGZzZgLGBLFbsNYbLb4Ha+C1W07nd5fADszvuj3wL2lHzmPt8fv+SAAzMHwWGkIDI9QETHkfHqGik1iqa4vWhY5qSpjZtkha0hB9KuKWzIVgEQTVlyWA8vW/JJCkzYim2lgdpK3YVL2coDo0w4qmO6qTlqM66vqC6Giua6mpu5oHEce62geNwOncrrup6lzet8t5/GAALOqCL40OG742iI0CIoyZa8MAaa8NCAikHqvAAOQAAL0XOZTUROmpoEaq5wPpADcLguLi/G8MCvAPtwdm8J0vABk5viML0ACM+huR5Xk+X5YC4kFblhZ53ntLwQX+IxSCgGiDxwBIYB4D0IDQtCQA==="}
import { wrap } from '@studiometa/js-toolkit/utils';

wrap(5, 0, 3); // 2
wrap(-1, 0, 3); // 2
wrap(10, 0, 3); // 1
```

### Parameters

- `value` (`number`): The value to wrap
- `min` (`number`): The minimum value of the range
- `max` (`number`): The maximum value of the range

### Return value

- `number`: The wrapped value within the specified range

### Behavior

The `wrap` function ensures that:

- Values above `max` wrap around to the beginning of the range
- Values below `min` wrap around to the end of the range
- If `min` equals `max`, the function returns `min`
- The result is always within `[min, max)` (inclusive of min, exclusive of max)

### Types

```ts
function wrap(value: number, min: number, max: number): number;
```

## Examples

### Carousel/slider

```js twoslash
// @twoslash-cache: {"v":1,"hash":"661fb3df17df0bbf518a527d431be211ab92a4683af4fc777786157121f5e672","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO6lmWRkTaCYiXmEEBbAEZkKvTezBqNOvQea0TW3aW7WzpADph2mrBFJoZcrJRBQECIIiCAA6r68zLxKrCq8Rrxo+DAGicxgUBa0vHJgAOYwAHT+aMz5IcjIIBxgANb++GhoWHCIAPTtAFZwALRoEBCsdexoRXBoglASmjBlRbBE7YLirHDtmszJ7bLyRU2arCAAusdUE8xeSACcVKwwBclIACxUZaSFDKG7fndGuIgAAxUET4S7MMRkG4AXwo6GwAIIxChbzoXxqc14IkEpFIDzQAElMnQHLZ/BcrogAKwADjuD3yT0QAEYAExvS6fPDY3H4omwWj+WoA9kgUHgyHkRDPWHwnB4Qgkcio+jcyQTJIQMqsADKHFgbV4VPJ7y+NNF90e+CQzOZHI+czwA21evYBqF/yQAGYQWC5JKkAA2WXUBEK5HK6hovD3bw8vFgQnEqzqGwokAUr5s4EYq020XvLmheN85MesAAwO+iU0KWAkOYeWhRXpmiq0IsDhcPg/RTKVSpxz6QzGQe2YeWUlkexjsguNweLw+eT+QLBPAReRRGL9hJSZKpEdRTLZXIZQolDkVJBVGpGBpUJotNqdHr9QbDUbjSbTCCzeaLMsqzrJs2w/PsaCHCcZwZqaNpelS9J5tK9pFiAPzlpW1b+rWNpUg2YbNhGpTRqEsZYjiCZJgKU6RpmNrPDmlqMtaLIFpyjrFpRpYCphQbYRCuGIKy9ZwqGTZIkqJHtmK6reM6bCugaajGuccEsoGdq5ixNpaYWnHUFqin6vAfGIFWYp+oJULSsyBESS2kZtui5Elom/IkrOdHqayIlITpbGoQZbnUXQZm3JZNY2aJcqIo50nop2nA8MuCixCotHDkYmXZLRM6mLY87uJ43gYVQa4hOEkTROlqSJAeaRSBkWSbDkeQXqU5SVNUtQPgQzStB03R9AMQwjGMExTDMczMAsMBLCs7BrBsWz4DsvgQVBpxqZcXysgh/lMq81AceiZV3hWNwCQGLL4WJjZxcRKouZiIUeSmBXpvRwmMYdrFskF6JvWWfyXYgEXijhNkifZj1Sc9apgBqCm6iZhqqbBu1IKyml/bpgNOkZqNuqZoMAhDVk3c8dkwSI0CIguJW8MAqW8NCAikH+vAAOQAAKTb+/7MMN75jaMQFLXA3MANwuC4rnce5ya8AAvLwgKy6Icmai6aOq0amsuJ0vAAHLMEQ7D5FsqT8J40iXFALjAwK+u9s7dC8AA1Lwdrq/oKNKfA3DS7wxu++yvA+rwrx+z7RTx3LYDG2bFtWzQvDaBCdT26QjuiIroU5GrbsF+9vC9D7+jAjrxkkzwIfGzHUcR771fPPHl4gELSCgGiDxwBIYB4D0IDQtCQA"}
import { wrap } from '@studiometa/js-toolkit/utils';

let currentIndex = 0;
const totalSlides = 5;

// Navigate forward
currentIndex = wrap(currentIndex + 1, 0, totalSlides); // 1, 2, 3, 4, 0, 1...

// Navigate backward
currentIndex = wrap(currentIndex - 1, 0, totalSlides); // 4, 3, 2, 1, 0, 4...
```

### Angle wrapping

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c10ed985a2c7f5a681ac729d9dcb38aae2234250e4d28168e0155932bd946d7d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO6lmWRkTaCYiXmEEBbAEZkKvTezBqNOvQea0TW3aW7WzpADph2mrBFJoZcrJRBQECIIiCAA6r68zLxKrCq8Rrxo+DAGicxgUBa0vHJgAOYwAHT+aMz5IcjIIBxgANb++GhoWHCIAPTtAFZwALRoEBCsdexoRXBoglASmjBlRbBE7YLirHDtmszJ7bLyRU2arCAAusdUE8xeSACcVKwwBclIACxUZaSFDKG7fndGuIgAAxUET4S7MMRkG4AXwo6GwAIIxChbzoXxqcyiBXuDls/guV0Q11uGMe+CQAFY3pdPngMvl7v5agCAMwgsFySHkRDPWHwnB4Qgkcio+h4e7eek49Q2FEgAlfACMioATHcHvknogqdQaXM6djcH8wADXiBQeCuUhAXzqAjBciRdQ0Uw2JweD55IplKoZY59IZjH7bAHLLiyPZg2QXG4PF5Pb8AkEQuFItFYvFEslUoGsVlNjk8oUStSKkgqjUjA0qE0Wm1Oj1+oNhqNxpNphBZvNFstVutNtsfvs0IcTmd5e8lSrgaTNeSedSPvrvr4mf8XuzLTRuQAOW2YAWhIVymhi0ISrEM32mPHnSdIVU6+5kymL2mhKVGysmjfmjkQ7cHxZfd7SPR1Shdc9MU/cMnQVB9nh3dUX21N9lxAT81x/RAADZN05QCgRAw8kWFCCzwxSVDVg/F70QRUcMVZC51fXUl3RTDjQBAB2fCAKhIi4TtEjjydU90RYDguD4H5vTia9ZVIAMjFg0MrCjOxYJjdxPG8H5/ECYI8AieQohiH0EikbM0ikDJ80sXJ6WKUpykqapamrAhmlaDpuj6AYhhGMYJimGY5mYBYYCWFZ2DWDYtnwHZfGHUdTjvS4lRwklnxYhc2PfEB9K4pBeL/LcBL3ISD0RUTyPRC8YI02iMofbizRyrUdXeArOO/Hi+KtejgPHERoERWNdN4YAE14aEBFITteAAcgAARCjsu2YPym0C0Ze1iuAloAbhcFxOl4ABpGAYCwS97jgXhdDQaRrqkQE814FkcPe2B8lIa64BcBrDV4ABeXhngpQETrAT8wYTFhDX0YFPu+7gjt4c7rkBU7YZB8HekhmG4fB2TP2R/QvsBdHMfaT7FQpfxNqQUA0QeOAJDAPAehAaFoSAA=="}
import { wrap } from '@studiometa/js-toolkit/utils';

// Keep angles between 0 and 360 degrees
let angle = 450;
angle = wrap(angle, 0, 360); // 90

angle = -45;
angle = wrap(angle, 0, 360); // 315
```
