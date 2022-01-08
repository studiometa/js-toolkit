import Service from './Service.js';

/**
 * @typedef {import('./index').ServiceInterface<LoadServiceProps>} LoadService
 */

/**
 * @typedef {Object} LoadServiceProps
 * @property {DOMHighResTimeStamp} time
 */

/**
 * Load service
 */
class Load extends Service {
  /**
   * Props.
   * @type {LoadServiceProps}
   */
  props = {
    time: window.performance.now(),
  };

  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {void}
   */
  init() {
    window.addEventListener('load', this);
  }

  /**
   * Handle events.
   * @returns {void}
   */
  handleEvent() {
    this.updateProps();
    this.trigger(this.props);
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {void}
   */
  kill() {
    window.removeEventListener('load', this);
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
 * @type {Load}
 */
let instance;

/**
 * @type {LoadService}
 */
let load;

/**
 * Use the load service.
 *
 * ```js
 * import { useLoad } from '@studiometa/js/services';
 * const { add, remove, props } = useRag();
 * add(id, (props) => {});
 * remove(id);
 * props();
 * ```
 *
 * @return {LoadService}
 */
export default function useLoad() {
  if (!load) {
    if (!instance) {
      instance = new Load();
    }

    load = {
      add: instance.add.bind(instance),
      remove: instance.remove.bind(instance),
      has: instance.has.bind(instance),
      props: instance.updateProps.bind(instance),
    };
  }

  return load;
}
