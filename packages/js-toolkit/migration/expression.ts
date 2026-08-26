/**
 * The one `new Function` compiler, shared by every family that evaluates an
 * author's expression — `Action`, `Data` and `Fetch`. It uses `new Function`,
 * so it requires a Content Security Policy that permits `unsafe-eval`; that
 * is why the boundary is one file, not a helper each family reinvents.
 *
 * `Action` and `Data` used to cache under a `cacheKey` the caller built by
 * hand — `Data`'s was `code + name`, under which `('bc', 'return "A"')` and
 * `('c', 'return "A"b')` land in the same entry. There is no `cacheKey`
 * parameter here: the key is the argument list and the body, kept apart in
 * two map levels rather than joined into one string, so nothing a caller
 * writes can collide with it.
 */

export type CompiledExpression = (...args: unknown[]) => unknown;

const cache = new Map<string, Map<string, CompiledExpression>>();

/**
 * Compile `body` into a function taking `argNames`, memoised by both.
 *
 * @param argNames The parameter names `body` may reference, in order.
 * @param body The function body, for example `return target.open();`.
 */
export function compileExpression(argNames: readonly string[], body: string): CompiledExpression {
  const argsKey = argNames.join(',');
  let byBody = cache.get(argsKey);
  if (!byBody) {
    byBody = new Map();
    cache.set(argsKey, byBody);
  }

  let compiled = byBody.get(body);
  if (!compiled) {
    // Compiling the author's expression is the whole feature.
    // oxlint-disable-next-line no-new-func, typescript/no-implied-eval
    compiled = new Function(...argNames, body) as CompiledExpression;
    byBody.set(body, compiled);
  }

  return compiled;
}
