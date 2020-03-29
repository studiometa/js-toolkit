import Service from '../abstracts/Service';

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
    const loop = () => {
      // todo: add params to the trigger
      this.trigger(this.props);

      if (!this.isTicking) {
        return;
      }

      requestAnimationFrame(loop);
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
    return {};
  }
}

const raf = new Raf();
const add = raf.add.bind(raf);
const remove = raf.remove.bind(raf);
const props = () => raf.props;

export default () => ({
  add,
  remove,
  props,
});
