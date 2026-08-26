# Timing

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8d2c998a404360640f1be055caab2811c46a9517f022767c704fd9509b899374","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWACMIwkTAA8AQVIBzOLzo0wULcIDWkAO5hkAXQB8jfmES9GAOhfMNcB2s18AvFd5EEOxQFNIwrMwYAPwOYIIAtjJk3A7Oru6e7r7+gcEAOmDs8VgQpGhhcgq4VFAQIgiIIAAi4ZG8zAIK4pK8wuKsvOzlcGgQWFpJ7GDqvCJsrDBQAqW8aPgwvOrsJFLx7KwccDAikvpOBQDyYKwYq+u8ESOz8wDkWm7qCTBgaO+kG4IjlAnJRqMxNEhkMgQBwwIZQfg0GhxogAPSogBWcAAtKMIKxDENsUQACxOEaCKASeIwNDMJywIiowT9OCo8R7aZORHxVgAYlk8lEuAsFioIzcDEQAE4qAtpmskAAOKh0jS0vCCqqg2G4RAABioInwbmYYjISGlAF8KOhsHqCMQLaqdEw2JweJ1RN1djB4hBVO5tPRvvpeJZeAAfcOGGAYBxGUxgMW8ABqbEEMBsdlSLicHw8vC8nr8aYzMBSvAAsn6A8XQunWJmrAUiiUyrwaf7QbV6ngAMJm+4dITeiRgN68f5wQSsco4UjtDRfH6hPr7Vb4pajZbqtAg1XghpQkBYU3xUF2XgAFXuo7E483ndr7COTl4AElynTY1pJBsPhXNBQhWSAwBgEExWhWF4SoRFkQ8dEsVxCB8UJNBiTJCkqQgGk6QZGAmRZfY2Q5KZ1G5NBeT5LsIBAUVxTVKUAEZZRhb51EVRASUPPc8FonUpj1Q0QGNU1zXIRBWJtO0cDwQgSHIF16DdDguD4e8fTuUgICRBZA00YNdDDRMIDMSxs3sRw8wLTJvF4UtchCMIImiWIEiSUhKzSfMMiLLIHJyIIoFbYpSm/fAdL06oQF7BoQAAJWEdovQfHpmHKf0nkkRReAXTZtm+Tt9kOY5TjgECpDWDYFmYKlpm0KB1AggoVGeA5BjAOBgg2areBMKZahMQYtCgHSsBwZzIHKWB+DIf5gVBOkIRQaCplgggkRRJCcTxAkiVJck0EpalaXpRlmVZdkinIyjqLWKK0AWeixRACUyiQAAmABWOUOK4lUwT4xoHt0p6Yt1JARLE0gzRoSSfpk6h7Xkp0lOoV1GhYNTPU0x8TGYIZGFgVyYl4OJEmSBwAAUdL2I4lCcltCjCjsCaGHs6nihL4HxEh2n4eG7g2LYdmKg5XzKvQ4APMEVpPGCES2xDMV21D9oww7sNO/CLuI1hSJurkeX5dmGAYt6mKQABmX72IVfAkB4oHmqlEAzcE8CoaNE1YYkm3vqtV6TlgPA23C3hgAqIVFFCWjQlB6LQjN3grQEOneBeAABbXcLO1WULQoZLpIl4AG5QTw5gkFAHRvm6yQ8CxEArStIA="}
import { debounce, memo, throttle, wait } from '@studiometa/js-toolkit/utils';
```

[[toc]]

## Rate limiting

```js twoslash
// @twoslash-cache: {"v":1,"hash":"72703f480a0f8ef58df5091f6d3c43265a559834e005fd41c8ea143073936ef2","data":"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"}
import { debounce, throttle } from '@studiometa/js-toolkit/utils';

