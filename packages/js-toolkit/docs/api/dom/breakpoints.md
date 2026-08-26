# Breakpoints

```ts
BREAKPOINTS: Readonly<Record<string, string>>
getBreakpoints(): Record<string, string>
setBreakpoints(next: Record<string, string>): void
```

The named breakpoint set is the single source of truth for every responsive spelling in the framework.

[[toc]]

## The defaults

```js twoslash
// @twoslash-cache: {"v":1,"hash":"abb0eb31a5d5f8b11d0f0557cacf0baba2c20615ece91022531d891dace28271","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAIQBKAUQCCAaQAKAeQCSAOQAqAZUS8JMZlCGsMAHn2DSUUyNLswAcwq9b9hwD53AHTDsAtlgQpKKSsoqqmlqUIEb8CIggACIwAGbMAK6somDMfjBQvETsMADugcG8JexQaPhwzlz8MGBQbgB0vACy+ZwAtACO6WQYvAAGpDB+o7zpcPC8tTC8AEakECVzpADkcLz27GicrLwpQqJw7ABeMM6Qoou8axCiMKyTzWg7AhAB6TQFF2ubWiaGYDniyGQIA4YAA1tF8Gg0Fg4IgAPRogBWcF6aAgEFYsIOvSIABY2iJ0q0fjBQW1YEQ0cwsOw0UY/GjVgZYYF7Gg4G1EX5WCAALqiqgiZjBJAATiob0ctSQAEYVVRQaQHLS8KF5Mp1NpojDcIgAAxUfj4aXMfg0ciIWUAXwo6GwpoIxDIILoDASLA4XD4KXSYDt7CEvG1aDEE2YPIgfLgjG4ugsQWsrkczizHh8/nKomjse5vLA/OisXiIH0aHSpDAvGY3ywIwgKQW+CWtsOJBWcYTfJctOBGrBEKhMPhVERyNRGOxuPxhOJZIpdepeTpDKZLLZP05A7L/MFaGFYolIClMsQACZbwrmg5lYgVaSx1qdQli0fE+WEAq9imhaIBWjadrenet4um6OB4IQJDkBqvpMGwnA8FGtIlvGx7JqmegwJYmZoHY2YuCRbjeL4ARBEWWG/kmlYQHEeC1vWjbNoIra8O2nbduGfZcjhf7nCOILjkgkLQvY04EEiKLoliOJ4gSRJoCS5KUputLMPSMCMsyrLsoepYiQKQoiuKkqan6ADs6rQk+L5vh+0Z4D+pmMYBYCmg+oHWqQPaQWaMHUO68Fekh1Aof6aFBt8wghNI+oRNoaYGEYYAmOYhEZjYFFkbmnj5jRFR6uEhpRFQVZ4MkaSZNkuT5IUxRlLRlTVLU9RNnATQtO0XQ9MwAxDKQIzjJM0yzPMDyrOsmxfPshxsCcZwuFcNy8HcfGPPiLxvHk5ZfIIvz/OtQLieCkmTjJCLyfOSlLqpq6aRuEZbrpO6GfuHJCYO/6nueVlXjZqpmgAHI+Sr4KqDmam5CTlQakTGkBSAAMyWgFQUOiFl6CLAeAFu1wDiMlFWRM4HnCUmvBOicax+LwWwAAJae9OmPSpK6fAA3D4PjU/9/IprzvAYjt/D1hM5bDmgPhI6lWhixLDywPVWQASAH1IKAvrNBcQh4NiIBOk6QA=="}
import { BREAKPOINTS, getBreakpoints } from '@studiometa/js-toolkit';

getBreakpoints(); // the current set
BREAKPOINTS; // the defaults
```

| Name   | Min width |
| ------ | --------- |
| `xxs`  | `0rem`    |
| `xs`   | `30rem`   |
| `s`    | `48rem`   |
| `m`    | `64rem`   |
| `l`    | `80rem`   |
| `xl`   | `90rem`   |
| `xxl`  | `120rem`  |
| `xxxl` | `160rem`  |

These are the names every `data-component:<name>` and `data-option-<x>:<name>` suffix is checked against.

