export function eachElements<S extends Node = Node, T = void>(
  elementOrElements: S | S[] | NodeListOf<S>,
  callback: (element: S, index?: number, elements?: S[]) => T,
): T[] {
  if (elementOrElements instanceof Node) {
    return [callback(elementOrElements)];
  }

  return Array.from(elementOrElements).map(callback);
}
