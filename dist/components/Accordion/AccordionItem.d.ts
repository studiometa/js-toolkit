/**
 * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../../utils/css/styles').CssStyleObject} CssStyleObject
 * @typedef {import('./index').AccordionInterface} AccordionInterface
 */
/**
 * @typedef {Object} AccordionItemRefs
 * @property {HTMLElement} btn
 * @property {HTMLElement} content
 * @property {HTMLElement} container
 */
/**
 * @typedef {Object} StylesOption
 * @property {String|CssStyleObject} open
 * @property {String|CssStyleObject} active
 * @property {String|CssStyleObject} closed
 */
/**
 * @typedef {Object} AccordionItemOptions
 * @property {Boolean} isOpen
 * @property {{ [refName: string]: StylesOption }} styles
 */
/**
 * @typedef {Object} AccordionItemInterface
 * @property {AccordionItemOptions} $options
 * @property {AccordionItemRefs} $refs
 * @property {Accordion & AccordionInterface} $parent
 */
/**
 * AccordionItem class.
 */
export default class AccordionItem extends Base {
    /**
     * AccordionItem config
     * @return {Object}
     */
    static config: {
        name: string;
        refs: string[];
        options: {
            isOpen: BooleanConstructor;
            styles: {
                type: ObjectConstructor;
                default: () => {
                    container: {
                        open: string;
                        active: string;
                        closed: string;
                    };
                };
            };
        };
    };
    constructor(element: HTMLElement);
    /**
     * Add aria-attributes on mounted.
     * @this {AccordionItem & AccordionItemInterface}
     */
    mounted(): void;
    /**
     * Handler for the click event on the `btn` ref.
     * @this {AccordionItem & AccordionItemInterface}
     */
    onBtnClick(): void;
    /**
     * Get the content ID.
     * @return {String}
     */
    get contentId(): string;
    /**
     * Update the refs' attributes according to the given type.
     *
     * @this {AccordionItem & AccordionItemInterface}
     * @param  {Boolean} isOpen The state of the item.
     */
    updateAttributes(isOpen: boolean): void;
    /**
     * Open an item.
     * @this {AccordionItem & AccordionItemInterface}
     */
    open(): Promise<void>;
    /**
     * Close an item.
     * @this {AccordionItem & AccordionItemInterface}
     */
    close(): Promise<void>;
}
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type CssStyleObject = Partial<CSSStyleDeclaration> & Record<string, string>;
export type AccordionInterface = {
    $options: import(".").AccordionOptions;
    $refs: import(".").AccordionRefs;
    $children: import(".").AccordionChildren;
};
export type AccordionItemRefs = {
    btn: HTMLElement;
    content: HTMLElement;
    container: HTMLElement;
};
export type StylesOption = {
    open: string | CssStyleObject;
    active: string | CssStyleObject;
    closed: string | CssStyleObject;
};
export type AccordionItemOptions = {
    isOpen: boolean;
    styles: {
        [refName: string]: StylesOption;
    };
};
export type AccordionItemInterface = {
    $options: AccordionItemOptions;
    $refs: AccordionItemRefs;
    $parent: Accordion & AccordionInterface;
};
import Base from "../../abstracts/Base";
import Accordion from ".";
