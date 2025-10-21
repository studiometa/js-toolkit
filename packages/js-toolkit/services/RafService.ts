import type { ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import { domScheduler } from '../utils/scheduler.js';
import { isFunction } from '../utils/is.js';

export interface RafServiceProps {
  time: DOMHighResTimeStamp;
  delta: number;
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
    delta: 0,
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
    const time = performance.now();
    this.props.delta = time - this.props.time;
    this.props.time = time;
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
 * @link https://js-toolkit.studiometa.dev/api/services/useRaf.html
*/
export function useRaf(): RafServiceInterface {
  return RafService.getInstance();
}
