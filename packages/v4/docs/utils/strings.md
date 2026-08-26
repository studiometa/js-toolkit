# Strings

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9a60da5f9639d40c5862842d63b64c84f05bcd99cc9e7968c7d420026c66c0a3","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhoBzALYxWAYS4xEvALIxxEADzIRpdmADmCrTt0BdCr0N6AfAB0w7cVgilR/CVNlxcVKBH4JEINJCJM68zOZo2nq8aBC8AAaukjJy8QB0lNTMuv7IyCAcYADWmfhoaFhwiAD01QBWcAC0sRCsRexojUQALGkiAK5Q7BCSaMxpsETV/WjsrHDVFjlpZeKsAMRJUq6eIMamICLMzkgAnFSsMHpo+GdUY6S6MAwBWym7Fzq4iAAMVPz4Y7Mfg0ciIU4AXwo6Gw3wIxDImRo9CYbE4PAEQhEvCKMAARsw8R55EoVOpNJEjAZKXpTBEorobHYHE5RLiCUS5JkfH48EEwCFROEljE4vF2YTGjsYPEzDcYOZATheBAAGZhBJQZhjRrxMLlbR4mYwDL3bK5fKFEpUMoVKq1BrNCCtdqdHp9NCDYajcaTaazeaLGnLVYbCV46V7A5HE6IABMfwKV10NzuWUezzw4eJmUK30TAKBIMR8Z+UJhODwhBCSLoLxALA4XD4gmEoiwXFc7xJylUGiW1IZdKWTPsjlCHbgXZz3l8/kCwTIQvpRlFCQACp22MT0kjzUg8gUdNaCOVKjV6k0Wm0Ol1egMhiNnr6YFMZnMFks4Cs0Gt1pOu0jfYqBjF4AGYAEYLmTVNEAgxMHieesAO3LlPjAfN/kBUhgVBJBIIhA5BFgPAx1ZXhgDEZJiTMbM5DMFDu14CFeFVUgRl4AByAABB9vWfS8nRdW8en9D9OIAbkyH0kFAOsrjgYYwDwBoQAhCEgA=="}
import { camelCase, kebabCase, pascalCase } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## Case

```js twoslash
// @twoslash-cache: {"v":1,"hash":"fcc5c18f67a1882e573cc8a37d58a7a3256d60904aa5b4bb2bfc7c4a43c81402","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhoBzALYxWAYS4xEvALIxxEADzIRpdmADmCrTt0BdCr0N6AfAB0w7cVgilR/CVNlxcVKBH4JEINJCJM68zOZo2nq8aBC8AAaukjJy8QB0lNTMuv7IyCAcYADWmfhoaFhwiAD01QBWcAC0sRCsRexojUQALGkiAK5Q7BCSaMxpsETV/WjsrHDVFjlpZeKsAMRJUq6eIMamICLMzkgAnFSsMHpo+GdUY6S6MAwBWym7Fzq4iAAMVPz4Y7Mfg0ciIU4AXwo6Gw3wIxDImRo9CYbE4PAEQhEvCKMAARsw8R55EoVOpNJEjAZKXpTBEorobHYHE5RLiCUS5JkfH48EEwCFROEljE4vF2YTGjsYPEzDcYOZATheBAAGZhBJQZhjRrxMLlbR4mYwDL3bK5fKFEpUMoVKq1BrNCCtdqdHp9NCDYajcaTaazeaLGnLVYbCV46V7A5HE6IABMfwKV10NzuWUezzw4eJmUK30TAKBIMR8Z+UJhODwhBCSLoLxALA4XD4gmEoiwXFc7xJylUGiW1IZdKWTPsjlCHbgXZz3l8/kCwTIQvpRlFCQACp22MT0kjzUg8gUdNaCOVKjV6k0Wm0Ol1egMhiNnr6YFMZnMFks4Cs0Gt1pOu0jfYqBjF4AGYAEYLmTVNEAgxMHieesAO3LlPjAfN/kBUhgVBJBIPLahYSrBFyHuOtUSbDEUO7RgBxXPRuEHIxbDHVleBomcQB5ed+UFDURViDct27XczRyA9LWPUoz3tS8nRdW93Qfb1nwmV9/Q/IMGW/UN/xEoDoweF4AA4AFZoOuW44IQ44kLwTi0KPDCkDjLCizw35CMwSsAmrRFyJRAJG3RFs3Fo+iliYhjdFYllQjeLieL5RdQmFYM10ScKd1NLIJJQKTihku0L0da9XTvD0vSfMZ1LfANP2DXTfw2N5DJA4ykAgsDukslNrPOdN7NebKnLzfD3Jw4swTLaEiN8+Ea0C+sQubHF8UJYk6ODZjGN22LmXHNkNs5D5uLnFKBSXASMqE8UTqlVI5XwBU4CVBU1Q1eItR1PVtUpI0aFysZ8sPK1ivPB0r2dG83XvT1Hx9OrNMDL8fz/cN2sOTq4JMtykystNEMzAJszGr4kF6kBCymzyywOQRYDwNjQmAMRkmJMwyc8MxHM8XgIV4VVSBGXgAHIAAEVJq5h5PKpTuhRuAxYAblsWw+ZgRgxagHDdGafBSHgQhWCgMXuBV3hanFgARPWABVDeN1ozdsRK5G13XsgNo23pd83LetnWHadv3TbF2xua14Pskd32TbNi2reqcWvf1m54/9zIfSQUA6yuOBhjAPAGhACEISAA==="}
import { camelCase, kebabCase, pascalCase } from '@studiometa/js-toolkit-v4/utils';

pascalCase('drag-threshold'); // 'DragThreshold'
camelCase('drag-threshold'); // 'dragThreshold'
kebabCase('dragThreshold'); // 'drag-threshold'
```

