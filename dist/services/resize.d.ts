/**
 * Use the resize service.
 *
 * ```js
 * import useResize from '@studiometa/js-toolkit/services/resize';
 * const { add, remove, props } = useResize();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 * @return {ServiceInterface & ResizeService}
 */
export default function useResize(): ServiceInterface & ResizeService;
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
export type ResizeServiceProps = {
    width: number;
    height: number;
    ratio: number;
    orientation: 'square' | 'landscape' | 'portrait';
    breakpoint?: string;
    breakpoints?: string[];
};
export type ResizeService = {
    /**
     * Add a function to the resize service. The key must be uniq.
     */
    add: (key: string, callback: (props: ResizeServiceProps) => void) => void;
    /**
     * Get the current values of the resize service props.
     */
    props: () => ResizeServiceProps;
};
