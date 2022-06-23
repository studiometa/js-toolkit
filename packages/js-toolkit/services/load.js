import { useService } from './useService.js';

/**
 * @typedef {import('./index').ServiceInterface<LoadServiceProps>} LoadService
 * @typedef {Object} LoadServiceProps
 * @property {DOMHighResTimeStamp} time
 */

/**
 * Get load service.
 * @returns {LoadService}
 */
function createLoadService() {
  /**
   * Trigger on load
   * @returns {void}
   */
  function onLoad() {
    // eslint-disable-next-line no-use-before-define
    props.time = window.performance.now();
    // eslint-disable-next-line no-use-before-define
    trigger(props);
  }

  const { add, remove, has, props, trigger } = useService({
    initialProps: {
      time: performance.now(),
    },
    init() {
      window.addEventListener('load', onLoad);
    },
    kill() {
      window.removeEventListener('load', onLoad);
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

let load;

/**
 * Use the load service.
 *
 * @returns {LoadService}
 */
export default function useLoad() {
  if (!load) {
    load = createLoadService();
  }

  return load;
}
