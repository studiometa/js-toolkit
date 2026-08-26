# Strings

```js twoslash
// @twoslash-cache: {"v":1,"hash":"9a60da5f9639d40c5862842d63b64c84f05bcd99cc9e7968c7d420026c66c0a3","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhoBzALYxWAYS4xEvALIxxEADzIRpdmADmCrTt0BdCr0N6AfAB0w7cVgilR/CVNlxcVKBH4JEINJCJM68zOZo2nq8aBC8AAaukjJy8QB0lCAizM5IAJxUrDB6aPj5VGg5ujAMAUnucpkcYLiIAAxU/Pg5zPw05Ih5AL4U6NitBMRkmTT0TGycPAJCIrwA1jAARsybHvJKKuqakUYGJ3qmEVG6NnYOTqIb27uN3r7+gcFkouEWujFxeJPHYAWlcnniZlKMHM3RwvAgADMwgkoMxKiD4mE0CdNgBXGgZKjZXKIABMHRARRKZUGFSqNTwwJeniaOlalK6PT603JbRGYxweEIIRmdFqIBYHC4fEEwlEWC4rhSngUylUGj+Z2ulz+t3sjlCirgyr2mR8fjwQTAIR+VyMAISAAUlWw9ulMiTagBmACMhWKulKSF9lMqpGqEuNpteVPZSE53VIvX6SD9Q1MIEEsDwBoevGAYmSezMzJLvGjbrkvCGvERpAg4l4AHIAAIiPFQdiNmrMAD0ACs4CDYhBWGt2GgQUQACx9gnsVhwZsAbkykkqSFA4uKcG7YDwQ5AQyGQA="}
import { camelCase, kebabCase, pascalCase } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## Case

| Function        | `'foo bar'` → |
| --------------- | ------------- |
| `lowerCase(s)`  | `'foo bar'`   |
| `upperCase(s)`  | `'FOO BAR'`   |
| `capitalize(s)` | `'Foo bar'`   |
| `pascalCase(s)` | `'FooBar'`    |
| `camelCase(s)`  | `'fooBar'`    |
| `kebabCase(s)`  | `'foo-bar'`   |
| `snakeCase(s)`  | `'foo_bar'`   |

```js twoslash
// @twoslash-cache: {"v":1,"hash":"fcc5c18f67a1882e573cc8a37d58a7a3256d60904aa5b4bb2bfc7c4a43c81402","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhoBzALYxWAYS4xEvALIxxEADzIRpdmADmCrTt0BdCr0N6AfAB0w7cVgilR/CVNlxcVKBH4JEINJCJM68zOZo2nq8aBC8AAaukjJy8QB0lCAizM5IAJxUrDB6aPj5VGg5ujAMAUnucpkcYLiIAAxU/Pg5zPw05Ih5AL4U6NitBMRkmTT0TGycPAJCIrwA1jAARsybHvJKKuqakUYGJ3qmEVG6NnYOTqIb27uN3r7+gcFkouEWujFxeJPHYAWlcnniZlKMHM3RwvAgADMwgkoMxKiD4mE0CdNgBXGgZKjZXKIABMHRARRKZUGFSqNTwwJeniaOlalK6PT603JbRGYxweEIIRmdFqIBYHC4fEEwlEWC4rhSngUylUGj+Z2ulz+t3sjlCirgyr2mR8fjwQTAIR+VyMAISAAUlWw9ulMiTagBmACMhWKulKSF9lMqpGqEuNpteVPZSE53VIvX6SD9Auo42FU3IFXF82lS2jbrkjC19r03G1RlsBoevGLKq8IAtH2ttpRf0d8RdJpLEKJWXDtQAHABWAM0kNhhlR11NtktJBkzpJlO8/mjTNCgIi6Z5uYBKWLWVuJtl876Cu6KvX2v3UL1BdvS0BdvfTuX7tP92Dr0h70ABZJyDWkCmoWc8B/WNmlab1V25VN2gzTAd0mUUDwlY8ZXWLYdj2C9rmrStiN0e9DUePCWWbVsrS+UJfi/WIEmZMFUihfAYTgOEYSRFF4jRDEsXRXECRgP9hxDEcVypQNgzpCCI0ZAJmTNQp40QYCQC5ZMeQGflTG06AJjrUJgDEZI9jMVS5DMRs9l4IZeERUgIHEXgAHIAAERDxKB2DcmpmAAegAKzgEFYggVg1nYNAQSIQDgoJdhWDgDyAG5bFsezSw8qBk10SL8FIeBCFYKAPO4DLeGC4LPIAEUKgAVEqyuiyrbGgzxGHywritK7iOqqmq6s8grmF0VrBvKzqwBsnq+sm6b2oqkbavqpaitKGbhsySRKiQUBxWKOAArAPBwpAIYhiAA==="}
import { camelCase, kebabCase, pascalCase } from '@studiometa/js-toolkit-v4/utils';

