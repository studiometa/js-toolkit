# Math

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9ceb72f404c04d8a3d88f1263f3455ef2aea35a4ac9e5f505851caf4c5501b9a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/ODRmTyQATipWGGy0fCQAVioi0hyGEJl5LD8OMFxEAAYqEXxi5jEyMoBfCnRsXoJicca6VpAWDi4+IVFxSV5K0kVDYw0bczlLB1t9TJ3LsnsTxxc3LA8vfc6qAKC8AEkwGgHCCyGhJG4SXi6NAAdxgVV4MIgkIgwigcHyVEKxVaAEYAGwVKrJGpIAAsjWKLTwHy6Rl6AxAQxGY3IiHxUxmODwhBI5CW9CYbE4PAEwjEEik50UsVUd1I+iMWEEaAAskY5QqwErVRdHldeCi0Nq1cdTPrDcbdWb7nLnu5PBZPv5AsEQCrmJFojKYAJSBA5AaerxMtkfZI0EishAamQMSAsSVEAAmJOE6q1RAAZgpzRgKyltJ6SAZTMyLKQKYmAF1BtA5i83rxgN4OvoPvopbwJr7/bwAOQAAUKgigEjkeeYAHoAFZwAC0EeBAGt2Gg50RSZPlexWHA+wBuPzjopIUDLKpwCV4WcgCYTIA==="}
import { clamp, lerp, map } from '@studiometa/js-toolkit-v4/utils';
```

Values in, values out. For anything with a time dimension — damping, springs, inertia — see [Motion](./motion.html).

[[toc]]

## Ranges

```ts
clamp(value: number, min: number, max: number): number
clamp01(value: number): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2f9240bc13defa62aed44e329e826140ad1118316f38206277e8f3e4a4c41f24","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/ODRmTyQATipWGGy0fCQAVioi0hyGEJl5LD8OMFxEAAYqEXxi5jEyMoBfCnRsXoJicca6VpAWDi4+IVFxSW8OvoBGJRU1DRsyezPHFzcsDy92hUO/AKC8cI6k2PjEmphePqAZAIDrxMtk8gUmq0DgA2CpVZI1JAAdkaxRaeEeWGeFSMvQGICGIzG5EQsKmMxweEIJHIS3oTDYnB4ewUxzip1Mtn0hmMV25Fis/IuDlsN3cnlZnSor2CYQiXxOCSk0VS6VBWRy+SohWKrRhqJAlWqtUQDWo6JgKyxXTxSAATINhpkSUg+hTqLNqQs6dRloz1iysezVKLzLyw6QeZZI5cuWRxXdJTaZYE5R8FIqOcqkmqqhrwdqQLqSohSgd4Sb6mjmlbMRFbT0kABmJ3Emik93TT1UkI0xZ+hkhNbMvhYw4hznnOyRxP3KU4/xp94K6Lff6/fD/IEgsFayF6pAHA4AFkriNNhqaGLaEUX3V6Z8JztGHbdEwAuoNoHNbvPgFK+jjiCEwCKQEByLwADkAAChSCFAEhyFazAAPQAFZwAAtGgEAQKwADW7BoFhRAnqhgjiKwcBQQA3C4LjBgcDQAvoBx9NwtG8KhqG8OxjERIwWEsQMfEcVxPEAgJ+xHAcuR1Jx3G8QcfjIUUSCgMsVRwBIYB4JhIATBMQA"}
import { clamp, clamp01 } from '@studiometa/js-toolkit-v4/utils';

