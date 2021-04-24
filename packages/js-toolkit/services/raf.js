import Service from '../abstracts/Service.js';
import { getRaf, getCancelRaf } from '../utils/nextFrame.js';

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

  /** @type {number} */
  id = 0;

  raf = getRaf();

  cancelRaf = getCancelRaf();

  /**
   * Bind loop to the instance.
   */
  constructor() {
    super();
    this.loop = this.loop.bind(this);
  }

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {Raf}
   */
  init() {
    this.isTicking = true;
    this.loop();
    return this;
  }

  /**
   * Loop method.
   */
  loop() {
    this.trigger(this.props);

    if (!this.isTicking) {
      return;
    }

    this.id = this.raf(this.loop);
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {Raf}
   */
  kill() {
    this.cancelRaf(this.id);
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

  // eslint-disable-next-line require-jsdoc
  function props() {
    return instance.props;
  }

  return {
    add,
    remove,
    has,
    props,
  };
}
