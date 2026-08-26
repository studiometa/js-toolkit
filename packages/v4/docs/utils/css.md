# CSS

```js twoslash
// @twoslash-cache: {"v":1,"hash":"886bb5b2b35b5982280b929ba9a3cce414a57dfbfbf32fdeb958821ed671c26c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALbM0pdrUZZSELHAD8iXgFk5C2gAVV67trjz2YAOYAdMO2lYIpNDP2LKIKBBEJEIABiLrJuzLwAwgDKUbzyzGBw/CHulrQAdF5ozNb+yMggdMxOrLhUAAaVAFZw9qEGjMC8cCJsMAAa2gAM6QCsFM2tpQCa3X28AL7cANz2APRzqQ09/bxdA+trfRsb3PaV5SAAukdUFsyuSACcVKU2aPhIAGxU2aTWMAwB9Z63VriIdYgET4C7MMRka4TCjobAAgjESGvOhfEAsDhcPhCUTiSRxUgJJIhZQmODaAAqBMSyVI0mMah45ksNnsjmcrnxhJp0i8Pj8eGCtLkvHC0Vi8WpIXS9ns5PwMDi+FIMAVzFo8F4EH4Is5iVYcgkUguCskCvKErg+poAGYoOUBgkoIqFXBCK5QWAnVr7OFVNlcWAHYM2prSDq4ABrGAAd140ascE1JDD7DQiZwpAAtGr2OmTGRxPBMq8cnkCkUSmUQAcavYLdzGrxaNoAIxdTYtNpjXqTGbzRYWq0wW2MNtdLC0DYTqe0Pid0qMFZ7MAHY6nEDnS6IFsAdluMHuj0QN2oFw+qPrIS8HDAAKBILBEPI253E3XImg8LZLjcTR+k91IlaUmARVGkXgAHIAAELEEKAJGkT5mDmGpMzQCAIFYCNU0zIgABY5kEcRWDgCDpi8RDsiQUAUQPOBDTwGoQAmCYgA"}
import { matrix, transform } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## Transforms

### transform

```ts
transform(props: TransformProps): string
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9a8e004351703f9dffdc3f904dd9d23844d07bb9b49a501a38f6f2dbd5cb7a95","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNKWZg4/CKQC2jLKQhY4iXgBVZ8xSoAKGrdx1wZ7MAHMAOmHbKsStNIMKlyyiCgQRBEQQADFvZndmXgBhAGVYjzkvFQA6R0ddfBhpfFIYbOZaeF4Ifl4omSTWCIkpZjySsGyAA0r5apoAZihminKwKBzsuEJSNHw5QdLHKI00Gsk+qLgRNmylct44AGsYAHdePZs4EpJSXnY0E5xSAFpC9muzMnF4FN952yDkZBA6ZhcrFwVGaoIAVnBHG1kqpgLxaDoAIwABmRfRWax0yJSAFZeABfbgAbkcAHpSYl2hEYN1GCjkVhaH0GUzeCy+BigYxsTjuI5Qc0QABdIVUKz1BiIACcVCBdnGSBl1HqthgkuoniMPllNlwiDRIBEE1kYjIivxFHQ2D1BGIZqoNHoTDYnB4lJhajM2j0mu8pk0PEs1jsjmcrjG7q1vn8gTwYRUEU2cQS0K1aTAGSyOTyBSKJ1Km2hHVq5QakhaRep3V6/UG42Go3GkxK/BmvDmCzASy2qyBJXOy12ByO8lOZAuV14N3utEeU+eY3Ybw+zC+SB+f1oAKwQN8AohUN9KkYcIRvHp6N7MCxuIJxLJFMrXSgdNRjOZ77ZjI5V+5uL5YACsKoogOKYxIAAbAATLKMDyvgioOiqap4Km3i+BwTRIDBhrGswprkPqFpWjgeCEGcHx0OqnqaC8GB8PoSRav6WgpLQAD8OhgIIygAEbjgAPrwwiwPwupQL4YGSgA7AALLB8FIIiSGkKq6q0BhurYVQRr1PhNCEYiUHEdQ1pkXa5AOlRTDqLRYz0T6TF+l6KQYJxvDcXxgnCQMMBiU0ElivM4GIAAHMpIByrYCqIBFwVqXgGCaVhiA4bpJoGUpUomZgpHBOR9rUNZwQ0TcmAMUeygsXAKScjA7mefx5xCSJfniZJwWSqFoUKdFCGIDiKkJcEdXJXqaV4QR2EQTlZn5RZlFOiVtllQ5jGGM5AYpB2NANTxTW8C1vn+TAgWgZ1Smor1MUQUNKHBDtwKRVpqU6ZNmWIJ0oX4iBIjQDaYZuLwcJoSoBICBoyi8AA5AAAlYghQBIyhqswpIQrcaAQBArDbJctxELJpKCOIrBwNDJIZmAoOwvCSJorwGA6FBDN1UiuJ9I9OiyXihJEr4KPzEgoBUXBcC1HgEIgPi+JAA"}
import { transform } from '@studiometa/js-toolkit-v4/utils';

