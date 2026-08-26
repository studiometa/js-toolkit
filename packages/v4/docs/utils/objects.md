# Objects & random

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c3081e92cab42b50abaeb73cfb5d5c344694d2ab7fc1172e070d01a4cec53215","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWDCwBbMgHMYjAHTrWzDGTiJeAJRgiIpKAB44aUuzCKKvYQGtIAdzAA+ZAF1uew8dMLKxs7BzBnCDd3AB0wdjksEzRpGFkFUmVKECgIEQREEABZJRheGBJSDF5NbVJqmH5ktAhea0V8NHs0fFK2jrkIS14XGzjbVVjYgDkWmyxBZPY4XjkF5hooe2YwKF5u3vhBVmS4fGZSeF5IXixNG14IACMAKyNkk15z0i1h9m7PsAYWIQfh7HpyVS8ADyYFKNTIvCWYLIDRMpWYKVkvGMWCqIMRnQBu2u8LqSIABsAAL7kiZgADKWAuzF2GI4Q0egnYx0+yVIwnECj05Jk8hKag0Wh03FpWTQzEU+WQyBAdGYCVYuCo5J1zzgsVF6WUjGAZWMcnSIhgelNIkEpAuogwegA5ABRACq+hdvCpvvspqMEAtZCtNoJMDkul4yAAjF5fb7uABuWIAejTvED5st1qz2PtjpEzt47q9Lvsf0j0bjCb9VNiOvJIC8XiolnODEQAE4qJrbN0kL3qOdlF3sqkxRktSAOLCkAAGKgiM7fMRkIdUijobC4AqECpyujjlgcLh8ISicSSVrbHJyFh6MCCOSPMj2R4AfifL7fpF8Vy/mQsTxIkpB8newZZDkeR4AAgreOzBoBr4Im+aAuKkUj7HsLgtI8EDCFAcBdD0vBwEGOwpPwzBHOIth7C05ILrK7byuBSAAExLrOMADvgSAAGxUOxY54N8SFyFkc57jxK7nMw67kIg3FbjuOB4AeG4iceTBsJwPACMIYgSFIEn3gAkmAaCPihf4ft+dlkABz6oaQIEJEkiGWdZ0G5PkIAIeZyE2DQyh1OhmF8ciuH4YROwkbwBH/DYIisIIsCslROEUcYOwGg0tHHCEjG8MxtKTGAboVFUoUwOFiLYWREnKIiywwAAjoIbCsFUHCODAvWQvo8VQCVGLBXIAisBA6wgWAlgwCyvCACgEwz4OwK5tet6y8EQADM0jsLsa2KOwJDLDhGFxURyxnKwoIYvJoilEtK6qFkHYcSpAAcfZ8Yog49iJo4wOOk1WQwfY2LJy6ropNDKZxP1qdQu6acQ2nULpBSngZF7GdeZmQXIFk0HIZgACruIwVZRnozI5GAvW8JT3gAZTvAAD5hLA/Aw7sjAANSxg8FQzSy3AeWBEGSWTkZ+bBBRBSTEZTfi2yfA6Wj2B8E2q/Ja6Iw8j3kcE4yfexXb7cO/aAwJiCxjxolg+JJPy1J0Pzogcnw0pSA21SbYgMYsB4KBXmmoaJT2JNsfu9Z8dy+Tib8KQyEugAApYGUSAo8ppnqAC0zQQKwjh/EXRAACxpgs3JwC6yZZPnzBIKAx58XApl4HqIBUlSQA==="}
import { deepmerge, random, randomInt, randomItem } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## `deepmerge`

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

## `random` and `randomInt`

