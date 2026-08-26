# Math

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9ceb72f404c04d8a3d88f1263f3455ef2aea35a4ac9e5f505851caf4c5501b9a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/NGZk4ORkEA4wAGs/fDQ0LDhEAHomgCs4AFo0CAhWSvY0DqIAFly4NEEoCTkYQtzYIibBcVY4JrlmNHxc2rlWAGIZeSwQAF1TqnHmTyQATipWGGytpABWKkLSHIYQo98Hoy4RAABioInw12YYjIdwAvhR0NggQRiDCPnQfiAWBwuHwhKJxJJeI9SIpDMYNDZzBsrJTHPpMoSHLZ7HTbC43FgPF4SScqAEgngAJJgGik3qbGBJRkSXi6NAAdxgT14iogcogwigcHyHyKJTKFWqVFq9UaLXaXR6fQGQ1G40m01mzHmMEWy3Yq3Wm22uwOvLOFxAVxuiAAjAA2B5PZIvRDDPVfWZ4AMAsBA0EgcGQ6HkcMR+GInB4Qgkcjo+hMNicHgCYRiCRSDaKWKqZnmIxYZYAWSM7dI+k7Pcs/f0mvqPb7bPM467aG7I+ndn7HPcngsfP8gWCIAXkWiral/FIEDkvEkUsy2Slkm6UUgWzIuuo+qQpXKRmNBDqDWabU63S9P0gwjGMExTKezquu6KxrBsWw7Ggez7M2gaXJ8PwAEyYdGzz4EgADMibfHgqFphmYIQpkuZINhsJBiI0DIpy3K8MA3jHPovL6M2vCwgIJ5ngA5AAAg6EEzIU/5WkBtojEssFCQA3H4knMEgoAYk8cCNng7QgLCsJAA=="}
import { clamp, lerp, map } from '@studiometa/js-toolkit-v4/utils';
```

Values in, values out. For anything with a time dimension — damping, springs, inertia — see [Motion](./motion.html).

[[toc]]

## Ranges

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2f9240bc13defa62aed44e329e826140ad1118316f38206277e8f3e4a4c41f24","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/NGZk4ORkEA4wAGs/fDQ0LDhEAHomgCs4AFo0CAhWSvY0DqIAFly4NEEoCTkYQtzYIibBcVY4JrlmNHxc2rlWAGIZeSwQAF1TqnHmTyQATipWGGytpABWKkLSHIYQo98Hoy4RAABioInw12YYjIdwAvhR0NggQRiDCPnQfiAWBwuHwhKJxJJvMdgQBGJQqNQaGxkezUxwuNxYDxeP5YMl+AJBPDhY5JWLxRJbGC8YGAZAJSbxMtk8gUiiUyhVqlRavVGi12l0en0BkNRuNJtNZsx5jBFst2Kt1pttrsDmyOedLp8fqSAGwPJ7JF6IADsH2u3zwDtJfgqQNBIHBkOh5EQ7vhiJweEIJHI6PoTDYnB4xIUFLiVNMtn0hmM9JLFisFdpDlsjPcnjzJyoXOCYQi/MpCSk0VS6SlWRy+QDxSQpXKRmVBDqDWabU63V6/UGIzGEymEBmcwWSxWaw2Wx2aD2hwiZwuICuN0Qbv95S9Pve1EDs2D54BYCBACYwRDMrGSDAom1BIimqLptQGJZjiuZsgWqh1uYZZIaQpaWKhdLFmQDbMk2bKcoE7a8goXaFj2ST9k8g4yiOL5jigipTjUs7qguWrLrqa4Gpu24mruFpWoetonva55OleLp3KSnrPPgbwBl8b6/B+k5fkgADMf4xjQcbAQioHJiEqZolBmYhNiOZ8CGCFFjSdiobhLLNhyrZETynbRAKIpCvgIripK0rDnKDETkqLFqvOmpLjqq76huRo7mae6WgeNrHqeIYXs61yuqSwyyd68l+opQYqSSoafkCBVRv+UK6UBsKXiI0DIkyznAM2+ghrwsICKQW68AA5AAAjxiXMOxMUrnqKWrENADcLguPBpLvKK+iksC3ALbwLS8FtK0RIwHTraCB3bbt+3AkdFWMKSuSvDte1NAdfh8UgoAYk8cASGAeDtCAsKwkAA=="}
import { clamp, clamp01 } from '@studiometa/js-toolkit-v4/utils';

clamp(15, 0, 10); // 10
clamp(-5, 0, 10); // 0
clamp01(1.5); // 1
```

