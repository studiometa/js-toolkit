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
// @twoslash-cache: {"v":1,"hash":"de1e066064ed0245833df4fbfcef0ff15d3d4b957d6e771f675b38f47d0a61ba","data":"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="}
import { DIAGNOSTICS, EVENTS, type ToolkitDiagnosticDetail } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"684a1ce50d29d9c878678b9742ce311e8176f7265c30a62751e114b774517e5d","data":"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"}
import { DIAGNOSTICS } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"b272ba1f1a6fc58bc3544da86e3397670ccab579c0ba5ef3a85479099d127c13","data":"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="}
import { reportDiagnostic, warn } from '@studiometa/js-toolkit';

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
