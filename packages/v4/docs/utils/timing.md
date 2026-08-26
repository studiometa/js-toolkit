# Timing

```js twoslash
// @twoslash-cache: {"v":1,"hash":"160227d335e2490422c34dcdae0fdc82423078ffc99b553e369cbe295c0f046c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWACMIwkTAA8AQVIBzOLzo0wULcIDWkAO5hkAXQB8jfmES9GAOhfMNcB2s18AvFd5EEOxQFNIwrMwYAPwOYIIAtjJk3A7Oru6e7r7+gcEAOmDs8VgQpGhhcgq4VFAQIgiIIAAi4ZG8zAIK4pK8wuKsvOzlcGgQWFpJ7GDqvCJsrDBQAqW8aPgwvOrsJFLx7KwccDAikvpOBQDyYKwYq+u8ESOz8wDkWm7qCTBgaO+kG4IjlAnJQQCM3AxEABOKgLaZrJAADioaA+MEhIFk8lE1RAHDAuEQAAYqCJ8G5mGIyEgoQBfCjobCEgjEakonRMNicHidUTdXYweIQVTubT0b76XiWXgAHylhhgGAcRlMYAsoQAamxBDAbHZUi4nB8PLwvDy/LwtawdSleABZQXCs2a7W6gpFEplXjxR2g2r1PAAYUp9w6Qj5EjAb14/zgglY5RwpHaGi+P1CfX2qwgrCWo2WGnRIJRzE0SGQyBAWAp8VBdl4ABV7uGxJHs97Hewjk5eABJcqohVaSQbD5ptChFaQAkgizqsGospIACMMLx33UCMQABYS4WMT6haD8YSSSAyRSqeREKv6YycHhCCRyOz6JyOFw+C3+XdSBA0GgCwipoYq6JKKoQGYlh6vYjiGsamTeLwFq5CEYQRNEsQJEkpC2mkRoZKaWTITkQRQO6xSlAO+B/gBCx+nUDQgAASsI7S8q2PTMOUQpPJIii8EmmzbN83r7IcxynHAk5SGsGwLMwUBTDMizqDA5xgCozwHIMYBwMEGxybwJhTLUJiDFoUB/lgOBoZA5SwPwZD/MCoLgkuiAAEwAKywhuW7ItQaIYmstGAbiJ5IGeF6kJSNDXj5d7UEyj6si+1Aco0LAfjy35tiYzBDIwsAYTEvBxIkyQOAACn+exHEoqFWBRnrlAVQwMQGjTMfAOYkO0/DxXcGxbDsYkHF2kl6HAxYLhCSAAMy+eu8L4Egu5BfueDtQwsJTKepLkrFV6Ld5tLzicsB4B6VG8MAFTYoooSHhAoShf+4WhDtvC0gIdW8C8AACIyCEpEA+qiAD0ABWcAALSjDmhhDHDRDbpDgj9HALwANyghDzBIKAOjfPpkh4LDIC0rSQA==="}
import { debounce, memo, throttle, wait } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## `debounce` and `throttle`

```ts
debounce<Args>(fn: (...args: Args) => void, delay?: number): (...args: Args) => void
throttle<Args>(fn: (...args: Args) => void, delay?: number): (...args: Args) => void
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"daeafcc7b411344a60029e09f9ade6dcaabf1f494f677886ae8122bdb7bd0cae","data":"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"}
import { debounce, throttle } from '@studiometa/js-toolkit-v4/utils';

