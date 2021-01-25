/**
 * Use the RequestAnimationFrame (raf) service.
 *
 * ```js
 * import { useRaf } from '@studiometa/js/services';
 * const { add, remove, props } = useRag();
 * add(id, (props) => {});
 * remove(id);
 * props();
 * ```
 *
 * @return {ServiceInterface & RafService}
 */
export default function useRaf(): ServiceInterface & RafService;
export type ServiceInterface = {
    /**
     * Remove a function from the resize service by its key.
     */
    remove: (key: string) => void;
    /**
     * Test if the service has alreaydy a callback for the given key.
     */
    has: (key: string) => boolean;
};
export type RafServiceProps = {
    time: DOMHighResTimeStamp;
};
export type RafService = {
    /**
     * Add a function to the resize service. The key must be uniq.
     */
    add: (key: string, callback: (props: RafServiceProps) => void) => void;
    /**
     * Get the current values of the resize service props.
     */
    props: () => RafServiceProps;
};
