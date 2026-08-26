# Objects & random

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c3081e92cab42b50abaeb73cfb5d5c344694d2ab7fc1172e070d01a4cec53215","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWDCwBbMgHMYjAHTrWzDGTiJeAJRgiIpKAB44aUuzCKKvYQGtIAdzAA+ZAF1uew8dMLKxs7BzBnCDd3AB0wdjksEzRpGFkFUmVKECgIEQREEABZJRheGBJSDF5NbVJqmH5ktAhea0V8NHs0fFK2jrkIS14XGzjbVVjYgDkWmyxBZPY4XjkF5hooe2YwKF5u3vhBVmS4fGZSeF5IXixNG14IACMAKyNkk15z0i1h9m7PsAYWIQfh7HpyVS8ADyYFKNTIvCWYLIDRMpWYKVkvGMWCqIMRnQBu2u8LqSIABsAAL7kiZgADKWAuzF2GI4Q0egnYx0+yVIwnECj05Jk8hKag0Wh03FpWTQzEU+WQyBAdGYCVYuCo5J1zzgsVF6WUjGAZWMcnSIhgelNIkEpAuogwegA5ABRACq+hdvCpvvspqMEAtZCtNoJMDkul4yAAjF5fb7uABuWIAejTvED5st1qz2PtjpEzt47q9Lvsf0j0bjCb9VNiOvJIC8XiolnODEQAE4qJrbN0kL3qOdlF3sqkxRktSAOLCkAAGKgiM7fMRkIdUijobC4AqECpyujjlgcLh8ISicSSVrbHJyFh6MCCOSPMj2R4AfifL7fpF8Vy/mQsTxIkpB8newZZDkeR4AAgreOzBoBr4Im+aAuKkUj7HsLgtI8EDCFAcBdD0vBwEGOwpPwzBHOIth7C05ILrK7byuBSAAExLrOMADvgSAAGxUOxY54N8SFyFkc57jxK7nMw67kIg3FbjuOB4AeG4iceTBsJwPACMIYgSFIEn3gAkmAaCPihf4ft+dlkABz6oaQIEJEkiGWdZ0G5PkIAIeZyE2DQyh1OhmF8ciuH4YROwkbwBH/DYIisIIsCslROEUcYOwGg0tHHCEjG8MxtKTGAboVFUoUwOFiLYWREnKIiywwAAjoIbCsFUHCODAvWQvo8VQCVGLBXIAisBA6wgWAlgwCyvCACgEwz4OwK5tet6y8EQADM0jsLsa2KOwJDLDhGFxURyxnKwoIYvJoilEtK6qFkHYcSpAAcfZ8Yog49iJo4wOOk1WQwfY2LJy6ropNDKZxP1qdQu6acQ2nULpBSngZF7GdeZmQXIFk0HIZgACruIwVZRnozI5GAvW8JT3gAZTvAAD5hLA/Aw7sjAANSxg8FQzSy3AeWBEGSWTkZ+bBBRBSTEZTfi2yfA6Wj2B8E2q/Ja6Iw8j3kcE4yfexXb7cO/aAwJiCxjxolg+JJPy1J0Pzogcnw0pSA21SbYgMYsB4KBXmmoaJT2JNsfu9Z8dy+Tib8KQyEugAApYGUSAo8ppnqAC0zQQKwjh/EXRAACxpgs3JwC6yZZPnzBIKAx58XApl4HqIBUlSQA==="}
import { deepmerge, random, randomInt, randomItem } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## Merging

### deepmerge