```ts
random(a: number, b?: number): number
randomInt(a: number, b?: number): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e6f4ef7657f64c4b7d3e04ee3f33001fe2719938fda597f27d5684b366745491","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUszBQIAWxaJeYQQoBGZCrw0B+FWs1luh9VtIAdMOwVYIpNNNnyFlEPJEJEIAILO5RVVzMl0YNAB3GBgpNHwYXkiIXQhhKDgdOIS4GBFJKF5YfmZBVnEwAHNE5IADAAYagDp3ODRmRyQATipWGIq4pAA2KjbSCvC8GUC3HvYwXEQ6qhF8duYxMi6AXwp0bAWCYk2RugYfFg4uPiFRcUkA1wBJMDRlYONSHX0zD9N3i2stnsjgeimeDConm8flBCl4cxo41IYUi0Vi8USEWSGlScgyKTi8NErEEsAKLkSGJyeTk1iKJTKcyqaFqDUa1msAFESKQMETEaE5pSElNxvC4LwYABHQRsVh8jgAaxg8savAASrioEzeMxYQJWBBmGhAWBWjBmAVACgEvAi+HYK3FttWTiIAGZCuxrbwKuwSBKspjsVqJatWPxdbwVrIRAkLStmlRWu0zgBGADsPT6A0Q3Wo7XGZxAUyeL3cHHmSCWIGjMg25EQGZ2exweEIPPcNHoTDYnB4sLeRgsXwM/xMPwBNjsDicJcU7iheH8c7hQ9CWlRMWFQZSaXxgep+UKMGKpXKzNZTRaozO6ervUqOeG+bGEx8K/LcwWACZlqs6zQDZ1M21D7G2RzkCc3bnL2VwDswE7aLoo5rqQfyoYC04gh+kIQF4S76qhKJRFugZJLueKZFSuRHvSZ46iyvD1FeSY3l0v4gA+/T4EMIwFm+xYuPOsyVogbp/ms9ZViBmCtj47bHNQpw9pc/YruCg4hJ8yGIWhumYcCs5CQo4ILnh0LLsZ/IwEixFotu5E4nuXwQIScwiCSZK6nI26HrScgngy57VExbIcmA3JkHyCI2YK6IirIYrsBK0qyqw8q8EqKoYGqmppDqeorgaRomjYZo0JavA2naDr4E6drGrw7qet6vr+g5WIUekvBhhGerRqIcbrPgiYgMmHSNhmWaPjxuZ8a+RbqWWIkLAALBJAGbIsMlgfJEGdspMGqXwS2vAhY7ad8F3oVpBkzrCpm4fhPiWdM1m2RuJHxTuTmUQSdXuZ5MDkj5B40f5dGMpUIXMeyYBcjy0UvLFyJCoGooJMlkoynKCrsMqqoalqBX6vwhrGqa5qVdV9qOljDWuh62qtX68AdcGe49WwfVRqsg2SsNo3jWmACs62cdms15qMhaTMZj2cV+SAixt6yAdJAC6yzQAcQL3cAsI6KdvBbAIpBBAA5AAAq0pISAo4TMAA9AAVnAAC0LIQKwirsGg7tEKtTuCOIrBwBbADc4UrowqZ1NwEe8E7Tu8HUvCAEmEvBx9YMcq1n8eJ8nvAixn+c5/LLyxwXScp7I71IWnmfZ2Ap2MHnccJzX3n19pJdN3U7gO20SCgKcMRwBIYB4G7IBbFsQA="}
import { random, randomInt } from '@studiometa/js-toolkit-v4/utils';

random(10); // 0 → 10
random(5, 10); // 5 → 10
randomInt(10); // an integer, 0 → 10
randomInt(5, 10); // an integer, 5 → 10
```

**One argument is a maximum; two are a range.** The bounds are inclusive for `randomInt`.

## `randomItem`

```ts
randomItem<T>(items: readonly T[]): T | undefined
randomItem(items: string): string | undefined
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"bccf2e1205cf47d57837fcb0faa3c6c3f7bb740d982ea073fad8b48c6c76e642","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUszBQIAWwCSNBQB4AKgD5G7VXETSYzeWFYZeG5AF1uhjbwA+vYbH7swMKL0YBqAIy8xGSsECbcADpg7ApYEKRo0rLyyqqUIPIiCIggAIJJcoq8ejAKQfy8spWkMhgUQaSVBSm8IvjMMmJk5U1waKQeAOYAdOl9HQyIAJxUrDBgg2j4SP4ADFRoHYMwkyAyhaml6RyeSOsgbR3MXeTTAL4U6Ni4OYQk5Bt0uywcXHz7KRUpTUfQGCx0JQUBiMJkk5l4oKGNjsCP6QycLjkMHcnm8fkCwVIoXCURicQSzUUQIU6Uy2TylLKkJ6VQ6tXq8SaAKKl06NEaEAqzFRYJGY02CSQADYAMyzeaLZaINYbLY7PDcw402YeF4AJiovOu/LODyeODwbzI6Ro9CYbE4PEZ1N0+kMiIWKI9gwxrmxurxASC72JUEi0Vi8USmuptIgWTw+U1xVULKkbOYdQaXOSPPafO6gt6aIWoyo40lyr1cpAcwWSxW5wl212MbSOtOiBrRpupushugLxAZKjvGAztTdwEpCKAHIAAJ9QRQCQKHbMAD0ACs4ABaNAQCCsADWel3RAALBvBOJWHBZwBuKJRNulRjIWfMWf1WcAI2/vCziIs62A+vAbhugFfhif6zjBwG+liOJeC+uZaown6/sB3BgRBUFwc4sHwQRmJuAG6RrpsSCgF88xwBIYB4DuIB3HcQA=="}
import { randomItem } from '@studiometa/js-toolkit-v4/utils';

randomItem(['a', 'b', 'c']); // 'a' | 'b' | 'c' | undefined
randomItem('abc'); // 'a' | 'b' | 'c' | undefined
```

The return includes `undefined` because an empty input has no item to give — and a signature that pretended otherwise would put the bug three lines later.

The string overload picks a character, which is the same question asked of a different sequence.
