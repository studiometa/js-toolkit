import { isArray, isString } from '../is.js';
import { dashCase } from '../string/changeCase.js';

interface AnyHTMLElementTagNameMap extends HTMLElementTagNameMap {
  [key: string]: HTMLElement;
}

type CreateElementChildren = string | Node | Array<string | Node>;

/**
 * Functional DOM Element creation.
 */
export function createElement<T extends keyof AnyHTMLElementTagNameMap = 'div'>(
  tag?: T,
  children?: CreateElementChildren,
): AnyHTMLElementTagNameMap[T];
export function createElement<T extends keyof AnyHTMLElementTagNameMap = 'div'>(
  tag?: T,
  attributes?: Record<string, string>,
  children?: CreateElementChildren,
): AnyHTMLElementTagNameMap[T];
export function createElement<T extends keyof AnyHTMLElementTagNameMap = 'div'>(
  tag?: T,
  attributes: CreateElementChildren | Record<string, string> = {},
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

  for (const [name, value] of Object.entries(attributes as Record<string, string>)) {
    el.setAttribute(dashCase(name), value);
  }

  if (children) {
    children = isArray(children) ? children : [children];
    const target = el instanceof HTMLTemplateElement ? el.content : el;
    target.append(...children);
  }

  return el;
}
