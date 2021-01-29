/**
 * Get a component's options.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @param  {Object}      config   The component's default config.
 * @return {Options & BaseOptions}              The component's merged options.
 */
export function getOptions(instance: Base, element: HTMLElement, config: any): Options & BaseOptions;
declare namespace _default {
    export { getOptions };
}
export default _default;
export type Base = import(".").default;
export type BaseOptions = {
    [name: string]: any;
    name: string;
    debug: boolean;
    log: boolean;
};
export type OptionsSchema = {
    [name: string]: ObjectConstructor | ArrayConstructor | StringConstructor | NumberConstructor | BooleanConstructor | {
        type: import("./classes/Options").OptionType;
        default: string | number | boolean | (() => any);
    };
};
import Options from "./classes/Options";
