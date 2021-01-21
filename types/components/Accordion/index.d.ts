/**
 * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../../abstracts/Base').BaseChildren} BaseChildren
 */
/**
 * Accordion class.
 * @implements {Base}
 * @property {BaseOptions & { autoclose: Boolean, item: Object|null }} $options
 */
export default class Accordion extends Base implements Base {
    /**
     * Accordion config.
     */
    static config: {
        name: string;
        options: {
            autoclose: BooleanConstructor;
            item: ObjectConstructor;
        };
        components: {
            AccordionItem: typeof AccordionItem;
        };
    };
    constructor(element: import("../../abstracts/Base").BaseHTMLElement);
    /**
     * @type {Array<Function>}
     */
    unbindMethods: Array<Function>;
    /**
     * Init autoclose behavior on mounted.
     * @return {Promise<void>}
     */
    mounted(): Promise<void>;
    /**
     * Destroy autoclose behavior on destroyed.
     * @return {void}
     */
    destroyed(): void;
}
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type BaseChildren = {
    [nameOrSelector: string]: (Base | Promise<Base>)[];
};
import Base from "../../abstracts/Base";
import AccordionItem from "./AccordionItem";