clamp(15, 0, 10); // 10
clamp(-5, 0, 10); // 0
clamp01(1.5); // 1
```

`clamp01` is the case that comes up in every progress calculation, so it has its own name and no arguments to get the wrong way round.

## Interpolation

```ts
lerp(min: number, max: number, ratio: number): number
map(value: number, inputMin: number, inputMax: number, outputMin: number, outputMax: number): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"ab7fb867894ecfd32410afb7d10f1bd7e91baf2058823a960806ab93ef4169b7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvVmSyMAtuzCJeYQfIBGZCr3nNaKtZu29SzcREPqtpbleOkAOmHbysEUmmmzKIKBBEERBAASTAaUndWcxheZlNzCV4tNAB3GBgpNIhkiGEoOAA6Xzg0Zk8kAE4qGTAAczR8JAAWKjLSOpgGYJlI3w4wXEQABioRfHLmMTIqgF8KdGwhgmIZtrpukBYOLj4hUQspPTkiNkEYexsdJSxBNABZJUuTG7v7/WfSHTy0W4en1TWEw/P7vAyAhx2CE2ZyudyeXTMLC+fyBPDvLBxXinVjnASkCDyXiSWJmeqxSRoHLMSCNMjFKilcrdACMAFYapkGk1EABmNrlTqbY79JRDUYgcaTabkRDs+aLHB4QgkcjrehMNicHjeSIKAFGK6I8GGkxmCyfKGmpwuNweLy9ZFUVFBULhWQQaI0LHmpIpdKZXjZXL5IoldrdABsACZOfVGi0BR0unhHaLBkhY5KJmYZUhhgrqEtlas1dQNpqdjrjowcedPtcwKCDUCvrxXg8PtDgXdm8pu22QW8u9ara3YXaESLnQFXRisXXYvwCUSSQlycTwtTafh6eHmUgABwAdjj3KQ/OogpTwWnIAGQ0vUtzEXzswAumNoMs4fbeMBdSwHRjl4WZ8UJXgAHIAAFSkEKAJHkLpmAAegAKzgABaKlPQAa3YNBMKIZoULudhWDgSCAG5nGcR1GFGXgWWGRjhkKNluCo3gUJQ3g2WGZwaw5XhGOYnRRJYzjuN4/jfCQsokFADZMjgCQwDwDCQFmWYgA="}
import { lerp, map } from '@studiometa/js-toolkit-v4/utils';

lerp(0, 100, 0.5); // 50
map(5, 0, 10, 0, 100); // 50
```

`lerp` takes a ratio; `map` re-scales one range onto another. `map` is `lerp` with the input range worked out for you.

## Wrapping and folding

```ts
wrap(value: number, min: number, max: number): number
fold(value: number, min: number, max: number): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"aa94f2881f80c2fa5d7fef9f9d0b38791f8e8b046fe96bb1f589378639f3c919","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwAiKyiMibQTES8wggLYAjMhV7r2YFWq069zWkY3bS3SydIAdMO3VYIpNNNmUQUCCIREEAAxGSheZl4FViVeTWYRAGsIsHD+dzR8XgMI3lJmMABzZWzPTQhhEXheCH5+OIhMhuEoOAA6Hzg0Zg8kAE4qVhgizKQAFipu0mKGIPTvQYNcRAAGKhF8HoSackQ+gF8KdGxlgmIyHxp6JjZOHgFK8UleAHd8rHlFEuNrXX1DVRWUzqcx2ay2QH2JwuNweV7vHx+AJ4ADq71y0ViOUi+SKJXYniGzBIcDiGBqYBgzVSKXCIgg6mq8SSZN4mSpjXwZA6VC6PVmAEYAKyDYaFUaICbUHozPBvZhYHwcSlINYgDZbMQXRDCw7HHB4QgkciTOizEAsDhcPjyj6Y75A0h/Axg4GgyHg12OZyuDLwhWI/yBEBohUYr7ZKQ4grFFQE3hEkmsyRU8otWm8emM0nM5Kacnsmrs0g8kB83qIABsAGZRSN8ONJjKYObbUqlkgAEzrTb5LW7FZ66gnQ3nE3UM03K33eZye1e50An5uiwesgQ5femF+2eB5FBUKycMxVMJZIFNIZLLYvIx/FlCqiaq1erlJpp1LtTpTQUrAAcdbig2kpNtMLZ4Luiwqogtbqr22zaoOAC66zQKc25wsAXhQLotq8PsAikAyvAAOQAAJdIIUASIy3QAPQAFZwAAtGgEAyIkBLMUQYx0YI4isHAJEANxOE4tqMAKAq6GsvACis3DCbwdF0XJvC8IAKASlJmDJMmeeSPlATizpJ0m8LJ8mKcpql9OpWnxh+VQ5mePi0cwSCgGawxwBIYB4ExID7PsQA==="}
import { fold, wrap } from '@studiometa/js-toolkit-v4/utils';

