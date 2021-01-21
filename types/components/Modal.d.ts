/**
 * @typedef {import('../abstracts/Base').BaseOptions} BaseOptions
 */
/**
 * @typedef {Object} ModalRefs
 * @property {HTMLElement} close
 * @property {HTMLElement} container
 * @property {HTMLElement} content
 * @property {HTMLElement} modal
 * @property {HTMLElement} open
 * @property {HTMLElement} overlay
 */
/**
 * @typedef {Object} ModalOptions
 * @property {String} move      A selector where to move the modal to.
 * @property {String} autofocus A selector for the element to set the focus to when the modal opens.
 * @property {Object} styles    The styles for the different state of the modal.
 */
/**
 * @typedef {Object} ModalInterface
 * @property {ModalRefs} $refs
 * @property {ModalOptions} $options
 * @property {Boolean} isOpen
 * @property {Comment} refModalPlaceholder
 * @property {HTMLElement} refModalParentBackup
 * @property {Function} refModalUnbindGetRefFilter
 */
/**
 * Modal class.
 */
export default class Modal extends Base {
    /**
     * Modal options.
     */
    static config: {
        name: string;
        refs: string[];
        options: {
            move: StringConstructor;
            autofocus: {
                type: StringConstructor;
                default: string;
            };
            styles: {
                type: ObjectConstructor;
                default: () => {
                    modal: {
                        closed: {
                            opacity: number;
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
     * Open the modal on click on the `open` ref.
     *
     * @return {Function} The component's `open` method.
     */
    get onOpenClick(): Function;
    /**
     * Close the modal on click on the `close` ref.
     *
     * @return {Function} The component's `close` method.
     */
    get onCloseClick(): Function;
    /**
     * Close the modal on click on the `overlay` ref.
     *
     * @return {Function} The component's `close` method.
     */
    get onOverlayClick(): Function;
    /**
     * Initialize the component's behaviours.
     *
     * @this {Modal & ModalInterface}
     */
    mounted(): Modal & ModalInterface;
    isOpen: boolean;
    refModalPlaceholder: Comment;
    refModalParentBackup: any;
    refModalUnbindGetRefFilter: any;
    /**
     * Unbind all events on destroy.
     *
     * @this {Modal & ModalInterface}
     * @return {Modal} The Modal instance.
     */
    destroyed(): Modal;
    /**
     * Close the modal on `ESC` and trap the tabulation.
     *
     * @this {Modal & ModalInterface}
     * @param  {Object}        options
     * @param  {KeyboardEvent} options.event  The original keyboard event
     * @param  {Boolean}       options.isUp   Is it a keyup event?
     * @param  {Boolean}       options.isDown Is it a keydown event?
     * @param  {Boolean}       options.ESC    Is it the ESC key?
     */
    keyed({ event, isUp, isDown, ESC }: {
        event: KeyboardEvent;
        isUp: boolean;
        isDown: boolean;
        ESC: boolean;
    }): void;
    /**
     * Open the modal.
     *
     * @this {Modal & ModalInterface}
     * @return {Promise<Modal>} The Modal instance.
     */
    open(): Promise<Modal>;
    /**
     * Close the modal.
     *
     * @this {Modal & ModalInterface}
     * @return {Promise<Modal>} The Modal instance.
     */
    close(): Promise<Modal>;
}
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type ModalRefs = {
    close: HTMLElement;
    container: HTMLElement;
    content: HTMLElement;
    modal: HTMLElement;
    open: HTMLElement;
    overlay: HTMLElement;
};
export type ModalOptions = {
    /**
     * A selector where to move the modal to.
     */
    move: string;
    /**
     * A selector for the element to set the focus to when the modal opens.
     */
    autofocus: string;
    /**
     * The styles for the different state of the modal.
     */
    styles: any;
};
export type ModalInterface = {
    $refs: ModalRefs;
    $options: ModalOptions;
    isOpen: boolean;
    refModalPlaceholder: Comment;
    refModalParentBackup: HTMLElement;
    refModalUnbindGetRefFilter: Function;
};
import Base from "../abstracts/Base";
