import { isObject, isString } from './is.js';
import { kebabCase } from './strings.js';

interface AnyHTMLElementTagNameMap extends HTMLElementTagNameMap {
  [key: string]: HTMLElement;
}

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
        element.setAttribute(`data-${kebabCase(dataName)}`, dataValue as string);
      }
    }
  }

  if (content) {
    element.append(...(Array.isArray(content) ? content : [content]));
  }

  return element as AnyHTMLElementTagNameMap[T];
}
