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
 * Tabs class.
 * @property {BaseOptions & { styles: Object }} $options
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
    constructor(element: import("../abstracts/Base").BaseHTMLElement);
    /**
     * Initialize the component's behaviours.
     */
    mounted(): Tabs;
    /** @type {Array<TabItem>} */
    items: Array<TabItem>;
    /**
     * Switch tab on button click.
     *
     * @param  {Event}  event The click event object.
     * @param  {Number} index The index of the clicked button.
     * @return {void}
     */
    onBtnClick(event: Event, index: number): void;
    /**
     * Enable the given tab and its associated content.
     *
     * @param  {TabItem}       item The item to enable.
     * @return {Promise<Tabs>}      Tabs instance.
     */
    enableItem(item: TabItem): Promise<Tabs>;
    /**
     * Disable the given tab and its associated content.
     *
     * @param  {TabItem}       item The item to disable.
     * @return {Promise<Tabs>}      The Tabs instance.
     */
    disableItem(item: TabItem): Promise<Tabs>;
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
import Base from "../abstracts/Base";
