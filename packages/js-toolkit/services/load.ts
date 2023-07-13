/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import type { ServiceInterface } from './index.js';

export type LoadService = ServiceInterface<LoadServiceProps>;

export interface LoadServiceProps {
  time: DOMHighResTimeStamp;
}

/**
 * Get load service.
 *
 * @returns {LoadService}
 */
function createLoadService() {
  /**
   * Trigger on load
   *
   * @returns {void}
   */
  function onLoad() {
    // eslint-disable-next-line no-use-before-define
    props.time = window.performance.now();
    // eslint-disable-next-line no-use-before-define
    trigger(props);
  }

  const { add, remove, has, props, trigger } = useService({
    /**
     * @type {LoadServiceProps}
     */
    props: {
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
