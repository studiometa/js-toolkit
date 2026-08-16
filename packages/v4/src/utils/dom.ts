import { isObject, isString } from './is.js';
import { kebabCase } from './strings.js';

interface AnyHTMLElementTagNameMap extends HTMLElementTagNameMap {
  [key: string]: HTMLElement;
}

/** Element creation and element measurement, both element-level DOM helpers. */

/** What an element can be given as content: markup-free text, nodes, or both. */
export type CreateElementChildren = string | Node | Array<string | Node>;

export interface CreateElementAttributes {
  /** Set as `data-` attributes, each name in `kebab-case`. */
  data?: Record<string, string>;
  [key: string]: string | Record<string, string> | undefined;
}

/**
 * Create an element, with its attributes and its content.
 *
 * The second argument is read as content when it is a string, a node or an
 * array — an element with content and no attribute needs no empty object.
 *
 * @example
 * ```js
 * createElement(); // <div></div>
 * createElement('a', { href: '#' }); // <a href="#"></a>
 * createElement('a', 'link'); // <a>link</a>
 * createElement('a', { href: '#' }, [createElement('span')]); // <a href="#"><span></span></a>
 * ```
 */
export function createElement<T extends keyof AnyHTMLElementTagNameMap = 'div'>(
  tag?: T,
  children?: CreateElementChildren,
): AnyHTMLElementTagNameMap[T];
export function createElement<T extends keyof AnyHTMLElementTagNameMap = 'div'>(
  tag?: T,
  attributes?: CreateElementAttributes,
  children?: CreateElementChildren,
): AnyHTMLElementTagNameMap[T];
export function createElement<T extends keyof AnyHTMLElementTagNameMap = 'div'>(
  tag?: T,
  attributes: CreateElementChildren | CreateElementAttributes = {},
  children: CreateElementChildren | null = null,
): AnyHTMLElementTagNameMap[T] {
  const element = document.createElement((tag as string) ?? 'div');

  let content = children;
  let attrs = attributes;
  if (content === null && (Array.isArray(attrs) || isString(attrs) || attrs instanceof Node)) {
    content = attrs;
    attrs = {};
  }

  for (const [name, value] of Object.entries(attrs as CreateElementAttributes)) {
    if (isString(value)) {
      element.setAttribute(kebabCase(name), value);
    } else if (name === 'data' && isObject(value)) {
      for (const [dataName, dataValue] of Object.entries(value)) {
        element.setAttribute(`data-${kebabCase(dataName)}`, dataValue);
      }
    }
  }

  if (content) {
    element.append(...(Array.isArray(content) ? content : [content]));
  }

  return element;
}

/** A `DOMRect`-shaped box, in the same viewport coordinates. */
export interface OffsetSizes {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Measure an element's box as layout placed it, with every transform on it and
 * on its ancestors ignored — what `getBoundingClientRect()` would answer if
 * nothing were transformed. Coordinates are the viewport's, as that method's.
 *
 * A pure read: the caller owns the phase it happens in.
 */
export function getOffsetSizes(element: HTMLElement): OffsetSizes {
  let x = element.offsetLeft;
  let y = element.offsetTop;
  let offsetParent = element.offsetParent;

  for (let node = element.parentElement; node; node = node.parentElement) {
    // Every scrolling ancestor shifts the box, the document included: reading
    // the chain covers the page scroll in standards and in quirks mode alike.
    x -= node.scrollLeft;
    y -= node.scrollTop;

    if (node === offsetParent) {
      // The offsets are relative to the offset parent's padding edge, and its
      // own offsets place its border edge, so its border sits between the two.
      const styles = getComputedStyle(node);
      x += node.offsetLeft + Number.parseFloat(styles.borderLeftWidth);
      y += node.offsetTop + Number.parseFloat(styles.borderTopWidth);
      offsetParent = node.offsetParent;
    }
  }

  const width = element.offsetWidth;
  const height = element.offsetHeight;

  return { x, y, width, height, top: y, right: x + width, bottom: y + height, left: x };
}
