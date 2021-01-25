/**
 * @typedef {import('../abstracts/Base').BaseOptions} BaseOptions
 */
/**
 * @typedef {Object} TabItem
 * @property {HTMLElement} btn
 * @property {HTMLElement} content
 * @property {Boolean} isEnabled
 */
/**
 * @typedef {Object} TabsRefs
 * @property {HTMLElement[]} btn
 * @property {HTMLElement[]} content
 */
/**
 * @typedef {Object} TabsOptions
 * @property {Object} styles
 */
/**
 * @typedef {Object} TabsInterface
 * @property {TabsOptions} $options
 * @property {TabsRefs} $refs
 * @property {Array<TabItem>} items
 */
/**
 * Tabs class.
 */
export default class Tabs extends Base {
    /**
     * Tabs config.
     */
    static config: {
        name: string;
        refs: string[];
        options: {
            styles: {
                type: ObjectConstructor;
                default: () => {
                    content: {
                        closed: {
                            position: string;
                            opacity: string;
                            pointerEvents: string;
                            visibility: string;
                        };
                    };
                };
            };
        };
    };
    constructor(element: HTMLElement);
    /**
     * Initialize the component's behaviours.
     * @this {Tabs & TabsInterface}
     */
    mounted(): Tabs & TabsInterface;
    items: any;
    /**
     * Switch tab on button click.
     *
     * @this {Tabs & TabsInterface}
     * @param  {Event}  event The click event object.
     * @param  {Number} index The index of the clicked button.
     * @return {void}
     */
    onBtnClick(event: Event, index: number): void;
    /**
     * Enable the given tab and its associated content.
     *
     * @this {Tabs & TabsInterface}
     * @param  {TabItem}       item The item to enable.
     * @return {Promise<Tabs & TabsInterface>}      Tabs instance.
     */
    enableItem(item: TabItem): Promise<Tabs & TabsInterface>;
    /**
     * Disable the given tab and its associated content.
     *
     * @this {Tabs & TabsInterface}
     * @param  {TabItem}       item The item to disable.
     * @return {Promise<Tabs & TabsInterface>}      The Tabs instance.
     */
    disableItem(item: TabItem): Promise<Tabs & TabsInterface>;
}
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type TabItem = {
    btn: HTMLElement;
    content: HTMLElement;
    isEnabled: boolean;
};
export type TabsRefs = {
    btn: HTMLElement[];
    content: HTMLElement[];
};
export type TabsOptions = {
    styles: any;
};
export type TabsInterface = {
    $options: TabsOptions;
    $refs: TabsRefs;
    items: Array<TabItem>;
};
import Base from "../abstracts/Base";