const search = debounce((term) => console.log(term), 300); // after the last call
const track = throttle((y) => console.log(y), 100); // at most once per delay
```

::: tip Not for scroll, resize, pointer or frame work
The services already coalesce: the scroll service batches its events into **one `read` per frame**, and the resize service is a `ResizeObserver`. A `throttle` on top of that is a second, worse rate limiter.

Reach for these for what the framework does not own — a `fetch` per keystroke, an analytics call, a `localStorage` write.
:::

### debounce

```ts
debounce<Args>(fn: (...args: Args) => void, delay?: number): (...args: Args) => void
```

Runs once, after the calls stop.

### throttle

```ts
throttle<Args>(fn: (...args: Args) => void, delay?: number): (...args: Args) => void
```

Runs at most once per `delay`.

## Waiting

### wait

```ts
wait(delay?: number): Promise<void>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a320393e5a72909d9f577e0a74a5276b39ce7a203aae3990d8f3f8b50ea04393","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7N2aRrFbMMAfkS8wggLYAjMtw0AFUhG3s4MADxEI7KAD4AOmHbasEUmhlyGVKBAiCIggAErwEKwkvMz8NKS8aPgwvADm7CRS5qwcliKSUHAAdJTUzKnByMggHGAA1qX4aGhYcIgA9O0AVnAAtGgQkXXyvUQALEVwaIJQEtowaMxFsETtguKscO3i5mCpRU3arADEsvIgALoXVFPMXkgAnFSsMHtJSGNUi6SpC3hnfhq7DAuEQAAYqCJ8HdmGIyI8AL4UdDYUEEYjwr50BghISicSSXhYZiCSyMQy8ExmCzWWz2BylW73RAANieNVeqXeiAArF87r8cSBiaTcM9gaCAEyQ6GkWHxJAARh5SJRODwhBI5Cx9CYbE4PB88kUMGUag0Wj0BmMpnMlhsdkcLjcHi8RsBASCeHCcEi0Vi8USyTSGVevGyuRg+TAhRK/IqSCqQPqjWarQ63T6AyGI3Gk2mszMCyWKzWGy2O2B+0OJwBl2uICZOIAHAB2Z6c7mfMo/P4hOvikFIADMMphcPIiGbCIb+VgeBdnm8wHdvARAltvAA5AABKYzObFzP9QasYZoMvsTZbgDcLhcXAwogEwjEEikIrJfGALl4MQB7qMMOYJgtwd5gAipTzIsSCgNirxwO+eA9CACIIkAA="}
import { wait } from '@studiometa/js-toolkit/utils';

async function pause() {
  await wait(300);
}
```

`await wait()` with no argument is one turn of the event loop.

For a frame rather than a timer, use [`nextFrame()`](/api/scheduler/nextFrame.html). For "the framework has caught up", use [`whenDOMSettled()`](/api/dom/whenDOMSettled.html) — a timer is the wrong tool for both, and the reason the [test helpers](/api/test/) exist at all.

## Memoisation

### memo

```ts
memo<Args extends [] | [key: unknown], Value>(fn: (...args: Args) => Value): Memo<Args, Value>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"24317aa1a889584585d9df6590211af45523aa5f20df6b90c3f2fd517314262e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxpEADwBBUgHM4vOjTBQNyALq8APr2QBrGBkS9hZyAHcw+irwBqbQTAB8jfmGuMAHTBzGpw1irqfAC8Xm4eMNzWALJyipFwLu6snl4AOmDs0lgQpGgyaZQgUBAiCIggAMLMIvgwvMwCwmISYADkGqTwgqzlOKQdaoKyYGguwuKsvGgQrFDLEAKlqjBogVVozOpIyMggWKHM0lV+vAAqbV2i4pIbFfLscDCBvACS5YcLBpJO1QqppjBZi5SrxIGBviBnGcOGAzFV8Gg0FhwgB6HEAKzgAFoVqszOw0ESiAAWQJwNCCKASWSHQKwIg4wSLOA48TSdhgVSBDHSVgAYlk8kRzhA9NCDEQAE4qKxIao0PgkNSqIc1Ls8JKIFUUbhEAAGKitS5iMhIRUAXwo6GwpoIxFtOq0eBEknpmloODAcHYJBSaQU5ks1lsDicLmYYAwXiqcrKSAAbBaQKrBRq7TqwfqGnRA8GSMaBaaAEyW/DWmjkRDpx3OnB4Qgkcie+hMNicHjvRSRqw2VGx5wdRM+PwBCwjmMQRwxOIJjBJXipeQRufRseLuOTpMFIolMqDqo1Op4ZqtUFPHqSAa8IZwEZjMiTcEzOajxYbNZvPw2y7PsBbHCgZwXKQVw3FIDztEIzy9G8hqfN8fwAswQK8CCn4QlCOETHCCJItmApolQGJYriBLEqSrDkpSNJ0gyTIQCyzBsjAHJcuwrA8nyApCiK4qGtKVCpgqADsNbZmqeaINq1CFgqIBiSqlZILJVrQTajYAIwABwttQLrtu6XbUF6DSMFBVy7GQfA7qOdj7imurSYZKryZqiAAMwFnqqlzhW8JabW9a2ogVbUiZmBtg0HYelZPY2XZLKObwzkLo47nykghnpt5ua+QFylBXgIUaWF0URbpDZIH5VZxWZiUWQc1kgKueVpkqWY5uqvleeVOyqSsADKaCkEJoXVnVLQNf5zZOqZCVup2HWpV1iY9Qq+lmvpxWDRmgWjXgQw4MwDDVXNIA6QtUXUlJLVrUllk0FtPpBuUJaQmWMBhvIBSMNle5LrwsSHrtSD6fpSkDQpyojUWIC/UGIa4DdWrzXpSBmi9rpvZtqlfX6aP/YDEDA6Drng5D3USR5MPUrJCO+UjupncWAZ/Rjs1IAArDji34zKPqwHgJ6lOUwCDrw9oCKQ7G8H0AAC9KMsyuzMLRJIQGSFKctyfQANwFAUpM/Tz6MkBDg6MCDljLllliBBNU1CYw3CBBdMBXYwVbcNwZtgAU5MY4wfTMH0we8HivA+sUXIwFAYfW/9kfR7H8ciC0bRQFUHFIKAWi85IeCEiA9r2kAA"}
import { memo } from '@studiometa/js-toolkit/utils';

