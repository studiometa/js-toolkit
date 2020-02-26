import Service from '../abstracts/Service';

/**
 * Tick service
 *
 * ```
 * import tick from '@studiometa/js/services/tick';
 * tick.add(id, handler);
 * tick.remove(id);
 * tick.props;
 * ```
 */
class Raf extends Service {
  /** @type {Boolean} Whether the loop is running or not. */
  isLooping = false;

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {void}
   */
  init() {
    const loop = () => {
      // todo: add params to the trigger
      this.trigger(this.props);

      if (!this.isLooping) {
        return;
      }

      requestAnimationFrame(loop);
    };

    this.isLooping = true;
    loop();
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {void}
   */
  kill() {
    this.isLooping = false;
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
