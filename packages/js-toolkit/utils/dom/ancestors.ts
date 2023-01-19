/**
 * Get an ancestor matching the given condition.
 */
export function getAncestorWhere(element: HTMLElement, condition: (el: HTMLElement) => boolean) {
  if (!element) {
    return null;
  }

  const ancestor = element.parentElement;

  return condition(ancestor) ? ancestor : getAncestorWhere(ancestor, condition);
}

/**
 * Get an ancestor matching the given condition, stop when the until function is truthy.
 */
export function getAncestorWhereUntil(
  element: HTMLElement,
  condition: (el: HTMLElement) => boolean,
  until: (el: HTMLElement) => boolean,
): HTMLElement | null {
  return getAncestorWhere(element, (el) => condition(el) || until(el));
}
