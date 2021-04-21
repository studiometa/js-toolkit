/**
 * @typedef {import('./abstracts/Base').BaseComponent} BaseComponent
 */
/**
 * Define a component without a class.
 *
 * @param  {Object} options The component's object
 * @return {BaseComponent}           A component's class.
 */
export function defineComponent(options: any): BaseComponent;
/**
 * Create a Base instance with the given object configuration.
 * @param {HTMLElement|String} elementOrSelector The instance root HTML element.
 * @param {Object}             options           The Base class configuration.
 */
export function createBase(elementOrSelector: HTMLElement | string, options: any): Base;
export default Base;
export type BaseComponent = import('./abstracts/Base').BaseComponent;
import Base from "./abstracts/Base";
