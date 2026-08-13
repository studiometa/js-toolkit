/**
 * The expression evaluator behind `data-option-effect` and every
 * `data-on:<event>` attribute.
 *
 * **Carved out of v3's `ActionEvent.effect` getter, which built the function
 * inline.** It stays out of v4 core for the same reason `Data/expression.ts`
 * does: `new Function` is a CSP decision, not a framework one. A page with
 * `script-src 'self'` and no `'unsafe-eval'` cannot run it at all, and core
 * must be loadable there. Keeping it in the component family means the
 * expression-driven components are the only ones a strict CSP disables,
 * instead of the whole toolkit.
 *
 * ## Why this is a second file and not a call into `Data/expression.ts`
 *
 * The two evaluators differ in exactly one axis, and it is the one that
 * matters: **arity**. `Data`'s `getCallback(name, code)` compiles a fixed
 * `(value, target, $data)` signature and runs `code` as a body. `Action`
 * compiles a **variable** signature — six fixed names plus one per component
 * instance mounted on the action element, a list that is only known at the
 * moment the event fires — and wraps `code` in a `return` so an expression is
 * a legal body.
 *
 * So they are two calls of one primitive, not one function. `compile()`
 * below **is** that primitive, and `Data`'s evaluator is one line of it:
 *
 *     getCallback(name, code) === compile(['value', 'target', '$data'], code, code + name)
 *
 * The port keeps them apart rather than editing the `Data` port to import
 * from here, because the convergence is a ui packaging decision — see
 * REPORT.md §6. What is deliberately *not* duplicated is the discipline: one
 * module-level cache, keyed by everything that changes the compiled output,
 * and one documented CSP boundary.
 */

/**
 * A compiled effect. Called with `this` bound to the action's element and the
 * argument list `executeEffect()` assembles; may return a function, which is
 * then called with the same `this` and the same arguments.
 */
export type EffectFunction = (...args: unknown[]) => unknown;

const cache = new Map<string, EffectFunction>();

/**
 * Compile `body` into a function taking `argNames`, memoised under `cacheKey`.
 */
function compile(argNames: readonly string[], body: string, cacheKey: string): EffectFunction {
  let callback = cache.get(cacheKey);
  if (!callback) {
    // oxlint-disable-next-line no-new-func
    callback = new Function(...argNames, body) as EffectFunction;
    cache.set(cacheKey, callback);
  }
  return callback;
}

/**
 * The six names every effect gets, in the order `executeEffect()` supplies
 * their values. Exported because the specs assert the contract and the
 * documentation lists it.
 */
export const EFFECT_ARGUMENTS = ['ctx', 'event', 'target', 'action', 'self', '$el'] as const;

/**
 * Compile one `data-on:*` / `data-option-effect` expression.
 *
 * The cache key covers the parameter list as well as the source, because the
 * same expression compiled against a different instance list is a different
 * function. The count is prefixed so two name lists cannot concatenate into
 * one key — v3 used `effectDefinition + keys.join('')`, under which
 * `['Ab', 'C']` and `['A', 'bC']` are the same entry.
 *
 * @param code           The expression source, e.g. `target.open()`.
 * @param instanceNames  Names of the components mounted on the action's own
 *                       element, each becoming an extra parameter.
 */
export function getEffect(code: string, instanceNames: readonly string[]): EffectFunction {
  return compile(
    [...EFFECT_ARGUMENTS, ...instanceNames],
    `return ${code}`,
    `${instanceNames.length}:${instanceNames.join(',')}:${code}`,
  );
}
