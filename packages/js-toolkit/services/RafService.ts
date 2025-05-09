import type { ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import { domScheduler } from '../utils/scheduler.js';
import { isFunction } from '../utils/is.js';

export interface RafServiceProps {
  time: DOMHighResTimeStamp;
}

export type RafServiceInterface = ServiceInterface<RafServiceProps>;

export class RafService extends AbstractService<RafServiceProps> {
  /**
   * @private
   */
  isTicking = false;

  /**
   * @private
   */
  scheduler = domScheduler;

  props: RafServiceProps = {
    time: performance.now(),
  };

  trigger(props: RafServiceProps) {
    for (const callback of this.callbacks.values()) {
      this.scheduler.read(() => {
        const render = callback(props) as (() => unknown) | void;
        if (isFunction(render)) {
          this.scheduler.write(() => {
            // @ts-ignore
            render(props);
          });
        }
      });
    }
  }

  loop() {
    this.props.time = performance.now();
    this.trigger(this.props);

    if (!this.isTicking) {
      return;
    }

    requestAnimationFrame(() => this.loop());
  }

  init() {
    this.isTicking = true;
    requestAnimationFrame(() => this.loop());
  }

  kill() {
    this.isTicking = false;
  }
}

/**
 * Use the RequestAnimationFrame (raf) service.
 */
export function useRaf(): RafServiceInterface {
  return RafService.getInstance();
}