### clamp

```ts
clamp(value: number, min: number, max: number): number
```

Keep a value inside a range.

### clamp01

```ts
clamp01(value: number): number
```

Keep a value inside `0 → 1`. It is the case that comes up in every progress calculation, so it has its own name and no arguments to get the wrong way round.

## Interpolation

```js twoslash
// @twoslash-cache: {"v":1,"hash":"ab7fb867894ecfd32410afb7d10f1bd7e91baf2058823a960806ab93ef4169b7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvVmSyMAtuzCJeYQfIBGZCr3nNaKtZu29SzcREPqtpbleOkAOmHbysEUmmmzKIKBBEERBAASTAaUndWcxheZlNzCV4tNAB3GBgpNIhkiGEoOAA6XzRmAHMg5GQQDjAAa198NDQsOEQAenaAKzgAWjQICFY69jReogAWQrg0QSgJeRhSwtgidsFxVjh2vTR8Qqb5VgBiGUiQAF0LqhnmTyQATioZMDK9pAmqUtIypbwzrC+Wq4RAABioInwd2YYjIjwAvhR0NgQQRiHCvnQGMEWBwuHwhKILFI9HIiGxBDB7DYdEosBsALJKakmOmM/Qs0g6PItRnM1TWEw8+loBkcgUOOwSmzOVzuTy6ZiAqj+QJ4MVYOK8cmsSkCUgQeS8SSxMyvWKSAZxSB7MjFL7lSrVWoNKhNFptTo9fqDYajcZTGZzBZLZgrGBrDbsLY7cz7Q4nUmXa4gW73RAARgArM9Mm98EgAMwOn5/YJJ55KEHgkCQ6Gw8iZrOI5E4PCEEjkTH0JhsTg8byRBT8ow0xUGaUmMwWTlS0dkWVuDxeAG+VVBULhWRDGJa6dJFLpTK8bK5fJFEqOpBVGpKV0EZqtDrdPoDIYjMaTaazeaG0PhyNNm2XZ4zQI5Th8K4bm+bEADYACZc1ed5EE+ag7l+bEah8SswBBRDayhMwGyQUEW2oFF23RLtqCxXs8QHUlGB1SlOVpMARSZZRJy5Xg2VFcV5144U+W4oTuQ2TjBMFWxOUXeUvArPwAg3DUtRY2J+ANI0TQSc1jXCHJmBtfA7UvCpr2dO9GkfT0Xx9d9/S/INf0WZZVnWIDYz2A4wMTJVk2gu5sQADgAdiQ/MixLTC8CU4FosI+sIlI+EUxEaBUTlZdeGAQcsB0UleHhfVDV4AByAABFyQ1Key3z9T8Jk86M4HKgBuZxnABRhwV4DNQT60FCizbh2t4TpeCzUFnCYnNeD6gadEWwaxom9optBXw3OYJBQCxTI4AkMA8B6EB4XhIA=="}
import { lerp, map } from '@studiometa/js-toolkit-v4/utils';

lerp(0, 100, 0.5); // 50
map(5, 0, 10, 0, 100); // 50
```

### lerp

```ts
lerp(min: number, max: number, ratio: number): number
```

Interpolate between two values by a `0 → 1` ratio.

### map

```ts
map(value: number, inputMin: number, inputMax: number, outputMin: number, outputMax: number): number
```

Re-scale one range onto another. It is `lerp` with the input range worked out for you.

## Wrapping and folding

