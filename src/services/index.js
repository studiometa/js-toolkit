import useKey from './key';
import usePointer from './pointer';
import useRaf from './raf';
import useResize from './resize';
import useScroll from './scroll';

/**
 * @typedef {Object} ServiceInterface
 * @property {(key:String) => void} remove
 *   Remove a function from the resize service by its key.
 * @property {(key:String) => Boolean} has
 *   Test if the service has alreaydy a callback for the given key.
 */

export { useKey, usePointer, useRaf, useResize, useScroll };