```ts
deepmerge(...layers: Record<string, unknown>[]): Record<string, unknown>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"0b7a0daef4bb9bf540f387ed1010933db4b54fa20f3564552ae383b0c2cbbf13","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWDCwBbMgHMYjAHTrWzDGTiJeAJRgiIpKAB44aUuzCKKvYQGtIAdzAA+ZAF1uew8dMLKxs7BzBnCDd3AB0wdjksEzRpGFkFUmVKECgIEQREEABZJRheGBJSDF5NbVJqmH5ktAhea0V8NHs0fFK2jrkIS14XGzjbVVjYgDkWmyxBZPY4XjkF5hooe2YwKF5u3vhBVmS4fGZSeF5IXixNG14IACMAKyNkk15z0i1h9m7PsAYWIQfh7HpyVS8ADyYFKNTIvCWYLIDRMpWYKVkvGMWCqIMRnQBu2u8LqSIABsAAL7kiZgADKWAuzF2GI4Q0egnYx0+yVIwnECj05Jk8hKag0Wh03FpWTQzEU+WQyBAdGYCVYuCo5J1zzgsVF6WUjGAZWMcnSIhgelNIkEpAuogwegA5ABRACq+hdvCpvvspqMEAtZCtNoJMDkul4yAAjF5fb7uABuWIAejTvED5st1qz2PtjpEzt47q9Lvsf0j0bjCb9VNiOvJIC8XiolnODEQAE4qJrbN0kL3qOdlF3sqkxRktSAOLCkAAGKgiM7fMRkIdUijobC4AqECpyujjlgcLh8Q3i9SqUnR/wmcyWay2exOVweby+AxBwJPkKv8J3xiOIEiSTEp0yKgcjyPBimnMoKiqUl6kaPYWj6Ql9ladh2jQAYhhGMAxkUOlplmMB5kWZZVnlDYth2ZFWkOHlTnOS5rluZh7ieV4xAeOovh+EZ/m2IFIFBfYIWhWFqilMlln2C5+DRT5wOxCBcQeUE/no4kWmQilqVpWJGWZVlqiWZJOW5ZJ1laAV4jzEVJyNFRr1vGVVDlBUlRVNUNRnJs9QNFzxWzYNc3DO0HRgJ1XU9b1Ey3fMgxDUgw3zKsoz0WskpTdNM3CtKMttQtYuLeLy0rGhspjeMksbHUWzbEAO1ILsADYACY+1ixRBx7Kh5WncdL2nLI5z3HqQBXc5mHXchEAXLcdxwPADw3IbjyYJkNLITA+DQFxUjAG1Yl4C6yi4PM/1sVMpEuqB7XWCRTquQQ5EeMh7qpLI2q7AB2AAWXqB3wJAAFYhtHGBxyOk6JpsKbl1XeaaEW2MupW6hd3W4hNuobaCkYXacHajA+Bga69FuxQ/uGrsAA4AGZQf68HEBBkcRrwKm4BnSakGm2a13RoXY2xzA1v3fHyC2+gdtIPbyYvZ7xEkPQwA+r65dahmh2Hft2aQRnoZ5gonu+dWwER+dEGF1GFqQZmAcl3GZcPeWT1J/aKb2Y7YrOh6Lr5m7gju2JfvbfXEExpdZz6gaoe5sc8Hh2LbeRmbHbFxAIcZt3pYIWWjwV4mfZVq7+Zp8O6ejzskExw3E45rnhtTgpQ8zoWUbmp3EA612WuMWA8HiRJ2vzMblETfglbkUsAAFLEEKAJAUeU0z1ABaZoIFYRw/m3oggbTBZuTgF17pCtIwv9k7w1D11JvOCtpDV169GZhcFySgN78DilampZQ7bwgAsH09Z8pgAzPmdOb1AzAJdKA8BaA36WxehrXg39f71iyBvZgSBQDHlinAV6eA9QgCpFSIAA"}
import { deepmerge } from '@studiometa/js-toolkit-v4/utils';

deepmerge({ tween: { ease: 'linear', duration: 300 } }, { tween: { ease: 'ease-out' } });
// { tween: { ease: 'ease-out', duration: 300 } }
```

Later layers win, at every depth. Plain objects merge; anything else — an array, a `Date`, an element, a class instance — **replaces**.

That last rule is the one worth knowing: an array is a value, not a structure to merge, because merging two arrays by index is almost never what a caller meant.

::: tip It ships for the consumer, not for core
A utility is judged by consumer need, not by whether core calls it. Layering a default config under an author's config is the case every component author meets, and getting the array rule wrong is exactly how a hand-rolled merge misbehaves.
:::

## Random

