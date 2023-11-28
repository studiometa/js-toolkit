/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
import { useService } from './service.js';
import { getRaf as getRequestAnimationFrame } from '../utils/nextFrame.js';
import { useScheduler } from '../utils/scheduler.js';
import { isFunction } from '../utils/is.js';
import type { ServiceInterface } from './index.js';

const scheduler = useScheduler(['update', 'render']);

export type RafService = ServiceInterface<RafServiceProps>;

export interface RafServiceProps {
  time: DOMHighResTimeStamp;
}

/**
 * Create raf service.
 */
function createRafService(): RafService {
  let isTicking = false;
  const RAF = getRequestAnimationFrame();

  /**
   * Trigger callbacks.
   */
  function trigger(props: RafServiceProps) {
    for (const callback of callbacks) {
      scheduler.update(() => {
        const render = callback(props) as (() => unknown) | void;
        if (isFunction(render)) {
          scheduler.render(() => {
            // @ts-ignore
            render(props);
          });
        }
      });
    }
  }

  /**
   * Loop.
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
    props: {
      time: performance.now(),
    } as RafServiceProps,
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
 */
export default function useRaf(): RafService {
  if (!raf) {
    raf = createRafService();
  }

  return raf;
}
