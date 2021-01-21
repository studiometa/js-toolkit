/**
 * @typedef {HTMLElement & { __base__?: Base | 'terminated' }} BaseHTMLElement
 * @typedef {{ name: string, debug: boolean, log: boolean }} BaseOptions
 * @typedef {{ [name:string]: HTMLElement | Base | Array<HTMLElement|Base> }} BaseRefs
 * @typedef {{ [nameOrSelector:string]: Array<Base | Promise<Base>> }} BaseChildren
 * @typedef {{ [nameOrSelector:string]: Base | (() => Promise<Base>) }} BaseConfigComponents
 * @typedef {import('./classes/Options').OptionsSchema} BaseConfigOptions
 * @typedef {{ name: string, debug?: boolean, log?: boolean, refs?: String[], components?: BaseConfigComponents, options?: BaseConfigOptions }} BaseConfig
 */
/**
 * Page lifecycle class
 * @property {Boolean=false} $isMounted
 */
export default class Base extends EventManager {
    /**
     * This is a Base instance.
     * @type {Boolean}
     */
    static __isBase__: boolean;
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
     * @param {BaseHTMLElement} element The component's root element dd.
     */
    constructor(element: BaseHTMLElement);
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
     * Is this instance a child of another one?
     * @type {Boolean}
     */
    __isChild__: boolean;
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
    /** @type {BaseHTMLElement} */
    $el: BaseHTMLElement;
    /** @type {BaseOptions} */
    $options: BaseOptions;
    /**
     * Small helper to log stuff.
     *
     * @param  {...any} args The arguments passed to the method
     * @return {void}
     */
    $log(...args: any[]): void;
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
export type BaseHTMLElement = HTMLElement & {
    __base__?: Base | 'terminated';
};
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type BaseRefs = {
    [name: string]: HTMLElement | Base | (HTMLElement | Base)[];
};
export type BaseChildren = {
    [nameOrSelector: string]: (Base | Promise<Base>)[];
};
export type BaseConfigComponents = {
    [nameOrSelector: string]: Base | (() => Promise<Base>);
};
export type BaseConfigOptions = {
    [name: string]: ObjectConstructor | StringConstructor | BooleanConstructor | NumberConstructor | ArrayConstructor | {
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