These are the functions the framework itself uses: `kebabCase` turns `dragThreshold` into `data-option-drag-threshold`, and `pascalCase` turns an option name into `optionDragThresholdChanged`.

::: tip Four of them are memoised
`pascalCase`, `camelCase`, `kebabCase` and `snakeCase` are `memo`-wrapped, because the framework converts the **same** names on every option read and every handler resolution. `lowerCase`, `upperCase` and `capitalize` are not — they are single-pass and there is nothing to cache.
:::

### lowerCase

```ts
lowerCase(string: string): string
```

### upperCase

```ts
upperCase(string: string): string
```

### capitalize

```ts
capitalize(string: string): string
```

### pascalCase

```ts
pascalCase(string: string): string
```

`'foo bar'` → `'FooBar'`. Memoised.

### camelCase

```ts
camelCase(string: string): string
```

`'foo bar'` → `'fooBar'`. Memoised.

### kebabCase

```ts
kebabCase(string: string): string
```

`'fooBar'` → `'foo-bar'`. Memoised.

### snakeCase

```ts
snakeCase(string: string): string
```

`'fooBar'` → `'foo_bar'`. Memoised.

## Leading and trailing characters

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c587a676dc6124acff5ffc0def82ee18254c6f3a3157e0560f66466cdb452fe9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAYXzNSzMWTiM4aUmvWJeJsxoq8ROvQdJxL189zenzAHTDsAWywIUjQZOUVlVQ1tXX0aF0oQKAgRBEQQAEEoKF55GF51dhIpBzjnODyIPPwCk10wiH5eZitvW15JERgAOiS0ZnV05GQQDjAAayT8NDQsVwB6BYArOABaNAgIVgm5NaIAFh6TQVUIAJgBntgiBcFxVjgF9w04HpmA1gBiWXlWKPMZScCQQAF1QVR6qEkABGGFUf4aeRIABM8OounUlzwv0iKnMsWBhiS41wiHRQPiZFRAF8KOhsGSCMRqVQaPQmGxODwBMIxBIpLiIPcACp6djjLSOKkuABKMBEghcxRgxnaFjaNnUdkpFS8Ws8mt8/iCITCQtF4slhJlcHliuVJCSKTSeHlARZNQKRRK9mlFQEpHOXt4MDAuSaLSNHS4nX4NCksfyGF4pBgOGYaD6bMGw1G4ymVBmc0WK3Wm22uzQ+yOJzOFyuNzuDyeLyG7zQnx+EWFsytgP9ILTDrgKpA4MhA2hiAAzAA2BFh9TI2cHHOkLEMDIWtBi5gSgmDwz2pWjp0ItRklFUXUJWn06iMvCEEjkNl0LcgFgcLh8XFKfEYiPFw1S1fVzB1YDXGjdRDTbPxAmCUJwnkADoilcoQWdVJ0iyHIQx9MM/UwwwqhDKFGmaVo2zsLpen6XMkBGMY1ELAhZnmRAllWDYth2PZDmONBTgkBtmGuGBbnuCVW3VN4Pm+XF/kA9Rb2JCcQAo2EYQAVkXJF8FRdEp03HEIjQw8SMSC8wDJPSQDU8hEAABjpBkcGfFk32oD9OR/Hl/wBICrKMNtwI6RzoLbOD1QQ01kMClSbQqbDXQybJcnyQoVVKKCyKyii4yjGjOlEeicyGJj81Y6YONLHiK346tBLrUTLnEptpMeZ45I7LslKC1SoPHCFNKnLcYTnNcxiXFc0XXUzt3MwbkqwmyyQXBzgKQVyH0wDyMhfVkfI5DJv25P8e0tfdrSgk9HVVMKYMgkLwtgt64qQ80rt3ftgqJOUFVPMcqBdXD3U9LLCNykLA2DLKwwjKjnpaSomgTVGvRTNMMyzBjKpQarJlqksuLLXjKwE2thPrdqJKklseq1eTO0Un7TBugcQuHYGnQ0rTEBRGdrxmgykBnaaTOxJb5F7PcD3+217rPXB1qQAB2G9tpcmlRpEaAmUQs1eGAPxeBQvF0NWwwKDNi25b+jCAbtIGHttsAaThgJeAAcgAAVa852vJxqqxrZsZJ9gBuPw/ESq2oMYH2ACNdB9uwff4LYfe4KPeCWX2s4gVPSB9uPlqSxPM62Ev08L7Pc/zhZ6+LtPeEAFAIWlYNMVBTfI03L2XroVp2lddlWk6wTN8CWBY659ufG4Ln2p/kH2kjEpBQA/MNR0kPBVhAGkaSAA=="}
import {
  withLeadingCharacters,
  withoutTrailingCharactersRecursive,
} from '@studiometa/js-toolkit-v4/utils';