pascalCase('drag-threshold'); // 'DragThreshold'
camelCase('drag-threshold'); // 'dragThreshold'
kebabCase('dragThreshold'); // 'drag-threshold'
```

::: tip The four converters are memoised
`pascalCase`, `camelCase`, `kebabCase` and `snakeCase` are `memo`-wrapped, because the framework converts the **same** names on every option read and every handler resolution. `lowerCase`, `upperCase` and `capitalize` are not — they are single-pass and there is nothing to cache.
:::

These are the functions the framework itself uses: `kebabCase` turns `dragThreshold` into `data-option-drag-threshold`, and `pascalCase` turns an option name into `optionDragThresholdChanged`.

## Leading and trailing characters

| Function                                       | Does                                   |
| ---------------------------------------------- | -------------------------------------- |
| `withLeadingCharacters(s, chars)`              | adds them if absent                    |
| `withoutLeadingCharacters(s, chars)`           | removes them once                      |
| `withoutLeadingCharactersRecursive(s, chars)`  | removes them as long as they are there |
| `withTrailingCharacters(s, chars)`             | adds them if absent                    |
| `withoutTrailingCharacters(s, chars)`          | removes them once                      |
| `withoutTrailingCharactersRecursive(s, chars)` | removes them as long as they are there |

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c587a676dc6124acff5ffc0def82ee18254c6f3a3157e0560f66466cdb452fe9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAYXzNSzMWTiM4aUmvWJeJsxoq8ROvQdJxL189zenzAHTDsAWywIUjQZOUVlVQ1tXX0aF0oQKAgRBEQQAEEoKF55GF51dhIpBzjnODyIPPwCk10wiH5eZitvW15JERgAOiT60KQARiGqVhgNeSQAJlHqXXUYBgzZeSUVc1inBIQxtVxEObLtshmAXwp0bAOCYlOqGnomNk4eAWExCSlVwkE0ABU9OwODFHPFDAAlGAiQQuYowYztCxtGzqOzHcEuLyozwo3z+IIhMI/CB/QHMYGbMEVKEwuEkJIpNJ4KEBO41ApFEr2ak7ASkCABDm8Ca5JotPEdLidfg0KTS/IYXikGA4ZhoPpUAbLADMADYxhN1FNEDqACwPBZLPAkslAkFaXmQ6GwuDwpIgg7TKgY5znS7Ua54QgkcgPOjLEAsDhcPg/dbRR3lHaI1HY8zop1YyXqXHuDR+QLBULhNZRKnJwyM1LpLI5YVciY8ysuKrC7UyiX5tGdUS9fpoBrDIYAVkNk3wMzmg9Ii0j8fLoJbuxAnqQY5AvoSSAADBcrjhg3cw9QI88Y28FxslycXKnzOmOlvDI/c6/C4SS1fE1tMSumbW2S5PkhTwqUWaVGg1QgR24qtN2dhdP2WozssQx6haq5GiasyWrO1orBECYVreK5rogBqblmu77oGh4ZCG9ynk8GTRq8cYRKSAL2iRf60q68L3hor6Zsur55kiH7FsSnF2hSDq/jSLr0rgVAASyMBsiQDZgc2pH8oKwqip28FInY0pNHKLSQbUSoqmqGoDkOiDTDq3pYROSDmnhc42rJ3HybxSl0m6DJ7GABwAOw+tRiB7gAuj60A3EWRK8MAfi8KWkTXkmpEUJl2VceSlI3nxymhTABVgGcBlCgA5AAAiYgiqIKSzMAA9AAVnAAC0UEQKwADWch9UQZqdX8wJwPVADcfh+N+QUpvVABGuj1XY9X8BAED1dwc28J1nW8Dte0baQ9VLURi55X+jDnRAl1bWdu37Ydx2nU9L28IAKAQtKwKoqEq+Qqjd8jFTxZXBQJJCPVg6r4CdnWvfVqOfSdZ2I/I9VJAEHVIKAEYTG6kh4L1IBnGcQA=="}
import {
  withLeadingCharacters,
  withoutTrailingCharactersRecursive,
} from '@studiometa/js-toolkit-v4/utils';

withLeadingCharacters('bar', 'foo'); // 'foobar'
withLeadingCharacters('foobar', 'foo'); // 'foobar' — already there
withoutTrailingCharactersRecursive('path///', '/'); // 'path'
```

