export { default as useDrag } from './drag.js';
export { default as useKey } from './key.js';
export { default as useLoad } from './load.js';
export { default as usePointer } from './pointer.js';
export { default as useRaf } from './raf.js';
export { default as useResize } from './resize.js';
export { default as useScroll } from './scroll.js';

/**
 * @template T
 * @typedef {Object} ServiceInterface
 * @property {(key:string) => void} remove
 *   Remove a function from the resize service by its key.
 * @property {(key:string, cb: (props: T) => void) => void} add
 *   Add a callback to the service. The callback will receive the current service props as parameter.
 * @property {(key:string) => boolean} has
 *   Test if the service has alreaydy a callback for the given key.
 * @property {() => T} props
 *   Get the service's props.
 */