wrap(11, 0, 10); // 1  — it comes back round
fold(11, 0, 10); // 9  — it bounces back
```

`wrap` is a carousel that loops; `fold` is a value that reverses at the edges. Two behaviours, two names, no flag.

## Rounding and averaging

```ts
round(value: number, decimals?: number): number
mean(numbers: readonly number[]): number
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b0ee82bbdee72d859a0f5123636737b5fa11d3d66e2ac5044824a021a7e60637","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxmYRmEHSARmTiJepOVEmsMvJarLIAut01G1pADph20rBFJoZcsJRC6RCRCAAq+DC8zKTsaPiy4iJu8rwQ/LwRwQDm7CRSVuoAdLwAglIwjpi8HHCuzCSkzCnwSRC8AAYADI3ZnuWhDIgAnFSsMGApEUgALFRoobXdILLynhxguIjNVCL4ocxiZEg9AL4U6NjLBMQ7E3QzLBxcfEKi4pJaEMJQjERsgjCWytYUvLARA42HAAPw/YykCyGX5kOwOJwuZ6vTzeXwgABKLzAUBCvA+rC+9SSQV4aQyMMh8USgOBrDg7SonRcSAAjABWfqDYb4JCc6hTGAzUjYqALdhLJCrEDrTbbciIDkHI44PCEKqeGj0JhsTg8ZE496fb6Uv4AmBA6Qg8GmsjQrK2eyOZyuEUoqhovBY154glEtANZJk9KDW2kanmy0gxkgZndABs4xAAyGI0Q/MmpGmeDdOPFksQACY1htqvKpcrqMc1WdyBdtX5rnq+HMFA6NFodHoDA6zPbYY6ES7Yh4PRAfHhAsFQuFIkL2DFWxGg+TQ+3cgVeEUsCUyhUqjU6gGmq0Y3HdtKUzyxhNBTNW/nlgBmEtymgK5p7UxraAnIdI4AR3+XNcT2AQRWkXgAHIAAFykEKAJCiZgAHoACs4AAWgDCBWAAa3CTCiFGFDBHEekoIAbjsOwQMYVlskLJ9Rk5XhC24SjeBQlDeAYpi7FbRhkFZf5i14F9eFGcxOO4tjsnZTxkKQUBLkGOAJA8PwMJAPY9iAA="}
import { mean, round } from '@studiometa/js-toolkit-v4/utils';

round(1.2345, 2); // 1.23
mean([1, 2, 3, 4]); // 2.5
```

## `createRange`

```ts
createRange(min: number, max: number, step: number): number[]
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9bec124e97043ef68c9b9eefeb9415782369a42771a64c313163a0abe105cc13","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAJWZgA5jEYBbdmES8wgjQCMyFXhua1d+oyd5waWKweOluTm6WQBdADph2GlgQpGjSsvIwSqq4VFAQIgiIIAAq+DC8RGyC8AKkEBq8AAZaYIW8gli8aBBF5rSFppLp9jCVzFjMIQB0fn4Aoswi+BlZ6exw0vlYgjRQuflVabzasLS8pPJppIvKvIMiBoKsEVCmcDXMfvwbYhJgbHYOvHE5kKFQpOz8aF28AIKPVq8ADu+HYQ2WEzevCCcHY4hIezAc342nhMD8sDgMnYxihNQ20SRc1kaEEpDAE12MECmD2pA2GC6lBA9k6DEQAE4qKwYKo0PgkABGIVUNCdNQckAyOSKZRqFkcMC4RAABioQ06gxo5C5AF8KOhsCqCMQyCyaPQmGxODwwrLIvL1CV3C5THVXbYWo49M4yG5fR5vH4AkEQvaIlEFbF4okUktMqxshNrgtitoyhUqjVihYGrwmoC2h1ur0wAMIYnspDJoEZjAUXkCgKxsi6OtNmQdlJ9odjrMzhcrjdxJIHt7nhBXhB3p9vr8ARPQeDhuM9DOYRA4Qj0soUWiaJj4Di8euO0S9+sYGSKVSpDSsHTOozmVQ2SEkAA2AAsPL5KgFYVRWoCVrzwGVIydRVtBVAAmDV8C1MRzTVPUvA1aATVDYJQmACM5SJPV5gKAByAABexBCgCQNGvZgAHoACs4AAWmqCBWAAa3hFiiG/eiZnYVg4BIgBuMsIIItRGHVXhRV4VUulggBWbhRN4ej6N4ZBZMUlTTEU5SDK6AB2Iy5K8FlaPFJBQDoGhKTuPBmJAPU9SAA"}
import { createRange } from '@studiometa/js-toolkit-v4/utils';

createRange(0, 1, 0.25); // [0, 0.25, 0.5, 0.75, 1]
```

## See also

- [Easings](./easings.html) — shaping a `0 → 1` progress
- [Motion](./motion.html) — everything with an elapsed time