const expensive = memo((key) => key.toString().repeat(2));

expensive('a'); // computed
expensive('a'); // cached
```

**Zero or one argument, and that argument is the key.** That is the whole surface, and it is deliberate: a memo keyed on several arguments needs a key strategy, and a key strategy is a decision the caller should make visibly rather than inherit.

It is what the four memoised [string converters](./strings.html) are built on, and what memoises the active breakpoint name for the length of one task.

`cache` and `memoize` from v3 are not shipped — this covers the one case core needed.

## Placeholders

They earn their place as **defaults**: a parameter defaulting to `noop` removes an `if` from every call site, and one defaulting to `noopValue` removes it from a transform pipeline. Both are one shared function, so a default costs no allocation per call.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c348afadd27609ad7f034937fddef54b32a9559553923af4f22c531bca4b5d71","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvSBCyNuiXkQjsoAHTDsAtlgik00iLMogoEEQkQgAIhENp87MAHMKvAO75mNEqV7sDdjheETZWGCgPAPwAOhM0ZmdLZGQQDjAAaxN8NDQsOEQAekKAKzgAWjQjVgyA8qIAFhi4NEEoCS0YBJjYIkLBcVY4QvEtJ2cYnK1WAGIZLBAAXUWqFuZ9JABOKnCXByQGqgTSZy68eZN03EQABioRL1JmMTItgF8KdGxrgmJXo7oDCsLA4XD4QlE4kkhlkADU2IIYAAeAAqAD5GEQETBFCiFLwURptLp9DCsPDWIiTGYLHgAEpdQSkKQOGBKbG8YRsGikCKKVn+WBgcSYXgQfi8Zi8NBPMBwfh6LQhLxOOJHRLJVLpLJUHJ5ArFMqVaq1ND1JotNodLrMHowPoDdhDEbacaTNDTOZGLBYym4ZarY5AgCMAFYdjA9vgtuqTmcrPMKVSdk5rncQA91s8eUgwx8vjg8IRfPFAXgRJIWmKwLYwDjePJeABeNFKFRQExrDaIADswYjUaQADZY6cgSBJLXcCm60gAEz3R7Z16IIf56jfIt/cgA+hMNicHgCYRiCRSebyRTKVREnR6AwXKg0yw2OyQBzjNyebz2sj+QLBKErDhJE7jRGq1AakgKRpE4OoELk+RFKUFRVBANR1I0zStO0ECdN0vT9IMwyjG6UyzBcAYgF2QIABzprszj7IghyQXG46PrBs6IAuGZLi85CIHmnwboWVjFv81BllYFZyoEQoihgiiohivqIrifAtgSnZBrmc6sYxzG0aO8YgKokaKZcqZIAAzIuWYCcO66YGJvwlru44goe4InlC57ekmyLopi2Iabit4kg+AXYtS5gvgyrTMtK+BsmpbJcqwPJ8slbLmcKAQYGKEpSjKzBygqpBKpmqrxFBKBanB2SIQaKHGuhprmthVp4TadoOsRLpjC47qevMaVLCs1G6UJNnhmkkZMdGiDbGxY7nNFfpWdxdl8Q5OZCT2byTRWsB4MS968MAZJuImHJvAIpB4bwADkAAClq4fhzCtWhGFoERTpwM9ADcGgaLJVaTpIbJNmSwO8MUkohGEABGzwZMl3i8GY8D2I4Ljg5W8kWQVzZkoF8OIyVsryoqmMGJmLi4+++POCYX1IKAgKRnAZ54GUIBvG8QA"}
import { noop, noopValue } from '@studiometa/js-toolkit/utils';

const onDone = noop; // a callback that does nothing
const identity = noopValue; // a transform that changes nothing
```

### noop

```ts
noop(): void
```

### noopValue

```ts
noopValue<T>(value: T): T
```

## What is not here

| Not shipped                    | Write                                                      |
| ------------------------------ | ---------------------------------------------------------- |
| `nextTick`                     | `await Promise.resolve()`                                  |
| `nextMicrotask`                | `queueMicrotask(fn)`                                       |
| `Queue`, `SmartQueue`          | the [scheduler](/api/scheduler/)'s lanes                   |
| `domScheduler`, `useScheduler` | [`defaultScheduler`](/api/scheduler/defaultScheduler.html) |
