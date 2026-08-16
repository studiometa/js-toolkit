/**
 * Expression evaluator for action bindings. It uses `new Function`, so it
 * requires a Content Security Policy that permits `unsafe-eval`.
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

/** Effect argument names in `executeEffect()` order. */
export const EFFECT_ARGUMENTS = ['ctx', 'event', 'target', 'action', 'self', '$el'] as const;

/**
 * Compile one `data-on:*` or `data-option-effect` expression.
 *
 * The cache key includes the source and complete parameter list.
 *
 * @param code The expression source, for example `target.open()`.
 * @param instanceNames Co-located component names added as parameters.
 */
export function getEffect(code: string, instanceNames: readonly string[]): EffectFunction {
  return compile(
    [...EFFECT_ARGUMENTS, ...instanceNames],
    `return ${code}`,
    `${instanceNames.length}:${instanceNames.join(',')}:${code}`,
  );
}
