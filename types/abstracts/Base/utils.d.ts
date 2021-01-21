/**
 * @typedef {import('./index').default} Base
 * @typedef {import('./index').BaseConfig} BaseConfig
 */
/**
 * Get the config from a Base instance, either the new static one or the old getter one.
 *
 * @param  {Base}       instance The instance to get the config from.
 * @return {BaseConfig}         A Base class configuration object.
 */
export function getConfig(instance: Base): BaseConfig;
/**
 * Display a console warning for the given instance.
 *
 * @param {Base}      instance A Base instance.
 * @param {...String} msg   Values to display in the console.
 */
export function warn(instance: Base, ...msg: string[]): void;
/**
 * Display a console log for the given instance.
 *
 * @param {Base}   instance The instance to log information from.
 * @param {...any} msg      The data to print to the console.
 */
export function log(instance: Base, ...msg: any[]): void;
/**
 * Verbose debug for the component.
 *
 * @param {Base}   instance The instance to debug.
 * @param {...any} args     The data to print.
 */
export function debug(instance: Base, ...args: any[]): void;
/**
 * Test if an object has a method.
 *
 * @param  {Object}  obj  The object to test
 * @param  {String}  name The method's name
 * @return {Boolean}
 */
export function hasMethod(obj: any, name: string): boolean;
/**
 * Call the given method while applying the given arguments.
 *
 * @param {Base}   instance The Base instance on which to trigger the method.
 * @param {String} method   The method to call.
 * @param {...any} args     The arguments to pass to the method.
 */
export function callMethod(instance: Base, method: string, ...args: any[]): import(".").default;
export type Base = import(".").default;
export type BaseConfig = {
    name: string;
    debug?: boolean;
    log?: boolean;
    refs?: string[];
    components?: import(".").BaseConfigComponents;
    options?: import("./classes/Options").OptionsSchema;
};
