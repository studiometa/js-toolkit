/**
 * Use the scroll service.
 *
 * ```js
 * import { useScroll } from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = useScroll();
 * add(key, (props) => {});
 * remove(key);
 * props();
 * ```
 *
 * @return {ServiceInterface & ScrollService}
 */
export default function useScroll(): ServiceInterface & ScrollService;
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
export type ScrollServiceProps = {
    x: number;
    y: number;
    changed: {
        x: boolean;
        y: boolean;
    };
    last: {
        x: number;
        y: number;
    };
    delta: {
        x: number;
        y: number;
    };
    progress: {
        x: number;
        y: number;
    };
    max: {
        x: number;
        y: number;
    };
};
export type ScrollService = {
    /**
     * Add a function to the resize service. The key must be uniq.
     */
    add: (key: string, callback: (props: ScrollServiceProps) => void) => void;
    /**
     * Get the current values of the resize service props.
     */
    props: () => ScrollServiceProps;
};
