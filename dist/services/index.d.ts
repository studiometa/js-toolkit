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
import useKey from "./key";
import usePointer from "./pointer";
import useRaf from "./raf";
import useResize from "./resize";
import useScroll from "./scroll";
export { useKey, usePointer, useRaf, useResize, useScroll };
