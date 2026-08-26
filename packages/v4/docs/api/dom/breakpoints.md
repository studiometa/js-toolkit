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
// @twoslash-cache: {"v":1,"hash":"0ce7b9232ac76254edf98334e9b48f7142a30d2fae16e7bebb235881cb0cc822","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAIQBKAUQCCAaQAKAeQCSAOQAqAZUS8JMZlCGsMAHn2DSUUyNLswAcwq9b9hwD53AHTDsAtlgQpKKSsoqqmlqUIEb8CIggACIwAGbMAK6somDMfjBQvETsMADugcG8JexQaPhwzlz8MGBQbgB0vACy+ZwAtACO6WQYvAAGpDB+o7zpcPC8tTC8AEakECVzpADkcLz27GicrLwpQqJw7ABeMM6Qoou8axCiMKyTzWg7AhAB6TQFF2ubWiImYwSQAE4qG9HLUkABGeFUNBghwwBgJULyZTqbTRDhgXCIAAMVH4+DBzH4NHIiAhAF8KOhsESCMQyNEaPQmGxODwTukwNT2EJeGi0GIJswANaBexoOCMbi6CxBayuRzODUeHz+cqicWSgyyiDyhBUWLxED6NDpUhgXjMb5YEYQFILfBLKmHEgrKUm+UudHAqig8GIABMEehzQccMQ8IALMjUei8Ib/XKwAr8fYiaSQOTKdSOZGI4zmTg8IQSORkXQMSAWBwuHwM8aswqlSqYJZ1Wg7JqXAO3N5fAEggb0UaZZ3zTEIHE8Da7Q6nYIXbw3R6vcLfasO6bs0G0CGQGGMQB2ZMgGFx/AIm8o0ji9PTzNHnPQvNIaOFimkN6pbEhW1AstW7J1tQDY8i2/KCMIITSNiETaD2hjGGYqpWDYI5Dtqni6hOFRYuEuJRBai5WskaSZNkuT5IUxRlJOlTVLU9SOnATQtO0XQ9MwAxDKQIzjJM0yzPMDyrOsmxfPshxsCcZwuFcNy8HcO6PBAzy8K87zZl8gi/P8qlAiCz4YoiSK3rG8aIimL5ppiyFkZEuaEkgADMZIAUBtIgQAumS0CsnqrHAOIrk4pEzjtrOn67PSJxrH4vBbAAAiI6StD86LMAA9AAVnAvRoDprDSgcvREImWwANw+D48UBtmircPVvAFQVWn8HaEzHnMaA+KRMXaJ13VabAtFZPOeQokgoANs0FxCHgJUgPS9JAA==="}
import { BREAKPOINTS, getBreakpoints } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"022218e137c9c60f940a899e48a5b8bf233a10c0fb1952074389d02fa008a070","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvODDQAhUjGYBrLBHZg0cRmDppEvAEowREUlAA8cNKQ0BzCtJv2AfNwNF1UADph2AWzVSNGlZBSVVdU0EKigIEQREEGMsVmYRGF40fEyuDLAoe14wZn8YKF4AI0UVNQ0QmRDmAt5FfkU4fF508RJpQUq4EVtKsjgAOkoQa2ZgpABOKlYYMDtspABGABYqNFm7WTxG8NqorSmOXSQABioRfFmesgWAXwp0bFwkwhJyXb0mGxODxQvIapF6tpdPQDMZTOYrM5Vo5rLZVm4PF5fAEgg0wuC6tEpnEEngUmkMlkct0hitCqtiqVylUCWdQd0Wm0Ol0euw+nABkMRmNJlQZnNEAA2DZLFZrfCbHbUfaHJLHVmQi4aL4AJjuD1IT3IiGubw+ODwP2e/3oTCwpAgOGCGD4tDgBlR9im4oYiAAHLcQMtVutEHrlaQDr6QG6tVdEABmfWPMTPMNm6ifS3Ea3UAFJRj2x1kTB8d1ONF2b17CXzJXB+WbXYq6MxIPapBK+4pmjGnUZzAW745v5520FotO0u8fwepFVsU130ba5+2UhhWIGURqN4fxxr4AVmThtTfYHWeHvymNHHIELDqnLt4rDnlers2XOvDDdD25ru5JKwB5IJKJ5Gkg/bvJmQ4ECON75vek4ls+tCvhWXqLp+mwJmBQZyqG4YAaqMbAUsHaIAA7OBZ6QS8AC6dzQF8IA4mYITAKCJwQtEvAvAIDr+LwADkAAC1iCIUEBlHsAD0ABWcAALRoBAECsMo7BoEpRBbMJADcvi+OqESElojDAL4vC8G6BjCdcij+MJFBWdIdlbH6jnOa5s4iZKWxeS5UgvnZAaBa5aF2fMkrhWALzcPpUwycwSCgHoKxwBIYB4IpIAvC8QA==="}
import { setBreakpoints } from '@studiometa/js-toolkit-v4';

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
