/**
 * @typedef {Partial<CSSStyleDeclaration> & Record<string, string | null>} CssStyleObject
 */
/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}    element The element to update.
 * @param {CssStyleObject} styles  An object of styles properties and values.
 * @param {String}         method  The method to use: add or remove.
 */
export default function setStyles(element: HTMLElement, styles: CssStyleObject, method?: string): void;
/**
 * Add styles to an element.
 *
 * @param {HTMLElement}    element The element to update.
 * @param {CssStyleObject} styles  A string of class names.
 * @return {void}
 */
export function add(element: HTMLElement, styles: CssStyleObject): void;
/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement}    element The element to update.
 * @param  {CssStyleObject} styles  A string of class names.
 * @return {void}
 */
export function remove(element: HTMLElement, styles: CssStyleObject): void;
export type CssStyleObject = Partial<CSSStyleDeclaration> & Record<string, string>;
