/**
 * @typedef {Object} AccordionRefs
 * @property {HTMLElement[]} btn
 * @property {HTMLElement[]} content
 */
/**
 * @typedef {Object} AccordionOptions
 * @property {Boolean} autoclose
 * @property {Object} item
 */
/**
 * @typedef {Object} AccordionChildren
 * @property {AccordionItem[]} AccordionItem
 */
/**
 * @typedef {Object} AccordionInterface
 * @property {AccordionOptions} $options
 * @property {AccordionRefs} $refs
 * @property {AccordionChildren} $children
 */
/**
 * Accordion class.
 */
export default class Accordion extends Base {
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
     * Destroy autoclose behavior on destroyed.
     * @return {void}
     */
    destroyed(): void;
}
export type AccordionRefs = {
    btn: HTMLElement[];
    content: HTMLElement[];
};
export type AccordionOptions = {
    autoclose: boolean;
    item: any;
};
export type AccordionChildren = {
    AccordionItem: AccordionItem[];
};
export type AccordionInterface = {
    $options: AccordionOptions;
    $refs: AccordionRefs;
    $children: AccordionChildren;
};
import Base from "../../abstracts/Base";
import AccordionItem from "./AccordionItem";
