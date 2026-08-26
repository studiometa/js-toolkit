# Diagnostics

Everything the framework recovers from is reported on **one** cancelable event, and nothing in core calls `console.warn()` or `console.error()` directly.

[[toc]]

## The protocol

`EVENTS.diagnostic` is `'js-toolkit:diagnostic'`. It carries a `ToolkitDiagnosticDetail`:

| Field       | Type                    | Notes                                             |
| ----------- | ----------------------- | ------------------------------------------------- |
| `severity`  | `'warning' \| 'error'`  |                                                   |
| `code`      | `ToolkitDiagnosticCode` | a namespaced string from `DIAGNOSTICS`            |
| `message`   | `string`                |                                                   |
| `component` | `string \| undefined`   | the reporting component's name, when there is one |
| `error`     | `unknown`               | **required** for `error`, absent for `warning`    |

Every diagnostic starts on its relevant connected element, or on `document` when there is none, and is dispatched with `{ bubbles: true, composed: true, cancelable: true }`.

## Listening

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ee67a71209318bad93b02be709eb1d95aa405f3bba5dc7df40a424c8cc2a334a","data":"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"}
import { DIAGNOSTICS, EVENTS, type ToolkitDiagnosticDetail } from '@studiometa/js-toolkit-v4';

declare function monitor(code: string, detail: ToolkitDiagnosticDetail): void;
// ---cut---
document.addEventListener(EVENTS.diagnostic, (rawEvent) => {
  const event = rawEvent as CustomEvent<ToolkitDiagnosticDetail>;
  monitor(event.detail.code, event.detail);

  if (event.detail.code === DIAGNOSTICS.responsive.unknownBreakpoint) {
    event.preventDefault();
  }
});
```

**Dispatch always happens before the default output.**

- An uncancelled **warning** calls `console.warn()` once with exactly `[js-toolkit:<code>] <message>`.
- An uncancelled **error** calls `reportError(detail.error)` with the original value.
- `preventDefault()` suppresses that output **only**. It changes no framework decision.

## The codes

`DIAGNOSTICS` is a deeply frozen object, and `ToolkitDiagnosticCode` is the exact union of its strings:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"45a8398bb1a234b368647c828edfe09882f1c05c483692e6f2b59747d7cb09f7","data":"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"}
import { DIAGNOSTICS } from '@studiometa/js-toolkit-v4';

DIAGNOSTICS.component.loadFailed; // 'component.load-failed'
DIAGNOSTICS.callback.serviceFailed; // 'callback.service-failed'
DIAGNOSTICS.protocol.lateRegistration; // 'protocol.late-registration'
```

See the [full list](/api/diagnostics/DIAGNOSTICS.html).

## Report once, or report and continue

| Behaviour                 | Cases                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reported exactly once** | recovered load, mount, invalid-strategy and `Base` lifecycle failures                                                                                     |
| **Report and continue**   | isolated signal, context subscription and teardown, attribute watcher, service, scheduler tick and task, DOM-update runner and extendable-event callbacks |
| **Thrown or rejected**    | decorator and manifest-adapter misuse, shared-runtime incompatibility, service startup rollback, caller-owned teardown, `viewTransition()` and `swap()`   |

A scheduled task also **rejects its own promise** with the same value. Direct, caller-owned failures stay throws: they are the caller's to handle, not a channel's.

Warning deduplication is stored in a revisioned shared-runtime slot, keyed by weak owner plus a misuse key, so it works across independently evaluated copies of the package without retaining instances, elements, declarations, runners or manifest inputs.

## Reporting your own

