/**
 * Functional DOM node creation.
 */
export function h<T extends keyof HTMLElementTagNameMap = 'div'>(
  tag: T,
  children?: (string | Node)[],
): HTMLElementTagNameMap[T];
export function h<T extends keyof HTMLElementTagNameMap = 'div'>(
  tag: T,
  attributes?: Record<string, string>,
  children?: (string | Node)[],
): HTMLElementTagNameMap[T];
export function h<T extends keyof HTMLElementTagNameMap = 'div'>(
  tag: T,
  attributes: Record<string, string> = {},
  children: (string | Node)[] = [],
): HTMLElementTagNameMap[T] {
  const el = document.createElement(tag);

  if (!Array.isArray(attributes)) {
    for (const [name, value] of Object.entries(attributes)) {
      el.setAttribute(name.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), value);
    }
  }

  el.append(...children);

  return el;
}
