export function eachElements<T = void>(
  elementOrElements: HTMLElement | HTMLElement[] | NodeList,
  callback: (element: HTMLElement, index?: number, elements?: HTMLElement[]) => T,
): T | T[] {
  if (elementOrElements instanceof HTMLElement) {
    return callback(elementOrElements);
  }

  return Array.from(elementOrElements).map(callback);
}
