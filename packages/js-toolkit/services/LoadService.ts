import { Service } from './Service.js';
import type { ServiceInterface } from './index.js';

export interface LoadServiceProps {
  time: DOMHighResTimeStamp;
}

export type LoadServiceInterface = ServiceInterface<LoadServiceProps>;

export class LoadService extends Service<LoadServiceProps> {
  props = {
    time: performance.now(),
  } as LoadServiceProps;

  handleEvent() {
    this.props.time = window.performance.now();
    this.trigger(this.props);
  }

  init() {
    window.addEventListener('load', this);
  }

  kill() {
    window.removeEventListener('load', this);
  }
}

/**
 * Use the load service.
 *
 * @returns {LoadService}
 */
export function useLoad() {
  return LoadService.getInstance();
}
