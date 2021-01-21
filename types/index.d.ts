/**
 * Define a component without a class.
 *
 * @param  {Object} options The component's object
 * @return {Base}           A component's class.
 */
export function defineComponent(options: any): Base;
/**
 * Create a Base instance with the given object configuration.
 * @param {HTMLElement|String} elementOrSelector The instance root HTML element.
 * @param {Object}             options           The Base class configuration.
 */
export function createBase(elementOrSelector: HTMLElement | string, options: any): any;
export default Base;
import Base from "./abstracts/Base";