```js twoslash
// @twoslash-cache: {"v":1,"hash":"97d2e42b178b0ca4d4da7b180a6edd87db627e098889dfee425f99da39ce769b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUszBQIAWxaJeYQQoBGZCrw0B+FWs1luh9VtIAdMOwVYIpNNNnyFlEPJEJEIAILO5RVVzMl0YNAB3GBgpNHwYXkiIXQhhKDgdOIS4GBFJKF5YfmZBVnEwAHNE5IADAAYagDp3ODRmRyQATipWGIq4pAA2KjbSCvC8GUC3HvYwXEQ6qhF8duYxMi6AXwp0bAWCYk2RugYfFg4uPiFRcUkA1wBJMDRlYONSHX0zD9N3i2stnsjgeimeDConm8flBCl4cxo41IYUi0Vi8USEWSGlScgyKTi8NErEEsAKLkSGJyeTk1iKJTKcyqaFqDUa1msAFESKQMETEaE5pSElNxvC4LwYABHQRsVh8jgAaxg8savAASrioEzeMxYQJWBBmGhAWBWjBmAVACgEvAi+HYK3FttWTiIAGZCuxrbwKuwSBKspjsVqJatWPxdbwVrIRAkLStmlRWu0zgBGADsPT6A0Q3Wo7XGZxAUyeL3cHHmSCWIGjMg25EQGZ2exweEIPPcNHoTDYnB4AmEYgkUhLYJoCgAPAAVAB8jHY47gKlIFvkYHlvCnyAAun8p7wAD68NIwfhzGAFRgAalTvCOpENlu4gLsDico4Uj3H7iheH8H/hcc7wjWRdVIGQMB0BxIwA2t1hoZEIBA3hWlIJlExAZMOkQAAmAAOLNKhzVNq1GQtJhcMcYBmEAKwWas4PrJB8Obah9jbe9O1OHtLn7D83iMCwvgMf4TB+AEbFfEEPx/CAvD/fVBNCLRURiYUgxSNJ8UDal8kKU8GXKZlWSaFpRjOPCcMI/p8CGEYCwmHwZNmStcOWVY6wQqtWMwVsfHbY5qG485eyuWEBJCT5dBEpTSD+WKX2Bd9KJo38fH/FLRORFSojUwMkk0vFMipXI9PpUojOqXh6lMpNzKQEiABZrJzYZ8zGRzixS8tzyQN13LWJjFh89j/M4k5uxC3i+A/cEIo+YTxLErLErfWFwVk+T0v1BEYCRFFcvRBICpxLSvggQk5hEEkyV1OR1N02k5AMiqdRZaq2Q5MBuTIPldv2oVA1FBJ2AlaVZVYDclRVDA1U1NIdT1AD+EfE0bDNGhLV4G07QdfAnTtY1eHdT1vV9f11JOkNeDDZDo1EON1nwDCsLTHC816IjbNzeyOqLWayxchZmprDz4M2YbdjYvzDg7CaiwuPsZpSr9qInVCmTnBdqKXaRV0kDcNcqHc/iNqojxPM95kvG87x5R8oGfSSkvW79ITk6EMumQDqOAu6wIgqDkSRzLGIQv29TNln6sbQY2s5myGtIhz+ZVt3aN6xAAFYBs8iW6i2bdlmgA4gTW4BYR0AW0CrtPfa2ARSCCAByAABVpSQkBRwmYAB6AArOAAFoWQgVhFQXIeiEa3vBHEVg4GbgBuL7+JI7gl94Xve94OpeEAJMJeBI6x+Jzo+6g3red6zg/z5PlWXkYdfN+3/3/u0Xfb+PsBZvHRhkGbswZuOhm4aGAbwZuIhm67iXu4bubQkCgFODEOAw48CDxAFsLYQA==="}
import { random, randomInt, randomItem } from '@studiometa/js-toolkit-v4/utils';

random(10); // 0 → 10
random(5, 10); // 5 → 10
randomInt(10); // an integer, 0 → 10
randomItem(['a', 'b', 'c']);
```

**One argument is a maximum; two are a range.**

### random

```ts
random(a: number, b?: number): number
```

A float in the range.

### randomInt

```ts
randomInt(a: number, b?: number): number
```

An integer in the range, bounds inclusive.

### randomItem

```ts
randomItem<T>(items: readonly T[]): T | undefined
randomItem(items: string): string | undefined
```

One item from an array, or one character from a string.

The return includes `undefined` because an empty input has no item to give — and a signature that pretended otherwise would put the bug three lines later.
