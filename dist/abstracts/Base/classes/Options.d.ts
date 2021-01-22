/**
 * Class options to manage options as data attributes on an HTML element.
 */
export default class Options {
    /** @type {Array} List of allowed types. */
    static types: any[];
    /**
     * Class constructor.
     *
     * @param {HTMLElement}   element The HTML element storing the options.
     * @param {OptionsSchema} schema  A Base class config.
     */
    constructor(element: HTMLElement, schema: OptionsSchema);
    /**
     * Get an option value.
     *
     * @param {String} name The option name.
     * @param {ArrayConstructor|ObjectConstructor|StringConstructor|NumberConstructor|BooleanConstructor} type The option data's type.
     * @param {any} defaultValue The default value for this option.
     */
    get(name: string, type: ArrayConstructor | ObjectConstructor | StringConstructor | NumberConstructor | BooleanConstructor, defaultValue: any): any;
    /**
     * Set an option value.
     *
     * @param {String} name The option name.
     * @param {ArrayConstructor|ObjectConstructor|StringConstructor|NumberConstructor|BooleanConstructor} type The option data's type.
     * @param {any} value The new value for this option.
     */
    set(name: string, type: ArrayConstructor | ObjectConstructor | StringConstructor | NumberConstructor | BooleanConstructor, value: any): void;
    #private;
}
export type OptionType = ObjectConstructor | ArrayConstructor | StringConstructor | NumberConstructor | BooleanConstructor;
export type OptionsSchema = {
    [name: string]: ObjectConstructor | ArrayConstructor | StringConstructor | NumberConstructor | BooleanConstructor | {
        type: OptionType;
        default: string | number | boolean | (() => any[] | any);
    };
};
