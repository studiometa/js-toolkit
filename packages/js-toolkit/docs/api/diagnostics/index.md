# Diagnostics

Everything the framework recovers from is reported on **one** cancelable event, and nothing in core calls `console.warn()` or `console.error()` directly.

## The exports

- [`EVENTS`](./EVENTS.html) — the framework event names
- [`DIAGNOSTICS`](./DIAGNOSTICS.html) — every code
- [`reportDiagnostic(code, message, error, ctx?)`](./reportDiagnostic.html) — report an error
- [`warn(code, message, ctx?)`](./warn.html) — report a warning

From inside a component, `$warn()` and `$error()` fill the component name in.

## The detail

```ts
type ToolkitDiagnosticDetail =
  | {
      readonly severity: 'warning';
      readonly code: ToolkitDiagnosticCode;
      readonly message: string;
      readonly component?: string;
      readonly error?: never;
    }
  | {
      readonly severity: 'error';
      readonly code: ToolkitDiagnosticCode;
      readonly message: string;
      readonly component?: string;
      readonly error: unknown;
    };
```

An **error** detail requires the original caught value; a **warning** carries none. That is a union, not an optional field, so a listener that reads `detail.error` has already narrowed on `severity`.

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

Every diagnostic starts on its relevant connected element, or on `document` when there is none, with `{ bubbles: true, composed: true, cancelable: true }`.

**Dispatch always happens before the default output.** An uncancelled warning calls `console.warn()` once with exactly `[js-toolkit:<code>] <message>`; an uncancelled error calls `reportError(detail.error)` with the original value. `preventDefault()` suppresses **that output only** and changes no framework decision.

## Read next

[Diagnostics](/guide/going-further/handling-diagnostics.html).
