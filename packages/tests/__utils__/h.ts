export function h(
  tag = 'div',
  attributes: Record<string, string> = {},
  children: (string | Node)[] = [],
) {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), value);
  }

  el.append(...children);

  return el;
}
