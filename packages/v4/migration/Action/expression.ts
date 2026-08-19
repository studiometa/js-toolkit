import { compileExpression, type CompiledExpression } from '../expression.js';

/**
 * A compiled effect. Called with `this` bound to the action's element and the
 * argument list `executeEffect()` assembles; may return a function, which is
 * then called with the same `this` and the same arguments.
 */
export type EffectFunction = CompiledExpression;

/** Effect argument names in `executeEffect()` order. */
export const EFFECT_ARGUMENTS = ['ctx', 'event', 'target', 'action', 'self', '$el'] as const;

/**
 * Compile one `data-on:*` or `data-option-effect` expression.
 *
 * @param code The expression source, for example `target.open()`.
 * @param instanceNames Co-located component names added as parameters.
 */
export function getEffect(code: string, instanceNames: readonly string[]): EffectFunction {
  return compileExpression([...EFFECT_ARGUMENTS, ...instanceNames], `return ${code}`);
}
