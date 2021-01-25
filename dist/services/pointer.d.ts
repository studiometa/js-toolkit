/**
 * Use the pointer.
 *
 * ```js
 * import usePointer from '@studiometa/js-toolkit/services';
 * const { add, remove, props } = usePointer();
 * add('id', () => {});
 * remove('id');
 * props();
 * ```
 *
 * @return {ServiceInterface & PointerService}
 */
export default function usePointer(): ServiceInterface & PointerService;
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
export type PointerServiceProps = {
    event: MouseEvent | TouchEvent;
    isDown: boolean;
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
export type PointerService = {
    /**
     * Add a function to the resize service. The key must be uniq.
     */
    add: (key: string, callback: (props: PointerServiceProps) => void) => void;
    /**
     * Get the current values of the resize service props.
     */
    props: () => PointerServiceProps;
};
