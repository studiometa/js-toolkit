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
// @twoslash-cache: {"v":1,"hash":"ee67a71209318bad93b02be709eb1d95aa405f3bba5dc7df40a424c8cc2a334a","data":"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="}
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
// @twoslash-cache: {"v":1,"hash":"45a8398bb1a234b368647c828edfe09882f1c05c483692e6f2b59747d7cb09f7","data":"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="}
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
// @twoslash-cache: {"v":1,"hash":"caff4504ce4eada0d30933f84a59b2e667ac0fa466210942ea6aeaaa8bce9ca6","data":"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="}
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