## Replacing them

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4b42e771abeec15e9d62c16547c9299f1e31ca721459d616c3da77ca84c8a96e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvODDQAhUjGYBrLBHZg0cRmDppEvAEowREUlAA8cNKQ0BzCtJv2AfNwNF1UADph2AWzVSNGlZBSVVdU0EKigIEQREEGMsVmYRGF40fEyuDLAoe14wZn8YKF4AI0UVNQ0QmRDmAt5FfkU4fF508RJpQUq4EVtKsjgAOkpqZjtE5GQQDjBlKfw0NCw4RAB6bYArOABaNAgIVmV2NEOiABZx60FCiDK0ZnHYIm3mLHZtuP9ttUInVouM1v5WCAALpQqjWZjBJAATiorBgYDs2SQAEYblRXqQ7LI8I1wrUolopktcIgAAxUET4BE9MjIgC+FHQ2BpBGIrPxeiYbE4PFC8hqkXq2l09AMxlM5iszgxjmstgxbg8Xl8ASCDTCEpBlNi8USyRgqXSmWyuSG6MKGOKpXKVUNFLF3RabQ6XR67D6cAGQxGY0m+JmcwWSxWVDWGy2uwOx1O50u1zuDyeLzeHy+Pz+z0BbqlYLQEOhsJA8MRiAArAAOVHozH4HF46aE4lJUnF6JUjQ0gBMDKZpBZ5DpHK5ODwhBI5AF9CYWFIEBwwQwfFoWyc6rsU2rDEQAHZj02MVjEMOO0SjyBt/3dEgAMwj5liVlXqfUbmzvkL6hBSSRgVzXMhMD4Hc1XsA8CSPJFsXPFscXDTs7xiRYByQdtGXfGgJ0Hb9MBnJI535QCl2A0D1wg3h/AMaCMVghEj2xWlayQy9EJvLsQH8R8aQ4kBcLHD8CKI39SP/KYaEokAQNXGjN14VgGOVfc4TgnFsRRRZmy41DbzwSFUSwxAADY31E/CkEIzkfxI3l5xkoD5Oo8DlNoVTdxgzSWJxZ9Xz0i9WyvQzeK8gSkDPYTR3HWy2UrUxYDwXUzBCYAxTJSVol4NkBFXfxeAAcgAAUzCRs32I4TjOC40GKgBuXxfB7YEKW0YBfF4XhtwMYraUUfxioobrpH6m56yGkaxvokrzJuabRqkFT+vrQaYGG5aeq8/qkXMpbfDZbhGqmbMkFAPR0TgCQwDwA4QDZNkgA"}
import { setBreakpoints } from '@studiometa/js-toolkit';

setBreakpoints({
  xs: '0rem',
  s: '48rem',
  m: '64rem',
  l: '80rem',
  xl: '96rem',
});
```

`setBreakpoints()` is the single source of breakpoint truth, and calling it does three things at once:

1. **rebuilds the scoped attribute names** — every `data-component:<name>` and every `data-option-<x>:<name>` spelling;
2. **replaces that slice of the observer's `attributeFilter`**, draining the records of the previous filter first;
3. **emits at once** on [`useBreakpoint()`](/api/services/useBreakpoint.html), so a subscriber sees the new active name immediately.

## The values are in `rem`

And in a media query, `rem` resolves against the **initial** font size, not against the root element. That is deliberate: a breakpoint that moved when a component changed the root font size would not be a breakpoint.

## What uses them

| Feature                                                                        | How                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------- |
| [responsive options](/api/html/data-option.html#every-option-is-responsive)    | `data-option-x:<name>`, cascading upwards      |
| [responsive components](/api/html/data-component.html#responsive-declarations) | `data-component:<name>`, replacing not merging |
| [`useBreakpoint()`](/api/services/useBreakpoint.html)                          | the active name, as a service                  |

**A suffix that names no configured breakpoint** gives one `responsive.unknown-breakpoint` warning and is ignored — including the v3 list syntax `:xxs:xs:s`.

## What it costs

- The `MediaQueryList` objects are built **once**.
- The active name is **memoised for the length of one task**, through `utils/memo`. `setBreakpoints()` and the `change` handler of a running service clear that memo at once.
- A `matchMedia` subscription opens only for a component that declares [`option<Name>Changed()`](/api/methods-hooks-options.html); connected elements with a scoped `data-component` share **one** reference-counted subscription. A page with plain declarations and read-only options opens **none**.

The breakpoint service is part of the core graph on every page. What a page pays is the subscriptions it asks for.

::: info The defaults and Tailwind
The current default breakpoints are **not** aligned with `@studiometa/tailwind-config`. That alignment is a separate product decision. Call `setBreakpoints()` to match your own scale.
:::

## There is no `defineFeatures()`

Breakpoints are the one configurable feature, and `setBreakpoints()` is it. Attribute names and the attribute prefix are not configurable.
