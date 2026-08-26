# Strings

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5cb4c5a6a1c2f4bf1d9ff1d57a45888d282f7660a849e7c33f235d2f44d443e6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhoBzALYxWAYS4xEvALIxxEADzIRpdmADmCrTt0BdCr0N6AfAB0w7cVgilR/CVNlxcVKBH4JEINJCJM68zOZo2nq8aBC8AAaukjJy8QB0lNTMuv7IyCAcYADWmfhoaFhwiAD01QBWcAC0sRCsRexojUQALGkiAK5Q7BCSaMxpsETV/WjsrHDVFjlpZeKsAMRJUq6eIMamICLMzkgAnFSsMHpo+GdUY6S6MAwBWym7Fzq4iAAMVPz4Y7Mfg0ciIU4AXwo6Gw3wIxDImRo9CYbE4PAEQhEvCKMAARsw8R55EoVOpNJEjAZKXpTBEorobHYHE5RLiCUS5JkfH48EEwCFROEljE4vF2YTGjsYPEzDcYOZATheBAAGZhBJQZhjRrxMLlbR4mYwDL3bK5fKFEpUMoVKq1BrNCCtdqdHp9NCDYajcaTaazeaLGnLVYbCV46V7A5HE6IABMfwKV10NzuWUezzw4eJmUK30TAKBIMR8Z+UJhODwhBCSLoLxALA4XD4gmEoiwXFc7xJylUGiW1IZdKWTPsjlCHbgXZz3l8/kCwTIQvpRlFCQACp22MT0kjzUg8gUdNaCOVKjV6k0Wm0Ol1egMhiNnr6YFMZnMFks4Cs0Gt1pOu0jfYqBjF4AGYAEYLmTVNEAgxMHieesAO3LlPjAfN/kBUhgVBJBIIhA5BFgPAx1ZXhgDEZJiTMbM5DMFDu14CFeFVUgRl4AByAABB9vWfS8nRdDp/Q/TiAG5Mh9JBQDrK44GGMA8AaEAIQhIA"}
import { camelCase, kebabCase, pascalCase } from '@studiometa/js-toolkit/utils';
```

[[toc]]

## Case

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b2ed2b047dd8e61e99d1d0b84f45b6a4f265ec8542e84900aace0ec0da5459c1","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhoBzALYxWAYS4xEvALIxxEADzIRpdmADmCrTt0BdCr0N6AfAB0w7cVgilR/CVNlxcVKBH4JEINJCJM68zOZo2nq8aBC8AAaukjJy8QB0lNTMuv7IyCAcYADWmfhoaFhwiAD01QBWcAC0sRCsRexojUQALGkiAK5Q7BCSaMxpsETV/WjsrHDVFjlpZeKsAMRJUq6eIMamICLMzkgAnFSsMHpo+GdUY6S6MAwBWym7Fzq4iAAMVPz4Y7Mfg0ciIU4AXwo6Gw3wIxDImRo9CYbE4PAEQhEvCKMAARsw8R55EoVOpNJEjAZKXpTBEorobHYHE5RLiCUS5JkfH48EEwCFROEljE4vF2YTGjsYPEzDcYOZATheBAAGZhBJQZhjRrxMLlbR4mYwDL3bK5fKFEpUMoVKq1BrNCCtdqdHp9NCDYajcaTaazeaLGnLVYbCV46V7A5HE6IABMfwKV10NzuWUezzw4eJmUK30TAKBIMR8Z+UJhODwhBCSLoLxALA4XD4gmEoiwXFc7xJylUGiW1IZdKWTPsjlCHbgXZz3l8/kCwTIQvpRlFCQACp22MT0kjzUg8gUdNaCOVKjV6k0Wm0Ol1egMhiNnr6YFMZnMFks4Cs0Gt1pOu0jfYqBjF4AGYAEYLmTVNEAgxMHieesAO3LlPjAfN/kBUhgVBJBIPLahYSrBFyHuOtUSbDEUO7RgBxXPRuEHIxbDHVleBomcQB5ed+UFDURViDct27XczRyA9LWPUoz3tS8nRdW93Qfb1nwmV9/Q/IMGW/UN/xEoDoweF4AA442g65bjghDjiQvBOLQo8MKQcyQELHDizBMtoSIysAmrRFyJRAJG3RFs3Fo+iliYhjdFYllQjeLieL5RdQmFYM10SCKd1NLIJJQKTihku0L0da9XTvD0vSfMZ1LfANP2DXTfw2N5DJA4ykAgyCLJTKzznTOzXhyxy83wrCizw35CMwPz4RrIL61C5scXxQliTo4NmMYna4uZcc2XWzkPm4udUoFJcBMyoTxWOqVUjlfAFTgJUFTVDV4i1HU9W1SkjRoPKxgKw8rRK88HSvZ0bzde9PUfH16s0wMvx/P9ww6w4urggB2QbLkstNEMzAJszGr4kG6SaPOmssDkEWA8DY0JgDEZJiTMMnPDMBzPF4CFeFVUgRl4AByAABFTauYeSKo6ZG4FFgBuWxbF5mBGFFqAcN0Zp8FIeBCFYKBRe4JXeFqMWABEdYAFX1w3WhN2wkrkTXteyPWDdep3TfNy2tbth2feN0XbC5jXA+ye3vaNk2zYt6oxY93Wblj33Mh9JBQDrK44GGMA8AaEAIQhIA==="}
import { camelCase, kebabCase, pascalCase } from '@studiometa/js-toolkit/utils';

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
// @twoslash-cache: {"v":1,"hash":"2cfeded9e0b4794de8f19f8b00eb4c9f56c903f8ad925f94dfedf9a10a7c1bac","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAYXzNSzMWTiM4aUmvWJeJsxoq8ROvQdJxL189zenzAHTDsAWywIUjQZOUVlVQ1tXX0aF0oQKAgRBEQQAEEoKF55GF51dhIpBzjnODyIPPwCk10wiH5eZitvW15JERgAOiS0ZnV05GQQDjAAayT8NDQsVwB6BYArOABaNAgIVgm5NaIAFh6TQVUIAJgBntgiBcFxVjgF9w04HpmA1gBiWXlWKPMZScCQQAF1QVR6qEkABGGFUf4aeRIABM8OounUlzwv0iKnMsWBhiS41wiHRQPiZFRAF8KOhsGSCMRqVQaPQmGxODwBMIxBIpLiIPcACp6djjLSOKkuABKMBEghcxRgxnaFjaNnUdkpFS8Ws8mt8/iCITCQtF4slhJlcHliuVJCSKTSeHlARZNQKRRK9mlFQEpHOXt4MDAuSaLSNHS4nX4NCksfyGF4pBgOGYaD6bMGw1G4ymVBmc0WK3Wm22uzQ+yOJzOFyuNzuDyeLyG7zQnx+EWFsytgP9ILTDrgKpA4MhA2hiAAzAA2BFh9TI2cHHOkLEMDIWtBi5gSgmDwz2pWjp0ItRklFUXUJWn06iMvCEEjkNl0LcgFgcLh8XFKfEYiPFw1S1fVzB1YDXGjdRDTbPxAmCUJwnkADoilcoQWdVJ0iyHIQx9MM/UwwwqhDKFGmaVo2zsLpen6XMkBGMY1ELAhZnmRAllWDYth2PZDmONBTgkBtmGuGBbnuCVW3VN4Pm+XF/kA9Rb2JCcQAo2EYWvMYlxXNF103HEIjQw8SMSC8wDJABWG9gKQAAGOkGRwZ8WTfagP05H8eX/AEgIsow23Ajo1JcULYMihDTWQ/yVJtCpsNdDJslyfJChVUooLIjKKLjKMaM6UR6JzIYmPzVjpg40seIrfjq0EutRMucSm2kx5njkjsuyUgLVKg8cIU0qctxhOd0URZd8FRdEp2M7dTP6xKsKsskFxAcKnJcx83IyF9WS8jkMm/bk/x7S192tKCT0dVUQpgyCgsiuD1RipDzQu3d+0Cok5QVU8xyoF1cPdT0MsI7KgsDYMMrDCMqMelpKiaBNka9FM0wzLMGPKlBKsmaqSy4steMrATa2E+tWokqSWy6rV5M7RSvtMK6ByC4dAadDStMQFEUQATkXJEZtXIzsUW+Rez3A9fttW6z1wNakAAdnsiztuGkRoCZRCzV4YA/F4FC8XQlbDAoY3TZln6ML+u0Abuq2wBpGGAl4AByAABZrzla0n6qrZsZM9gBuPw/Hi82oMYT2ACNdE9uxPf4LZPe4MPeCWL204gRPSE9qOloS2PU62Avk9z9PM+zhZq/zpPeEAFAIWlYNMVBTfI02L6XLrl+2FadpW46wTN8CWBYq89qfa5zz2x/kT2kjEpBQA/MNR0kPBVhAGkaSAA="}
import {
  withLeadingCharacters,
  withoutTrailingCharactersRecursive,
} from '@studiometa/js-toolkit/utils';

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
// @twoslash-cache: {"v":1,"hash":"def8ca01c654cc5e29e1917ae50a7abe00987e78498509ef7724ed3d42c81d38","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAZVZd8jOGlJr1iXgaMbup88YA6YdgFssEUmhlzFy1Ru27KIFAQIgiIIACCUFC8zLys3sZmOnD4vGgQMWaGxhS8kiIwAHQBaMzqocjIIBxgANYB+GhoWHCIAPRtAFZwALTpEKy1cj1EACyFBoKqEI4wpYWwRG2C4qxwbTYacIWNjqwAxLLy8SrGcMn4IAC6V1QGzG5IAIxPVPEa8s8AbFSlpOpzPBHLynXwXAI1XCIV4gET4B7MMRkJAAJgAvhR0NgoQRiMjfnQGGEWBwuHwhKJxJIPPIICslKCtBd9NkNNZWeorFkLOp7E4XG4aYR6Qkwf4qEEQngAEowRx4tL4GBxUXqJK6ASkGaZTbqXL5IolMoVKo1epURrNVodbp9CADIZoEbjSbTWbzRbLVbrXXbXYHYF0tAnHzlcE3O5/IkAZhh73Un2hAE5fg8AUSQIGRYy/CkIWooSiqHCEUjyIh0ZjqNi8IQSOQCfQmGxODwBMIxBIpFm0AAVUjMdg1Jm6Fk89k8rm6vnOVzuHv9wfD3OXCXBUIgWXykiK5WGJeJc4a/haxw6jn60SG1PlJCVapqc0EJotdpdXr9QbDMYTNBTCTuswCwwEsKxDj6HJ+mgeyHJ4Qb7kOZzhrcID3I8iAAKyjG8MAfJcFYAAypv8gJhAuA6IWKeZvAWSDRsW8IDmWqIYliOC1niDbUISzakm2FKdtSwKLpRI4pGOxgTsYU4cjOArzp4InLuCa5SmEkTRLECHDuqKRpBksS6peBTFDeJoPnUDQvta752g634un+bpzEBnpgWsGyQTs0EBp42lIf4EaoVGSAAOwABw4XhzyhcR6ZAopFHKeKFlQthsKMYiNDlpWbE4nW+LcU2xItmSQoMqGK4SWy3LSVJGhyXO5WqiuASShuGmZCGh4XPp548sZ17UMad6mo+VlWm+tqfo6zq/v+MwucBoHep5PJQTBwLdVsyGRg8RJPNGsXVLhCb4U8PzDSRGbAhVxitTRYBQsdJZMdlSAEax1bsWEBVcTQxUgCSrZ8D2d1UXour1Zy0ONYKYMtSpgTrjKcoKvIyrbWqR56Se2qGReeRXqZw23igY2WRa1lTR+9pfk6P6ugBS1uatvreZtcErFjOOXEFaEHaFl3xomTwpld8VkVzaDg2Jq6pUgkUZaW72IJ9VaYD9uL1iUPElXxoOJQeEPVSYtWWLDDizvDRuiQ9yNqREUSZP5Gi6ak6T9TkRMmUaZP3maE2vjatP2QzjkLYBy1euBa1nBzvnyK7YaBShAuok8Ssi+dx1/JLma28l1EK4g4uvVlyJq19mv5ZxuuA8DZXkcbcum9DMk8nDCm0isSn3Uj7Wo9ue5KmkSU9cep5exog0k6U/sU0+lrB7ZM0OfNzkeiBMceez/qwT3TTjztqd7ehKJfERJ3RYRcWkQXh99xD+ZPc8V/l8xVcoSI0A4vyTXAHsLwZqOYLgUCAUKIMssVzgKkJA3ux85awOAcJRBMD7Bok1NqAA5AAASZotUoq86aOh3nAbBABuew9hbqI1HNg5gAAjIM2DuAUN4B0Xg2C2hMJYTQ6W0DmTcN4SsVh7DOEMOYaI/h8gn6t2EVItAYiOFtC4TwxRbRsEyOFH2NBQj1FBk0WwlRaiRFKICIBJAoBCS4TgF2PA3QQBojREAA"}
import {
  withLeadingSlash,
  withoutLeadingSlash,
  withoutTrailingSlash,
  withTrailingSlash,
} from '@studiometa/js-toolkit/utils';

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
