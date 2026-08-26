# Utils

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7070ec6349867bc2a1b06e7152793423c378cbfd3a3cf4c7456eaa290f6388c7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/NGZk4ORkEA4wAGs/fDQ0LDhEAHomgCs4AFo0CAhWSvY0DqIAFly4NEEoCTkYQtzYIibBcVY4JrlmNHxc2rlWAGIZeSwQAF1TqnHmTyQATipWGGytpABWKkLSHIYQo98Hoy4RAABioInw12YYjIdwAvhR0NggQRiDCPnQfiAWBwuHwhKJxJJeFBjoxPt8AGoqNQaGzmESCUikJ5oKlxGmmWz6fhQ7qkBxc3gwWQNGBQAXmLDMkTsOASMAAfgldmVLjcWA8XhJ/38gWCIAASrNGVItjANBjeOIZh1tFwxcTjg7YvEslBeHAwMxIgB3Ab4RIAAylMBlcskgfyHyKJTKFWqVFq9UaLXaXR6fQGQ1G40m01mzHmMEWy3Yq3WEEJYB2aD2+21J3Ol0+PwAjAA2B5PZIvRDDaNfWZ4Bt+CpA0EgcGQ6HkRAd2EXSfQZHqzW8YDeY76Bu8WECUgQOS8ADkAAFc1NDwW2p1ur1+mglis4MeANx+GaFJCgDFPcNgPB2hAWFYSAA"}
import { clamp, damp } from '@studiometa/js-toolkit/utils';
```

Every one of them also has a subpath of its own:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"33642af5ee7886a35af719c7106418556ff70dbb028aab5f11850c7ac610c9cb","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/NGZk4ORkEA4wAGs/fDQ0LDhEAHomgCs4AFo0CAhWSvY0DqIAFly4NEEoCTkYQtzYIibBcVY4JrlmNHxc2rlWAGIZeSwQAF1TqnHmTyQATipWGGytpABWKkLSHIYQo98Hoy4RAABioInw12YYjIdwAvhcQCJoECQG4sB4vMBvMdeLCBKQIHJeAByAAC40m01mzDanW6vX6aCWKzWfywxIA3H4ZoUkKA6DQwHAJGA8O0QLDYUA="}
import { clamp } from '@studiometa/js-toolkit/utils/clamp';
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