```js twoslash
// @twoslash-cache: {"v":1,"hash":"aa94f2881f80c2fa5d7fef9f9d0b38791f8e8b046fe96bb1f589378639f3c919","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwAiKyiMibQTES8wggLYAjMhV7r2YFWq069zWkY3bS3SydIAdMO3VYIpNNNmUQUCCIREEAAxGSheZl4FViVeTWYRAGsIsHD+dzR8XgMI3lJmMABzZWzPTQhhEXheCH5+OIhMhuEoOAA6HzRmQsDkZBAOMESffDQ0LDhEAHopgCs4AFo0CBlE9jQFogAWNrg0QSgJdRguttgiKcFxVjgp9WZMttH1VgBidO8AXU+qPeYPJAATiorBgRUySC2VC6pGKDCCHygPkGuEQAAYqCJ8P8EjRyIhAQBfCjobCogjEMidOjwkAsDhcPhCUTiSS8ADu+Sw8kUJWM1l0+kMqispnuFhF9lskusThcbg8HK5Pj8ATwAHUublorEcpF8kUSuteKDmCQ4HEMDUwDBmqkUuERBBjhb4klLbxMrbGvgyB1od1ev1BsMqKNxpMZvMlitWGsNttdvtDs6TswzjALld2Dc7g98E80C9XpzmFgQN9fjD4QBGACsILBhQhiCh1H+cLwpfLIIMqIxICxOLEVMQ9eJpJweEIJHI0JpTDYnB4SrLPJifNFpEFBjsArMEv5ZGlR8czlcGVXPd8/kCIE1Ze1vOyUn1BWKKmNpvNHsktvKLQOrwTounECTJJoVpejUXqkP67Y9EgfQDAYoYEGMEzTHMizLKs6ybDsewHEcaYZlm1y3PcjzPG83YVj8IB/ACiAAGwAMyNuC+CQgGsInF2yq9jaSAAEyYti+QjviaITtQZLTpSc7UAuQT0suTJhOuSh7mKu4ymK5g6TYRlyheiqIiqt54KEshPhuYHugUaQZFkep5O+RplBUojVLU9TlE0AGpO0nSBkhwaoSMGGRthMZ4QmhHJiRpznJcFF5tRRZvBZlaMdWSA1miAAcnHNtxra8Z2CJhMifZIBxg4Sbio4yQxTqwHg8qXsAXhQLo3a8ISAikM6vAAOQAAJESmxxdLFuFxvh2xpTmcBjQA3E4TjdowNY1roGK8IV3DrbwMxHbwvCACgEpTAamrrgXk3lQE4iK7ftvCHcdp3nYCl03caQVVA9SQ+LNzBIKANJgnAEhgHg8wgIShJAA="}
import { fold, wrap } from '@studiometa/js-toolkit-v4/utils';

wrap(11, 0, 10); // 1  — it comes back round
fold(11, 0, 10); // 9  — it bounces back
```

Two behaviours, two names, no flag.

### wrap

```ts
wrap(value: number, min: number, max: number): number
```

A carousel that loops: past the end, it comes back round to the start.

### fold

```ts
fold(value: number, min: number, max: number): number
```

A value that reverses at the edges rather than looping.

## Rounding and averaging

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b0ee82bbdee72d859a0f5123636737b5fa11d3d66e2ac5044824a021a7e60637","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxmYRmEHSARmTiJepOVEmsMvJarLIAut01G1pADph20rBFJoZcsJRC6RCRCAAq+DC8zKTsaPiy4iJu8rwQ/LwRwQDm7CRSVuoAdLwAglIwjpi8HHCuzCSkzCnwSRC8AAYADI3Znmg1vsjIIBxgANae+GhoWBoA9BMAVnAAtGgQEKwD4XNEACzZ5YJQElHM2bBEE4LirHAT0swR2SPSrADEsvIgpqZU5aEMiACcVKwYGAUhEkBsqJ1SLUfiAXh4AewwLhEM0qCJ8KFmGIyEhfgBfCjobDIgjEHEQugwlgcLh8ISicSSLQQYRQRhENiCGCWZTWCi8WAiBxsOAAfh5xlIFkMvLIdgcThczNZnm8vhAACUWWAoCFeBzWFz6kkgrw0hkZZL4olBcKLu0IV0kD0+oihlQRmNJjN5otlqs0Ostjs9hADkcYCczuwLlcbvg7mgHo9SNqoG8PiAvi4kABGACsAKBIPwSEL1FC0LwqZVCKRSFRIHRmOx5EQBYJRJweEIVQ6lKYbE4PGVOvZnO5lr5ApgQuuF3FU7I0qytnsjmcrhrOtVEB8eC1rL1BqNixNqXSQKXpGtM7nIodFZS3V6/XdBFG40QU1mCyWKzWTZtjQXZ9hgToIyjc5LmuW57iebd03eT5IR+AA2cE+mLUFEHLSEqz8RDPH6ZEACY0QxapWwbTtqGJHsyXICl6EHGkRzhRRZVIDQtB0PQDFXMwVy4+UNyVOFd33PxAmCUJwkicD2BiOFb2SM1L0yLi4FyApeCKLASjKCoqhqOozxaNoOidFBXzdYZP29X8/QAwMgJDMCIOOU5oLjOCkyeCTkKzVDcUbQFgRwzD8PAvAJLrZEAGYKJbGg22aPFMxEaASQVTdeGAWIwH5RDeDxARU2kXgAHIAAF3LDcDmB9P9/UAjZvJjOAqoAbjsOxEMYXNslIhKNkLXhSO4breCmXghpGuwOOQXN+XI3gkt4DZzGm2bSOyfNPAOJBQEpIE4AkDw/FmEA8TxIA="}
import { mean, round } from '@studiometa/js-toolkit-v4/utils';

