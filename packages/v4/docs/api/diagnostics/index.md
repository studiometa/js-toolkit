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

Every diagnostic starts on its relevant connected element, or on `document` when there is none, with `{ bubbles: true, composed: true, cancelable: true }`.

**Dispatch always happens before the default output.** An uncancelled warning calls `console.warn()` once with exactly `[js-toolkit:<code>] <message>`; an uncancelled error calls `reportError(detail.error)` with the original value. `preventDefault()` suppresses **that output only** and changes no framework decision.

## Read next

[Diagnostics](/guide/going-further/handling-diagnostics.html).