transform({ x: 10, y: 20, scale: 1.5, rotate: 45 });
```

Builds a `transform` value from named parts, so a component composes a transform instead of assembling a string. `TransformProps` takes `x`, `y`, `z`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `scale`, `scaleX`, `scaleY`, `scaleZ`, `skew` and the rest of the family.

**The order is fixed by `TRANSFORM_PROPS`, not by the object.** Transform functions do not commute, so two components building "the same" transform from differently-ordered literals must still get the same matrix.

### matrix

```ts
matrix(props?: MatrixProps): string
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"81b21929dc65f224d0be09a2daf51f095a2493ccb8436a38e0f956e26fb0ca62","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALbM0pdrUZZSELHAD8iXgFk5C2gAVV67trjz2YAOYAdMO2lYIpNDP2LKIKBBEJEIABiLrJuzLwAwgDKUbzyzGBw/CHulrQAdF5ozNb+yMggdMxOrLhUAAaVAFZw9qEGjMC8cCJsMAAa2gAM6QCsFM2tpQCa3X28AL7cANz2APRzqQ09/bxdA+trfRsb3PaV5SAAukdUFsyuSACcVKU2aPhIAGxU2aTWMAwB9Z63VriIdYgET4C7MMRka4TCjobAAgjESGvOhfEAsDhcPg/JQqNSabR6NLGPFmZqWGz2RzOVxLX7eXz+IIhOS8cLRWLxRLJUjSWkZLI5PIFIolMogA41OoeJRNFptTpbVZykZjXqTGbzRbYxgrHZrDbbfVrPZgA7HU4gc6XRC9G4gO7WB7PV4XD6o7FeDhgAEAJioILBEPIgOhsJweEIJHIyPoTFxOFcGD4hIMxPU6WVHS0vDAgmkACMyLwAD68YSwfj/KBeHx+PAAFXwMEGbV4kjiTd4tFZtHYcHSvAAIjB+MxBKw0HA4hBeOUAIzlTJnN5fJ4ADluMHuj0QL2ors+eEz7U9/yQfuBoNI4JowauoeocIjiOj1BRcZMZEwyelaf7nLgVg5CzbRcwLItS3LEcqxrBkG07ACgPEdt2weZtu2YXt+yHEcxwnKc0BncoukXLwrS+AB2O0HSdRA5yBN43TwRDgJPP5vXPf0rxvSFEB9LoJgtERoHhKkXDcJpsUmARVF5AByAABCxBCgCRpE+Zg5hqABaQiIFYABrdg0G0ogABY5kEcRWDgOTZjAKU0kaFtSgVP04mvRIkI6bR6PVaYvHU7IkFAFEtzgCQwDwGoQAmCYgA==="}
import { matrix } from '@studiometa/js-toolkit-v4/utils';