const search = debounce((term) => console.log(term), 300); // after the last call
const track = throttle((y) => console.log(y), 100); // at most once per delay
```

| Function   | Runs                       |
| ---------- | -------------------------- |
| `debounce` | once, after the calls stop |
| `throttle` | at most once per `delay`   |

::: tip Not for scroll, resize, pointer or frame work
The services already coalesce: the scroll service batches its events into **one `read` per frame**, and the resize service is a `ResizeObserver`. A `throttle` on top of that is a second, worse rate limiter.

Reach for these for what the framework does not own — a `fetch` per keystroke, an analytics call, a `localStorage` write.
:::

## `wait`

```ts
wait(delay?: number): Promise<void>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5d567121105e1b2d6c29ca9e8e139c51556439797a7a6511794af9747ba4ca8b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7N2aRrFbMMAfkS8wggLYAjMtw0AFUhG3s4MADxEI7KAD4AOmHbasEUmhlyGVKBAiCIggAErwEKwkvMz8NKS8aPgwvADm7CRS5qwcliKSUHAAdJQgcGjMXkgAnFSsMGCpSUgALFQVpKkwDCGy8qUcYLiIAAxUIviVzGJkNQC+FOjYwwTEs+10PSBCouKSvFjMgpaMhrwmZhbWtvYOpeWVPQDsAEx1DU34SACs7ZVdW0Ox1wdXYQyQbxAEymM3IiAAjN8FkscHhCCRyBt6Ew2JweD55IoYMo1BotHoDMZTOZLDY7I4XG4PF4CX4QAEgnhwnBItFYvFEsk0hkGrxsrkYPkwIUSlQHlVENUxiB6o1mog2tR/t08H02YNhgBmcaTUjTeJIAAccwAuuNoCsmZ5vMBWbw5gJqbwAOQAAXKgigEm03WYAHoAFZwAC0aAgkQA1vJo0QWmHBOJWHBvQBuFwuLgYUQCYRiCRSIEnPjAFy8GJ61mMQ0jEbcPNgOalEMVJCgTYNODlvBRkBzOZAA="}
import { wait } from '@studiometa/js-toolkit-v4/utils';

async function pause() {
  await wait(300);
}
```

`await wait()` with no argument is one turn of the event loop.

For a frame rather than a timer, use [`nextFrame()`](/api/scheduler/nextFrame.html). For "the framework has caught up", use [`whenDOMSettled()`](/api/dom/whenDOMSettled.html) — a timer is the wrong tool for both, and the reason the [test helpers](/api/test/) exist at all.

## `memo`

```ts
memo<Args extends [] | [key: unknown], Value>(fn: (...args: Args) => Value): Memo<Args, Value>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a500099a6095054247ff60ae8c7cf4c444eae8aa419d79dc2f6f702009aa2ac2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxpEADwBBUgHM4vOjTBQNyALq8APr2QBrGBkS9hZyAHcw+irwBqbQTAB8jfmGuMAHTBzGpw1irqfAC8Xm4eMNzWALJyipFwLu6snl4AOmDs0lgQpGgyaZQgUBAiCIggAMLMIvgwvMwCwmISYADkGqTwgqzlOKQdaoKyYGguwuKsvGgQrFDLEAKlqjBogVVozOpIyMggWKHM0lV+vAAqbV2i4pIbFfLscDCBvACS5YcLBpJO1QqppjBZi5SrxIGBviB9M4QHBDmUkABOKisSGqND4JAAFioaJ2DAasnkVQ48KQAAYqK1LmIyJiAL4UdDYXANQgkcgkrR4ESSVGaWg4MBwdgkFJpBTmSzWWwOJwuZhgDBeKqo0LkgBsAGZsbj8ZiSWDdng6JLpSRqexaYgAEyM/DMmjkRD6jlcnB4PmswX0JhsTg8d6KRVWGxgOwQRzODqanx+AIWGMqhNgGJxDUYJK8VLyBUZ5Vx1VJ/P5QrFUrlSkQKo1Op4ZqtUFPHqSAa8IZwEZjMiTcEzOaxxYbNZvfjbXb7C3HFBnC6kK43KQPdpCZ69N6Nz7fP4A5hA3ggkcQqHniZwhFIqi69GIADsAFYTWA8QTEMTqJbyRARsHSdV0QCZNcWS9ABGAAOX1qG5ANiCDaghQaRhVyuXYyD4MtY3jRwdTRclYOgz9vyQY1/zUK0GgzECeTAiCWk9JBnUJBDMH9XkUIFNCQwwrDZE9PClQI1ViL1JBYKxEAcS/M1EGo0k6JABjsUdJi3Q9VllOdLikN4/kDnQkB8yk58MWohTKMQWCLVowCVgAZTQUhHVURj2J0yC2OUn1OUQniCD40zBPMzVLPJaC6T/WylP1RyyTwIYcGYBhNNA3zWL0wkX0MkLA34mgIpFKVyhtSE7RgOV5AKRh8KzRxc2TDBoqQaDoJfCilLk1TAKqqUZVwLKeT/FioPpQqeVCkzg0A8qxSGmq6ogBqmorbNWosx8SM6wkP3k00f36gDrQlaqRu8xAjsm/y6TZZERVgPAihKMpeGASNeDZARSAgaReD6AABVFBCgCQROYAB6AArOAAFoVlWMx2DQRGiEJGHBEWOA+gAbgKAolsqy7hpIXhokjRhGssVqM0CVz3M8xhuECNKYAyxhnW4bgibAAoVpGxg+mYPp+d4GGYd4EVilxmAoCF8matF8XJel2WWjaKAqmhpBQC0K7JDwBGQDZNkgA"}
import { memo } from '@studiometa/js-toolkit-v4/utils';

