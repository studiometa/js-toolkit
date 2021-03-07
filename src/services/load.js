import Service from '../abstracts/Service';

/**
 * @typedef {import('./index').ServiceInterface} ServiceInterface
 */

/**
 * @typedef {Object} LoadServiceProps
 * @property {DOMHighResTimeStamp} time
 */

/**
 * @typedef {Object} LoadService
 * @property {(key:String, callback:(props:LoadServiceProps) => void) => void} add
 *   Add a function to the resize service. The key must be uniq.
 * @property {() => LoadServiceProps} props
 *   Get the current values of the resize service props.
 */

/**
 * Load service
 */
class Load extends Service {
  /**
   * Start the requestAnimationFrame loop.
   *
   * @return {Load}
   */
  init() {
    this.handler = () => {
      this.trigger(this.props);
    };

    window.addEventListener('load', this.handler);
    return this;
  }

  /**
   * Stop the requestAnimationFrame loop.
   *
   * @return {Load}
   */
  kill() {
    window.removeEventListener('load', this.handler);
    return this;
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

let instance = null;

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
 * @return {ServiceInterface & LoadService}
 */
export default function useRaf() {
  if (!instance) {
    instance = new Load();
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
