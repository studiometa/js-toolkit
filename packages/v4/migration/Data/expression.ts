/**
 * The expression evaluator behind `data-option-compute`,
 * `data-option-effect` and every `data-bind:*` attribute.
 *
 * **Copied from `@studiometa/ui` `Data/utils.ts`, unchanged apart from
 * types.** It stays out of v4 core on purpose: `new Function` is a CSP
 * decision, not a framework one. A page with `script-src 'self'` and no
 * `'unsafe-eval'` cannot run it at all, and core must be loadable there.
 * Keeping it in the component family means the expression-driven components
 * are the only ones a strict CSP disables, instead of the whole toolkit.
 *
 * The cache is keyed by `code + group` rather than by `code` alone. That is
 * v3's key and it looks redundant — the compiled function does not close over
 * the group — but it makes two identical expressions in two groups distinct
 * cache entries, which is what a debugger sees when it steps into one.
 */

export type DataExpression = (value: unknown, target: HTMLElement, $data: unknown) => unknown;

const callbacks = new Map<string, DataExpression>();

export function getCallback(name: string, code: string): DataExpression {
  const key = code + name;

  let callback = callbacks.get(key);
  if (!callback) {
    // oxlint-disable-next-line no-new-func
    callback = new Function('value', 'target', '$data', code) as DataExpression;
    callbacks.set(key, callback);
  }

  return callback;
}
