import Service from './Service.js';
import { getRaf, getCancelRaf } from '../utils/nextFrame.js';

/**
 * @typedef {import('./index').ServiceInterface<RafServiceProps>} RafService
 */

/**
 * @typedef {Object} RafServiceProps
 * @property {DOMHighResTimeStamp} time
 */

/**
 * Tick service
 * @todo Add multiple callbacks to schedule different actions in batch (see fastdom or framesync):
 *
 * ```js
 * useRaf().add(key, callback, { step: 'update' })
 * useRaf().add(key, callback, { step: 'render' })
 * ````
 *
 * The `update` step should be used to read values from the DOM
 * The `render` step should be used to set values in the DOM
 *
 * - [ ] Add a `updateCallbacks` property like the `callbacks` one
 * - [ ] Trigger the `updateCallbacks` functions before the `callbacks` functions
 * - [ ] Default value for the `step` option is `render`
 * - [ ] Add a `beforeTicked` hook to the `Base` class using the `update` step (?)
 */
class Raf extends Service {
  /** @type {boolean} Whether the loop is running or not. */
  isTicking = false;

  /** @type {number} */
  id = 0;

  raf = getRaf();

  cancelRaf = getCancelRaf();

  /**
   * Props.
   * @type {RafServiceProps}
   */
  props = {
    time: performance.now(),
  };

  /**
   * Start the requestAnimationFrame loop.
   *
   * @returns {void}
   */
  init() {
    this.isTicking = true;
    this.loop();
  }

  /**
   * Loop method.
   */
  loop() {
    this.updateProps();
    this.trigger(this.props);

    if (!this.isTicking) {
      return;
    }

    this.id = this.raf(() => this.loop());
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @returns {void}
   */
  kill() {
    this.cancelRaf(this.id);
    this.isTicking = false;
  }

  /**
   * Get raf props.
   *
   * @todo Return elapsed time / index?
   * @returns {this['props']}
   */
  updateProps() {
    this.props.time = window.performance.now();
    return this.props;
  }
}

/**
 * @type {Raf}
 */
let instance;

/**
 * @type {RafService}
 */
let raf;

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
 * @returns {RafService}
 */
export default function useRaf() {
  if (!raf) {
    if (!instance) {
      instance = new Raf();
    }

    raf = {
      add: instance.add.bind(instance),
      remove: instance.remove.bind(instance),
      has: instance.has.bind(instance),
      props: instance.updateProps.bind(instance),
    };
  }

  return raf;
}
