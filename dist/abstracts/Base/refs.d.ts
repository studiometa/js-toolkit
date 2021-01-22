/**
 * @typedef {import('./index').default} Base
 */
/**
 * A ponyfill for the CSS `:scope` selector which is not supported in IE11.
 * The following method will return an array of elements similare to the
 * `:scope ${selector}` selector.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/:scope
 * @see https://github.com/jonathantneal/element-qsa-scope
 *
 * @param  {HTMLElement} element  The element from which the scope is taken.
 * @param  {String}      selector The children selector.
 * @param  {String}      uniqId   A uniq ID to prefix the selector with.
 * @return {Array}                A list of elements.
 */
export function scopeSelectorPonyfill(element: HTMLElement, selector: string, uniqId: string): any[];
/**
 * Get all refs of a component.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @return {Object}               Return an object containing all the component's refs.
 */
export function getRefs(instance: Base, element: HTMLElement): any;
declare namespace _default {
    export { getRefs };
}
export default _default;
export type Base = import(".").default;
