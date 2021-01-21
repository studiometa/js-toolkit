/**
 * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../../utils/css/styles').CssStyleObject} CssStyleObject
 * @typedef {{ open: string | CssStyleObject, active: string | CssStyleObject, closed: string | CssStyleObject }} StylesOption
 */
/**
 * AccordionItem class.
 * @property {BaseOptions & { styles: { container: StylesOption, [refName:string]: StylesOption}, isOpen: Boolean }} $options
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
    constructor(element: import("../../abstracts/Base").BaseHTMLElement);
    /**
     * Add aria-attributes on mounted.
     * @return {void}
     */
    mounted(): void;
    /**
     * Handler for the click event on the `btn` ref.
     * @return {void}
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
     * @param  {Boolean} isOpen The state of the item.
     * @return {void}
     */
    updateAttributes(isOpen: boolean): void;
    /**
     * Open an item.
     * @return {Promise}
     */
    open(): Promise<any>;
    /**
     * Close an item.
     * @return {Promise}
     */
    close(): Promise<any>;
}
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type CssStyleObject = Partial<CSSStyleDeclaration> & Record<string, string>;
export type StylesOption = {
    open: string | CssStyleObject;
    active: string | CssStyleObject;
    closed: string | CssStyleObject;
};
import Base from "../../abstracts/Base";
