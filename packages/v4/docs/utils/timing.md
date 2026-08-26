# Timing

```js twoslash
// @twoslash-cache: {"v":1,"hash":"160227d335e2490422c34dcdae0fdc82423078ffc99b553e369cbe295c0f046c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWACMIwkTAA8AQVIBzOLzo0wULcIDWkAO5hkAXQB8jfmES9GAOhfMNcB2s18AvFd5EEOxQFNIwrMwYAPwOYIIAtjJk3A7Oru6e7r7+gcEAOmDs8VgQpGhhcgq4VFAQIgiIIAAi4ZG8zAIK4pK8wuKsvOzlcGgQWFpJ7GDqvCJsrDBQAqW8aPgwvOrsJFLx7KwccDAikvpOBQDyYKwYq+u8ESOz8wDkWm7qCTBgaO+kG4IjlAnJRqMxNEhkMgQBwwIZQfg0GhxogAPSogBWcAAtKMIKxDENsUQACxOEaCKASeIwNDMJywIiowT9OCo8R7aZORHxVgAYlk8lEuAsFioIzcDEQAE4qAtpmskAAOKh0jS0vCCqqg2G4RAABioInwbmYYjISGlAF8KOhsHqCMQLaqdEw2JweJ1RN1djB4hBVO5tPRvvpeJZeAAfcOGGAYBxGUxgMW8ABqbEEMBsdlSLicHw8vC8nr8aYzMBSvAAsn6A8XQunWJmrAUiiUyrwaf7QbV6ngAMJm+4dITeiRgN68f5wQSsco4UjtDRfH6hPr7Vb4pajZbqtAg1XghpQkBYU3xUF2XgAFXuo7E483ndr7COTl4AElynTY1pJBsPhXNBQhWSAwBgEExWhWF4SoRFkQ8dEsVxCB8UJNBiTJCkqQgGk6QZGAmRZfY2Q5KZ1G5NBeT5LsIBAUVxTVKUAEZZRhb51EVRASUPPc8FonUpj1Q0QGNU1zXIRBWJtO0cDwQgSHIF16DdDguD4e8fTuUgICRBZA00YNdDDRMIDMSxs3sRw8wLTJvF4UtchCMIImiWIEiSUhKzSfMMiLLIHJyIIoFbYpSm/fAdL06oQF7BoQAAJWEdovQfHpmHKf0nkkRReAXTZtm+Tt9kOY5TjgECpDWDYFmYKlpm0KB1AggoVGeA5BjAOBgg2areBMKZahMQYtCgHSsBwZzIHKWB+DIf5gVBOkIRQaCplgggkRRJCcTxAkiVJck0EpalaXpRlmVZdkinIyjqLWKK0AWeixRACUyiQAAmABWOUOK4lUwT4xoHt0p6Yt1JARLE0gzRoSSfpk6h7Xkp0lOoV1GhYNTPU0x8TGYIZGFgVyYl4OJEmSBwAAUdL2I4lCcltCjCjsCaGHs6nihL4HxEh2n4eG7g2LYdmKg5XzKvQ4APMEVpPGCES2xDMV21D9oww7sNO/CLuI1hSJurkeX5dmGAYt6mKQABmX72IVfAkB4oHmqlEAzcE8CoaNE1YYkm3vqtV6TlgPA23C3hgAqIVFFCWjQlB6LQjN3grQEOneBeAABbXcLO1WULQg6SUukiXgAblBPDmCQUAdG+brJDwLEQCtK0gA==="}
import { debounce, memo, throttle, wait } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## Rate limiting

```js twoslash
// @twoslash-cache: {"v":1,"hash":"daeafcc7b411344a60029e09f9ade6dcaabf1f494f677886ae8122bdb7bd0cae","data":"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"}
import { debounce, throttle } from '@studiometa/js-toolkit-v4/utils';

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
// @twoslash-cache: {"v":1,"hash":"5d567121105e1b2d6c29ca9e8e139c51556439797a7a6511794af9747ba4ca8b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7N2aRrFbMMAfkS8wggLYAjMtw0AFUhG3s4MADxEI7KAD4AOmHbasEUmhlyGVKBAiCIggAErwEKwkvMz8NKS8aPgwvADm7CRS5qwcliKSUHAAdJTUzKnByMggHGAA1qX4aGhYcIgA9O0AVnAAtGgQkXXyvUQALEVwaIJQEtowaMxFsETtguKscO3i5mCpRU3arADEsvIgALoXVFPMXkgAnFSsMHtJSGNUi6SpC3hnfhq7DAuEQAAYqCJ8HdmGIyI8AL4UdDYUEEYjwr50BghISicSSXhYZiCSyMQy8ExmCzWWz2BylW73RAAdgATM9Xql3ogAKxfO6/HEgYmk3DPYGgjkgKEwuHkRAARl5SJRODwhBI5Cx9CYbE4PB88kUMGUag0Wj0BmMpnMlhsdkcLjcHi8RsBASCeHCcEi0Vi8USyTSGVevGyuRg+TAhRKAoqSCqQPqjWarQ63T6AyGI3Gk2mszMCyWKzWGy2O2B+0OJwBl2uICZOIeEJqXJ5nzKPz+ITrEpBSAAzJDoaRYfEkAAOBEN/KwPAuzzeYDu3gIgS23gAcgAAlMZnNi5n+oNWMM0KMxmX2JstwBuFwuLgYUQCYRiCRSUVkvjAFy8GIAXdRhBzBMFuAfMAEVKeZFiQUBsVeOBPzwHoQARBEgA=="}
import { wait } from '@studiometa/js-toolkit-v4/utils';

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
// @twoslash-cache: {"v":1,"hash":"a500099a6095054247ff60ae8c7cf4c444eae8aa419d79dc2f6f702009aa2ac2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxpEADwBBUgHM4vOjTBQNyALq8APr2QBrGBkS9hZyAHcw+irwBqbQTAB8jfmGuMAHTBzGpw1irqfAC8Xm4eMNzWALJyipFwLu6snl4AOmDs0lgQpGgyaZQgUBAiCIggAMLMIvgwvMwCwmISYADkGqTwgqzlOKQdaoKyYGguwuKsvGgQrFDLEAKlqjBogVVozOpIyMggWKHM0lV+vAAqbV2i4pIbFfLscDCBvACS5YcLBpJO1QqppjBZi5SrxIGBviBnGcOGAzFV8Gg0FhwgB6HEAKzgAFoVqszOw0ESiAAWQJwNCCKASWSHQKwIg4wSLOA48TSdhgVSBDHSVgAYlk8kRzhA9NCDEQAE4qKxIao0PgkNSqIc1Ls8JKIFUUbhEAAGKitS5iMhIRUAXwo6GwpoIxFtOq0eBEknpmloODAcHYJBSaQU5ks1lsDicLmYYAwXiqcrKSAAbABmFVqjV2nVg/UNOiB4MkY0C00AJkt+GtNHIiHTjudODwhBI5E99CYbE4PHeikjVhsqNjzg6iZ8fgCFhHMYgjhicQTGCSvFS8gjc+jY8XccnSYKRRKZUHVRqdTwzVaoKePUkA14QzgIzGZEm4Jmc1Hiw2azefhtl2fYC2OFAzguUgrhuKQHnaIRnl6N5DU+b4/gBZggV4EFPwhKEcImOEESREAUTRKgMSxXECWJUlWHJSkaTpBkmQgFlmDZGAOS5dhWB5PkBSFEVxUNaUqFTBUAHYAFYc0FPNEG1ahCwVEAxJVSskBrEArWgm1GwARgADhbagXXbd0u2oL0GkYKCrl2Mg+B3Uc7H3FNdQVYzDPk9VNUQbMVL1NS5wreFtNretbUQKtqTMzA2waDsPRsns7IcllnN4VyF0cTz5SQYzlTI3MAqC3UdlCyxwurKL9IbJBMyrBKLOSqyDlskBVwKtMlSC1UFIC4yCxCvAVgAZTQUghNqyLdLrBqYszZsnXMpK3U7Tr0u6xNeoVQyzWUwb/IzUaqrwIYcGYBhNIi2L6paRqlKk1qNpS6yaB2n0g3KEtITLGAw3kApGFyvcl14WJD32pBDMMqS/MUkrKqLEB/qDENcDu01lL0p6YrNN7XQ+7a1J+v0McB4GIFB8H3Mh6Geokry4epOTSqG/Ngou4sAwBrG5sQDn8YMpAiZlH1YDwE9SnKYBB14e0BFIdjeD6AABelGWZXZmFokkIDJCkqWpTluT6ABuAoCgpv7+cxkgocHRgwcsZccssQJJumoTGG4QIrpgG7GCrbhuGtsACiprHGD6Zg+gj3g8V4H1ii5GAoGjh3AbjhOk5TkQWjaKAqg4pBQC0AXJDwQkQHte0gA"}
import { memo } from '@studiometa/js-toolkit-v4/utils';

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
// @twoslash-cache: {"v":1,"hash":"a90bfe5cdc8aa414e93bf2d075d71a488d161f8acfad585a833943607a7245eb","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvSBCyNuiXkQjsoAHTDsAtlgik00iLMogoEEQkQgAIhENp87MAHMKvAO75mNEqV7sDdjheETZWGCgPAPwAOhM0ZmdLZGQQDjAAaxN8NDQsOEQAekKAKzgAWjQjVgyA8qIAFhi4NEEoCS0YBJjYIkLBcVY4QvEtJ2cYnK1WAGIZLBAAXUWqFuZ9JABOKnCXByQGqgTSZy68eZN03EQABioRL1JmMTItgF8KdGxrgmJXo7oDCsLA4XD4QlE4kkhlkADU2IIYAAeAAqAD5GEQETBFCiFLwURptLp9DCsPDWIiTGYLHgAEpdQSkKQOGBKbG8YRsGikCKKVn+WBgcSYXgQfi8Zi8NBPMBwfh6LQhLxOOJHRLJVLpLJUHJ5ArFMqVaq1ND1JotNodLrMHowPoDdhDEbacaTNDTOZGLBYym4ZarY5AgCMAFYdjA9vgtuqTmcrPMKVSdk5rncQA91s8eUgwx8vjg8IRfPFAXgRJIWmKwLYwDjePJeABeNFKFRQExrDaIADshzSkec+0QADZY6cgSBJLXcCm60gAEz3R7Z16j/PUb5Fv7kAH0JhsTg8ATCMQSKTzeSKZSqIk6PQGC5UGmWGx2SAOcZuTzee1kfyBMEoSsOEkTuNEarUBqSApGkTg6gQuT5EUpQVFUEA1HUjTNK07QQJ03S9P0gzDKMbpTLMFwBiAXZAgAHAAzBGUYHOO8bgN6lypouy5Zi85CIHmnyboWVjFv81BllYFZyoEQoihgiiohivqIrifAtgSnZBrmC49sxQ7RogdFsZOqiRgpXHzogTEZiu/FICOG6YKJvwlnuk4gke4KnlCF7ekmyLopi2Lqbid4ko+AXYtS5ivgyrTMtK+BsqpbJcqwPJ8slbLmcKAQYGKEpSjKzBygqpBKpmqrxNBKBavB2RIQaqHGhhprmjhVr4TadoOiRLpjC47qevMaVLCsNE6YJDEmQOLGINsUFxpOiYxXO1y2ZmTwOYJPZvJNFawHgxIPrwwBkm4a1+rwbwCKQ+G8AA5AAApaeEEcwrXoZhZqNMRTpwE9ADcGgaDJVbTpIbJNmSwO8MUkohGEABGzwZMl3i8GY8D2I4Ljg5WckWQVzZkoF8OIyVsryoqmMGJmLi4x++POCYn1IKAgKRnA554GUIBvG8QA"}
import { noop, noopValue } from '@studiometa/js-toolkit-v4/utils';

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