withLeadingCharacters('bar', 'foo'); // 'foobar'
withLeadingCharacters('foobar', 'foo'); // 'foobar' — already there
withoutTrailingCharactersRecursive('path///', '/'); // 'path'
```

The **recursive** pair exists because a URL joined from parts collects separators, and removing one is not the same as removing them all.

### withLeadingCharacters

```ts
withLeadingCharacters(string: string, characters: string): string
```

Adds them if absent.

### withoutLeadingCharacters

```ts
withoutLeadingCharacters(string: string, characters: string): string
```

Removes them once.

### withoutLeadingCharactersRecursive

```ts
withoutLeadingCharactersRecursive(string: string, characters: string): string
```

Removes them as long as they are there.

### withTrailingCharacters

```ts
withTrailingCharacters(string: string, characters: string): string
```

Adds them if absent.

### withoutTrailingCharacters

```ts
withoutTrailingCharacters(string: string, characters: string): string
```

Removes them once.

### withoutTrailingCharactersRecursive

```ts
withoutTrailingCharactersRecursive(string: string, characters: string): string
```

Removes them as long as they are there.

## Slashes

The four named cases, for the one separator every path uses. Each is the matching `*Characters` function with `'/'` filled in, which is what makes a call site readable at a glance.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e39d97cd15dec1619a5909cd20f3446185a1bf1dddc30c8a37222f07473dd106","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAZVZd8jOGlJr1iXgaMbup88YA6YdgFssEUmhlzFy1Ru27KIFAQIgiIIACCUFC8zLys3sZmOnD4vGgQMWaGxhS8kiIwAHQBaMzqocjIIBxgANYB+GhoWHCIAPRtAFZwALTpEKy1cj1EACyFBoKqEI4wpYWwRG2C4qxwbTYacIWNjqwAxLLy8SrGcMn4IAC6V1QGzG5IAIxPVPEa8s8AbFSlpOpzPBHLynXwXAI1XCIV4gET4B7MMRkJAAJgAvhR0NgoQRiMjfnQGGEWBwuHwhKJxJIPPIICslKCtBd9NkNNZWeorFkLOp7E4XG4aYR6Qkwf4qEEQngAEowRx4tL4GBxUXqJK6ASkGaZTbqXL5IolMoVKo1epURrNVodbp9CADIZoEbjSbTWbzRbLVbrXXbXYHYF0tAnHzlcE3O5/IkAZhh73Un2hAE5fg8AUSQIGRYy/CkIWooSiqHCEUjyIh0ZjqNi8IQSOQCfQmGxODwBMIxBIpFm0AAVUjMdg1Jm6Fk89k8rm6vnOVzuHv9wfD3OXCXBUIgWXykiK5WGJeJc4a/haxw6jn60SG1PlJCVapqc0EJotdpdXr9QbDMYTNBTCTuswCwwEsKxDj6HJ+mgeyHJ4Qb7kOZzhrcID3I8iAAKyjG8MAfJcFYAAypv8gJhAuA6IWKeZvAWSDRsW8IDmWqIYliOC1niDbUISzakm2FKdtSwKLpRI4pGOxgTsYU4cjOArzp4InLuCa5SmEkTRLECHDuqKRpBksS6peBTFDeJoPnUDQvta752g634un+bpzEBnpgWsGyQTs0EBp42lIf4EaoVGSAAOwABw4XhzyhcR6ZAopFHKeKFlQthsKMYiNDlpWbE4nW+LcU2xItmSQoMqGK4SWy3LSVJGhyXO5WqiuASShuGmZCGh4XPp548sZ17UMad6mo+VlWm+tqfo6zq/v+MwucBoHep5PJQTBwLdVsyGRg8RJPKMRHVLhCb4U8PzDSRGbAhVxitTRYBQrFGWltlSAEax1bsWEBVcTQxUgCSrZ8D2d1UXour1Zy0ONYKYMtSpgTrjKcoKvIyrbWqR56Se2qGReeRXqZw23igY2WRa1lTR+9pfk6P6ugBS1uatvreZtcErFjOOXEFaEHaFKYndFyZxaRmZc2g4NiauqVIJFr1Me9iCfVWmA/bi9YlDxJV8aDiUHhD1UmLVliww4s7w4bokPcjakRFEmT+RoumpOk/U5ETJlGmT95mhNr42rT9kM45C2ActXrgWtZwc758gu2GgUoQLqIonGp2Jk8L1/PFZE28l1Hy4gwslsryKq19Gv5ZxOuA8DZXkUbssm9DMk8nDCm0isSn3Uj7Wo9ue5KmkSU9cep6exog0k6UfsU0+lpB7ZM0OfNzkeiB0ceez/qwT3TTjztKd7ehKJfPRItnaix15xLze20jkLPMd5dZZXn0oSI0A4vyTXAHsLwZqOYLgUCAUKIMMsVzgKkJA3ux9ZawOAcJRBMD7Bok1NqAA5AAASZotUoq86azTGDvOA2CADc9h7C3URqObBzAABGQZsHcEobwDovBsFtGYaw2hUtoHMh4XwlYbCOFcMYSwsRAj5B92NiI6RaBxGcLaNw3hSi2jYNkcKPsaDhEaKDFo9hqj1GiOUQEQCSBQCElwnALseBuggDRGiIAA=="}
import {
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
  withTrailingSlash,
} from '@studiometa/js-toolkit-v4/utils';

withLeadingSlash('about'); // '/about'
withoutLeadingSlash('/about'); // 'about'
withTrailingSlash('/about'); // '/about/'
withoutTrailingSlash('/about/'); // '/about'
```

### withLeadingSlash

```ts
withLeadingSlash(string: string): string
```

### withoutLeadingSlash

```ts
withoutLeadingSlash(string: string): string
```

### withTrailingSlash

```ts
withTrailingSlash(string: string): string
```

### withoutTrailingSlash

```ts
withoutTrailingSlash(string: string): string
```
