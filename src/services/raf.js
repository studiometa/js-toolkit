import Service from '../abstracts/Service';
import { getRaf } from '../utils/nextFrame';

/**
 * Tick service
 *
 * ```
 * import { useRaf } from '@studiometa/js/services';
 * const { add, remove, props } = useRag();
 * add(id, (props) => {});
 * remove(id);
 * props();
 * ```
 */
class Raf extends Service {
  /** @type {Boolean} Whether the loop is running or not. */
  isTicking = false;

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {void}
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
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {void}
   */
  kill() {
    this.isTicking = false;
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

export default () => {
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
};
