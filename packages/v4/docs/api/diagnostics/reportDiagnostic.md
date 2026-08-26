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
// @twoslash-cache: {"v":1,"hash":"aaaf4942a2e7215127b30180e64831407c2571649449b97c19a0ef4b5220728a","data":"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"}
import { reportDiagnostic } from '@studiometa/js-toolkit-v4';

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
