import useKey from './key';
import useLoad from './load';
import usePointer from './pointer';
import useRaf from './raf';
import useResize from './resize';
import useScroll from './scroll';

/**
 * @typedef {Object} ServiceInterface
 * @property {(key:String) => void} remove
 *   Remove a function from the resize service by its key.
 * @property {(key:String, cb: (props: Object) => void) => Boolean} add
 *   Add a callback to the service. The callback will receive the current service props as parameter.
 * @property {(key:String) => Boolean} has
 *   Test if the service has alreaydy a callback for the given key.
 */

export { useKey, usePointer, useLoad, useRaf, useResize, useScroll };
