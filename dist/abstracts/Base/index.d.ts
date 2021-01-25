/**
 * @typedef {typeof Base} BaseComponent
 * @typedef {() => Promise<BaseComponent | { default: BaseComponent }>} BaseAsyncComponent
 * @typedef {{ name: string, debug: boolean, log: boolean }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | BaseComponent | Array<HTMLElement|BaseComponent> }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Array<Base | Promise<Base>> }} BaseChildren
 * @typedef {{ [nameOrSelector:string]: BaseComponent | BaseAsyncComponent }} BaseConfigComponents
 * @typedef {import('./classes/Options').OptionsSchema} BaseConfigOptions
 */
/**
 * @typedef {Object} BaseConfig
 * @property {String} name
 * @property {Boolean} [debug]
 * @property {Boolean} [log]
 * @property {String[]} [refs]
 * @property {BaseConfigComponents} [components]
 * @property {BaseConfigOptions} [options]
 */
/**
 * Base class to easily create components.
 *
 * @example
 * ```js
 * class Component extends Base {
 *   static config = {
 *     name: 'Component',
 *     log: true,
 *   };
 *
 *   mounted() {
 *     this.$log('Component is mounted!');
 *   }
 * }
 *
 * class App extends Base {
 *   static config = {
 *     name: 'App',
 *     components: {
 *       Component,
 *     },
 *   };
 * }
 *
 * new App(document.body).$mount();
 * ```
 */
export default class Base extends EventManager {
    /**
     * This is a Base instance.
     * @type {Boolean}
     */
    static $isBase: boolean;
    /** @type {BaseConfig} */
    static config: BaseConfig;
    /**
     * Factory method to generate multiple instance of the class.
     *
     * @param  {String}      nameOrSelector The selector on which to mount each instance.
     * @return {Array<Base>}                A list of the created instance.
     */
    static $factory(nameOrSelector: string): Array<Base>;
    /**
     * Class constructor where all the magic takes place.
     *
     * @param {HTMLElement} element The component's root element dd.
     */
    constructor(element: HTMLElement);
    /**
     * The instance parent.
     * @type {Base}
     */
    $parent: Base;
    /**
     * The state of the component.
     * @type {Boolean}
     */
    $isMounted: boolean;
    /**
     * Get properties to exclude from the autobind call.
     * @return {Array<String|RegExp>}
     */
    get _excludeFromAutoBind(): (string | RegExp)[];
    /**
     * @deprecated Use the static `config` property instead.
     * @return {BaseConfig}
     */
    get config(): BaseConfig;
    /**
     * Get the component's refs.
     * @return {BaseRefs}
     */
    get $refs(): BaseRefs;
    /**
     * Get the component's children components.
     * @return {BaseChildren}
     */
    get $children(): BaseChildren;
    /** @type {String} */
    $id: string;
    /** @type {HTMLElement} */
    $el: HTMLElement;
    /** @type {BaseOptions} */
    $options: BaseOptions;
    /**
     * Small helper to log stuff.
     *
     * @return {(...args: any) => void} A log function if the log options is active.
     */
    get $log(): (...args: any) => void;
    /**
     * Trigger the `mounted` callback.
     */
    $mount(): Base;
    /**
     * Update the instance children.
     */
    $update(): Base;
    /**
     * Trigger the `destroyed` callback.
     */
    $destroy(): Base;
    /**
     * Terminate a child instance when it is not needed anymore.
     * @return {void}
     */
    $terminate(): void;
}
export type BaseComponent = typeof Base;
export type BaseAsyncComponent = () => Promise<BaseComponent | {
    default: BaseComponent;
}>;
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type BaseRefs = {
    [name: string]: typeof Base | HTMLElement | (typeof Base | HTMLElement)[];
};
export type BaseChildren = {
    [nameOrSelector: string]: (Base | Promise<Base>)[];
};
export type BaseConfigComponents = {
    [nameOrSelector: string]: typeof Base | BaseAsyncComponent;
};
export type BaseConfigOptions = {
    [name: string]: ObjectConstructor | ArrayConstructor | StringConstructor | NumberConstructor | BooleanConstructor | {
        type: import("./classes/Options").OptionType;
        default: string | number | boolean | (() => any);
    };
};
export type BaseConfig = {
    name: string;
    debug?: boolean;
    log?: boolean;
    refs?: string[];
    components?: BaseConfigComponents;
    options?: BaseConfigOptions;
};
import EventManager from "../EventManager";
