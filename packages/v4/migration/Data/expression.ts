/**
 * Expression evaluator for Data components. It uses `new Function`, so it
 * requires a Content Security Policy that permits `unsafe-eval`. The cache
 * keeps identical expressions in different groups separate.
 */

export type DataExpression = (value: unknown, target: HTMLElement, $data: unknown) => unknown;

const callbacks = new Map<string, DataExpression>();

export function getCallback(name: string, code: string): DataExpression {
  const key = code + name;

  let callback = callbacks.get(key);
  if (!callback) {
    // Compiling the author's expression is the whole feature.
    // oxlint-disable-next-line no-new-func, typescript/no-implied-eval
    callback = new Function('value', 'target', '$data', code) as DataExpression;
    callbacks.set(key, callback);
  }

  return callback;
}
