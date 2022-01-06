import useDrag from './drag.js';
import useKey from './key.js';
import useLoad from './load.js';
import usePointer from './pointer.js';
import useRaf from './raf.js';
import useResize from './resize.js';
import useScroll from './scroll.js';

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

export { useKey, usePointer, useDrag, useLoad, useRaf, useResize, useScroll };
