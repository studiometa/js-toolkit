# warn

```ts
warn(
  code: ToolkitDiagnosticCode,
  message: string,
  context?: { component?: string; target?: Element },
): CustomEvent<ToolkitDiagnosticDetail>
```

Reports a **warning** on the diagnostic channel. A warning carries no error value — that is the difference from [`reportDiagnostic()`](./reportDiagnostic.html), and it is a union in the type rather than an optional field.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"84274af55f097b88f9c08b751191dc768138aa3dadafba9db16c558250aa973a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7NSYRiOgxEvACoQIrANbs0AEU4BzSHHEiAwsoq8AtvDjMjK3mdLswRm8F5LbWSRgwNBs0OWc0XgBfAH5VQydTcytgujRuVQtBMwhbAFESYIAeDS1dA2Mk9hF9GDD2VgA+AB0wdn8IUkjZeUoQKAgRBEQQACUYAK7eZhk5Ns9eSV40fBheKEqIM2rffGYwMBhWADpW1oBBX1yAw+DeUgnOtDhl/FIIQSN8XlbgAAEOGBtD8wAAhLgwY4AEh6UlaUVaNmk+Gq334DVYLw8vD0Lwg0ikYGY9la+ygvCOMHswWO6hRWJeKzW/E6tgEnSusBkem+kBxYDM+xEazQEHujymXF4gBQCaatWzQQSsGAAWmVJFYvFWrBwpBsHJmIlYXBeyNROJekEiMwABuC4DAbcc+mEjMNkMgQIDtH18Gg0Fg4IgAPTBgBWcBVorKehVRAALMczIINrk6sxjrAiMHmFh2MGNoktuY4MHYcc/bZWCAALo1qiCrpIACcVGVnhWSHjVDCpAieFhfUBuEQAAYqCI9qRmGIyC2ohR0NgRwRiHOe2kmGxODxZvJFMpVKUdHoEiZi9UrLAbPY4I5nKo3B4vLwfH4bkEQstwnVonFeGeVSWJIND0BkvBZDk+SFGgJSaCeFRFtsNTpg0LRtB0UyDlQAxDHg4yTNae7zEYixSEy6ybMhuz7IcJxnGAlzvoEdwPIRjJvB8Xwgv83ogvakIwnMIIImASIopOAgYliUi4osBK8ESJJEmA5KUtSaC0mo9IWq8zKsuypCcms0g8opYoeIKogimKbFPNMLyysw8qKsqaowBqWpHLq+pGYaxp3jIEnfOwloQERdoQk6LpOO6nrer6/qBiG4aRtGCFxomyapvYYSZh5OZ5gWVElmWcwVmgVa1vWICNgwiAAKwAIxtkERidog3bUD+9UgNhXoeCOABME5TjONDkGOC5LjgeCECQ5AbvQTBYO8uqYHwgEXsBqT0MczG3Gg/5PgsAA+vDCLA6KHFAfR1UgTUNV17btfgLY9j1eAHZ+Q6DUgADMo1yONc6IENUQ1UosB4O0hGvsR0QCO8bIAOR/NlEi5cwqVRvB5SZSjADcDGwowKMiHIHwOickAqnAHCwHAKM2CjlwWJT2RHNyKzma4DNrAM8DmSsz60ucUDkjaUDMGEKrfcEAC8zQgAAyvzytOszr6tLwVwdIdqgo+z7yc6wzPwtwhN9FjSCgGkQRwBIYB4M8IBRFEQA==="}
import { warn } from '@studiometa/js-toolkit-v4';

warn('carousel.no-slides', 'A Carousel with no slide does nothing. Add `data-component="Slide"`.', {
  component: 'Carousel',
});
```

**Return value**

- the dispatched event, so a caller can read `defaultPrevented`.

## What happens

1. The event is dispatched — **always before any output**.
2. If nothing cancelled it, `console.warn()` is called **once**, with exactly `[js-toolkit:<code>] <message>`:

```
[js-toolkit:option.literal-default] Panel: the `tween` option default must be a factory function.
```

That exact format is what makes the console output greppable and what lets a listener reproduce it.

## From a component

`$warn(code, message)` fills the component name in:

```js
this.$warn('carousel.no-slides', 'A Carousel with no slide does nothing.');
```

## Deduplication

Core's own warnings are deduplicated by weak owner plus a misuse key, in a revisioned shared-runtime slot — so a misuse is reported once per instance, per element or per declaration, and it works across independently evaluated copies of the package **without retaining** instances, elements, declarations, runners or manifest inputs.

The public `warn()` does not deduplicate. Call it where the condition is detected once.

## Write a message that says what to do

The framework's own messages name the component, the thing that is wrong and the correction — `option.literal-default` names the option and the factory form to write instead. A warning a reader cannot act on is noise on a channel meant for monitoring.