matrix({ scaleX: 2, translateX: 10 });
```

A `matrix()` string. Reach for it when a value has to be interpolated as a matrix rather than as separate functions.

### TRANSFORM_PROPS

```ts
const TRANSFORM_PROPS: readonly (keyof TransformProps)[];
```

The ordered list of keys `transform()` reads.

## Measuring

### getOffsetSizes

```ts
getOffsetSizes(element: HTMLElement): { x, y, width, height, top, right, bottom, left }
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"6b3a38fc5042034b07f2c8ce5c33d71651b4154ca7df0ac1d67a6c1c549960a0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAOYw0AeX784cgMrsAXvEYxWMALYwwaRLwASAFQCyAGQCiew8e6nFytZvgAdMO31YIUjQZOTcVNHUtBCooCBEERBArGC5BUhheZildAyM0AHI4XgAjCFpMotZmDAhBYKwqkRgoXnY0Cl4Adzb8XhgSUgxeNFIsuH5A/V5JVuCsqB8ZtqKsprg0QKL2aUh0lsAUAi78ZmCAA1k0ACFasCh2MGkAYQ48gCUYMUZuU67a1haxp0yK1+D5IGh8PdpF0yBkRmMJqRDFAAHS8R4QQJ3MAneCZdLDfAZIjsGCdAJBQodLiEk68QwQ6CFFE+HwAQV4WDSGXSzCgpghGREbD0pGmnTARUFnOOKlmvGOWBwktaYBRlBA62YQSQAE4qHoHhCkABGAAsVDQ2oueAuYQ8UQ1HDAuEQAAYqCJjqMxGQ9QBfCjobCugjEP2WugMRIiSTrEplVxKcKReAarU6xAAdgAzAajNJjYg89RrXI8KVaE77q6AEye73MX3kRAANkDwZweEIAw1NHoTDYnB4IQUyYd2hyThM5ms9kceRcvHtEU8cB8fgpwTt49XjpicQSSRScG5mWyC+MhQT5RpVRqdU5jWasw63QhfQGQ3hksRUyWcy3IsUjLOeawbKQWw7IEL6HJ0xxnBc1zCNiTwvMY7yfN8vyCP855wECYrsKCYDgpCDwwgSP7jJMzRohiWL3LiKxUUSvAkmSW5UhUtLBAyhBQMyrJgByXIEry/KEkKIrAhAEpSmxWCyhkbQKswSpGFsarplamZZvqICGoW+CmhapakDaiQ7u4e5pgaNZIPWIBetqTY0C2Jq1h21Aht24bkJGA6JEQ2q8LEIiCNOpgACJxJFeQauFR4AFTJac3S3HJKLhfFxinKlvDpGgaQqswhUwPwsKiHCEBSWFcXTrwsbGMwNYtPcdUZbEnQsmAPjIFY0UAHK8O8lXpNVAC6jD4GgaBYHAiAAPRLbAJCsBAOCkCi+gQBo7CsFUKKBNIq2HktADqMDFEtbIAAoAJKXfc3VnRF07cDp2rRrqZlGUWAAclpltGIA5dO1Yuo5Dauc2jlZt5mBdokPYRtQUZMFgpCbWQmB8LF715CipRQBgpiWLYDi5MYiWHngFhsalpwE7laDE9AGD5clnLY1tmDlVj8B5ApGQADwkxgAB80xiqL/CjIY4TS5AsDTPwdURaQE3BODeQdIEvBgLhrAgobtWnl6fSXsEdDsOscC9f1g0jWNVVNNNs3zYtK1rboOPbbt+2Hcwx0WW9cCXddt2PUtLPTktEufVQGbRiabolv9JmIGZumWSAEuQ3WMM+u5SA5u2k2etAoaboEwTAKOK6pkU/oCNjUz5AAAusgh3BADLMEtABWcAALQbBArAANZtKPRBmktdQHXA+QANzCc18aVrwAC8je7s3jC68Y7Ok9wq8agPSCgFGmkSGAeAjyA/r+kAA"}
import { getOffsetSizes } from '@studiometa/js-toolkit-v4/utils';

const box = getOffsetSizes(document.body);
```

The element's box from its **offset** properties rather than from `getBoundingClientRect()` — so a transform the component itself applied does not move the measurement.

That is exactly what a drag or a tilt needs: the layout box is the frame of reference, and the transform is the output.

::: tip It is a layout read
Call it from the `read` phase — [`$read()`](/api/instance-methods.html#read-and-write) — so it batches with every other measurement of the frame.
:::

## Applying

### setClassesOrStyles

```ts
setClassesOrStyles(
  el: HTMLElement,
  value: string | string[] | Partial<CSSStyleDeclaration> | undefined,
  method?: 'add' | 'remove',
): void
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"922eff9993f504dc1ead2fb24a0c4110ba1104c8ee56fa19ef3fe0d7208624ab","data":"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="}
import { setClassesOrStyles } from '@studiometa/js-toolkit-v4/utils';

const el = document.body;

setClassesOrStyles(el, 'is-active'); // a class
setClassesOrStyles(el, ['is-active', 'is-open']); // several
setClassesOrStyles(el, { opacity: '0' }); // inline styles
setClassesOrStyles(el, 'is-active', 'remove'); // undo it
```

Applies a value that may be **either** classes or inline styles, which is what lets [`transition()`](./transitions.html) take one option in both forms.

An `undefined` value does nothing, so a caller with an optional state does not have to branch.

## What is not here

`addClass`, `removeClass`, `toggleClass`, `addStyle`, `removeStyle` and `animate` are not shipped. `el.classList` and `el.style` say the first five, and time-based playback belongs to the separate `ui-animation` package.