The **recursive** pair exists because a URL joined from parts collects separators, and removing one is not the same as removing them all.

## Slashes

The four named cases, for the one separator every path uses:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e39d97cd15dec1619a5909cd20f3446185a1bf1dddc30c8a37222f07473dd106","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAZVZd8jOGlJr1iXgaMbup88YA6YdgFssEUmhlzFy1Ru27KIFAQIgiIIACCUFC8zLys3sZmOnD4vGgQMWaGxhS8kiIwAHQBBsxuSACMFVTxGvKVAGxUaGXqMAxhsvJKKsZ+KQEcYLiI1SAi+GXMYmRIAEwAvhTo2CMExLPNdB0gLBxcfEKi4pIe8hCCaD0+Wsl6NhrW2ZZPFur2Ti5uZ4SX1313AJBEJ4ABKMEcGzS+BgcQSGiSugEpAgjkyD3UuXyRRKLXKiAAzGNaup6qMAJzNVrtPBdX5XeG3fw1NQjOZUCZTGbkRCLZbUVZ4QgkchbehMNicHgCYRiCRSOkXNAAFVIzHYQyZKX0zxMWTeVn1dgczlc7kVl1V6s1/XwQOCoRA4MhJGhsMM1sScDuyNR6N1WNEOKopXxAFYACw1GB1O28gAMVNIbR2FpVao1AOZICGIwJHMmau58yWKxwQo2ouo2wl+2lRzlpzpVszvjuOrer2MhoxH1N32bGZtgKowMdkWisQ9rfUiJSaQysQxgYKxRDeI6AHYABzR2OVTdJlO0zwt4fZ3NIKPjQvTGg8vlltbCzbV8VhPZSvh0/5t3Qd4wuxeI0ND7L5zU8X8tTtUcHTwCdMniXoEW9JF0n9N4V2DEBQw6CoI0THMY1JOMKiaahqVTSDGVtQZWSQQ8by5e8kHjUsBXLMIXyrGh312SUDh+JUoNtADHhA9Qe11MCzSEv4aJHQI4LCZ0oXkWEkJuOdUn4FE0SXAM8iDNccI3A9KSI/cKSPGlOk8YSFIvejEF3JiixYxA2P5TBOPWEUAl4nZP0EwdPT/bUMSAySopkgdTyHLMBlgkEwgQqcEpQn10IMzCjNXXEyg6OY5mJYiyQqRi8WPOz5DPRKYJzZyLM5dzZk89ifOfSsAprD8BOlNM6vC+5dSiqS3liiDzktDLoPtFKnQhNSYTSWbtN9fSJKwkzcPmBp80skj5kIqrbJAQbZtollhkqQiWrvNq2IAXQ5aA1k+WTgHsXgfhEu4KG+uSGWQ6CAakIGhtBwHQpnW0wYWDbeAAcgAAQMQRVFRdpmAAegAKzgABadIIFYABrORCaICMccuDU4CRgBuex7B/RztSR5gACMlSR7hGd4HGceRnHud51n7PkkHRKR0WecuPmBaF5GxYViXasu9tZdVtBFcF4XtfltAcaR9X6UhmW5aVE3+f1kWdaRgJHGxpBQG2GM4HlPACZABYFiAA"}
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

Each is the `*Characters` function with `'/'` filled in, which is what makes a call site readable at a glance.
