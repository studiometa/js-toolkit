import Service from '../abstracts/Service';
import { getRaf } from '../utils/nextFrame';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
 */

/**
 * @typedef {Object} RafServiceProps
 * @property {DOMHighResTimeStamp} time
 */

/**
 * @typedef {Object} RafService
 * @property {(key:String, callback:(props:RafServiceProps) => void) => void} add
 *   Add a function to the resize service. The key must be uniq.
 * @property {() => RafServiceProps} props
 *   Get the current values of the resize service props.
 */

/**
 * Tick service
 */
class Raf extends Service {
  /** @type {Boolean} Whether the loop is running or not. */
  isTicking = false;

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {Raf}
   */
  init() {
    const raf = getRaf();

    const loop = () => {
      this.trigger(this.props);

      if (!this.isTicking) {
        return;
      }

      raf(loop);
    };

    this.isTicking = true;
    loop();
    return this;
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {Raf}
   */
  kill() {
    this.isTicking = false;
    return this;
  }

  /**
   * Get raf props.
   *
   * @todo Return elapsed time / index?
   * @type {Object}
   */
  get props() {
    return {
      time: window.performance.now(),
    };
  }
}

let instance = null;

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
export default function useRaf() {
  if (!instance) {
    instance = new Raf();
  }

  const add = instance.add.bind(instance);
  const remove = instance.remove.bind(instance);
  const has = instance.has.bind(instance);
  const props = () => instance.props;

  return {
    add,
    remove,
    has,
    props,
  };
}
