# Utils

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e8542dd4f7991c82b8c468c8c64fda77b44231f2052d484a46ef84984b53f33b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/ODRmTyQATipWGGy0fCQAVioi0hyGEJl5LD8OMFxEAAYqEXxi5jEyMoBfCnRsXoJicca6VpAWDi4+IVFxSV4oDsYmloA1FTUNG3MRQVJSKrRTuPPTW31+UbQPB1feGFksOAwKDfcxYO4idhwCRgAD8ILs8JcbiwHi8+18VACQTwACUYGgblIajANMteOI5DAALTaLhAvYdemxeJZKC8OBgZiRADu7BqiQABmCYBCoZIBfkqIViq0AIwANgqVWSNSQABZGsUWnh0Z0KkZegMQEMRmNyIgFRMALqDaBzZGo3jAbwdfS63gTASkCByXgAcgAAoVBFAJJSigB6ABWcCpnwgrAA1nyqUQ1RHBOJWHA/QBuPzh5hIUDLKpisB4GMgCYTIA=="}
import { clamp, damp } from '@studiometa/js-toolkit-v4/utils';
```

Every one of them also has a subpath of its own:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b42c5017c83e882ddf8ed06664b04a091ef3f0e9e35a3e1808e1b379b3b4283b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/ODRmTyQATipWGGy0fCQAVioi0hyGEJl5LD8OMFxEAAYqEXxi5jEyMoBfAF1B6F6QNywPL2BvDt4JgVIIOV4AcgABQsEoCTkYIoB6ACs4AFo0CAhWAGt2NDuiABZLwXFWOCXdoKPYAbj85yKSFAdBoYDgEjAeFuIAmEyAA"}
import { clamp } from '@studiometa/js-toolkit-v4/utils/clamp';
```

With a bundler, prefer the barrel — tree-shaking removes what you do not import. From an ESM CDN with no build step, prefer the subpath: there is no bundler to shake the graph.

## The categories

| Category                           | Contents                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| [Type guards](./is.html)           | `isString`, `isNumber`, `isObject`, `isDefined`, …                     |
| [Strings](./strings.html)          | case conversion, leading and trailing characters                       |
| [Math](./math.html)                | `clamp`, `lerp`, `map`, `wrap`, `fold`, `round`, `mean`, `createRange` |
| [Easings](./easings.html)          | the 24 easing functions, `createEaseOut`, `createEaseInOut`            |
| [Motion](./motion.html)            | `damp`, `spring`, `smoothTo`, the inertia family                       |
| [CSS](./css.html)                  | `transform`, `matrix`, `getOffsetSizes`, `setClassesOrStyles`          |
| [Transitions](./transitions.html)  | `transition`, `enterTransition`, `leaveTransition`                     |
| [DOM](./dom.html)                  | `createElement`, `selectorFor`                                         |
| [Focus](./focus.html)              | `trapFocus`, `untrapFocus`, `saveActiveElement`                        |
| [Scroll](./scroll.html)            | `scrollTo`, `scrollPosition`, `lockScroll`                             |
| [History](./history.html)          | `historyPush`, `historyReplace`, `objectToURLSearchParams`             |
| [Loading](./load.html)             | `loadImage`, `loadScript`, `loadLink`                                  |
| [Timing](./timing.html)            | `debounce`, `throttle`, `wait`, `memo`, `noop`                         |
| [Objects & random](./objects.html) | `deepmerge`, `random`, `randomInt`, `randomItem`                       |

## What v3 shipped and v4 does not

| Removed                                                             | Because                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `tween`, `animate`                                                  | time-based playback moves to a separate `ui-animation` package                                         |
| `domScheduler`, `useScheduler`                                      | [one scheduler](/api/scheduler/) is the clock                                                          |
| `Queue`, `SmartQueue`                                               | the scheduler's lanes replace them                                                                     |
| the collision helpers                                               | not ported                                                                                             |
| `keyCodes`                                                          | [`useKey()`](/api/services/useKey.html) delivers named booleans, so nothing is left to compare against |
| `nextTick`, `nextMicrotask`                                         | `await Promise.resolve()` and `queueMicrotask()` say it                                                |
| `isEmpty`, `isEmptyString`, `isArray`, `isDev`                      | the platform or a one-liner says it                                                                    |
| `cache`, `memoize`                                                  | [`memo`](./timing.html#memo) covers the one case core needed                                           |
| `addClass`, `removeClass`, `toggleClass`, `addStyle`, `removeStyle` | `classList` and `style` say it                                                                         |
| `loadIframe`, `loadElement`                                         | not ported                                                                                             |

## How a utility earns its place

**It is judged by consumer need, not by core's own use.** Some of these are not called anywhere in core — they ship because a component author would otherwise write them again, and getting them wrong is easy. `deepmerge` is the clearest case.

The reverse also holds: a function core happens to use internally is not public for that reason alone.
