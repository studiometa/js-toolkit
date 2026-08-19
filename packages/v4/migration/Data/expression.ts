import { compileExpression } from '../expression.js';

export type DataExpression = (value: unknown, target: HTMLElement, $data: unknown) => unknown;

const ARG_NAMES = ['value', 'target', '$data'] as const;

/**
 * Compile a `data-bind:*`, `data-compute` or `data-effect` expression.
 *
 * @param code The expression source, for example `return value * 2;`.
 */
export function getCallback(code: string): DataExpression {
  return compileExpression(ARG_NAMES, code);
}
