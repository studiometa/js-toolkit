# CSS

```js twoslash
// @twoslash-cache: {"v":1,"hash":"886bb5b2b35b5982280b929ba9a3cce414a57dfbfbf32fdeb958821ed671c26c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALbM0pdrUZZSELHAD8iXgFk5C2gAVV67trjz2YAOYAdMO2lYIpNDP2LKIKBBEJEIABiLrJuzLwAwgDKUbzyzGBw/CHulrQAdF5ozNb+yMggdMxOrLhUAAaVAFZw9qEGjMC8cCJsMAAa2gAM6QCsFM2tpQCa3X28AL7cANz2APRzqQ09/bxdA+trfRsb3PaV5SAAuhQFHGAA1l74aGjqiAs1ALRoEBCsF+xoT0QALOkWQRQCTSGDZdKwIhzQTiVhwOZ+ODpG7SVgAYnqniOJxAFmYriQAE4qKUbGh8EgAGxUbKkaxgvCY2hec64RDrEAifD45hiMhEiYUdDYNkEYj8ml0BgBFgcLh8ISicSSOKkBJJELKExwbQAFTViWSpGkxjUPHMlhs9kczlcqvVRukXh8fjwwWNcl44WisXihpC6Xs9l1+BgcXwpBgYeYtHgvAg/C99sSrDkEik+LDkjD5T9cFTNAAzFBygMElBw2G4IRXNywBWE/ZwqpssqwGXBm146Qk3ALjAAO68AdWODxkg9r5jnCkJ4x9jTkxkcTwTI0nJ5ApFEplEAHGr2POOxq8WjaACMXU2LTaY16kxm80WeYLMGLjEvXSwtA239/tD4G9SkYFY9jAA5jlOEBziuKgbjuHVHjgF43g+L4fn+QFgQgUFwUhaFYXhRFkTQVE0SPEJjhxPECUQc8AHYSRgMkKUQYlqHxelpWoA0NWNFkrDZDkuR5PlyDo+iJhxERoFFG0XDcJomQGCjjUmARVGkXgAHIAAEsJBMFmDmZ5XneT5vj+Aj2DhbTpi8XDmCQUApWYuB0zwGoQAmCYgA"}
import { matrix, transform } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## Transforms

### transform

```ts
transform(props: TransformProps): string
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9a8e004351703f9dffdc3f904dd9d23844d07bb9b49a501a38f6f2dbd5cb7a95","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNKWZg4/CKQC2jLKQhY4iXgBVZ8xSoAKGrdx1wZ7MAHMAOmHbKsStNIMKlyyiCgQRBEQQADFvZndmXgBhAGVYjzkvFQA6R0ddfBhpfFIYbOZaeF4Ifl4omSTWCIkpZjySsGyAA0r5apoAZihminKwKBzsuEJSNHw5QdLHKI00Gsk+qLgRNmylct44AGsYAHdePZs4EpJSXnY0E5xSAFpC9muzMnF4FN952yDkZBA6ZhcrFwVGaoIAVnBHG1kqpgLxaDoAIwABmRfRWax0yJSAFZeABfbgAbkcAHpSYl2hEYN1GCjkVhaH0GUzeCy+BigYxsTjuI5Qc0QABdCi/Dhgba+fBoNBaRDkiG3NAQCCsbaXW5EAAsKSsgigEmUMHmKVgRFJgnErDgpMCcBS0uUrAAxNCjD4hSKQFZ6gxEABOKhAuzjJCB6j1WzGvBu7y+cW4RBokAiCayMRkMP4ijobCJgjETNUGj0JhsTg8SkwtRmbR6Tzu0yaHiWax2RzOVxjKvu3z+QJ4MIqCKbOIJWOpdJgTLZcZ5ApFE6lTbQjq1coNSQtVfU7q9fqDcbDUbjSYlfgzXhzBZgJZbVZAkrnZa7A5HeSnMgXK68G73WiPL+zxjOwbwfMwXxID8fy0ACWBAr4AoQlCDbeIwcIIrw9Log+MBYriBLEmSFI7l0UB0qijLMlRbKMhyuHcrifJgAKwqiiA4qSlQ0qytoCpwEqKpqhq2q6mg+qGsazCmjA5qWuw1q2nA9qOi6E4el6PpjEgABsABMQYwCG+BhsWkbRsE6nxjYiYGSmabMBm5BJtmuY4HghBnB8dB+iANaaC8GB8PoSSNrWKS0AA/DoYCCMoABGX4AD68MIsD8DZUC+FpfoAOxaoZxlIIiZmkFGvm0NZTRIHZqb1I5NDOYiemudQeYeYW5DFj5TDqAFYxBfWoXeE2WgpBg0W8LFCXJalAwwBlTRZVQOVIAAHCVHFGbYoaIJt8xlRZIAYFVtlUHV6aNcV/qtZg7nBJ5RbUD1wT+TcmDBahJjhZyMCTdNiXnClaULZl2UHX6a1rYVO0mYgOKleVeC/adNXnQ5Tk1Tpt3tQ9nXeaWr19e9g0hYYI3hdeND/XFgO8MD82LTAy3ehDxWojDu06YjR1U8CHE2Wj9n1ZjiCdGt+JeiI0D5p2bi8HC6kEgIGjKLwADkAACeoGhARrzKSirKqq6poJqWoWlacDqySYAocNKjofCSJorwGA6Hpru/UiuJ9HzOhanihJEr4+vMEgoA+UZcC1HgEIgPi+JAA="}
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
// @twoslash-cache: {"v":1,"hash":"81b21929dc65f224d0be09a2daf51f095a2493ccb8436a38e0f956e26fb0ca62","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALbM0pdrUZZSELHAD8iXgFk5C2gAVV67trjz2YAOYAdMO2lYIpNDP2LKIKBBEJEIABiLrJuzLwAwgDKUbzyzGBw/CHulrQAdF5ozNb+yMggdMxOrLhUAAaVAFZw9qEGjMC8cCJsMAAa2gAM6QCsFM2tpQCa3X28AL7cANz2APRzqQ09/bxdA+trfRsb3PaV5SAAuhQFHGAA1l74aGjqiAs1ALRoEBCsF+xoT0QALOkWQRQCTSGDZdKwIhzQTiVhwOZ+ODpG7SVgAYnqniOJxAFmYriQAE4qKUbGh8EgAGxUbKkaxgvCY2hec64RDrEAifD45hiMhEiYUdDYNkEYj8ml0BgBFgcLh8JnKEyabR6NLGNQ8cyWGz2RzOVxLTxUHx+PDBUihXjhaKxeKJZKWo0ZLI5PIFIolMogA41OoeJRNFptTpbVbBkZjXqTGbzRaKlY7NYbbbJtZ7MAHY6nEDnK5UG53OAPObPV7vT7fP4AtBAkFg5gQmBQmHsOEIuBIlHopnHHF4gmIXrE3MwMkUxDU6j4+nSkC9klWNkAJioXJ5fPI7MFwpweEIJHIkvoTBUajImD4aoMGvUAKGHS0vDAgmkACMyLwAD68YSwfhLlAXimv4IAACr4DAgxtLwkhxJBvC0NatDsEivAACIwPwzCCKwaBwHEEC8OUACM5SZFQA7SpSAAcJJjtY5JUjSM4MgEEYdCyS5IKunLcqQvI0FuhI7tQIr7uKR7UFKp4mBeGBXgGt5IvacCsHIj7aC+76fj+f5YYBwG+KBEFQap6niHBcHklBSHMChaGYdhuH4YRxFdORXhUUgADsI6koxE4kRytKzng5kae0XFgCua78YJ/KIMuXQTDiIjQKK+ouG4TRMpMAiqNIvAAOQAAKAsCECgtkpZwC8bwfF8Py/NCsJwMVsxgP6aSNNBpShqucQCYkFkdNowUxtMXjVcwSCgFKY5wBIYB4DUIATBMQA"}
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
// @twoslash-cache: {"v":1,"hash":"6b3a38fc5042034b07f2c8ce5c33d71651b4154ca7df0ac1d67a6c1c549960a0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAOYw0AeX784cgMrsAXvEYxWMALYwwaRLwASAFQCyAGQCiew8e6nFytZvgAdMO31YIUjQZOTcVNHUtBCooCBEERBArGC5BUhheZildAyM0AHI4XgAjCFpMotZmDAhBYKwqkRgoXnY0Cl4Adzb8XhgSUgxeNFIsuH5A/V5JVuCsqB8ZtqKsprg0QKL2aUh0lsAUAi78ZmCAA1k0ACFasCh2MGkAYQ48gCUYMUZuU67a1haxp0yK1+D5IGh8PdpF0yBkRmMJqRDFAAHS8R4QQJ3MAneCZdLDfAZIjsGCdAJBQodLiEk68QwQ6CFFE+HwAQV4WDSGXSzCgpghGREbD0pGmnTARUFnOOKlmvGOWBwktaYBRlGozGkCWQyBAHDAAGsNfg0GgsHBEAB6K0AKzgAFoNhBWIa2g6iAAWFHrQR3CAM5go2BEK11disOBW+JwFGm/SsADEFwgSnCcE8CAAulmqOtmEEkABOKh6B4QpAARk9VDQBYueAuYQ8UQ1BtwiAADFQRMdRmIyMWAL4UdDYDsEYiD2t0BiJESSdYlMquNMt+Aa/OFxAAdgAzKWjNIK4gD5rSA3EqVaG37h2AEw9vvMAfkRAANhHY5weEIAw1ND0EwbCcDwIQKGuESZjojh5KYli2A4uTOKu7hQVEPh+BSwRNpBkQbjEcQJEkKRwNymTZLBxiFMu5Q0lUNR1JyjTNLMHTdBCfQDEM8KSoiUxLHMtyLFIywUWsGykFsOyBKxhydMcZwXNcwjYk8LzGO8nzfL8gj/BRcBAmK7CgmA4KQg8MIErx4yTM0aIYli9y4is1lErwJJkthVIVLSwQMoQUDMqyYAclyBK8vyhJCiKwIQBKUruVgsoZG0CrMEqRhbGqAFajqeoGsaVCmualo2vaTqYq67pej6aB+hIgbBv0YbiJG0ZwLG8ZJimkEZq2OZ5nW247iW+pHie1a1vWciNqEeGZreYAPk+BYvjQb6VveX7UOOv5TuQM5AYkRAFrwsQiIITgmLwAAicRXXkGoXcRABUr2nN0tzxcGD3Xac728Ok9WkCqzBAzA/CwqIcIQNF51/XkvALsYzB3i09zw19sSdCyYA+MgVi3QAcrw7xQ+kMNZowJUWtaVohroEA4KQKL6BAGgRlUKKBNIDNEVaADqMDFFabIAAoAJJC/cOP85d13cJuw1zkWNbjeW+BIAAHNNF6zYkF2PcYS0rSAvZra+SD3juO2YD+iR/tO1CzkwWCkMzZCYHw90K3kKKlFAGDwdY9hUQwhHxHgFjue9py+8baAB9AGAA69nIeyzmAQ+78B5IlGQADyBxgAB80xioX/CjIY4Tl5AsDTPw8OXaQlPBEb10dIEvBgHprAgr3cNkb2fTh30tDsOssYhYTJNk5D0NNNTtNlQz/RMyzbMc1zQa8/LUbC6LEvSwn11WiXStDQWc6Vp2Z5lseWuIOrw2XiAJem9bq39htSB7p+XM5toATiwoEYIwBwLNnQniIcAgPZTHyAAAV9P6QMdpHTOmqmgD0npWoRjgPkAA3CFFGS5ry8AALxQIWlERgnd/aXyIRqQMSBQCziyhIMAeB7QgCHEOIAA"}
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
// @twoslash-cache: {"v":1,"hash":"922eff9993f504dc1ead2fb24a0c4110ba1104c8ee56fa19ef3fe0d7208624ab","data":"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"}
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
