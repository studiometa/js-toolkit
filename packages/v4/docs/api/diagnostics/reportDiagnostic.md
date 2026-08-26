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
