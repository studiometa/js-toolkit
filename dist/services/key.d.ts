/**
 * Use the keyboard service.
 *
 * ```js
 * import { useKey } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useKey();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 *
 * @return {ServiceInterface & KeyService}
 */
export default function useKey(): ServiceInterface & KeyService;
export type ServiceInterface = {
    /**
     * Remove a function from the resize service by its key.
     */
    remove: (key: string) => void;
    /**
     * Add a callback to the service. The callback will receive the current service props as parameter.
     */
    add: (key: string, cb: (props: any) => void) => boolean;
    /**
     * Test if the service has alreaydy a callback for the given key.
     */
    has: (key: string) => boolean;
};
export type KeyServiceProps = {
    event: KeyboardEvent;
    triggered: number;
    isUp: boolean;
    isDown: boolean;
    ENTER: boolean;
    SPACE: boolean;
    TAB: boolean;
    ESC: boolean;
    LEFT: boolean;
    UP: boolean;
    RIGHT: boolean;
    DOWN: boolean;
};
export type KeyService = {
    /**
     * Add a function to the resize service. The key must be uniq.
     */
    add: (key: string, callback: (props: KeyServiceProps) => void) => void;
    /**
     * Get the current values of the resize service props.
     */
    props: () => KeyServiceProps;
};
