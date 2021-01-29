/**
 * Get a list of elements based on the name of a component.
 *
 * @param {String} nameOrSelector
 *   The name or selector to used for this component.
 * @param {HTMLElement|Document} element
 *   The root element on which to query the selector, defaults to `document`.
 * @return {Array<HTMLElement>}
 *   A list of elements on which the component should be mounted.
 */
export function getComponentElements(nameOrSelector: string, element?: HTMLElement | Document): Array<HTMLElement>;
/**
 * Get child components.
 * @param  {Base}                 instance   The component's instance.
 * @param  {HTMLElement}          element    The component's root element
 * @param  {BaseConfigComponents} components The children components' classes
 * @return {null|Object}                     Returns `null` if no child components are defined or an object of all child component instances
 */
export function getChildren(instance: Base, element: HTMLElement, components: BaseConfigComponents): null | any;
declare namespace _default {
    export { getChildren };
}
export default _default;
export type Base = import(".").default;
export type BaseComponent = typeof import(".").default;
export type BaseAsyncComponent = () => Promise<typeof import(".").default | {
    default: typeof import(".").default;
}>;
export type BaseConfigComponents = {
    [nameOrSelector: string]: typeof import(".").default | import(".").BaseAsyncComponent;
};
