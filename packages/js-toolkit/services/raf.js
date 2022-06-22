import { useService } from './useService.js';
import { getRaf } from '../utils/nextFrame.js';
import { useScheduler } from '../utils/scheduler.js';
import isFunction from '../utils/isFunction.js';

const scheduler = useScheduler(['update', 'render']);

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

let isTicking = false;
const RAF = getRaf();

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
  initialProps: {
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
    raf = {
      add,
      remove,
      has,
      props: () => props,
    };
  }

  return raf;
}