`warn()` and `reportDiagnostic()` are public, and a consumer code is any `'<namespace>.<name>'` string:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"caff4504ce4eada0d30933f84a59b2e667ac0fa466210942ea6aeaaa8bce9ca6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUjCwRSaACKcA5pDjiRjEdBiJeAFQgRWAa3ZLV6zQGFdFXgFt4cZir28NpdmBUOypPL6wqaQAO5gDsC8Oo5yYDBgaA5ozKTuaLwAvgD8+spu1uwidkl0aNz6NoIaEI4AoiRJADxGJuaWhRAaxYowqeysAHwAOmDscfKZMnIKBWrdmpQgUBAiCIggAEqyU7zM0jA6JDJQAsyDgjK8krxo+DC8UFaLxTH4zGAJrAB0Y2MAQRidXiiWmuwUcDu+ECghU+F4Y2AAAEOGBTIiwAAhLgwH4AEgC8kxWTGDjC+GKCP4g1YUJ8vAsUIgEV4YGYzjGnzOMFYMGcSR+hkp9Kh90e/HkjgExJ0sF4YQsCMgjLAGk+IkeaAgh1mmS4vEAKAT7MaOaCCPkAWj5JFYvAerBwpAcxIOIlYXChFKpjKhkH1vAABji4DBAz9luqFEgAJxUPm+e5IACMADYqKl0v08DMpvMiiJlmjcIgAAxUEQfUjMMRkWNZCjobAlgjEOsZ8pMNicHgCYRiCRSMJpMDaXT6NpmCz514lexOFxuDxeHx+XjRWKgpIpNIZbJ5Xgznpzsr0Sq8aq1BpNNCtYxTzoLY99AbDMYTPUKkfLVbrPA7T8DmHUhxl8G4pHFJ4XmPd5Pm+P4wEBYFJgSJJdSmMUYQgOEESRVEfAxMYQzxfFgKkMZSUiBVKUrARaXpKQmRuVl2U5dkwB5PkBTQIUDBFX1oQlKUZVIYF5UVe42R1Hx1VELUdVzBR9ihY1mFNc0rRtXl7V5J0XVEt0PTgL0aIRdg/QgANg1xcNI0zBhEAAJgAdnjRIVCTRAABYM13bNNjIosfBLcsQErNIaxocgnOchsmxwPBCBOZYaHoLsOC4PgyLHWAJ3vDoj1sednGMpd9BXXwomQrdkjuPzMlyfJoKK08KiqGptWvME73aadmt6foLjfcZJiUwKqF/DZtghAMyNXcDBKgroYPCr5eQQpDN0kMF0MhaFYXhTEUTRQjsVxAkyJJMlqJ9GlWDpVVGTQZkWI5GAuQ43heX5MFeP48zFslUhpSBsTHgk5VpLVVI5LuBSZuUo0TTAM0oAtGBrRgW0dMdMh9P2GIjJMn0Af9AnrNDWyqCjBzUzjEAEw8/AkB86h6rwcaGeCpBHIrKtIrrMs4uoZtErbcgOzSzZGCwQInUwPhCuKUpUp4rbULQA8KpUXgAB9eGEWAaQSKA7LSBzky80LGc8+nMwyPB1bBIKEh5vmItraLnOTYXMASzYkvbahO02Ig0l4AApABlAB5AA5fRo/jn81imgFGKSbw1TeCAACMACsjkye5mEyWXiHYWAoSEURxEkMUdR0MATkyCPmDDqORG8LBMjD1hBHgOH9k+/hAmlSC247rv2B73gY4LoveDjyzS8HXhGCTuO+CBxxS4jan7JTZyAFY3MTZnvN8rMHJATeXZLU+wv5z2ed90WA/FlKQ5ARhnHuaA+Cbx+FgNIoZGCq3KmgLOa4ZBEHYCcA84CRT6E+BgBwpgYAYEgdAhwfcB4oLABgPgABeIYw8iEEIwCnP8mxSgtyhAcSezBO7d0yPPQuYgl4rzrlIDesct6eCgfNHw2ph43AXmIfebMVAbGQMgEAIDqyOC/vQXgQI+6V0jvwwR0CIwAF0KDyMURyZYsD4FkDUX2Wua8S7F2rGqHemFHgyDgBaZ6f0AY1wHLcAGIg2B8jOKDGANYETOEcLnCxEB+CLTzhwniYwACS0SDhhIiaJJuAw1RsngDQM4sSi5wBSA8bJGgYB5Ikc9fY1woGfDgDvMpvAIlAy1MUxRO18mcPMvowx1AsJhAQFQYAUcMBJGYLQeopBAikCyLwJJQZVaBgEmTDRZwgEgD0QYkANMUwAA5rbuU8o/e2/kFGgNwPGbmiBH7hWrC/RAsVGwi39q2ZKksb5h1EkSUgwR0ThDAGbaMTlSzJjPkzJARz2abC+ffJA6Yn4eyivWR5fsWyBwlsHKWP9uyZV2o+AsOUPCTgKv1OcsAHAlVcO4bBq5/CTKCAbX5LIqIbhBNtbcdVr77iastFqqtzyXk6o0bqRK+o8oGq+UYI1PyKTxbOahU0AJ7AODIY4ZAGn8CGlcR4txILPDFSIWCa1fj/DAECJ2aEZWYQOrhMAx0CKYmIgSL5V0qLelondB6DImJMrZG9D6nEfqCmFADAGkEd4iTBgqJUUlVSyU1EPGViNVLqTRppLG2kHR6RuAZQmnobq0VJpZcmxEqZbMPk5ZMvMGYHIvmmK+DtNgyqVoWC5rt7nu1uYipyb9nlopUe88OXyfmhCZQChyjkYyPxthfCF188DQtbSWVy8LO2Cx2cfLImy5Qtg/HsaITaSXkhHNkAQY9eAAHJkQaEEM8Oog0AD0+c4CWm1L1NAloiBeXPQAbhNdlc9fjYShl+JAS0cAOBV3PQ4c9QIbBpGwsBqNkkVTgcro8VYg9/SUl8D8KD65qpsrQPoc9cGgO8nPdkbgv7EKZwwOuMYvAtHx2AWcxg57gDnqoxRGIpdaKMC+XwYADHcXNrY4BhD61c7MCgJaJuNIVB4fPXxR4cn2A61LkI3OggaBLKLSspjcdcO0qmVxsAWRlh/2YEgUA5REhwEHHgZ6IAshZCAA==="}
import { reportDiagnostic, warn } from '@studiometa/js-toolkit-v4';

warn('carousel.no-slides', 'A Carousel with no slide does nothing.', { component: 'Carousel' });

try {
  JSON.parse('{');
} catch (error) {
  reportDiagnostic('carousel.bad-config', 'The config attribute is not valid JSON.', error);
}
```

From inside a component, `$warn()` and `$error()` fill the component name in for you:

```js
this.$warn('carousel.no-slides', 'A Carousel with no slide does nothing.');
```

## What was removed

`EVENTS.error`, `ToolkitErrorDetail` and `ToolkitErrorStage` are removed with **no alias**. `DIAGNOSTICS`, `ToolkitDiagnosticSeverity`, `ToolkitDiagnosticCode` and `ToolkitDiagnosticDetail` replace them.

## In tests

Asserting on `console.warn` cannot see the code, the severity or the reporting component, and it passes for the wrong diagnostic. [`captureDiagnostics()`](/api/test/) reads the channel instead — and cancelling each event as it arrives is the same act that silences the console, so collecting and silencing are one step:

```js
import { captureDiagnostics } from '@studiometa/js-toolkit/test';

const diagnostics = captureDiagnostics();
// … exercise the component
expect(diagnostics.codes).toContain('ref.mismatch');
diagnostics.stop();
```
