/* eslint-disable no-use-before-define */
import { useService } from './service.js';
import { getRaf as getRequestAnimationFrame } from '../utils/nextFrame.js';
import { useScheduler } from '../utils/scheduler.js';
import isFunction from '../utils/isFunction.js';

const scheduler = useScheduler(['update', 'render']);

/**
 * @typedef {import('./index').ServiceInterface<RafServiceProps>} RafService
 * @typedef {Object} RafServiceProps
 * @property {DOMHighResTimeStamp} time
 */

/**
 * Create raf service.
 * @returns {RafService} [description]
 */
function createRafService() {
  let isTicking = false;
  const RAF = getRequestAnimationFrame();

  /**
   * Trigger callbacks.
   * @param   {RafServiceProps} props
   * @returns {void}
   */
  function trigger(props) {
    callbacks.forEach(function forEachCallback(callback) {
      scheduler.update(function rafUpdate() {
        const render = callback(props);
        if (isFunction(render)) {
          scheduler.render(function rafRender() {
            render(props);
          });
        }
      });
    });
  }

  /**
   * Loop;
   * @returns {void}
   */
  function loop() {
    // eslint-disable-next-line no-use-before-define
    props.time = performance.now();
    trigger(props);

    if (!isTicking) {
      return;
    }

    RAF(loop);
  }

  const { add, remove, has, props, callbacks } = useService({
    /**
     * @type {RafServiceProps}
     */
    props: {
      time: performance.now(),
    },
    init() {
      isTicking = true;
      RAF(loop);
    },
    kill() {
      isTicking = false;
    },
  });

  return {
    add,
    remove,
    has,
    props: () => props,
  };
}

let raf;

/**
 * Use the RequestAnimationFrame (raf) service.
 *
 * @returns {RafService}
 */
export default function useRaf() {
  if (!raf) {
    raf = createRafService();
  }

  return raf;
}
