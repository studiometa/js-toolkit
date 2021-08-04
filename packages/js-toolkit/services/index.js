import useDrag from './drag.js';
import useKey from './key.js';
import useLoad from './load.js';
import usePointer from './pointer.js';
import useRaf from './raf.js';
import useResize from './resize.js';
import useScroll from './scroll.js';

/**
 * @typedef {Object} ServiceInterface
 * @property {(key:String) => void} remove
 *   Remove a function from the resize service by its key.
 * @property {(key:String, cb: (props: Object) => void) => Boolean} add
 *   Add a callback to the service. The callback will receive the current service props as parameter.
 * @property {(key:String) => Boolean} has
 *   Test if the service has alreaydy a callback for the given key.
 * @property {() => Record<string, unknown>} props
 *   Get the service props.
 */

export { useKey, usePointer, useDrag, useLoad, useRaf, useResize, useScroll };
