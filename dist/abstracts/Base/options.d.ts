/**
 * @typedef {import('./index').default} Base
 */
/**
 * Get a component's options.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @param  {Object}      config   The component's default config.
 * @return {Object}               The component's merged options.
 */
export function getOptions(instance: Base, element: HTMLElement, config: any): any;
declare namespace _default {
    export { getOptions };
}
export default _default;
export type Base = import(".").default;