const expensive = memo((key) => key.toString().repeat(2));

expensive('a'); // computed
expensive('a'); // cached
```

**Zero or one argument, and that argument is the key.** That is the whole surface, and it is deliberate: a memo keyed on several arguments needs a key strategy, and a key strategy is a decision the caller should make visibly rather than inherit.

It is what the four memoised [string converters](./strings.html) are built on, and what memoises the active breakpoint name for the length of one task.

`cache` and `memoize` from v3 are not shipped — this covers the one case core needed.

## `noop` and `noopValue`

```ts
noop(): void
noopValue<T>(value: T): T
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a90bfe5cdc8aa414e93bf2d075d71a488d161f8acfad585a833943607a7245eb","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvSBCyNuiXkQjsoAHTDsAtlgik00iLMogoEEQkQgAIhENp87MAHMKvAO75mNEqV7sDdjheETZWGCgPAPwAOhM4NGZ9JABOKnCXByQAFipE0mcYBisZLBMOMFxEAAYqES9SZjEyVIBfCnRsKoJiFry6YpAWDi4+IVFxSUNZADU2QRgAHgAVAD5GInmYRWWFXmWNbV19aaw51gWTMws8ACUiwVIpBxglLd5hNhpSCMUX/1gYHEmF4EH4vGYvDQjTAcH4ei0IS8TjiVASSWKAEYAKzpGCZfCpPJJQqDUrnS7pJxVWogepJJrfJA49qdHB4Qi+Ew0eh4ESSBKgsC2SqKeS8AC8qyUKig8XyxQA7LkQBlnFlEAA2YkFIp4SQi3BUypIABMdQajJaWtZ1C6HN65H6vKsw04PAEwjEEikpXkimUqkOOj0BlKV3MlhsdkgDicrg8Xh8ZH8gWCoVY4Ui7miqJA6OSiAAHABmPEEnI60l4cPGqrmumW5rkRAsjp29lWTl9agDPkCwKA4EYRQrdabC7bfZ8KX7eUY5mmxXl9WE4tVvVWVT44flalIMuNhnNpCa22YTs9LnOwZu0aeiY+04UpZrDZbHZ7A6aEMnclbCMbise40EeZ58FeCcFg+MAvjIX4oQggEdwCDBQXBSFoWYWF4VIRF6RRedC0xEsixXDU0moElN3AIwzgAusDwtY8mVbRVWgAXTqaBuiOUNeGAU43H/SdeFaARSAgREAHIAAEEkEKAJC0IpmAAegAKzgABaNAjFYABrAJtKIbI1MEcRWDgaSAG4NA0flYQMA1JFeCVThs3g1LUiEQjCAAjJoDMQ7xeDMeB7EcFwHIHZCgVQyVny2TzvN8rCcIREKDHpFwItjKLnBMFTEiQUABnxOAfTwLSQFaVogA==="}
import { noop, noopValue } from '@studiometa/js-toolkit-v4/utils';

const onDone = noop; // a callback that does nothing
const identity = noopValue; // a transform that changes nothing
```

They earn their place as **defaults**: a parameter defaulting to `noop` removes an `if` from every call site, and one defaulting to `noopValue` removes it from a transform pipeline. Both are one shared function, so a default costs no allocation per call.

## What is not here

| Not shipped                    | Write                                                      |
| ------------------------------ | ---------------------------------------------------------- |
| `nextTick`                     | `await Promise.resolve()`                                  |
| `nextMicrotask`                | `queueMicrotask(fn)`                                       |
| `Queue`, `SmartQueue`          | the [scheduler](/api/scheduler/)'s lanes                   |
| `domScheduler`, `useScheduler` | [`defaultScheduler`](/api/scheduler/defaultScheduler.html) |
