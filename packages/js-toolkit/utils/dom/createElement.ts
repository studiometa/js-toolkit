import { isArray, isObject, isString } from '../is.js';
import { dashCase } from '../string/changeCase.js';

interface AnyHTMLElementTagNameMap extends HTMLElementTagNameMap {
  [key: string]: HTMLElement;
}

type CreateElementChildren = string | Node | Array<string | Node>;

type CreateElementAttributes = {
  data?: Record<string, string> | string;
  class?: string;
  id?: string;
  [key: string]: string | Record<string, string> | undefined;
};

/**
 * Functional DOM Element creation.
 *
 * If only 2 arguments are given and the second is an array, a string or a Node,
 * then it will be used as children.
 *
 * @example
 * ```js
 * createElement(); // <div></div>
 * createElement('a'); // <a></a>
 * createElement('a', { href: '#' }); // <a href="#"></a>
 * createElement('a', { href: '#'}, [createElement('span')]); // <a href="#"><span></span></a>
 * createElement('a', 'link'); // <a>link</a>
 * ```
 *
 * @param tag The tag name of the element to create.
 * @param attributes The attributes to set on the created element.
 * @param children The children to append to the created element.
 * @link https://js-toolkit.studiometa.dev/utils/createElement.html
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
  children: CreateElementChildren = null,
): AnyHTMLElementTagNameMap[T] {
  const el = document.createElement((tag as string) ?? 'div');

  if (
    children === null &&
    (isArray(attributes) || isString(attributes) || attributes instanceof Node)
  ) {
    children = attributes;
    attributes = {};
  }

  for (const [name, value] of Object.entries(attributes as CreateElementAttributes)) {
    if (isString(value)) {
      el.setAttribute(dashCase(name), value as string);
    } else if (name === 'data' && isObject(value)) {
      for (const [dataName, dataValue] of Object.entries(value)) {
        el.setAttribute(`data-${dashCase(dataName)}`, dataValue);
      }
    }
  }

  if (children) {
    children = isArray(children) ? children : [children];
    el.append(...children);
  }

  return el;
}
