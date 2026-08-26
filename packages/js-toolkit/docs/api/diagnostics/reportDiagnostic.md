# reportDiagnostic

```ts
reportDiagnostic(
  code: ToolkitDiagnosticCode,
  message: string,
  error: unknown,
  context?: { component?: string; target?: Element },
): CustomEvent<ToolkitDiagnosticDetail>
```

Reports an **error** on the diagnostic channel. The original caught value is required.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"25069f85dd6fab3d9c18d5987a403b058649ebc610ced19239d935c8eef74273","data":"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="}
import { reportDiagnostic } from '@studiometa/js-toolkit';

try {
  JSON.parse('{');
} catch (error) {
  reportDiagnostic('carousel.bad-config', 'The config attribute is not valid JSON.', error, {
    component: 'Carousel',
  });
}
```

**Parameters**

- `code` — a namespaced string. Core codes come from [`DIAGNOSTICS`](./DIAGNOSTICS.html); a consumer uses its own `'<namespace>.<name>'`.
- `message` — one sentence, and it should say what to do about it.
- `error` — **required.** The original value, passed through untouched.
- `context.component` — the reporting component's name.
- `context.target` — the element to dispatch from. Defaults to `document`.

**Return value**

- the dispatched event, so a caller can read `defaultPrevented`.

## What happens

1. The event is dispatched — **always before any output** — with `{ bubbles: true, composed: true, cancelable: true }`.
2. If nothing cancelled it, `reportError(detail.error)` is called with the original value.

`preventDefault()` suppresses that call and nothing else.

## From a component

`$error(code, message, error)` is the same call with the component name filled in:

```js
this.$error('carousel.bad-config', 'The config attribute is not valid JSON.', error);
```

## When to report and when to throw

| The failure is               | Do                  |
| ---------------------------- | ------------------- |
| something you recovered from | report it           |
| the caller's to handle       | **throw or reject** |

Core follows the same rule: decorator and manifest-adapter misuse, shared-runtime incompatibility, service startup rollback, caller-owned teardown, `viewTransition()` and `swap()` all throw. A channel is for what was survived.

## See also

- [`warn()`](./warn.html) — a warning, with no error value
- [`captureDiagnostics()`](/api/test/) — reading the channel in a test