round(1.2345, 2); // 1.23
mean([1, 2, 3, 4]); // 2.5
```

### round

```ts
round(value: number, decimals?: number): number
```

Round to a number of decimals.

### mean

```ts
mean(numbers: readonly number[]): number
```

The arithmetic mean of a list.

## Series

### createRange

```ts
createRange(min: number, max: number, step: number): number[]
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9bec124e97043ef68c9b9eefeb9415782369a42771a64c313163a0abe105cc13","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAJWZgA5jEYBbdmES8wgjQCMyFXhua1d+oyd5waWKweOluTm6WQBdADph2GlgQpGjSsvIwSqq4VFAQIgiIIAAq+DC8RGyC8AKkEBq8AAZaYIW8gli8aBBF5rSFppLp9jCVzFjMIQB0fn4Aoswi+BlZ6exw0vlYgjRQuflVabzasLS8pPJppIvKvIMiBoKsEVCmcDXMfvwbYhJgbHYOvHE5kKFQpOz8aF28AIKPVq8ADu+HYQ2WEzevCCcHY4hIezAc342nhMD8sDgMnYxihNQ20SRc1kaEEpDAE12MECmD2pA2GC6lGozBUiWQyBAHDAAGsWfg0GgsHBEAB6MUAKzgAFpqhBWLz4TKiAAWLr2QRQCQaGBoZhdWBEMUzdisOBi8xofBdQUaVgAYhkchohLUIC8Xio9k6DEQAE4qKwYKprUgAIzhqj60hqP0gZ0RKLuoPaXCIAAMVCGnUGrqQ/oAvhR0Nh0wRiGQWTR6Ew2JweGEXZFlGpNNp3C5THVO7YWo49M4yG5Bx5vH4AkEQk2k62YiA4gk8Kl0plWNkJtcFsVtGUKlUasULA1eE1AW0Ot1emABhC19lIZNAjMYCi8gVrWNkXR1psyDspH2Q5jlmM4LiuG5xEkB5+2eCBXggd5Pm+X4AVg0FwWGcY9EQmEIDhBF0mUFE0RoTF4BxPEcN/IliPWPVyUpJFeBpLA6U6RlmWjNkOS5Hl+SoQVhVFCVpTlCAFSVNAVXVTVtXyPUDSNE1xHNS1NltNB7SdcJXTnD0vRAH0QiQAA2VUgxDFQw0QSNuNjPU8ETRR9NTMB0wAJmzfBczEKtM0LQyRGgctJ2CUJgBnFyiULeYCgAcgAATknVFKlWV5UVZU1RUs04HigBua9nJbaJGCzXgo14DMug8gBWbgCt4CVeGQCqavq0warqrqugAdh6yqvBZXV9SQUA6BoSk7jwaUQELQsgA=="}
import { createRange } from '@studiometa/js-toolkit-v4/utils';

createRange(0, 1, 0.25); // [0, 0.25, 0.5, 0.75, 1]
```

## See also

- [Easings](./easings.html) — shaping a `0 → 1` progress
- [Motion](./motion.html) — everything with an elapsed time
